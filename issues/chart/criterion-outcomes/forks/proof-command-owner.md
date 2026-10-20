# proof-command-owner

## Question

Do done-criteria lock only the observable result while the plan owns the exact proof command, and who may correct that command?

### Carries

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: issues/chart/paid-proof-bounds/slots/map-merged.md

## Findings

Merged notes: slots/notes-merged.md (A,B,C blind notes, B and C rebuttals applied).

- `shapes.md` already says a criterion is an observable result, never a test file; the #105 criterion named three test files and passed the audit.
- `plan-issue` plan.synthesis already maps each criterion to the command that observes it.
- `implement-issue`, `check-issue`, `merge-issue` route a wrong criterion unit to A "under `test-proof-rules`", which no file defines (it is a closed leaf slug).
- `check-issue` check.repair bars B from test-expectation corrections and other plan text, so B cannot hand a command fix anywhere today.
- The direct route has `<chart>/direct/plan.md`, so the same owner rule covers it.

## Taken

Operator 2026-10-19: `1a | 2a | 3a` (after "elid").

1. 1a: a done-criterion locks only the observable result; `plan.md` owns the proof command. A replaces a wrong command with one observing the same result, preferring the repo's configured runner (B), and records old command, new command, reason and evidence. B judges in review that the same tests and cases run and a deliberate break still fails. B in check.repair and merge hands a command correction to A. A runner command already written inside a criterion is proof, judged by that guard (C). An invocation that is itself the product behavior stays locked. A correction never widens a live or paid action.
2. 2a: the rule is written once, in `plan-issue`, and the `test-proof-rules` citations in implement-issue, check-issue and merge-issue point to it. Correction after the round: the 2026-10-16 lesson is not retired, because `skills/lesson-rule.md` Retire needs a removal, loud refusal or running guard, and a written rule is none; the lesson line stays.
3. 3a: no mechanical check against commands in criteria.

