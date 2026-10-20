# Notes A: proof-command-owner

Code and skills at akrogon HEAD 96a96979, read 2026-10-19.

## Pick
Done-criteria lock only the observable result. A command written inside a criterion is not locked: the plan maps each criterion to the command that observes it (already `plan-issue` plan.md mapping), and A may replace a named command that is wrong (not the repo's configured runner semantics, or red at base for a cause outside the leaf) with one observing the same result, recording old command, new command and reason in `plan.md` or `implementation/report.md`. B judges in review that the new command observes the same result (absorbs lesson 2026-10-16 review-test-command-equivalence). Only a change to the result itself is the operator's.
Reason: the rule already exists in two halves that do not meet. `shapes.md` audit says a criterion "states an observable result ... never a test file, assertion or test count", and `implement-issue` / `check-issue` say "a unit of the leaf's own done-criteria that is wrong is A's correction under `test-proof-rules`". But `test-proof-rules` is the slug of a closed leaf (`issues/closed/pre-written-tests/test-proof-rules`), not a rule a seat can read, and `implement-issue` also says a red criterion is "never handed off as pre-existing, base red". Seat A in #105 read the literal command as locked brief text and stopped for the operator. Fix by stating the rule once in the seat skills and deleting the dangling reference, no code.
Cost: skill text in plan-issue, implement-issue, check-issue (and merge-issue where it cites the same reference). Seats now judge command equivalence; a bad judgment could weaken a proof, caught by B.

## Rejected
- Run every criterion command on base at handoff: red-first bug criteria are meant to be red on base; and the base can change before the leaf runs.
- Let known-red waive a criterion: the result would no longer be proven; contradicts "never handed off as base red".
- A mechanical lint refusing commands in criteria at handoff: format check on prose; the audit already says it and the command can still be wrong when written as plan text.
- Operator amends every time (today): 25 minutes and an operator stop per case (#105, #47).

## Evidence (tier: repo skills and closed leaf, 2026-10-19)
- `skills/chart-issues/assets/shapes.md` Preflight and validation: criterion is an observable result, never a test file.
- `skills/plan-issue/SKILL.md` plan.synthesis: plan.md maps each criterion to "the command that observes it".
- `skills/implement-issue/SKILL.md` failure ending: "never handed off as pre-existing, base red or modulo anything"; known-red paragraph ends "a unit of the leaf's own done-criteria that is wrong is A's correction under `test-proof-rules`". Same in `check-issue` check.review known-red paragraph and `merge-issue` red verify.
- `test-proof-rules` resolves only to the closed leaf `issues/closed/pre-written-tests/test-proof-rules` (its What: "A corrects one wrong expectation").
- `check-issue` repair rule: B repairs every Fix except a locked brief change and "any correction of a test expectation".
- `learnings/history/2026-10-16-review-test-command-equivalence.md`: compare ad-hoc command with the configured runner before calling a product Fix.
- #105 intake: criterion named 3 test files with plain `bun test`; repo runner uses `--isolate`; same 9 failures at base and head.

## Pitfalls
- A swaps the command to one that passes but observes less: B checks the new command observes the criterion's result and fails when the result breaks (the red-first evidence).
- Base-red becomes an excuse: a command red at base still counts only after the known-red judgment shows the failing names are outside the criterion's result; the criterion's own result must still be shown passing.
- Door keeps writing literal commands: the shapes audit already refuses; no new check.

## Question the fork does not ask
- Does the stated rule replace the dangling `test-proof-rules` reference everywhere it appears, and should the lesson 2026-10-16 retire into it?
