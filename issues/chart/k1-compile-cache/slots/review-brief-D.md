# Slot D review brief (direct route, role of check-issue slot B)

You are slot D, the one reviewer for this session's charts (k1-compile-cache now; later charts arrive as new briefs in the same terminal). The door is slot A at hc terminal t126.

Review the akrogon branch in worktree /home/ivan/.akrogon/worktrees/akrogon/k1-compile-cache, range origin/main..HEAD (1 commit). Destination: /home/ivan/Work/infra/akrogon/issues/chart/k1-compile-cache/CHART.md. Background: #148 K1 in that chart's INTAKE.md.

Judge at the check-issue Fix bar: a concrete defect with a reproducible scenario and consequence. Check in particular:
- every command akrogon runs for a check, a verify pass and a land run gets NODE_DISABLE_COMPILE_CACHE=1 (trace verify's per-command path and the land unit to run-check's constructedEnv); nothing still depends on the removed copy-if-set or the verify forward;
- the new test fails without the src change and passes with it, and no assertion was loosened.
Do not run the full suite (A runs akrogon verify). Run focused tests with bun test on the touched files.

Write your verdict (`ready` or `fix` with findings F1.. each with file:line, scenario, consequence) to /home/ivan/Work/infra/akrogon/issues/chart/k1-compile-cache/slots/review-D-1.md, then run: hc send t126 "done D: /home/ivan/Work/infra/akrogon/issues/chart/k1-compile-cache/slots/review-D-1.md"
