# Slot F review brief (direct route, role of check-issue slot B)

Review the akrogon branch in worktree ~/.akrogon/worktrees/akrogon/test-races, range 436b5179..HEAD (3 commits). Read /home/ivan/Work/infra/akrogon/issues/chart/test-races/direct/report.md first: it states each cause, evidence and fix.

Judge at the check-issue Fix bar: a concrete defect with a reproducible scenario and consequence. In particular check:
- the worktree lock: every git worktree add/remove/prune akrogon runs is covered; no lock is held across anything but the one git command; no caller can take it twice (self-deadlock); lock file location is right in a linked worktree and in the main checkout; self-update's root.
- whether the plain-git race is a credible cause of the verify notice failure, and whether the fix covers it.
- the two test fixes wait on the real condition and loosen no assertion; the systemctl wrapper cannot hide a real failure of the cases it wraps.
- the next.test.ts fake flock change keeps the case testing what its name says.
Do not run the full suite (A runs akrogon verify). Run focused tests through `akrogon run-check` or bun test on the touched files.

Write your verdict (`ready` or `fix` with findings F1.. each with file:line, scenario, consequence) to /home/ivan/Work/infra/akrogon/issues/chart/test-races/slots/review-F-1.md, then run: hc send <A address given in your task> "done F: /home/ivan/Work/infra/akrogon/issues/chart/test-races/slots/review-F-1.md"
