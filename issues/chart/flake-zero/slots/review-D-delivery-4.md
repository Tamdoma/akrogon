# Slot D delivery-flakes round 4

Verdict **fix**. Reviewed `79ce1b28` on `14774a0e`.

- **F8 · fails in normal use.** The agy wait can start a task after its start-proof budget expires. `waitFor` awaits the trust-key call inside the loop, then `next` returns a queued line even with a negative remaining time. In a `startConsultant` replay with a 150 ms budget, I held the trust-key reply for 450 ms and queued idle during the hold. This revision called `hc send` 453 ms after `keys`, then returned unconfirmed. Main returned unconfirmed after 160 ms with zero sends. Apply the deadline to predicate waits and queued lines so an expired wait cannot initiate another action. See `src/hc.ts:528–536,559–574` and `src/seat.ts:146–177,210–243`.
- **F9 · fails in normal use.** `waitForTerminal` starts the caller's timeout only after `subscribe` receives the snapshot, which has a separate 60 s deadline. In a replay with a 50 ms caller bound and the snapshot delayed 240 ms, main returned `null` at 51 ms. This revision accepted the snapshot and returned idle at 246 ms. The door uses this wait before resetting or renaming a seat and expects the configured bound to cover the whole wait. See `src/hc.ts:538–545,578–589` and `skills/chart-issues/scripts/door-reset.ts:28,88–91,129–138`.
- **F10 · minor.** The fixture regression caps the `got` poll but never asserts that the held lookup returned a terminal. I made the gated shim exit 17 without producing a result or marker. The test still passed after 13.7 s. Assert successful lookup completion so the test actually exercises a late result. See `tests/hc-identity.test.ts:387–392,406–420`.

**F5–F7.** The first-task proof consumes the event queue without a fresh lookup, removing F5's slow-read path. The fixture test's marker loop now has a bound, closing F6. The pre-launch subscription test passed on this head and returned unconfirmed when I restored the `c79a18ff` implementation. I verified the supplied stress logs contain 100 clean copies and the verify log records 1,423 suite passes and 50 repeat passes.

Typecheck, diff check and 36 focused tests passed.
