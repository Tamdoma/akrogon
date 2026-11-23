# Brief: the agy retry versus the snapshot read (delivery-flakes, D round 2 F3)

Read: slots/review-D-delivery-2.md (F3, F4), forks/design.md last block
Worktree: /home/ivan/.akrogon/worktrees/akrogon/delivery-flakes at fe7e6361: src/hc.ts waitFor (~507-540), src/seat.ts:142-176 (agyTask, predicate sends the task on each idle report), :218-227 (first-task proof).

Facts (helper probe, hc 0.1.22): a status event carries only {records, reported, status} plus params.seq. There is no report time. hc get and terminal records carry status_ms but no seq. A repeated `idle` report produces its own event even when the state is unchanged, and the agy retry needs that event (D F3). The snapshot read in waitFor can show idle from report seq N while the event for seq N is still queued, so the event replays idle and agy sends twice (helper's round 9). fe7e6361 skips events that leave the terminal unchanged, which drops the real fresh report D needs.

The three observed flakes were all state-only waits: the first-task proof, the fixture waitFor and placement. None was in the agy retry.

A's proposal (challenge it): the snapshot read belongs to state-only waits. The agy retry reacts to reports, so it does not take the read and keeps the base behaviour that D's replay passed. Then the equality skip goes away, since a replay is harmless to a state-only predicate. Open question: how to split this without a mode flag on waitFor (two plain functions? agyTask follows events directly?).

Other options: O1 drop the skip and accept a double agy send; O3 ask hc upstream for status_ms in events or a seq in hc get.

Answer in at most 12 lines: agree or pick another, how to split it with the fewest moving parts, and what loss is left.
