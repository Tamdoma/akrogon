# Chart: flake-zero

Route: direct (operator: full autopilot, A implements, D reviews)

Destination: no flaky test in akrogon's suite, and a mechanism that keeps new or changed tests from being flaky.

## Open forks
- none (design taken, waits on session-flake landing)

## Direct attempts

- 2026-11-23 landed a840bf96 (D rounds 1-4, ready at round 4); deployed; test check line applied on main 0349c523 (suite, then changed tests/*.test.ts five more times). 1h (stop-run per-unit stop) moved onto lane-first.
