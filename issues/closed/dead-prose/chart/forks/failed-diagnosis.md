# Fork: failed-diagnosis

## Question
Which failed-diagnosis clause goes?

## Carries
merge-issue:37, check-issue:47; src/phase.ts:138.

## Findings
- repo (B): on origin/main merge → check.fix still counts toward the cap; merge-issue:37 is dead only after merge-conflict-route merges.
- repo (both): the log has no reason field; 2 closed plan.md files hold a diagnosis; check-issue:47 is the only other written failure reason.

## Taken
Operator answer (2026-09-14): `20a` delete both diagnosis clauses (merge-issue:37, check-issue:47). Review files are the failure record. Forecloses keeping check-issue's clause.
