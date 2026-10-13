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
