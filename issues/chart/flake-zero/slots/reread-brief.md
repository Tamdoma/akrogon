# Brief: how event waits recover from hc dropping start-time events (delivery-flakes, D round 1)

Read: slots/review-D-delivery-1.md (F1, F2). Worktree /home/ivan/.akrogon/worktrees/akrogon/delivery-flakes at e7e8b058: src/hc.ts (hcReader ~380-410, follow, waitFor ~510-540, waitForDoc ~560-580), src/seat.ts:43,142-158,218-253, src/listen.ts:84-99, tests/hc-fixture.ts:350-390.

Facts: hc 0.1.22 is a third-party binary (no source here). Under load it can drop the events of a change made while an `hc events --terminal` subscription starts: the snapshot shows seq 5 working, no event follows, and `hc get` shows idle turn 1. Heartbeats come every 15 s. The first heartbeat comes 15,002 ms after the snapshot. D could not reproduce the drop in 300 subscriptions on an idle core. The helper captured it 3 times under load.

Current fix (e7e8b058): the first heartbeat after a snapshot is a "reread", and waitFor, waitForDoc and the fixture waitFor do a fresh read on it. D found two problems. F1: the reread runs inline in follow's callback, so a real event queues behind a slow read, and a late reread result can call the predicate after the wait has settled (the agy predicate sends keys). F2: place() gives waitForDoc 15,000 ms, so the reread at about 15 s comes after the deadline.

Options (A's view, challenge it):
- O1. Keep the heartbeat reread but make it non-blocking: events keep flowing, a reread result is dropped if the wait has settled or a newer seq has arrived. F2 stays unless deadlines grow.
- O2. Each wait does one fresh read at its own deadline before it fails. A missed change then costs the wait's full timeout but never fails it. Drop the heartbeat reread.
- O3. Something else simpler that removes the class, e.g. one fresh read right after the snapshot (does that close the window?), or both O1 and O2.

Answer in at most 15 lines: pick one, name any loss it still leaves, and say what you would delete from e7e8b058.
