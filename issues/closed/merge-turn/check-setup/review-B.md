# Review B: check-setup

Date: 2026-10-05
Phase: check.review (initial, blind)
Base: 923c6c98fac3f051a54ac27168ea024215652602
Reviewed head: 331d7bf262962ade448d1954b03a8caecebae9aa
Verdict: fix

## Findings

### F1 — Fix: index membership does not prove a committed lockfile

Location: `skills/init-akrogon/SKILL.md:29,43`.

Criterion: brief done-criterion 8 requires no `setup` proposal for a repository without a committed lockfile. The new instruction uses `git ls-files` as that gate. This lists the index, including newly staged files absent from HEAD.

Source and consequence: an operator stages a newly generated lockfile before running the documented repository setup workflow. Following the new instruction proposes a frozen dependency install even though no committed lockfile exists. A fresh leaf worktree copies HEAD, not the staged lockfile, so the proposal assumes a file unavailable to the worktree. The proposal itself violates criterion 8's named no-committed-lockfile scenario. This also exposes a flaw in plan D8, which equates `git ls-files` with committed membership.

Verification: a disposable git repository had a committed `package.json`, then an added and staged `bun.lock`. The prescribed gate and a HEAD-tree listing returned:

```text
git ls-files -- bun.lock: 'bun.lock'
git ls-tree --name-only HEAD -- bun.lock: ''
git status --porcelain: 'A  bun.lock'
```

The fixture was removed. This is a criterion outcome failure, not a request for an additional test file. Use the committed tree for the gate, accounting for a repository with no HEAD, and keep both new instruction sites consistent. Repair must reconcile plan D8 with the brief outcome rather than retain the incorrect index gate.

No other Fixes or Nits found. No operator actions required.

## Verification

Read the brief, design, plan, implementation report and ponytail guidance before the diff. Debate artifacts are absent as expected for `debate: no`. Did not read the peer review.

The config schema accepts optional non-empty setup. Composition uses the existing shell quote helper, wraps both complete commands, and applies only to effective printed checks, merge_checks and advisory. Init persists the raw schema-parsed proposal. Tests execute real CLI output, Bun installs and flock. Existing assertions and fixtures were not changed or deleted. The report records the deliberate raw-command break turning criterion 5 red and restored green; that evidence was reused.

Rerun trigger: changed `src/config.ts` and its CLI consumers. This repository's effective configuration has no setup, so its printed checks remain the following unwrapped commands:

- `bun test tests/config.test.ts tests/docs-links.test.ts --timeout=30000`: exit 0, 17 pass, 0 fail.
- `bun run typecheck`: exit 0.
- `bun run format`: exit 0, every formatted file unchanged.
- `bun test --timeout=30000`: exit 0, 421 pass, 0 fail, 20 files.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 326 pass, 0 fail, 9 files, with base 923c6c98fac3f051a54ac27168ea024215652602.
- `git status --porcelain`: empty after checks.
- `akrogon status check-setup`: no Missing lines.

Criteria 1–6: matching CLI-boundary test scenarios passed, including version/path resolution, four concurrent installs, failed setup suppressing both sides of an OR command, and all setup commands under the lock. Criteria 7 and 9: skill/doc inspection plus docs-links passed. Criterion 8: blocked by F1.

## Documentation and area paths

Opened the changed-behavior page `docs/guide/setup.md`. Its setup behavior, lock location and proposal description match the intended brief. Both execution skills contain the direct-proof locked-setup rule and detached-base clause. The init skill's committed-lockfile gate has F1.

One repository-root listing of every file path named by changed `src/AREA.md` showed all present:

```text
docs/reference-index.md: exists
src/akrogon.ts: exists
src/config.ts: exists
src/init.ts: exists
src/phase.ts: exists
src/preflight.ts: exists
src/readiness.ts: exists
src/shell.ts: exists
tests/helpers.ts: exists
tests/phase.test.ts: exists
```

Followed the reference index and affected config/init/check-runner contracts. No dead pointers found. No reusable lesson artifact added.

## Test-Change trailers

Target range: `origin/main..HEAD` (same three leaf commits as base..HEAD at review).

`cb680d9072efc8076925f11af7c1f9f0a4b6499f`:

```text
Test-Change: tests/config.test.ts added T1–T6 setup-composition cases; no existing expectation changed
```

Valid under `src/test-files.ts`: the sole changed existing test file adds a helper and six cases; its old expectations remain unchanged, so no contrary-expectation source is needed. Other two leaf commits contain no Test-Change trailers and change no old test files.

## 2026-10-05 — check.repair

Read both initial reviews for reviewed head `331d7bf262962ade448d1954b03a8caecebae9aa`. A recorded no Fixes. B's F1 is the sole Fix. The worktree remains at the reviewed head and clean.

### Handed to A

- F1: plan D8 explicitly prescribes the incorrect `git ls-files` committed-lockfile gate. Correcting the gate requires reconciling that plan decision with brief criterion 8. The check-issue repair protocol excludes plan changes from B's repairs and forbids B from editing `plan.md` or `design.md`, so A owns this correction and its matching init-akrogon instructions.

No doable Fix remains within B's repair authority. No operator actions are open. No code or doc edits, commits or additional checks were made in this pass. Prior passing checks remain evidence for the unchanged head; criterion 8 remains blocked by F1. Requested `check.fix` for A's repair.

## 2026-10-05 — check.review after A's repair

Prior reviewed head: `331d7bf262962ade448d1954b03a8caecebae9aa`.
Repaired head: `0e1d4ffc309b2502c9a6ca9b2d7e16dab269b6dc`.
Verdict: ready.

Inspected only the repair diff and A's repair report/implementation note. The sole changed file is `skills/init-akrogon/SKILL.md`. Both instruction sites now require a lockfile committed in HEAD. The gate uses `git ls-tree --name-only HEAD`; repositories without HEAD explicitly get no setup proposal. Plan D8 is reconciled by A's implementation note.

F1 resolved. Independently executed the specified gate in a disposable repository across all relevant states:

```text
unborn HEAD: exit 128, stdout '', stderr 'fatal: Not a valid object name HEAD'
staged-only lockfile, HEAD listing: 'package.json'
committed lockfile, HEAD listing: 'bun.lock\npackage.json'
```

Assertions confirmed the gate excludes a staged-only lockfile and includes it after commit. The fixture was removed. This closes criterion 8. No defects introduced by the repair, no remaining Fixes or Nits, and no operator actions.

Reused A's recorded post-repair checks: format unchanged, typecheck clean, docs-links 3 pass, changed tests 326 pass and full suite 421 pass. No code or test changes justify another suite rerun. The repair changes no existing test file and adds no Test-Change trailer. Worktree status was clean at repaired head.

## 2026-10-05 — merge checks

Prior reviewed head: `0e1d4ffc309b2502c9a6ca9b2d7e16dab269b6dc`.
Old base: `923c6c98fac3f051a54ac27168ea024215652602`.
Fetched target and refreshed AKROGON_BASE: `acba8087271fcaa152b3373f0dc932eaa814d5e2`.
Rebased head: `878d7169004fcba9de73c05b3eb2dac7e4425a06`.

Rebase completed without conflicts. Range-diff shows the four leaf commits preserved, with only surrounding context reflecting main's Nit-recording rule in check-issue. No held Nits or outstanding edits. Read all five merge-turn leaf briefs before any completion move.

Post-rebase checks:

- `bun run format`: exit 0, all unchanged.
- `bun test --timeout=30000`: exit 0, 421 pass, 0 fail.
- `bun run typecheck`: exit 0.
- Changed tests with AKROGON_BASE set to `acba8087271fcaa152b3373f0dc932eaa814d5e2`: exit 0, 326 pass, 0 fail.

No configured merge_checks or advisory commands. No setup configured in this repository. All checks ran in the leaf worktree. Pending pre-push guard and fast-forward push.

Pre-push worktree status empty. `akrogon phase check-setup merged --slot B --check` returned `ok`. `git push origin HEAD:main` succeeded fast-forward, `acba808..878d716`, exit 0. Published head: `878d7169004fcba9de73c05b3eb2dac7e4425a06`.

Final phase call returned `moved merged`. It printed no `issue complete` or `epic complete` line, so no completion broadcast was triggered.
