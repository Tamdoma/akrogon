# Cleanup after batch release

## Question

Q1. Where does the cleanup of a merged leaf follow the release of its merge batch, so that the releasing invocation finishes it?
Q2. Which test proves it?

### Carries

Signposts 1a (same invocation, existing path, all vetoes kept), 2a (every release route), 3a (remove where safe), 4a (no durable work), 6a (local tests only). Intake: issues/chart/merged-batch-cleanup/INTAKE.md.

## Findings

Merged blind notes: slots/cleanup-after-release-merged.md (from slots/map-A.md, slots/map-B.md).

Rebuttal: slots/cleanup-after-release-rebuttal-B.md (R1 seat-caller teardown at the release point, R2 shared `commitMove` coverage, R3 caller-safety proof). Final shape: slots/cleanup-after-release-final-shape.md; B's check: slots/cleanup-after-release-final-check-B.md (C1 L1 wording, C2 criterion 2 scope), both adopted below.

Charting observations (free, local, main 50d925f2, 2026-11-09): `bun test --timeout=60000 tests/batch-dispatch.test.ts tests/hc-teardown.test.ts tests/pause-next.test.ts` 46 pass 0 fail (slots/evidence/guards-main-50d925f2.log); `bun test --timeout=60000 tests/green-merge.test.ts` 13 pass 0 fail (slots/evidence/green-merge-main-50d925f2.log). Identity: the operator's user, isolated fixtures (temp Git repos, private hc core, stand-in seats, fake systemctl per tests/AREA.md). Cleanup: fixtures self-clean. Limits: proves the existing retention guards and the existing merged-leaf cleanup path pass on the base; does not reproduce the strand (the leaf's criterion 1 is red on base) and touches no real session.

## Taken

A's pick under full autopilot (2026-11-09T14:32Z, door t15), not operator words.

Q1: cleanup runs last in a pass. `nextCommand` and `unpausePass` (src/next.ts) run the existing `reconcileRepos` after the merge step (in `nextCommand` after the per-repo merge loop), once per invocation, under the global lock, for the same repos and `isAutomatic` flag as today, on a fresh discovery. The pre-merge call is moved, not duplicated; it is kept in addition only if the plan names a same-pass dependency on pre-merge cleanup, recorded in the plan. `mergeWake` is unchanged and runs no repo cleanup (R1: its phase-command caller runs inside the reporting seat's terminal and `endSeats` has no own-terminal veto; that seat's turn end is a listener event). Nothing is cleared at the merged move (R2 noted; the live land unit and follow-up work objections stand). No new state, timer, event or listener change; every existing veto kept.

Reason: signpost 1a (same invocation, existing path), 2a (both release branches in `reconcileBatch` run inside `mergePass`, which now precedes cleanup), 3a (one call moved, nothing added). Decided by B's R1 against the release-point option.

Rejected: clear the batch at the merged move (live land unit in the leaf slice still runs `landedWake`); cleanup at the release point inside `reconcileBatch` (R1, would end the reporting merge seat mid-command); a second final reconcile by default (two scans per pass, kept only as the plan's named fallback); a separate release stage (new boundary, no concrete benefit); a timer or listener change (signposts 1a, 2a).

Q2: proof as the leaf's done-criteria: (1) the closed-holder red/green test asserted after the first invocation; (2) idempotence for the eligible fixtures of both release routes, scoped per C2; (3) existing retention guards unchanged, including seat-owned phase completion not closing the holder's own tab (R3).

Stated limits: L1 (C1) in normal operation, a landing with no broadcast ends with `landedWake` ending the last seats and closing the tab, then the land unit exits; the listener does not watch the unit's exit (src/listen.ts), so a pass started by that seat event that reaches `reconcileBatch`'s `landAlive` check while the unit is still active keeps the batch and no further event is guaranteed. The same gap exists on the base; this chart does not widen it and does not design for it (recorded only). L2: a `mergeWake` from a land unit that releases another holder's batch leaves that holder to the next event.

Standing dissent: none. B accepted the moved-call placement with C1 and C2 applied.
