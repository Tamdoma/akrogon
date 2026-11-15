# Design: cleanup-last-in-pass

## Binding decisions, verbatim

### Signposts (issues/chart/merged-batch-cleanup/forks/signposts.md), A's picks under full autopilot, 2026-11-09

- 1a: Once a pass removes a merged leaf's last cleanup blocker, cleanup finishes in that same invocation, through the existing cleanup path, keeping every existing safety veto and broadcast retention. Foreclosed: a separate scheduled cleanup invocation; periodic reconciliation.
- 2a: Every merged-leaf batch-release route in the orchestration (the already-merged holder and the `merge` holder `commandMerged` moves inside the pass). Foreclosed: only the observed route; all finished-leaf retention and listener behavior.
- 3a: Remove the window where safe; a second cleanup call only if removal is unsafe. Foreclosed: smallest diff wins.
- 4a: No new durable work; a successful pass completes cleanup, existing startup/resume recovery covers interruption.
- 5a: No leftover display change.
- 6a: No paid calls and no live mutations: deterministic local tests with isolated fixtures, plus required checks.

### Cleanup after release (forks/cleanup-after-release.md), A's pick under full autopilot, 2026-11-09, checked by B

Cleanup runs last in a pass. `nextCommand` and `unpausePass` (src/next.ts) run the existing `reconcileRepos` after the merge step (in `nextCommand` after the per-repo merge loop), once per invocation, under the global lock, for the same repos and `isAutomatic` flag as today, on a fresh discovery. The pre-merge call is moved, not duplicated; it is kept in addition only if the plan names a same-pass dependency on pre-merge cleanup, recorded in the plan. `mergeWake` is unchanged and runs no repo cleanup (its phase-command caller runs inside the reporting seat's terminal and `endSeats` has no own-terminal veto; that seat's turn end is a listener event). Nothing is cleared at the merged move (the live land unit in the leaf slice still runs `landedWake`). No new state, timer, event or listener change; every existing veto kept.

Rejected: clear the batch at the merged move; cleanup at the release point inside `reconcileBatch` (would end the reporting merge seat mid-command); a second final reconcile by default (two scans per pass); a separate release stage; a timer or listener change.

Stated limits, not designed for: L1, a landing with no broadcast ends with `landedWake` ending the last seats and closing the tab, then the land unit exits; the listener does not watch the unit's exit, so a pass started by that seat event that reaches `reconcileBatch`'s `landAlive` check while the unit is still active keeps the batch and no further event is guaranteed (same gap on the base). L2, a `mergeWake` from a land unit that releases another holder's batch leaves that holder to the next event.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: a bug fix, so criteria 1 and 2 each show a test failing on the base and passing after, at the real boundary (the `akrogon next` CLI against an isolated fixture repo, private hc core, stand-in seats and fake systemctl, as tests/batch-dispatch.test.ts and tests/green-merge.test.ts already do). Criterion 1 asserts after the first invocation; a test that runs a second pass before asserting proves nothing here. Criterion 2's second pass checks only that nothing more is removed. Criterion 3 rests on the existing tests (tests/batch-dispatch.test.ts "cleanup retains a merged holder worktree while publication recovery is blocked" and "a green merge clears the record once the holder lands", the live-attempt and working-broadcast cases in tests/green-merge.test.ts, tests/pause-next.test.ts "unpause runs deferred merged cleanup"); a test is added only for a case they do not cover. No new fixture machinery; reuse `dispatchFixture`, `hcFixture` and their helpers. An existing test whose expectation depended on cleanup running before the merge step is corrected with its reason, not deleted silently.

## Leaf architecture

- Owned surfaces: src/next.ts (`nextCommand`, `unpausePass`; `reconcileRepos` signature unchanged), tests covering the pass (tests/batch-dispatch.test.ts, tests/green-merge.test.ts, tests/next.test.ts, tests/pause-next.test.ts, or a new test file for criteria 1 and 2), and any doc under docs/ or src/AREA.md that states the pass runs cleanup before the merge step (grep "reconcile", "cleanup" and "merge pass" after the edit and report each remaining hit; lesson 2026-10-11 cleanup timing guide claims).
- State changed: when, inside one pass, cleanup reads leaf state. Consumers relying on it: `mergePass` → `mergeTurn` (src/next.ts) reads `state.worktree` and the merge queue after cleanup today; cleanup's `saveState(... worktree: undefined)` for a vanished worktree (src/reconcile.ts `reconcile`) will now happen after `mergeTurn` in the same pass. Open for the plan: whether `mergeTurn`, `broadcastPass` or `renameTabs` relies on cleanup having run first in the same pass; if one does, keep the pre-merge call too and record why (fallback decided above).
- Lock and mode: `reconcileBatch` takes the global lock itself and `mergePass` runs outside it, so the moved cleanup takes the lock again after the merge loop, never nested. Pause and `isAutomatic` rechecks in `reconcileRepos` stay as they are; a pause raised during the merge step is honored by the moved call.
- Host step: `reconcileRepos` runs `reconcileHost` once per call; the moved call keeps one call per invocation over the same repo set, so the host step stays once per pass.
- Unchanged: src/reconcile.ts retention rules (state.batch, broadcast, foreign pane, process, owner, lock, Git cleanliness, own slice), `mergeWake`, `landedWake`, src/land.ts, src/listen.ts, `commitMove`.
- Exclusions: open-owner worktree retention in `mergedWorktree` (existing rule); leftover display (signpost 5a); L1 and L2; issues/ (none).
- Dependencies: none.
