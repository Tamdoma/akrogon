# Brief 1: test deletions, rewrites and new cases

## 1. Goal

Rewrite the test suite for the post-deletion contract (plan D9, D10). Against the current `src/` these edits must go **red** — that red run is required evidence, not a failure to repair.

## 2. Acceptance criteria

1. No test file contains the literal `issues/.lock`, `seatFor`, `peerOf`, `recoverMerge`, `withRepoLock`, `repo_max_active`, or `perRepo`.
2. `tests/fetch-deadline-harness.ts` is deleted and its test at `tests/next.test.ts:1310` is deleted.
3. New/rewritten cases exist for done-criteria 2, 3, 4, 5, 6, 7, 9 (specs in §6).
4. `bun test --changed` run once at the end: failures are expected and pasted verbatim as red evidence. Do not edit `src/`.

## 3. Read-first list

`plan.md` D9–D10, `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `yaml`, `fakeGh`, `next`, `dispatchFixture`, `database`, `saveDatabase`, `calls`, `skips`, `configure`, `resetPrompts`, `nextAt`), `tests/fake-herdr.ts` (pane fields: `agent`, `agent_status`, `agent_session`), `tests/fake-gh.ts` (`probe.lock` semantics: `flock -n` must fail = lock held), `tests/next.test.ts`, `tests/phase.test.ts`, `tests/sync.test.ts`, `tests/config.test.ts`, `ponytail.md`.

## 4. Change list

### tests/next.test.ts

- `:257` 'next resumes interrupted tab creation, retries same slot twice then peer once and fails' — rename to drop "peer once"; delete `expect(db.prompts[2].pane).not.toBe(db.prompts[0].pane)`; assert all three prompts hit the same pane.
- `:369` loop over `['idle','done','unknown']` — split: `idle`/`done` keep the clearing assertions; `unknown` keeps `agent: 'fake'` and asserts `busy_since.A` is set to `new Date(now + 63*60000).toISOString()` after the 63-minute sweep, and the following `working` sweep at 64 keeps that same value (busy_since is retained, not reset).
- `:398` 'logical B fallback warns for physical A and unknown agents retain busy observations' — rewrite: `attempts: {A:0,B:2}` with B `unknown` now waits (no prompt to A, attempts unchanged, `busy_since.B` set at `now`); the 61-minute sweep notifies `seat B`; the final `done:['B']` + all-`unknown` sweep now *sets* `busy_since` for both seats instead of preserving it.
- `:430` '…sends unknown panes to idle peers' — rename (e.g. '…waits on unknown panes'); the `first` leaf's B pane `unknown` now produces no prompt and `busy_since.B` set; drop the `prompts.at(-1)?.pane === pane.A` assertions.
- `:534`, `:571`, `:589` (per-repo `max_active` tests) — delete.
- `:609` 'unreadable state reserves its repo capacity' — rewrite on the global cap only: remove both `yaml(...issues/config.yaml, {max_active})` writes; use `configure(f, {max_active: 2})` then raise to `3` for the retry.
- `:673`, `:906`, `:1509` — `lock: resolve(f.home, '.lock')`.
- `:1065` scope loop — keep `'global'` only; drop `'repo'`.
- `:1298` `REMOVE_BEFORE_LOCK` — `resolve(f.home, '.lock')`; retitle to 'a selected leaf removed before its global lock is reported as skipped'.
- `:1310` 'recovery fetch deadline releases dispatch locks without transitioning' — delete test and `tests/fetch-deadline-harness.ts`.
- `:472` 'a merged leaf with its tab still open does not count toward max_active' — after the typed `next` with `HERDR_PANE_ID: b`, the merged leaf's tab is now closed in the same run: `database(f).tabs.map(t => t.label)` is `['second']`.
- `:524` 'merged phase leaves tab intact…' — rewrite: the typed `next` with `HERDR_PANE_ID: b` now sweeps and cleans: first tab closed, `second` started; drop the later `--all` cleanup step or keep it asserting nothing further changes.
- New case (criterion 5): leaf at `merge` whose branch HEAD is already an ancestor of `origin/main` (commit + push to a bare remote like `:652`), A pane `idle` → `next` prompts A (`merge-issue <slug> slot=A phase=merge`) and `state.phase` stays `merge`.
- New case (criterion 6): leaf `debate: 'yes'` at `plan.synthesis` with no positions files → `next` exits 1, stderr contains the slug and `plan.positions`, no tab/pane/worktree created, state.yaml unchanged. Then write `positions-A.md` and `positions-B.md` into the leaf folder → `next` dispatches normally (prompt `plan-issue <slug> slot=B phase=plan.synthesis`).
- New case (criterion 9): leaf `done` at `merged` with a live worktree; typed `next` with `HERDR_PANE_ID` set to another leaf's pane and no `HERDR_PLUGIN_EVENT_JSON` → exit 0, the merged leaf's worktree is removed in the same run.
- New case (criterion 2, may fold into the `:369` split): an `unknown` pane gets no prompt, keeps attempts, `busy_since` set.

### tests/phase.test.ts

- `:267`, `:541`, `:546`, `:634` — `lock: resolve(f.home, '.lock')`.
- New case (criterion 3): leaf at `failed` with `fix_rounds: 3`, `attempts: {A:1,B:2}`, `done:['A']` → `cli phase <slug> plan.synthesis` exits 0, state has `attempts {A:0,B:0}`, `done:[]`, `fix_rounds:0`. Then a second `failed` leaf → `cli phase <slug> check.fix` exits nonzero with 'Illegal move', state.yaml bytes and `issues/log.jsonl` unchanged/absent.
- New case (criterion 4): leaf at `implement` with a worktree whose HEAD equals `origin/main` (worktree added, no commits) → `cli phase <slug> check.review --slot B` exits nonzero, stderr names `origin/main`, state.yaml and log unchanged.

### tests/sync.test.ts

- `:25` — after sync, `git status --porcelain` is `''` (no `?? issues/.lock`).
- `locksFree` — check `resolve(f.home, '.lock')` only.
- `:147` staged-exclusion list — drop `'issues/.lock'` (keep `'issues/nested/.lock'`).
- `:246` — loop over `[resolve(f.home, '.lock')]` only.
- `:273-283` 'sync owns global lock while waiting for repo lock' — delete.
- `:303` location loop — drop `'issues/.lock'`; keep `'settings [1]*/.lock'`; the trailing lock check uses `resolve(home, '.lock')` only.

### tests/config.test.ts

- `:19-32` — drop the `repo_max_active` assertions and the `max_active: 2` repo yaml block.
- `:56` loop over `[0,-1,1.5]` — replace with a single case: `yaml(issues/config.yaml, {max_active: 2})` → `cli config` exits nonzero and stderr names `max_active` (unrecognized key).

## 5. Do-not

Do not edit `src/`, `docs/`, `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/fake-gh.ts`. Do not weaken assertions to make red green — red is the deliverable. If a listed line number does not match content, find the test by name. Return a mismatch with evidence if a spec contradicts the fixtures.

## 6. Ordered steps

1. next.test.ts edits + new cases (criteria 2,5,6,9).
2. phase.test.ts edits + new cases (criteria 3,4).
3. sync.test.ts edits.
4. config.test.ts edits (criterion 7).
5. Delete `tests/fetch-deadline-harness.ts`.
6. Run `bun test --changed="26a7bc2613af4a2c9d579351bc66e87cd1af1427"` with `AKROGON_BASE=26a7bc2613af4a2c9d579351bc66e87cd1af1427`; paste output (expect failures).
7. Grep check: `grep -rn "issues/.lock\|seatFor\|peerOf\|recoverMerge\|withRepoLock\|repo_max_active\|perRepo" tests/` returns nothing.

Advisory size: ~4 files, under 60 turns.

## 7. Commands

`AKROGON_BASE=26a7bc2613af4a2c9d579351bc66e87cd1af1427 bun test --changed="26a7bc2613af4a2c9d579351bc66e87cd1af1427"` — red output expected and required.

## 8. Done-when

All edits landed, greps clean, red run pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
