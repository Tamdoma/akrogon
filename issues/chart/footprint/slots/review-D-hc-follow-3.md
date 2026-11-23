# Slot D review, hc-follow, round 3

Verdict fix

- Base `40a577709865b03cdd640bbecb8475458515faa9`
- Head `4b9f0791dfab5d0e4995582e569fdf862a0ef3a3`

**F4 fixed.** I injected the original `notice` and an unknown `presence` event with null terminal and data after a real snapshot. The fixture wait reached its normal timeout. The blocked-consultant and observe restart tests completed normally. The fixture's retained status and turn updates passed the unmodified delivery, start and door-reset tests (`src/hc.ts:380–391`, `tests/hc-fixture.ts:299–310`).

**F5 fixed in production.** After `missed` at seq 5, `waitFor` ignored the stale statuses and timed out when those were the only changes. A fresh idle event at seq 6 satisfied the wait. The stream regression test failed when I removed the sequence check. The prior valid and malformed snapshot and event cases still behaved as expected, including a `missed` snapshot triggering a second document read (`src/hc.ts:358,423–438,547–548`).

**F6. The shared test fixture still applies stale events after recovery.** It accepts the normalized `missed` snapshot and then merges each status or turn without checking its sequence (`tests/hc-fixture.ts:299–310`). In a replay layered on a real hc stream, the recovered terminal was working at turn 2. An older idle status nevertheless satisfied the fixture's wait for turn 2 idle. This is the same predicate used in delivery tests. Apply the recovery cutoff in test readers that consume recovery snapshots so their waits reflect current state.

All 62 unmodified tests across identity, listener, observe, delivery, window calls, door exchange, door reset and hc-start passed on hc 0.1.22 with `--timeout=120000 --max-concurrency=5`. `git diff --check 40a57770..4b9f0791` passed.
