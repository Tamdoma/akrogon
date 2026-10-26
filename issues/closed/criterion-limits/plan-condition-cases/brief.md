# Brief: plan-condition-cases

## What

`skills/plan-issue/SKILL.md` `## plan.synthesis` gains one rule, placed before the paragraph where A writes the criterion tests: A checks each plan decision against every condition its done-criterion states and plans a case for each condition a decision can reachably break. No other skill changes.

## Why

A recorded plan proved the gain of two criteria (fewer calls) while breaking their stated conditions: it cached a failed lookup that criterion 3 said must be retried, and it reused one pane list across repos after an earlier repo's step could close tabs, which criterion 2 forbade. Its planned tests counted calls in a single repo with no write and could observe neither break. A condition case passes on the base, because the base reuses nothing, so the red-first rule never prompted it, and tests lock after planning, so planning is the only point the case can be added without a review and repair round. The case is recorded in design `## Case`.

## Done-criteria

1. `skills/plan-issue/SKILL.md` `## plan.synthesis` requires, before the criterion tests are written, that A check each plan decision against every condition its done-criterion states (what must stay fresh, be retried, be refused, or not happen between), tracing each value from where it is made to its last use through later calls, helpers and earlier iterations of a containing loop or batch; that each condition a decision can reachably break gets a case that fails on that violation, run where the decision's kept state lives (the same process, invocation or step), or the traced reason it cannot break; that each checked condition, its decision and its case or traced reason are recorded in `plan.md` beside that criterion's observation (A,C); that each such case is shown red at planning by a temporary edit that makes the decision's violation, discarded before the test commit, with the red output recorded beside the condition (A,C); that a count over cases where the condition holds does not prove the condition; and that these cases prove the existing criterion, so an existing test that proves only the criterion's main result does not stand in for them.
2. Applied to the recorded case in design `## Case`, the rule as written requires a case where a lookup for one path fails and a later call for the same path in the same process runs the lookup again, and a case with two repos where a herdr write from the first repo's step sits between the shared read and the second repo's use and the second repo's list reflects that write (A,C); a reviewer walking the rule over that case reaches both, and reaches that the recorded planned proofs (four distinct paths, a single-repo slice with no write) satisfy neither.
