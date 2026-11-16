# A seat that ends its turn to wait on a background run is failed by the controller

## Case

Leaf `keyword-research-skill` (framework repo), implement, slot A, 2026-11-15. A launched the paid Buffalo capture (`akrogon run-check --name capture-buffalo -- bun --env-file=... capture-phrases.ts --case buffalo`, about 150 s) as a background shell command and ended its turn to wait for the exit notice. The controller saw a turn end with no phase move and re-delivered the implement prompt. That happened at 21:36:35 and 21:36:46 (`issues/timings.jsonl` 79183, 79186). At 21:36:56 it moved the leaf `implement -> failed`, with `failure: {cause: attempts, reason: "seat A ended 3 turns without reporting"}` (`issues/log.jsonl` 6738; `src/next.ts:509-515`).

A did not see the move. It went on to launch three more paid runs under the leaf grant: national, e-commerce and a Buffalo re-record. `run-check` started each one with no refusal, and each is logged with `"phase":"failed"` (timings 79197-79216). That was about $2.20 of model cost and $0.18 of DataForSEO. The leaf returned to `implement` at 21:48:46 (`log.jsonl` 6740, slot null).

## Evidence

- `issues/log.jsonl:6738` and `:6740` in the framework checkout.
- `issues/timings.jsonl:79183-79216`.
- implement-issue SKILL.md proof order item 3: "A runs the exact printed command once, in the foreground with the tool timeout set above its expected run time."

## Learning

A turn that ends while a slow run is still in the background counts as a turn without a report. Three of them fail the leaf. Nothing then stops the seat: `akrogon run-check` launches covered paid work for a leaf in `failed` and only records the phase. Run slow runs in the foreground with a tool timeout above their size. A guard that would stop the mechanism: `run-check` refuses a leaf-scoped launch when the leaf phase is `failed`.

Report: https://github.com/Tamdoma/akrogon/issues/136

## Case 2026-11-16: framework keyword-intent-geo implement, delegated worker

A delegated the paid U3 re-record to a background worker subagent and ended its turns to wait for the worker's notification. The dispatcher re-prompted A three times; each turn ended without a phase move, so the leaf moved to `failed` (cause `attempts`, phase implement, slot A). The Buffalo capture already in flight finished (exit 0, $2.43); the next `akrogon run-check` (the replay) was refused with "the leaf is failed (seat A ended 3 turns without reporting)", so this time no further paid launch ran. Learning: the trap also covers waiting on a background worker, not only a background command; in a delegated run with a slow wave, A must hold its turn on the worker (foreground) rather than end turns to wait.
