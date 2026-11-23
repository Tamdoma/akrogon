# Review brief: flaky-wait (slot D)

Worktree /home/ivan/.akrogon/worktrees/akrogon/flaky-wait, branch flaky-wait, base origin/main 1f3f0622. Three commits:
- b090710e test: live-capture pack test starts its phase once the capture is live (durable-capture.test.ts). Cause: phase merged raced the run-check, which then refused "owner gone" and never wrote ready.
- e8f9ed81 test: busy-watcher coalesce test reads due numbers from what was sent (watch-timer.test.ts). Cause: hard-coded due 1 and 4 depend on host speed.
- 2a27e466 fix: watch timer prints an up line when its boundary clock starts (timer.ts + test). Cause: the test froze the timer before its clock started.

Check: are the causes real (file:line), do the fixes remove the race rather than hide it, does the up line break any reader, any new flake. Verdict ready or fix with concrete defects.
