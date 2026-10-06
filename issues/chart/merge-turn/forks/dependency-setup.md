# Dependency setup

## Question
Q1. Who installs a leaf worktree's dependencies, and when, so every check run in a worktree uses packages matching that worktree's own lockfile, including after the batch stack changes the lockfile?

### Carries
- Root cause (A, verified 2026-10-05): leaf worktrees live inside the registered checkout (`worktree_root: issues/worktrees`, `src/config.ts:128-130`), and `ensureWorktree` installs nothing (`src/next.ts:245-278`), so Bun's upward module lookup silently uses the registered checkout's `node_modules`. Framework's root `node_modules` was installed 2026-09-26 (`node_modules/.bin` mtime); leaf commit `0f722250f` (satellite-build) added `markdown-it` to `package.json` and `bun.lock` (lock mtime 2026-10-01); `node_modules/markdown-it` is absent at the root. Every later leaf's `framework:verify` failed with `Cannot find package 'markdown-it'` (INTAKE.md:26).
- So "fresh worktree has no node_modules" is really "worktree silently shares a stale root install", the pattern listed Off route as unsafe (CHART.md Off route).
- `repoSchema` has no setup key (`src/config.ts:28-49`). Checks are run by seats (`skills/implement-issue/SKILL.md:41`, `skills/check-issue/SKILL.md:85`, `skills/merge-issue/SKILL.md:37`).
- Dispatch runs `ensureWorktree` under the global flock (`src/next.ts` allocate/dispatch).
- From merge-order 1d (C): when the batch top commit's lockfile differs from the one installed in the holder's worktree, setup runs again before the single check run.
- Taken: merge-order, issues-only, turn-release (see their Taken sections; batch stack and push are command-owned).
- Lock: no clocks, watchdogs or polling.

## Findings
See ../slots/map-merged.md M6, R3, R5.

Rounds: ../slots/dependency-setup-A.md, -B.md, -C.md, -merged.md (with "After rebuttals", "Concurrency probe", "Follow-up", "Composed-command probe"), -rebuttal-B.md, -rebuttal-C.md, -followup-B.md, -followup-C.md.

## Taken
Operator 2026-10-05, verbatim: "1a 2a", after asking "which packages?" and "no additional places to install node_modules? I don't want any of those complexities." A answered that per-worktree `node_modules` lives inside the leaf worktree, is git-ignored, is removed with the worktree, is hardlinked from Bun's cache, and already exists in 11 framework worktrees from manual installs; a single shared install reintroduces stale packages and install-while-checking crashes.

- Q1 1a: one optional repo key `setup` (e.g. `bun install --frozen-lockfile`) in `issues/config.yaml`; `akrogon config` prints every `checks` and `merge_checks` command as `flock "$(git rev-parse --git-path akrogon-install.lock)" <setup> && <check>`. Every check run installs first, under a per-worktree lock kept under the git dir, on the commit it tests, whoever runs it (seat, worker, holder on the batch top, detached base checkout). New: the key and the composition in `akrogon config`. Reused: the check lists and every runner of them. `init-akrogon` proposes `setup` only when a lockfile is committed; `docs/guide/setup.md` documents it next to `checks`. Reason: level-based, no list of install moments to miss; probe showed concurrent bare installs fail and the composed command passes (20/20). Foreclosed: akrogon installing at fixed moments (B's held preference), per-line prefixes in each repo, skill-only installs, one shared install.
- Q2 2a: worktrees stay under `worktree_root: issues/worktrees`. Accepted cost: an undeclared import present only in the registered checkout's `node_modules` resolves from there. `worktree_root` stays available to move them later.
- Probe 2026-10-05, Bun 1.4.2, operator's local identity: disposable detached worktree `issues/worktrees/probe-setup` at 923c6c9, no `node_modules` at start. Ran akrogon's four `checks` (format, test, typecheck, test_changed with `AKROGON_BASE=HEAD`) at once, each as `flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile && <check>`. All four exit 0 (test 415 pass, 0 fail), `git status --porcelain` empty, lock at `.git/worktrees/probe-setup/akrogon-install.lock`. Version shadow: `bun add zod@4.1.5` in the worktree, removed `node_modules`, composed install, `require.resolve('zod')` gave `issues/worktrees/probe-setup/node_modules/zod/index.cjs` version 4.1.5 while root has 4.6.1. Cleanup: worktree removed and pruned, logs and script deleted, `git worktree list` shows no probe entry. Limits: one machine, one Bun version, four runners, does not prove merge_checks of framework or an undeclared import.
- Done-criteria: a new worktree with no `node_modules` passes its first check without a separate install step; four checks at once in one worktree all pass and leave `git status` clean; a batch whose carried member adds a package passes its single check run; a restored member's solo run uses its own lockfile; a lockfile that does not match `package.json` fails the check with the install error; evidence shows the resolved package path and version.
