# Review A: tree-preflight

Base: a6b53fdceca8e54b7618f59cffd0beb53c2d882b
Reviewed head: 0e63cba4095b27d14ba5787c1b989061e0016781
Debate: no, so no positions or rebuttal exist.

## Verdict: ready

## Judgement against plan and brief

- D1/D2: `validateLeafDepth` computes area-relative depth with `relative` and path components, accepts only 2 or 3, names `<leaf>/state.yaml`, and throws a ZodError. `leavesUnder` carries the area root through recursion. All subtree callers in park, phase and pull pass their known root and change no parking or completion logic.
- D3: next `discover` and the status overview walker validate at each discovered state and keep their existing error policies. Status sets the diagnostic path to `state.yaml` before validation.
- D4: ordinary slug/path selection runs before the global lock in `selectLeaves`. An invalid-only selection leaves `leaves` empty, skips `withLock` entirely, exits 1 via the skipped set, and keeps the original path diagnostic. Valid selections still enter the locked `dispatchLeaf` which rediscovers under the repo lock. `--all`, `tab_closed` and hook-pane routes remain inside the lock unchanged.
- D5: `missingLeafMessage` is shared by `findLeaf` and the explicit-slug miss in next. It enumerates parked owner/child/leaf folders via `issueFolders`, requires a state file at the slug folder, never parses it, and does not match an owner name alone or arbitrary nesting. The state/park import cycle contains only function references. Real CLI tests exercise it.
- D6: shapes.md preflight and the SKILL.md audit both require the `issues/closed/<top-level-owner>` check before any write, treat an empty folder as a collision, name the conflicting destination, and distinguish the epic owner from nested child issues. C5 scenarios hold on reading.
- D7: no schema, mismatch message, or completion behavior changes. No new dependency.

## Tests versus acceptance criteria

- C1: `tests/next.test.ts` covers open/closed at depths 0, 1 and 4 for slug and path inputs with a recording `flock` stub that fails if invoked, a 3s bounded child with SIGKILL and reap, and asserts no state, db, log, worktree, agent call or global lock change.
- C2: `tests/state.test.ts` covers depths 0 through 4 in both areas via `allLeaves` and `leavesUnder`. The mixed-tree next test shows the invalid merged leaf reported and excluded while a healthy leaf dispatches under `--all`, `.` and hook routes, and merged cleanup does not touch it.
- C3: both parked shapes, malformed dormant state, absent and owner-only misses, and active/closed precedence are covered in state, next and status tests. Message assertions use the fixed reference from the brief.
- C4: status overview reports `unreadable` with the state path while still listing the other repo, detailed status rejects invalid open and closed discovery, and snapshots prove no writes.
- No mocks of the unit under test. Fixtures run the real CLI as a child process.

## Verification evidence

- `verification-tree-preflight.txt`: 89 pass, 0 fail across next/status/park/phase/pull, plus 29 authoritative records loaded through the changed `allLeaves`.
- `implementation/full-test.txt`: 166 pass, 0 fail. `format.txt` and `typecheck.txt` empty with exit 0.
- Reran in the worktree at head: `bun test tests/state.test.ts tests/next.test.ts tests/status.test.ts` 82 pass, 0 fail, exit 0. `bun run typecheck` exit 0. `git status --porcelain` empty.

## Findings

None blocking. No nits.

## Merge attempt (slot A)

Rebase target: origin/main at a4f0b5d88080026860be4837f97f6a89a7c52a1c (base refreshed from a6b53fd).
Rebasing 0e63cba stopped with conflicts. Rebase context is preserved in the worktree for check.fix.

Conflicting files:
- src/next.ts
- src/phase.ts
- src/pull.ts
- src/status.ts
- tests/next.test.ts
- tests/status.test.ts

Checks not run because the rebase is unfinished.

## Re-check after check.fix 1 (slot A)

Baseline: rebase conflict on origin/main a4f0b5d88080026860be4837f97f6a89a7c52a1c, prior reviewed head 0e63cba.
Repaired head: f8c7e2f261994ec1030accfd5b681c70491cf833, on top of a4f0b5d. Worktree clean, no unmerged paths.

Inspected `git range-diff a6b53fd..0e63cba a4f0b5d..f8c7e2f`. The only differences from the reviewed patch are upstream adaptations: `RepoMismatchError` replaces the inline mismatch throws in next and status, the `--all` route keeps upstream's sweep-before-cleanup order, `completeOwner` passes the open area root to its restructured subtree scans, and pull.ts no longer calls `leavesUnder` because upstream removed that scan. Test hunks moved only by context. No behavior from the plan was dropped and no new behavior was introduced.

Earlier findings stand: verdict ready, no nits. No defect introduced by the repair.

Evidence: `repair-1-red.txt` (conflicted tree 75 pass, 24 fail), `repair-1-green.txt` (176 pass), `repair-1-full-test.txt` (181 pass, 0 fail), `repair-1-inventory.txt` (29 authoritative records), format and typecheck exit 0. Reran at f8c7e2f: `bun test tests/state.test.ts tests/next.test.ts tests/status.test.ts` 92 pass, 0 fail, exit 0; `bun run typecheck` exit 0.

## Verdict: ready

## Merge attempt 2 (slot A)

Rebase target: origin/main at f3b25f55c302cc00aeee4896d5e595b0cd35a807 (base refreshed from a4f0b5d). Upstream commit "Remove unused state fields with legacy read migration" added its own `tests/state.test.ts`.
Rebasing f8c7e2f stopped with one add/add conflict. Rebase context is preserved in the worktree for check.fix.

Conflicting files:
- tests/state.test.ts (both added; both test groups must be retained)

Checks not run because the rebase is unfinished.

## Re-check after check.fix 2 (slot A)

Baseline: add/add conflict on `tests/state.test.ts` rebasing f8c7e2f onto origin/main f3b25f5.
Repaired head: 6b6c9ee181c7e64aface49dd0cef3415191ade17, on top of f3b25f5. Worktree clean.

`git range-diff a4f0b5d..f8c7e2f f3b25f5..6b6c9ee` shows only the combined imports and both test groups in `tests/state.test.ts`, plus upstream context in SKILL.md. Upstream's two migration tests and this leaf's depth/parked tests are all present. No production code changed relative to the prior reviewed patch.

Earlier findings stand: ready, no nits. No defect introduced by the repair.

Evidence: `repair-2-green.txt` 190 pass, `repair-2-full-test.txt` 195 pass 0 fail, `repair-2-inventory.txt` 29 records, format and typecheck exit 0. Reran at 6b6c9ee: `bun test tests/state.test.ts` 27 pass 0 fail; `bun run typecheck` exit 0.

## Verdict: ready

## Merge attempt 3 (slot A)

Rebase target: origin/main at 7be71885565323b89f666098748dcb127fdd84bf (base refreshed from f3b25f5). Upstream commit "Clarify invalid targets, Herdr responses and committed log failures" touched next selection.
Rebasing 6b6c9ee stopped with conflicts. Rebase context is preserved in the worktree for check.fix.

Conflicting files:
- src/next.ts

Checks not run because the rebase is unfinished.

## Re-check after check.fix 3 (slot A)

Baseline: conflict in `src/next.ts` rebasing 6b6c9ee onto origin/main 7be7188.
Repaired head: 21c2f3d1f908a3184b836931c9bc946f14394b5b, on top of 7be7188. Worktree clean.

`git range-diff f3b25f5..6b6c9ee 7be7188..21c2f3d -- src/` shows one adaptation: upstream's non-directory target rejection now sits in `selectLeaves` right after folder resolution, so it still fires before any lock. All other reviewed control flow is unchanged.

Earlier findings stand: ready, no nits. No defect introduced by the repair.

Evidence: `repair-3-red.txt` (conflicted tree 129 pass, 76 fail), `repair-3-green.txt` and `repair-3-full-test.txt` 205 pass 0 fail, `repair-3-inventory.txt` 29 records, format and typecheck exit 0. Reran at 21c2f3d: `bun test tests/next.test.ts tests/state.test.ts tests/status.test.ts` 113 pass 0 fail; `bun run typecheck` exit 0.

## Verdict: ready

## Merge attempt 4 (slot A)

Rebase target: origin/main at ad2fd66c700233abc91f5cc33d57cfe966c5d6e1. Rebase of 21c2f3d applied cleanly as 09c189f. Base refreshed to ad2fd66.

Checks in the worktree at 09c189f:
- `bun run format`: exit 0, no changes.
- `bun run typecheck`: exit 0.
- `test_changed` against ad2fd66: 205 pass, 0 fail, exit 0.
- `bun test`: 209 pass, 0 fail, exit 0.

First push of 09c189f was rejected non-fast-forward (upstream gained d928606 and 84500d5). Rebased cleanly to 1956e56 on 84500d5b40c0fd8e69ad98b9c5526faf96a4372c and reran every check: format exit 0 with no changes, typecheck exit 0, test_changed against 84500d5 205 pass 0 fail, `bun test` 209 pass 0 fail.

Pushed 1956e56 fast-forward to origin/main (84500d5..1956e56), confirmed with `git merge-base --is-ancestor`. `akrogon phase tree-preflight merged --slot A` recorded merge -> merged at 16:06:36Z, closed sources #8 and #14, and completed issue lifecycle-records and epic loop-hardening into issues/closed.
