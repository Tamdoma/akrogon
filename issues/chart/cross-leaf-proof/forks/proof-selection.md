# Proof selection

## Question
Q1. Should akrogon require every done-criterion to be proven by the cheapest command that can catch its failure, with any slow or live run naming the property no smaller test proves? If yes, which skills carry it: standing design (copied into every leaf at charting), plan-issue synthesis (maps each criterion to command, expected cost and rerun trigger), check-issue (judges proof adequacy)?

Q2. Should a leaf's verification carry a numeric time budget, or is the named-property rule in Q1 enough?

### Carries
- Locks: standing-design.md:9 end-to-end artifact per user-visible leaf stays. Skills guide agents; the command owns phases. No check is removed. Destination is akrogon, not framework live-replay.
- Related: forks/spine-growth.md, forks/proof-leaf-policy.md, forks/review-rules.md (to be written).
- Map: slots/map-merged.md.

## Findings
Independent rounds: slots/proof-selection-A.md, -B.md, -C.md. Merged: slots/proof-selection-merged.md. Rebuttals: -rebuttal-B.md, -rebuttal-C.md.

- better-than-training · shapes.md:132, plan-issue/SKILL.md:55,57, check-issue/SKILL.md:43-45, standing-design.md:9, read 2026-09-29 · no stage ties a test to its cost · extend existing stages, add no gate. (A,B,C)
- practitioner · Mike Wacker, https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html; Ham Vocke, https://martinfowler.com/articles/practical-test-pyramid.html; Dave Farley, https://continuousdelivery.com/wp-content/uploads/2010/01/The-Deployment-Pipeline-by-Dave-Farley-2007.pdf, read 2026-09-29 · push each check to the smallest test that catches it and keep user-level acceptance · supports cheapest sufficient without dropping the E2E lock. (A,B,C) Adrian Sutton, https://www.symphonious.net/2015/04/30/making-end-to-end-tests-work/ · E2E works when fast and continuous (C).
- Example: live-replay #15 (two-col never stacks at 360px, report.md:232-240) was found in rehearsal R8, a multi-stage run; a 360px renderer test in the renderer leaf would catch it. (A,C)
- Consensus 1a, 2a. Rebuttal changes: review Fix limited to a failure the leaf's code can cause left untested in the leaf; a slow but correct test is a Nit (B1). Cheapest counts creation and maintenance effort; unknown size stays unknown (B3). Wall time recorded for commands sized minutes, hours or unknown (C2, B3). Farley's minute numbers not presented as fact (B2).

## Taken
Operator 2026-09-29: "1a | 2a |"

Q1 = 1a. Standing-design line beside the unchanged E2E lock: "Each done-criterion is proven by the cheapest sufficient test that catches its failure. A slow or live run names what no smaller test proves." Charting applies it when writing criteria. Plan synthesis maps each criterion to a command, the failure it catches, a size (seconds, minutes, hours or unknown) and its rerun trigger; one command may cover several criteria. Review makes a Fix when a failure the leaf's own code can cause is left untested in that leaf; a slow but correct test is a Nit; rerun rules unchanged. Cheapest counts creation and maintenance effort; a real model or external call can be the cheapest sufficient test when that behavior is under test.
Reason: the chart locks criteria before planning, so the rule must reach charting, planning and review.
Foreclosed: 1b plan-only, 1c no rule.

Q2 = 2a. No numeric budget. The implementation report records measured wall time for every command the plan sizes as minutes, hours or unknown.
Reason: no measured stage durations exist; data first.
Foreclosed: 2b a number now.
