# Agy2 B: flake-zero

Read at worktree head c79a18ff. (H) marks what I ran on this host on 2026-11-23 in a private throwaway hc session (`akr-probe-b5`, removed), hc 0.1.22, 48 busy loops on 32 cores. Nothing in the repo changed.

1. Agree with A, with a label filter in place of an unfiltered stream. hc accepts `hc events --label k=v` before any such terminal exists, and `hc run --label` sets the labels at creation.
2. Probe (H): a stand-in that reports idle then done within 8 ms of its start, 2,000 starts per way, under load. Subscribed by address after `hc run` returned (today's way): 32 starts lost a report (1.6%), and in 25 of them the stream never reached the true state. Subscribed by label before `hc run`: 2,000 of 2,000 got `created`, idle and done, in that order.
3. Why my 1 in 10,000 was wrong: `scopeEntry` returns when the seat enters its scope (`src/seat.ts:334`), which is when the harness starts. So `agyTask` subscribes just as the stand-in sends its first report.
4. Filter: the launch's `akrogon.repo`, `akrogon.leaf` and `akrogon.seat` labels in `startSeat`, and the caller's `spec.labels` in `launch`. Not the `herdr.*` labels, which herdr-app may change. The stream may also carry an older terminal of the same seat, so lines are still matched by address.
5. Cost (H): the first line of that stream was 44 bytes on the live session. Unfiltered it was 73,837 bytes (62 terminals), and `--label akrogon=1` 45,352. Snapshot arrival took at most 33 ms under load.
6. `src/hc.ts`: one function opens the stream, queues every line and resolves when the snapshot arrives. `waitFor` takes that stream in place of `session` and becomes a plain loop: next line or the deadline, merge, ask `until`. It no longer opens or stops anything.
7. `src/seat.ts`: `startSeat` and `launch` open the stream before `run` (`:291`, `:384`), pass it to `firstTask` (`:341`, `:402`) and stop it in a `finally`. `agyTask` (`:143`) and the proof (`:219`) read the same queue one after the other.
8. One change is needed in the merge: a `created` event must set `current`. Today a `null` current ignores every event (`src/hc.ts:512`).
9. Deletes: `waitForState` and its read (`src/hc.ts:530`), its three fake-hc cases (`tests/hc-identity.test.ts:325-360`), the second subscription per seat start, and the `settle` and timer code in `waitFor`. A predicate can no longer run after its wait ended, because the loop asks it in order.
10. Loss left, L1: hc sends `missed` with a new snapshot to a subscriber that fell behind. If the seat reports while hc builds that snapshot, the report may be lost as at a first start, and agy waits out its 60 s. It needs a reader that stops reading, and the queue reads without waiting on the predicate. I did not probe `missed`.
11. Loss left, L2: the fixture's `waitFor` and the e2e waits still subscribe to a live terminal. They are state waits, so the fixture's read on the snapshot covers them.
12. Could break: lines queue from before the address is known, up to 15 s of `scopeEntry`. That is a handful of lines. A failed `run` must still stop the stream.
