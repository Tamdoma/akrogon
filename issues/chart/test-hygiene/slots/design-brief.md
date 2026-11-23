# Design brief: test-hygiene (#150 and P12)

You are a consultant. Read only. Write your own view before seeing anyone else's.

Read: CHART.md, INTAKE.md (#150 report), forks/signposts.md (locked), issues/chart/lean-akrogon/slots/map-merged.md "Chart 5 test-hygiene" (the agreed direction: #150 timer is right and the e2e is stale; assert the first due sent after the hold went once, no fixed number, no new log line. P12: test slices become children of the test's own slice so they stop with it; no reconcile sweep of akrogon-test-*).
Code on main /home/ivan/Work/infra/akrogon: tests/e2e/watch-live.e2e.ts:826-875 (hold block and the later waitDue 4/5 numbers), skills/watch-issues/scripts/timer.ts (hold and coalesce), tests/run-units.test.ts:55-120 (testSlice, stopTestSlice, afterAll), src/scope.ts:15-40 (AKROGON_RUN_SLICE, slicePrefix), any other test making akrogon-test-* slices (grep). Live host: `systemctl --user list-units 'akrogon-test-*' --all --no-legend | wc -l`.

Answer with file:line:
1. #150: the exact assertion change, and whether the later fixed due numbers (4, 5) after the hold have the same defect.
2. P12: how a test learns its own slice (e.g. /proc/self/cgroup innermost slice), the child slice name rule, what happens when the test runs outside any akrogon slice, and proof that stopping the parent stops the child units. Does systemd keep an empty loaded slice after its units end, and does stopping the parent remove the child slice?
3. What could break (path length limits on slice names, slicePrefix assumptions, nested runs).
4. Fewest-parts final shape and any open fork with your pick.
Under 50 lines. Write slots/design-<slot letter>.md here.
