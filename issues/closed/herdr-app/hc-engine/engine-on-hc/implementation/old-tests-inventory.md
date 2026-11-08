# Old tests on the herdr pane path (inventory, 2026-11-07, Explore pass)

Tags: PANE = depends on fake herdr pane/tab/agent calls of engine paths; PANE-R = only reads pane/tab lists for liveness; NOTICE = only notice sends; NONE = no herdr dependency. Counts are source tests (template-literal loops count once).

| File | Tests | Tag summary |
|---|---|---|
| tests/next.test.ts | 202 | almost all PANE (dispatch, capacity, delivery, sessionFile settlement, layout, focus, .env, scratch, merge turn, blocked report, target resolution); ~12 NONE? |
| tests/batch-dispatch.test.ts | 22 | all PANE (dispatch via `allocatedLeaf`) |
| tests/batch-merge.test.ts | 20 | NONE? (fake herdr env only for `phase`'s `mergeWake`) |
| tests/green-merge.test.ts | 14 | PANE (setup through `next`), 1 NONE |
| tests/pause-next.test.ts | 17 | 15 PANE, 2 NONE? |
| tests/dependents-first.test.ts | 4 | 3 NONE, 1 PANE |
| tests/release-any-phase.test.ts | 14 | mostly PANE-R, 2 PANE, 2 NONE? |
| tests/leaf-stop.test.ts | 10 | all PANE (setup through `next`) |
| tests/leaf-slices.test.ts | 16 | PANE/PANE-R mix, 5 NONE? |
| tests/reconcile.test.ts | 41 | PANE (setup through `next`) and PANE-R |
| tests/timing.test.ts | 7 | 6 PANE, 1 NONE |
| tests/phase.test.ts | 58 | 4 PANE (tab rename), ~9 NOTICE, ~45 NONE |
| tests/seat-containment.test.ts | 10 | all PANE (boxing, D21 deletes) |
| tests/session-routing.test.ts | 19 | 16 PANE, 3 NOTICE |
| tests/session-reads.test.ts | 9 | PANE/PANE-R |

About 400 source tests depend on the pane path. Per-case lines were returned in the Explore answer (not kept here); rerun the inventory for exact names when porting.
