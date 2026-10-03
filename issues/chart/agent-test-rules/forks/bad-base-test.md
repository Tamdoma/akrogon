# Bad test on base

## Question
Q8. A merged bad test breaks other leaves. Who fixes it, with no human step?

### Carries
- implement-issue:38 and check-issue:59: red on base stops the leaf (`failed`). src/phase.ts:180-183: seats cannot recover failed. merge-issue:45 already fixes a broken default branch forward.
- failed-leaf-routing (handed off 09-28, fix-routing 1a): the operator charts the fix. This answer changes that for the bad-test case only.

## Findings
- TMPDIR passed in leaf-temp-dir, merged, then stopped wave-table and proof-order (issues/log.jsonl:411-414, recovered with slot null). (B,C)
- B proposed routing red-on-base to review where B repairs; C objected that every affected leaf repeats the fix and conflicts at merge. C proposed first-seat fix-forward. (B,C rebuttals)
- Unchecked: two leaves fixing the same bad test at the same time. (A)

## Taken
Operator 2026-10-03: "8a | 9a | 2a | 3a |"
- Q8 -> 8a. The first seat that proves a test red on base and wrong (contradicts a brief outcome or real source, per test-authority Q1) fixes that one expectation in its own commit with the reason. B reviews it like any diff. Other leaves get it by rebase. A test red on base because the code is really broken keeps today's stop. Foreclosed: 8b B repairs in review per leaf, 8c keep stopping.
