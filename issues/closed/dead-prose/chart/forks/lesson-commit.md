# Fork: lesson-commit

## Question
Who commits a lesson and where is it written?

## Carries
check-issue:41, merge-issue:27, implement-issue:29, plan-issue:31; src/phase.ts:117.

## Findings
- repo (both): 11 lesson commits so far by A at merge or the operator; LESSONS.md is in the registered checkout, which `akrogon phase` never checks for cleanliness.
- (B) R6: a lesson written in the worktree dirties it and blocks the phase move.

## Taken
Operator answer (2026-09-14): `23a` lessons are written in the registered checkout and the operator commits them with the issue files; check-issue:41 loses the leaf-branch commit clause. Forecloses A committing lessons at merge.
