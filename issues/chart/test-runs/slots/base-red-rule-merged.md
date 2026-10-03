# Base red rule: merged A and B

## Agreed facts
- M1 (A,B) The first base run was killed by the seat's own launcher: Claude Code Bash `run_in_background: true, timeout: 1500000` (25 min, covering install plus tests), transcript adc47027 line 2335; killed at 13:18:00 UTC, line 2395; seat still recorded "red on base", line 2402. The harness allows longer background limits (max 7200000 ms).
- M2 (B) The leaf run's reported "exit 0" was the status of a trailing `echo`/`grep | head`, not the test command (transcript 2308/2322, report:183).
- M3 (A,B) Later completed whole-file runs on leaf and base both failed (238/1, fixtures 07 and 13) from one shared capture race. Names differed, cause matched.
- M4 (A,B) Outside practice: Chromium CQ reruns failing suites without the patch and compares; LUCI separates infra/cancel outcomes from test failures; GitLab compares base/head test reports. Their retry-and-ignore-flake tolerance does not transfer (failed checks always block here).

## Recommendations
- Q1 (A,B) 1a: red on base needs both runs completed (the checked command's own exit status and terminal result), comparable command/args/scope/install/conditions, and a recorded causal judgment that the base failure explains the leaf failure. Names need not match. Otherwise the leaf failure takes repair.
- Q2 (A,B) 2a: a killed, interrupted or crashed run is incomplete; stop with `failed --reason "<command> incomplete base run <sha>: <cause>"`, no automatic repeat, no base-guilt claim.
- (A) Add one line removing the kill class: the seat never sets its own kill deadline on a base or slow run below the harness maximum; it waits on exit (implement-issue:43). (B) did not propose this.
- (B) Preserve the checked command's own exit status before any reporting pipeline.
- (A,B) Scope: the two base-run paragraphs, skills/implement-issue/SKILL.md:38 and skills/check-issue/SKILL.md:59. No merge-issue change, no new state, slot, clock or retry.
