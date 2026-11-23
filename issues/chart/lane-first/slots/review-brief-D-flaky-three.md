# Review brief: flaky-three (slot D)

Worktree /home/ivan/.akrogon/worktrees/akrogon/flaky-three, base origin/main c4cf74a7 (rebase pending onto 16c85dae). Two commits:
- 46f3461a test: door-exchange re-armed wait. Cause: "foreground is not hc wait" is also true before the second wait starts and after it exits but before wait2.code is written; the blocker could also fire before the second wait ran. Fix: each wait has its own timeout (19+n) so argv names it; the test waits for the second wait in the foreground before blocking; the door writes the code file via temp + rename and the test waits for it.
- a6d28cbe test: watch-timer otherCore used discard() (drops tracking, deletes socket, never stops the process) so one herdr-core leaked per run; now stop().
Check: causes real, fixes remove the races, the temp+rename in the door script changes no reader. Verdict ready or fix.
