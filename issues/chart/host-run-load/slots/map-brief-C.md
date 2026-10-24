# Map brief: host-run-load, seat C

You are consultant seat C in a chart-issues door. Work blind: do not read other slots/map-*.md files. Read only, edit no code.

Read:
- issues/chart/host-run-load/INTAKE.md (seed #118 verbatim, operator words, agent findings)
- src/admission.ts (withAdmission, liveRuns, run records), src/run-check.ts checkedRun (~:185-275), src/verify.ts runOnce and verifyCommands
- git show 81196b3b (the 2026-10-14 removal of memory limit, reservations, 30 s spacing, admission flock) and the charts issues/chart/host-test-load, issues/chart/merge-load-flakes, issues/chart/permit-bypass for past operator decisions (#88 overload, #89 55-minute unordered wait)

Write a territory map to issues/chart/host-run-load/slots/map-C.md:
1. Confirm or refute the cause with file:line. Which runs reach admission (seat run-check, verify setup, verify checks, merge_checks, base comparison of --known-red) and what each knows about itself (repo, leaf, scope, command name).
2. Material forks with options. For each option say what it could break or invite later, including the #88 and #89 failure modes. Include at least: what counts as heavy (verify full checks only vs any run-check vs a config flag per command); the bound (count of heavy runs host-wide, CPU/load reading, memory reading); ordering (FIFO by request time vs priority for merge scope); how waiting shows in status; nested runs (verify inside run-check); what a waiter does when a holder dies; whether past operator decisions forbid any option.
3. Pitfalls and the tests that would catch a regression with the existing test helpers (tests/run-permit.test.ts, tests/run-units.test.ts, tests/helpers.ts admissionEnv).
4. The smallest change that makes framework merge verify green again under today's mix.
Keep it short. Cite file:line per claim.
