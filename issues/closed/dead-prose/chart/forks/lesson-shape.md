# Fork: lesson-shape

## Question
Which lesson sentences go?

## Carries
implement-issue:29, check-issue:41, merge-issue:27, plan-issue:25 and :31, chart-issues:27.

## Findings
- repo (both): LESSONS.md has 11 lines; no apply ever removed one; the prune offer in chart-issues:27 is the only retirement that ran.
- (A) correction 2026-09-14: the line above is wrong; one active line was removed by an applying leaf (28aa08c) and two applied lessons were recorded as dated history only. Details under Taken.
- (B) R5: creation, evidence and 'lessons are not rules' stay.

## Taken
Operator answer (2026-09-14): `22` keep the apply-removes-and-dates clause at implement-issue:29 and first find out why it has not fired. Investigation the same day: it fired every time a lesson was applied. guide-source-spec was recorded 2026-09-11 (acdd72c) and removed with a dated history line by the applying leaf docs-retire-guide (28aa08c); sync-ignored-overwrite and pull-close-partial-side-effect were applied inside their own repair rounds and recorded as dated history only, never as an active line. One miss: the stderr-json-parse line was added 2026-09-11 (ca914e0) after its guard already landed 2026-09-10 (0418eb5, src/next.ts retryable), so it was born applied and nobody removed it. The other ten akrogon lines and all 31 framework lines are review habits or traps already fixed in the leaf that recorded them, which the clause does not reach; framework has 0 removals in 33 lesson commits, all since 2026-09-12. Forecloses deleting the clause and the four-restatement collapse.
Operator answer (2026-09-14): `30a` keep implement-issue:29 verbatim; the born-applied stderr-json-parse line is prune material, not a rule change. Forecloses a history-only clause.
