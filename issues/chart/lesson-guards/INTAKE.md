# Intake: lesson-guards

## Scope
Turn checkable lessons into tracked intake without an operator pass, so the active lesson stock shrinks as lessons become guards. Destination: akrogon skills.

## Provenance
- GitHub: Tamdoma/akrogon#73 (also listed in issues/chart/merge-throughput/INTAKE.md, which put it Off route as "separate destination, own chart later"; owned here)
- Operator: 2026-10-10 "let's start charting it all out."

## Source: Tamdoma/akrogon#73
# Lessons never feed back into skills or checks: LESSONS.md is excluded from pass input and learn-issues only prints seed lines

Source: Tamdoma/akrogon#73
URL: https://github.com/Tamdoma/akrogon/issues/73

Unverified intake.

## Observation
The lesson-to-guard loop is open. Seats are told not to read `learnings/LESSONS.md`. `learn-issues` runs only when the operator invokes it, and for a checkable lesson it prints a seed line without acting. Consumer `Tamdoma/tamdoma-framework`, 2026-10-09: 135 active lessons, 0 marked Applied. The stock grew from 129 to 135 over the last day and nothing drains it. The same failure classes recur in merge bounces after being written up: biome lint, schema-version bumps, generated-artifact rewrite conflicts, and rebased receipt ancestry. One example is a top 2026-10-08 lesson on generated-artifact rewrite conflicts.

## Location
- `skills/implement-issue/SKILL.md:31`: "`learnings/LESSONS.md` is not pass input".
- `skills/check-issue/SKILL.md:45`: LESSONS is "not review input".
- `skills/learn-issues/SKILL.md`: operator-invoked, deletes guarded lessons, prints seed lines for checkable ones.

## Reproduction
Record a lesson for a failure class that a cheap check could catch. Later leaves hit the same class at merge, because no seat reads the lesson and no check is added unless the operator runs learn-issues and files the printed seed by hand.

## Expected behavior
A recurring failure class that has been written up becomes a guard (a check, a brief rule or a skill line) without depending on a manual operator pass, and the active lesson stock shrinks as lessons become guards.

## Urgency
Medium. Each recurring class costs bounces repeatedly (DEFECT bounces on framework were 12 of 34 over 10-07..08, several in classes already in LESSONS). Workaround: the operator runs learn-issues and files the seeds manually.

## Suspected cause
Agent view, shared by both consults. Excluding LESSONS from seat input is reasonable, because 135 untriaged prose lessons would be noise. But the only outlet that turns a lesson into a guard is a manual step, so the loop is single-loop: repairs fix instances and the rule that let the class through never changes (Argyris double-loop learning, Senge "fixes that fail").
Files read: the skill lines above, framework `learnings/LESSONS.md`.
Not inspected: how often learn-issues has been run on framework. Would disprove: Applied entries or guards traceable to lessons elsewhere in history.
Related reports: Tamdoma/akrogon#48 (closed, check evidence is prose, not records). Searched Tamdoma/akrogon all states: "LESSONS learn-issues" (only #48).

## Source: operator 2026-10-10
let's start charting it all out.

## Agent findings
See slots/map-merged.md. Plans and the chart door already read LESSONS.md (skills/plan-issue/SKILL.md:25); only implement and review exclude it. Framework holds 144 active lessons, 0 Applied. Named bounce classes are mostly absent from framework LESSONS, so bounce attribution is unproven. Some active lessons are already guarded (src/phase.ts:320 vs LESSONS.md:10).
