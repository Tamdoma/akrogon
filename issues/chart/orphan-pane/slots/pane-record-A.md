# Pane record, slot A notes

## Pick
(a) Record each pane id in state as soon as allocate has it (first, then second), before `box`. Reason: the orphan class is "a pane akrogon made that state does not record". Recording at creation removes it on every path (bootstrap, repair-A, missing-B), not only bootstrap. The cost "recorded but unboxed" is already handled by allocate's entry sweep, which closes a recorded pane outside its scope (the Herdr-restore path, docs/guide/next.md "A recorded pane found outside its scope ... is closed and recreated"). Residual: process death inside the herdr split round trip or between its return and saveState (milliseconds).
Cost: deletes the "boxed before any save" invariant. One consumer trusts it: broadcastPass (src/next.ts broadcastPass) skips allocate when the recorded B is live and prompts it directly. That shortcut must stop trusting a live B without the scope check.

## Rejected
- (b) bootstrap reuses an unrecorded member as B: covers only bootstrap. The repair path (recorded A gone, B recorded) and the missing-B path also split then box, and a box throw there orphans too. Adopts operator hand-split panes, which docs allow in leaf tabs. Picks by herdr list order.
- (c) reconcile unrecorded members before splitting: needs an ownership rule that docs contradict (hand-split panes are operator's). More code.
- (d) close the fresh split pane when box throws: handles throws, not interrupts (5 s box window), adds a catch path.

## Evidence (better-than-training, inspected 2026-10-22, HEAD 92dddada)
- src/next.ts allocate: saveState(tab) then split, box(first), box(second), then saveState(pane A,B).
- src/next.ts broadcastPass: `(await panes()).some(pane_id === fresh.state.pane.B) ? fresh.state : allocate(...)`.
- Other readers (log.ts paneId, reconcile broadcastInProgress, next observeBusy, dispatchSlot after allocate) only read status or run after allocate.

## Pitfalls
- Unboxed B prompted by broadcast: removed by making broadcast's shortcut require the pane inside its scope, or by routing through allocate (plan decides; done-criterion proves no prompt reaches an outside pane).
- Retry loop when box keeps failing: each pass closes and re-splits one pane; bounded to one extra pane per pass, never accumulating. Done-criterion: repeated failing passes leave tab members equal to recorded ids.

## Question the fork does not ask
None material.
