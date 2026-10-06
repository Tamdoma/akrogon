# Design: check-setup

## Binding decisions, verbatim

### dependency-setup (issues/chart/merge-turn/forks/dependency-setup.md)
Operator 2026-10-05, verbatim: "1a 2a", after asking "which packages?" and "no additional places to install node_modules? I don't want any of those complexities." A answered that per-worktree `node_modules` lives inside the leaf worktree, is git-ignored, is removed with the worktree, is hardlinked from Bun's cache, and already exists in 11 framework worktrees from manual installs; a single shared install reintroduces stale packages and install-while-checking crashes.

- Q1 1a: one optional repo key `setup` (e.g. `bun install --frozen-lockfile`) in `issues/config.yaml`; `akrogon config` prints every `checks` and `merge_checks` command as `flock "$(git rev-parse --git-path akrogon-install.lock)" <setup> && <check>`. Every check run installs first, under a per-worktree lock kept under the git dir, on the commit it tests, whoever runs it (seat, worker, holder on the batch top, detached base checkout). New: the key and the composition in `akrogon config`. Reused: the check lists and every runner of them. `init-akrogon` proposes `setup` only when a lockfile is committed; `docs/guide/setup.md` documents it next to `checks`. Reason: level-based, no list of install moments to miss; probe showed concurrent bare installs fail and the composed command passes (20/20). Foreclosed: akrogon installing at fixed moments (B's held preference), per-line prefixes in each repo, skill-only installs, one shared install.
- Q2 2a: worktrees stay under `worktree_root: issues/worktrees`. Accepted cost: an undeclared import present only in the registered checkout's `node_modules` resolves from there. `worktree_root` stays available to move them later.
- Probe 2026-10-05, Bun 1.4.2, operator's local identity: disposable detached worktree `issues/worktrees/probe-setup` at 923c6c9, no `node_modules` at start. Ran akrogon's four `checks` (format, test, typecheck, test_changed with `AKROGON_BASE=HEAD`) at once, each as `flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile && <check>`. All four exit 0 (test 415 pass, 0 fail), `git status --porcelain` empty, lock at `.git/worktrees/probe-setup/akrogon-install.lock`. Version shadow: `bun add zod@4.1.5` in the worktree, removed `node_modules`, composed install, `require.resolve('zod')` gave `issues/worktrees/probe-setup/node_modules/zod/index.cjs` version 4.1.5 while root has 4.6.1. Cleanup: worktree removed and pruned, logs and script deleted, `git worktree list` shows no probe entry. Limits: one machine, one Bun version, four runners, does not prove merge_checks of framework or an undeclared import.
- Done-criteria: a new worktree with no `node_modules` passes its first check without a separate install step; four checks at once in one worktree all pass and leave `git status` clean; a batch whose carried member adds a package passes its single check run; a restored member's solo run uses its own lockfile; a lockfile that does not match `package.json` fails the check with the install error; evidence shows the resolved package path and version.

Excluded: merge-order, turn-release and issues-only decisions belong to merge-turn-order, merge-batch, record-only-reuse and nits-before-merge. The dependency-setup done-criteria about a batch and a restored solo member belong to merge-batch. Setting `setup` in any repo's `issues/config.yaml` is an operator commit on main.

## Standing design
/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

- No mocks of the unit under test: done-criteria 2-6 run real `bun install` and `flock` against a fixture git repo with a worktree, at the `akrogon config` CLI boundary. Keep the fixture offline with a `file:` dependency inside the fixture, so the install needs no network.
- Criterion 3 is a real version-shadow fixture: one version of a package in the fixture's root `node_modules` and another in the worktree's lockfile.
- Criterion 4 is the concurrency the chart probe found failing without the lock, so its test runs four printed commands at once.
- New behavior shows one deliberate break turning its test red (for example, drop the lock and see criterion 4 fail, or drop the check grouping and see criterion 5 fail).
- Prose criteria 7-9 are checked by reading the skill and doc. akrogon tests must not assert prose wording.

## Leaf architecture
- Owned: `src/config.ts` (`repoSchema` gains optional `setup`, and `effectiveConfig` composes the printed `checks`, `merge_checks` and `advisory` commands (A,C)), `skills/implement-issue/SKILL.md` and `skills/check-issue/SKILL.md` (the locked `setup` before a direct proof outside the printed commands (A,B)), `skills/init-akrogon/SKILL.md` (proposal rule), `docs/guide/setup.md` (the key, next to `checks`), and akrogon's config tests.
- Printed form, literal (A,B,C): `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup> && sh -c <quoted command>`, quoting each whole string with `quote` from `src/shell.ts:63`. All of `setup` runs under the lock, and no part of the command runs after `setup` fails.
- Direct-proof form in the skills (A,B): `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <quoted setup>`, run before a dependency-using proof outside the printed commands.
- `advisory` is composed too (A,C). It is outside the binding text's "every `checks` and `merge_checks` command", but the same rule applies: an advisory command can run first in a fresh worktree.
- The lock file lives under the git dir, so it never shows in `git status` and is removed with the worktree.
- Every runner of the lists (seats, workers, the merge holder, detached base checkouts) reads them from `akrogon config` and gets the composition with no change of its own.
- Not owned: `ensureWorktree` (no install there), `worktree_root` (stays `issues/worktrees`).
