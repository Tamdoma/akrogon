# Final-shape disagreements: B

## C1. L1 describes the old ordering and misclassifies the remaining race

Under the proposed shape, the releasing `mergePass` precedes cleanup. L1 must remove cleanup from the work preceding `landAlive`. The relevant sequence is startup/discovery/sweep, then `reconcileBatch`'s fetch and locked liveness check (`src/next.ts`, `nextCommand`, `mergePass`, `reconcileBatch`). There is no measured basis here for calling the remaining window narrow.

Also, this is an ordinary successful-run race, not a killed-pass recovery case under signpost 4a. `src/land.ts`, `land`, awaits `landedWake` before exiting. `src/next.ts`, `landedWake`, can end the last seats before that exit, while `src/listen.ts`, `listenCommand`'s event handler, does not subscribe to the land unit's service exit. If the resulting pass sees the unit active, the batch remains and no further event is guaranteed. L1 can remain an explicit scope limit, but should identify that normal-operation gap without claiming signpost 4a settles it.

## C2. Done-criterion 2 needs the eligibility and exclusion conditions

As written, it covers every invocation of both release routes, including the excluded open-owner case. `src/reconcile.ts`, `mergedWorktree`, closes a live tab but returns whenever the leaf is still under `issues/open`. A second pass with no intervening change can then remove that worktree. This directly violates criterion 2 while preserving the proposed exclusion.

Scope criterion 2 to the controlled eligible fixtures: a closed merged holder without broadcast or another retention veto, and the recovered merge holder with no live tab and an incomplete owner so no broadcast is created. Keep first-invocation cleanup assertions primary. A second invocation may prove idempotence only under those conditions. Evidence: `src/reconcile.ts`, `mergedWorktree`; `src/phase.ts`, `commandMerged`; `src/next.ts`, `mergeTurn` runs `broadcastPass` before recovery can create a new handoff.
