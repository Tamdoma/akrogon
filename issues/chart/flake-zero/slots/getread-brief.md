# Brief: fresh `hc get` inside waitFor (reset-flake, D round 1)

Context: hc 0.1.22 can drop a change made while `hc events` subscribes, from both events and snapshot. Seats are fixed by subscribing before `hc run` (1f563e7d). The door-reset helper (skills/chart-issues/scripts/door-reset.ts) subscribes via waitForTerminal while A's turn may end at that moment, so it waited 600 s. Commit 37a37b4b (worktree /home/ivan/.akrogon/worktrees/akrogon/reset-flake, src/hc.ts waitFor) reads `hc get` when the snapshot lists the terminal and REPLACES the snapshot entry with it, then applies queued events on top.

D review: review-D-reset-1.md (same folder).
- F1: get has no seq; applying older queued events onto the newer get composes a state that never happened (turn 1 idle), and the door may type /clear into an open turn.
- F2: the get blocks event consumption; a slow get makes the wait miss a timely idle event.
- F3: a terminal removed after the snapshot makes get throw not_found before a finished record is seen.
- F4: `hc get` on a stopped core's socket starts a new core.

A's proposed design (O1):
- Events apply only to the sequenced snapshot state, exactly as on main.
- The fresh get runs concurrently, once, after the snapshot arrives. Its result is evaluated by the predicate as its own observation (a real state at a moment after subscription). It is never merged with the queue.
- The wait returns the first observation that satisfies the predicate. Both share the one deadline.
- get not_found counts as "no observation"; the event path continues (F3).
- F4: skip the get if the stream has already ended, or accept it as minor.

Questions:
1. Is O1 sound? Can a predicate true on the get result ever be wrong for a caller (door-reset, start proof, agy task)? Note a get state is a true state at some moment after subscription.
2. Is there a simpler or more native option (for example, only door-reset does the extra read, not every waitFor)?
3. Any race left?

Answer in 10 lines or fewer.
