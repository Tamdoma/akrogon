# Planning rule for criterion conditions

## Question

- Q1: Does the new `## plan.synthesis` rule cover every condition a done-criterion states, or only decisions that reuse, cache or skip work?
- Q2: Does a condition case that is green on the base get its own guard label?
- Q3: How does the leaf prove its own criterion?

### Carries

- Intake: [INTAKE.md](../INTAKE.md). Change only `skills/plan-issue/SKILL.md` `## plan.synthesis`; no check-issue or implement-issue change (A,B,C).
- Operator choices on record: [drop-debate handoff-format](../../drop-debate/forks/handoff-format.md) 1a (2026-10-25) kept `## plan.synthesis` unchanged beyond removing the debate because no recorded Fix showed a gap. This chart supplies that recorded case.

## Findings

Maps and rebuttals: [map-A](../slots/map-A.md), [map-B](../slots/map-B.md), [map-C](../slots/map-C.md), [map-merged](../slots/map-merged.md), [map-rebuttal-B](../slots/map-rebuttal-B.md), [map-rebuttal-C](../slots/map-rebuttal-C.md).

- Q1: T1 every stated condition (A,B); T2 only reuse, cache, snapshot or omitted repeated work (C). C: generic duties exist and failed, and T2 names the concrete decisions. B: the missing step is selecting the case per condition, which T1 adds. A: T2 misses decisions that reorder, batch or parallelize work against a stated condition. C's loop and batch paths and its "a count over valid cases proves no boundary" are adopted into T1.
- Q2: no label, the existing "intentionally broken behavior" wording already demands the red demonstration (A,B); a guard label beside the red proof (C).
- Q3: review against the file plus a walk-through of the fewer-repeat-calls case (A); no slot disagreed. A text-contains test couples to wording (`learnings/LESSONS.md` 2026-10-01 prose assertions). A replayed planning pass is a paid, non-deterministic launch.
- Evidence: better-than-training, `skills/plan-issue/SKILL.md` `## plan.synthesis`, `skills/check-issue/SKILL.md` `## check.review`, `skills/implement-issue/SKILL.md` `## implement`, leaf `issues/open/repeat-calls/fewer-repeat-calls` brief and plan, `issues/closed/drop-debate/remove-plan-debate/design.md`, all read 2026-10-26.

## Taken

A's pick under autopilot, 2026-10-26: `1a 2a 3a`.

- 1a: before writing tests, A checks each plan decision against every condition its done-criterion states (what must stay fresh, be retried, be refused, or not happen between), tracing each value from where it is made to its last use through later calls, helpers and earlier iterations of a containing loop or batch. Each condition a decision can reachably break gets a case in the same run that fails on that violation, or the traced reason it cannot break. A count over cases where the condition holds proves nothing about it. The cases prove the existing criterion and are not new scope. Reason: covers every kind of decision with one trace, and the case selection is the missing step (B). Rejected 1b: misses reorder, batch and parallel decisions. Standing dissent: C prefers the reuse-only trigger (map-rebuttal-C D1).
- 2a: no guard label; the rule states each such case is shown red by breaking its condition, which the existing new-test rule allows. Reason: adds no concept, and requiring the case removes the ambiguity C names. Rejected 2b: a second label for the same test. Standing dissent: C (map-rebuttal-C D2).
- 3a: the leaf's criteria are judged by review against `skills/plan-issue/SKILL.md`, including a walk-through showing the rule requires a fail-then-retry case for the fewer-repeat-calls criterion 3 and a two-repo write-between case for criterion 2. Rejected 3b: wording coupling. Rejected 3c: paid, non-deterministic, needs a grant.
