# Slot D delivery-flakes round 3

Verdict **fix**. Reviewed `28553ec6` on `14774a0e`.

- **F5. A fresh read can still hide timely start proof (F1).** `waitForState` waits for `hc get` on every snapshot and event. The stream waits for that lookup, and the wait can expire despite a delivered `working` report. In a real hc replay I released the seat after the proof subscribed, observed the `working` event and held the proof lookup past a 2.5 s budget. The seat remained working at turn 0. The base confirmed and wrote `prompted.A`. This head printed `started, not confirmed` and wrote `delivery_error.A.code=not_confirmed`. Preserve the start proof from events delivered within the budget alongside the fresh read that recovers a startup drop. See `src/hc.ts:440–445,507–543` and `src/seat.ts:219–228,341–362`.
- **F6. The new fixture regression can wait forever when the read never starts.** After rejection the child records whether `get` started, then always waits for `got`. I forced the fixture to skip the read and observed that it entered this loop with no reader to write the marker. The original loop has no bound, the caller supplies no subprocess timeout, and fixture cleanup follows the loop. A missing read should fail the assertion and clean up. See `tests/hc-identity.test.ts:389–412`.

**F3 and F4 closed.** `waitFor` matches main and the real-core second-idle replay retried and delivered exactly one task. The gated fixture read made zero predicate calls after rejection. Both new regressions failed with the corresponding `fe7e6361` code restored. The accepted agy subscription-start gap remains.

Typecheck, diff check and 30 focused tests passed. Supplied logs show 104 clean hc-delivery copies across 26 stress rounds, plus 1,423 suite passes and 50 repeat passes.
