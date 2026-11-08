# Round 21 B

Verdict: changes needed for `3fdf8cd27953c66dd8a43ed30394569e68ee5a74`.

## F1: The clear branch claims success when duplicate jobs remain

`skills/watch-issues/SKILL.md:17–18`: the new first-prompt rule applies when CronList finds an exact-prompt job, delegates to the stop steps, then requires a stopped reply. But those stop steps delete nothing when several jobs match.

With two matching jobs after `/clear`, the first tick therefore deletes neither, reports the watch stopped, and skips its check. The next tick is no longer the first prompt and resumes checks with both jobs still active. This contradicts the completion claim and the clear-stop description at `docs/use/watch-while-away.md:42`.

At minimum, report the actual stop result instead of forcing a successful stop claim. Keep the existing duplicate-job refusal explicit if that remains the intended policy. The uncommitted skill edit visible during this review already changes the reply to the stop steps' result, addressing that false-success instruction. That edit is not part of the reviewed commit.

## F2: The ordering test no longer proves the event was handled during subscription

`tests/hc-listener.test.ts:128,140–144`: the new barrier observes the first stream's tee file. Tee writing a finished event does not establish that `src/hc.ts:387–397` has consumed it or invoked the listener callback. The test can release the second subscription and complete startup before the listener handles that event. Its pass-order assertions also accept that ordinary late-event sequence.

Confirmed using a throwaway copy of the test, with production code unchanged. Its stream shim wrote the finished line into the snapshot file, then held that line from the listener on a FIFO until `end next --resume` appeared. Only then did it deliver the event. The original test assertions still passed: **1 pass, 0 fail, 5 assertions**. Thus the claimed “wake received while another session subscribes” condition was absent, and the test did not detect it.

Restore a barrier tied to listener handling/enqueueing, or otherwise make the test reject that controlled late-delivery sequence. An upstream output-file observation cannot supply that guarantee.

## Other requested checks

No executable wake helper, label lookup, watcher status line or skill registration remains in the reviewed production sources. Searches through active skills and docs found no remaining listener-to-watcher delivery contract, including chart-issues. Remaining mentions in tests are an absence assertion and stale comments, not live wake paths.

The engine retains its own event path: `src/listen.ts:83–93` queues `next --resume` on each snapshot and `next --wake` on turn, blocked, finished and lost events. `src/next.ts:1308–1324` still sweeps allocated leaves and reconciles repositories. Removing the optional watcher wake does not remove these engine passes or the startup catch-up.

A fresh manual tick without a matching job still reaches the one-check branch. The paid test was not run. The uncommitted skill/docs edits also clarify compaction and the intervening-prompt limitation. No paid evidence was obtained for a tick already queued across `/clear`, so I am not claiming an additional runtime defect there.

## Validation

- Combined `bun test --timeout 30000 tests/hc-listener.test.ts tests/hc-status.test.ts`: **9 pass, 2 fail**. The cleared-foreground/restart and event-folding/restart tests timed out. The default-timeout run also failed those cases.
- Each failing case passed separately: cleared-foreground **1 pass / 4 assertions**, event-folding **1 pass / 12 assertions**. An isolated run using the parent listener also passed the cleared-foreground case. The combined-run failure's cause was not established, so it is not presented as an attributed regression.
- The controlled ordering counterexample above passed. Temporary probes and own test terminals were removed. No implementation files were changed by this review.

## Re-check of 57c044d3

Verdict: changes needed. F1 is fixed. F2 remains.

F1: the clear branch now reports the stop steps' actual result instead of claiming success when several jobs match. The compaction and intervening-prompt limits are explicit.

F2: `tests/hc-listener.test.ts:129–145` now emits 8,000 heartbeats before creating the `handled` marker. This proves the bytes were accepted downstream, not that the listener dispatched the finished event. Bun can buffer subprocess stdout ahead of the JavaScript consumer.

Confirmed against the actual `src/hc.ts` `follow()` implementation. A throwaway producer emitted the initial snapshot, then the finished event and the same 8,000 heartbeats, flushed stdout and created its marker. While the snapshot callback was held on a promise, the result was:

```json
{"markerBeforeCallbackReleased":true,"finishedHandled":false}
```

Thus the new marker can appear while the consumer has not even reached the finished-event callback. Increasing pipe traffic does not repair the missing acknowledgment. The ordering test still needs an observation tied to listener handling/enqueueing, rather than producer writes.

Validation: the amended ordering test itself passed (**1 pass, 0 fail, 4 assertions**). The read-ahead counterexample above exited successfully. The paid tier was not run. Only this repair was reviewed. Temporary probe files and own test terminals were removed, and no implementation files were changed.

## Re-check of 763806f4

Ready. No remaining functional defect found in this repair.

`src/listen.ts:34,56–58` initializes the queue with pull and resume before any event can append a wake. Their order therefore does not depend on proving when the finished event was handled. The revised test removes the false handshake claim and explicitly identifies the one-second settle as timing. The missing acknowledgment is a test limitation, not grounds to block this change. F2 is no longer blocking, and F1 remains fixed.

Validation: the revised ordering test passed: **1 pass, 0 fail, 4 assertions**. Reviewed only this repair. Own test terminal removed, with no implementation files changed.
