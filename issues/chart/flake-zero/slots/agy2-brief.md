# Brief: close the agy start drop (delivery-flakes, F7)

Worktree /home/ivan/.akrogon/worktrees/akrogon/delivery-flakes at c79a18ff (on main 14774a0e). Read: src/seat.ts:134-240 (agyTask, firstTask), :274-410 (startSeat, launch: where `hc run` returns the address and firstTask starts), src/hc.ts waitFor/follow/waitForState. Design so far: forks/design.md last two blocks, slots/agy-B.md (L1).

F7 (helper's stress run, load 77): 1 of 96 hc-delivery copies timed out in "an agy seat answers the trust dialog once and its first task, refused unavailable, goes in once". agyTask (base waitFor, no read, by our decision) most likely lost the trust-dialog report made while its `hc events --terminal` subscription started, and waited out its 60 s budget. This exists on main too. B's L1 estimate was under 1 in 10,000, but it was observed at 1 in 96 under heavy load. The operator rule is zero flaky tests, so L1 cannot be accepted.

Facts: hc 0.1.22 drops events of a change made during subscription start. A change after the snapshot arrives always gets its event (B, 8,000/8,000). agyTask must react to every report (D F3) and cannot take a fresh read, because a read plus the queued event replays a report and sends twice. Status events carry only seq. hc get carries no seq.

A's proposal (challenge it): subscribe before the thing being watched can change. Open the event stream before `hc run` starts the agy terminal (unfiltered, or whatever hc allows before the address exists), wait for its snapshot, then start the terminal, and filter by address on our side. With no terminal during subscription start, nothing can be dropped, and every report after it gets its event. The same stream could also serve firstTask's proof, removing waitForState's read. Questions: can hc subscribe before the address exists (unfiltered stream, or a name filter)? What does an unfiltered stream cost under load? What is the fewest-moving-parts way to hand that stream from launch to agyTask and the proof?

Answer in at most 15 lines: agree or pick another, the exact mechanism, the loss left (with interleaving), and what it deletes. B: probe it on a throwaway hc session if you can.
