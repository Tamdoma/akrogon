# Focused check: lane-first stop of a land leaf

Worktree /home/ivan/.akrogon/worktrees/akrogon/lane-first (head 5debd8b9, base 814a2387). Reviews: slots/review-D-lane-4.md .. review-D-lane-6.md.

Problem (D F10): the land service owns the repo-line admission record; when stop kills it (slice stop), admission drops the record at PID exit, while the detached verify pass (separate unit, akrogon-land.slice) is still running, so a queued same-repo check starts beside it. The current fix SIGSTOPs land before teardown; D rounds 5-6 found lock deadlocks from freezing a process that may hold .lock or the line lock (F11, F12) and a missing-unit race (F13).

A's proposal: remove SIGSTOP entirely. Restore the round-4 stop order (cancel marks, slice stop kills land, then stop passes/runs). Change admission's liveness for a land hold record: it stays live while its PID is alive OR its verify pass unit is active; it is dropped only when both are gone. Then the line is held until the pass ends, a retry still finds the record, and nothing is frozen.

Reply only a concrete break with file:line (e.g. a path where the pass outlives forever, a cost in the admission poll, a pass unit name admission cannot derive), or "ok".
