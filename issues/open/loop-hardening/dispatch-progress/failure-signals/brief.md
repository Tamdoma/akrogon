# Brief: failure-signals

## What
A failed leaf produces exactly one herdr notification per failure episode, recorded in state after successful delivery and retried on later sweeps until delivered. A seat busy for more than 60 minutes produces one notification and `akrogon status` shows how long each busy seat has been busy; nothing is interrupted.

## Why
Every sweep re-notifies every failed leaf (#11, reproduced three notices in three sweeps), and a wedged agent reporting `working` holds its leaf forever with no signal (#9).

## Done-criteria
1. `bun test tests/next.test.ts` passes with new cases: (a) three sweeps over one failed leaf produce one notification and state records delivery; (b) a failed notification (fake herdr exits nonzero) leaves no delivery record and the next sweep retries; (c) the record clears when the leaf moves `failed -> implement`; (d) a seat first seen busy is stamped, a sweep 61 minutes later (clock injected through the test's fake time or a state stamp in the past) notifies once and does not consume an attempt or change phase; (e) the seat becoming idle clears the stamp.
2. `bun test tests/status.test.ts` passes with a case showing `busy A 1h02m` (exact format chosen in the plan) in the leaf row for a stamped seat.
3. CLI end-to-end run leaves `implementation/cli-artifact.log` with the notification calls received by the fake herdr.
4. `bun run format`, `bun run typecheck`, `bun test` pass.
