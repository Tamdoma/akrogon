# Ceiling trigger

## Question
Q1. Does the ceiling-values reopen trigger ("a later run over 300 s or fails on a non-flake") cover changed-tests runs, or only framework:verify:core, and what measurement settles the quota's cost?

### Carries
- ../../host-test-load/forks/ceiling-values.md:25, slots/map-merged.md M8, M9.

## Findings
- Changed-tests duration is selection breadth, not quota cost (A,B,C). B asked for operator confirmation before narrowing the literal trigger.

## Taken
Operator 2026-10-13, verbatim "1a, 2a, 3a, 4a, 5a". Round notes slots/ship-{A,B,C}.md, merge slots/ship-merged.md, rebuttals slots/ship-rebuttal-{B,C}.md.
Taken 4a: the host-test-load ceiling-values reopen trigger (over 300 s or non-flake failure) covers framework:verify:core only. No CPUQuota change.
Revised by operator 2026-10-13 ~21:15 local: "don't put any caps, it must not be the solution. The solution is killing idle processes, and figuring out how to make the tests better." CPUQuota removed from systemd/akrogon.slice and the running slice (cpu.max "max 100000"); CPUWeight=20 and memory limits unchanged pending the operator's memory answer. Before: slice throttled 100/100 periods at 16 cores with host 56% busy; 57 leaked browsers (935 processes, ~6 cores, 18.8 GB anon+shmem) stopped by PID. This supersedes host-test-load ceiling-values 1a's CPUQuota.
