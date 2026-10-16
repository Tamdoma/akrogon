# Merged opening map: retire-rule

Sources: [map-A](map-A.md), [map-B](map-B.md). Tags name the slots that hold each point.

## Agreed
- Three exits, each "on every reachable path": removal of the mechanism, a reader or writer that refuses loudly at the point of use before any side effect, or a running guard (A,B). A deleted cited file is not enough when the lesson is a pattern (A,B). A failure after the harmful effect is not a stop (A,B).
- Rename learn-issues' Guarded outcome to Stopped, so removal is not called a guard; Checkable means mechanically detectable, still reachable and unstopped (A,B).
- `Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>` stays the record for every stopped exit; src/lessons.ts:21 keys on the `Applied` prefix, so no code change (A,B).
- Transfer is for Stays (judgment) lessons only, done only by the root learn-issues pass in its uncommitted diff, the operator's approval of that diff completes it, the destination must be the one live review step reached for the lesson's case, else the lesson stays; leaves never transfer; Checkable never transfers (A,B).
- check-issue:61 and the chart audit (shapes.md:289, SKILL.md:75) must change in the same diff, or a removal retirement gets a Fix from its own reviewer and charting never requires the new retirements (A,B).
- One change, direct route, no sweep of either repo's active lessons (A,B).
- Evidence: operator, framework issues/chart/agent-latitude/forks/check-retirement.md Taken 3a.1 (2026-10-16); better-than-training, the surfaces in INTAKE.md Agent findings (2026-10-16); framework history 2026-09-14-variant-when-dead-after-field-removal.md shows a removal can itself create a defect (B); akrogon history 2026-09-11-guide-source-spec.md:9 already records a removal-style application (B).

## Points where slots differ
1. Transfer record. A: `Applied <date> by transfer to <file:line>: ...`, one prefix everywhere. B: a distinct `Transferred <date> to <file:line>, approved by <who>` line, so `Applied` keeps meaning "stopped"; transfers happen only on the root, so the merge parser never needs to see them.
2. Cross-repo destination (A only). A framework judgment lesson whose live review step is an akrogon skill cannot be edited from the framework's learn diff (the installed copy is a release). A: transfer only to a review step file in the same repo, otherwise the lesson stays and learn-issues prints a seed line for the owning repo. B did not address it.

## Open questions
- None beyond the two differences.
