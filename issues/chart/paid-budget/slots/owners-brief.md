# Brief: every owner of the akr-e2e-watch session recovers and contains the same way (paid-budget, D round 12)

Read: slots/review-D-paid-12.md (F24-F26). Decision so far: forks/design.md last block. Worktree /home/ivan/.akrogon/worktrees/akrogon/paid-budget at cedcd2a2: tests/e2e/watch-tier.ts (session, holdSession, startWatchTier :131-146, stopWatchTier), watch-consults.e2e.ts (judge: killSlice, stopAndRemove, body in akrogon-e2ewatch.slice), watch-live.e2e.ts, watch-stop.e2e.ts (start the tier in the test process, outside any fixed slice), watch-consults-deadline.e2e.ts (stand-in judge tests, no paid harness, writes shared state outside the lock).

Problems: F24, the deadline fixture mutates the real session's ledger, slice and state outside the lock, so running it beside a paid check can damage that check. F25, only the consults judge recovers at start and contains its body. A killed watch-live or watch-stop leaves a core daemon outside the fixed slice. The next owner fails with EEXIST, or the consults judge reports an empty absence list while that core still lives. F26 (minor): one Bun process loading two of the files deadlocks on its own lock.

Constraint: paid runs keep the session name akr-e2e-watch (operator grant). The deadline file starts no paid harness.

A's view (challenge it):
- F24: the deadline fixture gets its own private session name and slice, because it is not a paid run. How, with the fewest moving parts, given `session` is a module constant in watch-tier.ts?
- F25: one recovery used by every owner. holdSession() takes the lock and then runs the same start cleanup. Containment: should watch-live and watch-stop run their tier in the fixed slice too (as consults does), or can recovery stop a leftover core another way (its socket, hc server stop, its pid)? Which is simpler and leaves nothing alive?
- F26: holdSession is taken once per process (cache the promise).

Answer in at most 15 lines: the mechanism for F24 and F25, the loss left, and what it deletes.
