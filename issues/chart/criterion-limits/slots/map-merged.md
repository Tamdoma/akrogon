# Map merged, criterion-limits, 2026-10-26

Sources: [map-A](map-A.md), [map-B](map-B.md), [map-C](map-C.md), all blind against [map-brief](map-brief.md).

## Class

- The plan proves the normal result of a criterion and drops a stated condition on it: a failure that must be retried, an event that must not sit between a read and its use (A,B,C). C names it narrower: an invalidation boundary of reused work (C).
- Planned tests repeat the omission: they count calls over cases where the reuse is valid (A,B,C). A condition case is green on the base, because the base reuses nothing, so the red-first rule never asks for it (A,C).

## Where to change

- `skills/plan-issue/SKILL.md` `## plan.synthesis` only, near the paragraph that maps each done-criterion to its observation (A,B,C).
- No check-issue change: review already blocks a criterion with no test that would catch its failure (A,B,C).
- No implement-issue change: tests lock after planning, so planning is the only point the case can be added without a repair round (A,B,C).

## Options for the trigger

- T1 every stated condition of the decision's criterion, traced from where the value is made to its last use through intervening calls and state changes; each condition a decision could reachably break gets a proof case that fails on that violation; cases of the existing criterion, not new scope (A,B). Cost: a short trace per decision; risk of edge-case sprawl, bounded by "stated" and "reachable" (B).
- T2 only decisions that reuse, cache, snapshot or omit repeated work: state the reuse's valid interval, give each outcome or event the criterion excludes from it its own case in the same run, tracing paths through earlier loop iterations and batch items, or the traced reason it is unreachable; an aggregate count over valid cases proves no boundary (C). Cost: misses conditions not tied to reuse, such as criterion 1's "a changed start is refused" (A).

## Points where slots differ

- D1 trigger: T1 (A,B) vs T2 (C). C: generic wording already exists and failed here, so a specific trigger is needed. B: "follow the brief" reminders change nothing, but a trace plus a case per condition does.
- D2 base-green case: C wants it recorded as a boundary guard beside the red proof of the new behavior. A: `## plan.synthesis` already allows a new test "shown red for the missing or intentionally broken behavior", so a deliberate break covers it and no clause is needed. B: silent.
- D3 loop and batch paths: named explicitly by C, implied by B's "intervening calls and state changes", by A's "realistic shape".

## Evidence

- better-than-training: leaf `brief.md` criteria 2-3, `plan.md` D2/D3/C2/C3 and Implementation notes; `skills/plan-issue/SKILL.md` `## plan.synthesis`; `skills/check-issue/SKILL.md` `## check.review`; `skills/implement-issue/SKILL.md` `## implement`; all read 2026-10-26 (A,B,C).
- better-than-training: `issues/closed/drop-debate/remove-plan-debate/design.md` judged its skill-text criterion by review, not grep (A).
- model-knowledge: the expected benefit is a judgment, not a demonstrated guarantee (B).

## Pitfalls

- Edge-case sprawl: bounded to stated conditions a decision can reachably break (A,B).
- Trace misses writes hidden behind helpers (C): the trace names helper calls, and review still judges the diff.
- A condition case mistaken for the new behavior's red proof (C): shown red by a deliberate break (A) or labelled a guard (C).

## Questions no map asked

- How the leaf proves its own criterion: review against the file and against this case (A); a text-contains test checks wording (LESSONS.md 2026-10-01); a replayed planning pass is a paid, non-deterministic launch (A).
- Lesson line: none planned; the leaf lands the rule directly, and a judgment lesson reaches a skill step only through a `/learn-issues` transfer (A).
