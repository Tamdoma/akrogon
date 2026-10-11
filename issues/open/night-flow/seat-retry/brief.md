# Brief: seat-retry

## What
A seat that fails to start or to take its prompt never sends the leaf to `failed`. The fault is recorded and the next pass tries again.

- The automatic `failed` move after three undelivered passes (`src/next.ts:609-617`) and the immediate `failed` move for an unreachable seat (`:621-629`) go. Both cases record the error (command, code, message, pane, session, time) and raise the attempt count, as the retryable path already does. The leaf keeps its phase.
- A later successful delivery clears the error and the count, as today (`recordDelivery`).
- A late delivery is reconciled from the recorded offset only when the pane's current session is the session recorded with the error (`delivery_error[slot].session`, written at `:602`). With a different or missing session, the old offset is not read and the prompt is sent again. Today the reconcile (`:645-652`) reads the current session's file at the old offset without that comparison, so after a session replacement it can miss a delivery or clear the error on old matching text (A,B).
- A dead agent already shows as no agent in the pane and takes the existing relaunch branch (`:654`), and its per-pane name can start again (door proof, chart night-flow, fork failed-exits). Neither needs new code.

Owned: `src/next.ts` (`recordFailure`, `unreachable` and the delivery reconcile in `dispatchSlot`), its tests, and `docs/guide/next.md` (today `:133`).

## Why
Tamdoma/akrogon#84 and the operator's 2026-10-11 night: five of the night's failed moves were seat delivery faults, and every one recovered with a bare retry. A failed leaf then sat unnoticed for hours with leaves blocked behind it. The operator chose retry on the next pass (chart night-flow, fork failed-exits, S5).

## Done-criteria
1. A seat whose `herdr agent start` or `herdr agent prompt` fails with a retryable error on three or more passes stays in its phase with the error and attempt count recorded, and the next pass tries again.
2. A seat whose herdr call fails with a non-retryable error stays in its phase with the error recorded, and the next pass tries again.
3. A delivery that succeeds after recorded failures clears the recorded error and resets the count.
4. `akrogon status` shows a leaf with a recorded delivery error with its slot, error code and attempt count, and `docs/guide/next.md` says delivery faults retry on the next pass and never fail the leaf.
5. A recorded delivery offset is used only while the pane's session equals the session recorded with the error. After a session replacement, matching text past that offset in the new session's file neither clears the error nor skips the next prompt, and the prompt is sent again (A,B).
