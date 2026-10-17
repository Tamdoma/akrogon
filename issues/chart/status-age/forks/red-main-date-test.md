# Red main: date-bound flow report test

## Question
Q1. How does the date-bound `flow report` test get fixed so this attempt can land?

### Carries
- Route direct, B ready on d0ad061 (slots/review-B-1.md).
- Growth stop: fixing another test is a second outcome.

## Findings
- better-than-training · tests/timing-report.test.ts:490-536, read 2026-10-17: fixture issues use fixed filed dates (#5 2026-10-11) while the command measures age against the real clock. `oldest <= 5` broke on 2026-10-17. Last touched d8190a7 2026-10-15.
- better-than-training · direct/check-test-1792224181245-2602720.log and check-retry-flow-report-*.log: 993 pass 1 fail, red again on retry.
- Not in this diff: `git diff origin/main...HEAD -- tests/timing-report.test.ts src/timing-report.ts` is empty.

## Taken
Operator 2026-10-17: "1 - Just delete the old test if it doesn't serve any purpose anymore."

The test still has a purpose: it is the only one with parked and open carriers, proving they stay out of the backlog (count 2). Only its oldest/median day-range asserts expired, and 'flow report: even counts average...' still proves those values against now. Deleted those asserts and kept the count, in its own commit d94e128 on this branch. Foreclosed: deleting the whole test (loses the parked/open carrier proof), a separate chart.
