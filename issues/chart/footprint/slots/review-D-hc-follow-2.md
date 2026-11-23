# Slot D review, hc-follow, round 2

Verdict fix

- Base `40a577709865b03cdd640bbecb8475458515faa9`
- Head `507b333f49e6ec7ca14bc9ea99bd867666985495`

1. **F1 fixed.** A valid snapshot with an extra `params: null` reached the callback. The same shape with `terminals: 42` rejected (`src/hc.ts:380–405`).
2. **F2 fixed.** A `turn` event with a missing or numeric terminal rejected. Bad doc data also rejected (`src/hc.ts:359–375,387–408`).
3. **F3 fixed for snapshot delivery.** A `missed` carrying turn 2 satisfied a terminal wait that started at turn 1. The same sequence made `waitForDoc` read and return document version 2. Invalid `missed.params.terminals` rejected (`src/hc.ts:380–405,493–502,530–541`).
4. **F4 partly fixed.** Injecting the original `notice` after a real hc snapshot passed the fixture wait probe, blocked-consultant test, and observe restart path. An unknown `event` type still reaches the fixture's payload parser. Injecting a `presence` event with `data: null` after the snapshot made the fixture wait fail with a Zod error (`tests/hc-fixture.ts:299–309`). Filter unconsumed event types before validating or merging their data.
5. **F5. Discard events at or below a recovery snapshot's sequence in this change.** The plain hc stream drains its queue, then takes the snapshot under a separate lock. A producer can enqueue an event in that gap with a sequence the snapshot already covers. hc's contract tells the reader to discard it. In a probe, a `missed` snapshot at seq 5 showed turn 2 working. A delayed idle status at seq 3 made `waitFor` return turn 2 idle before the queued working status was processed. Without the stale event, the same wait stayed open until a genuinely newer idle status. This can complete a wait using stale state. Preserve the recovery sequence and skip events at or below it per stream (`src/hc.ts:358,427–431,493–502`). [hc event contract](https://github.com/herdrdev/herdr-core/blob/v0.1.22/schema/README.md#events) · [hc plain-stream implementation](https://github.com/herdrdev/herdr-core/blob/6e2984629fcd600b0165f69b2e5b0bda5985ec1c/crates/herdr-core/src/server.rs)

All 39 tests across identity, listener, observe, delivery, window calls and door exchange passed unmodified on hc 0.1.22 with `--timeout=120000 --max-concurrency=5`. `git diff --check 40a57770..507b333f` passed.
