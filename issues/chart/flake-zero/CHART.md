# Chart: flake-zero

Route: direct (operator: full autopilot, A implements, D reviews)

Destination: no flaky test in akrogon's suite, and a mechanism that keeps new or changed tests from being flaky.

## Open forks
- none (design taken, waits on session-flake landing)

## Direct attempts

- 2026-11-23 landed a840bf96 (D rounds 1-4, ready at round 4); deployed; test check line applied on main 0349c523 (suite, then changed tests/*.test.ts five more times). 1h (stop-run per-unit stop) moved onto lane-first.
- 2026-11-23 landed 1c7efc84 permit-flake (run-permit stop-run cancel test froze its waiter inside the line lock; D ready after 2 rounds, F3 PID reuse accepted); deployed.
- 2026-11-23 landed 1f563e7d delivery-flakes (seat streams open before the seat runs; D ready after 9 rounds, F13 accepted); deployed.
- 2026-11-24 landed 3574ca33 status-flake (git background maintenance off in every test repo via a suite template; D ready after 2 rounds); deployed.
- 2026-11-24 landed 92321c1e identity-flake (stale-socket test waits for the socket to refuse, not a zombie leader; D ready); deployed.
- 2026-11-24 landed 5ee8f516 9c0792b9 6a2454a9 23e2ddc6 load-flakes (shell private child; reconcile stderr; markers by rename + readMarker; S8 ledger from paid-starts; D ready round 6); deployed.
- 2026-11-24 landed abdb3cee reset-flake (waitForTerminal races events vs a separate read; losing get aborted with SIGKILL; fixture same rule; D ready round 5); deployed.
- 2026-11-24 landed 7aafd2eb fixture-zombie (fixture stop and sweep wait for every thread; zombie-leader daemons found via a live thread; session-routing waits for the socket to refuse; D ready round 3); deployed.
- 2026-11-24 proof of zero PASSED on 7aafd2eb: 3 full suites at once, twice, 6/6 at 1416 pass 0 fail; no new akrogon flaky rows.
- 2026-11-24 landed bdc34423 boxed-tests (bun run test boxed in a transient service under akrogon-test.slice; B+C chose O1 as a service; D ready round 2); deployed.
- 2026-11-24 landed 3916c3a2 retry-slices (slice name without the per-run parent; ledger before systemd-run; F1 race accepted by B+C; D ready round 2); deployed.
- 2026-11-24 landed ff1b1dab reconcile-914 (readProc skips ESRCH from a process reaped mid-scan; one line, no test, evidence in message; D ready round 1); deployed.
- 2026-11-24 landed e9158fe0 holder-relative (pass errors reach the caller, status written in finally; --holder must be absolute; S2 dropped; D ready round 2); deployed.
- 2026-11-24 landed 768ae7e5 flock-orphans (killTree lists children first; blocking loops end with the fixture home; dead subreaper sweep deleted; +9 -84; B+C chose O2; D ready round 2); deployed.
- 2026-11-24 landed 89da5ed4 watch-concurrent (watch-timer tests drop test.serial, 118 s to 30 s; timer accrues on the late clock, resend keeps poll-start; suite wall 172 s to 116 s; B+C chose it over a split; D ready round 3); deployed.
