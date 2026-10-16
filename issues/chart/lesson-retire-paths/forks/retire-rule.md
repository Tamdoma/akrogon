# Retire rule

## Question
1. What stops a lesson's mechanism well enough to remove its line?
2. How is a judgment-lesson transfer recorded in its history file?
3. What happens when the one live review step for a judgment lesson lives in another repo?

### Carries
- issues/chart/lesson-guards/forks/lesson-lifecycle.md (handed off 2026-10-10): "applied = running mechanical guard; guard leaf removes its line". This chart revises it on new intake #95.
- Operator decision quoted by #95: framework issues/chart/agent-latitude/forks/check-retirement.md Taken 3a.1 (2026-10-16).

## Findings
- Opening map: [A](../slots/map-A.md), [B](../slots/map-B.md), [merged](../slots/retire-rule-merged.md), [B rebuttal](../slots/retire-rule-rebuttal-B.md).
- Q1 (A,B): three exits, each on every reachable path: removal, a reader or writer refusing loudly at the point of use before the lesson's harmful effect (B's R3 wording, A agrees; a diagnostic write before the refusal is fine), or a running guard. A deleted cited file is not enough for a pattern lesson (LESSONS.md lines on `min(1)`, `pkill -f`, `bun -e` argv). learn-issues outcome Guarded becomes Stopped. check-issue:61, shapes.md:289 and chart-issues SKILL.md:75 change in the same diff.
- Q2: A proposed `Applied ... by transfer to <file:line>`; B held `Transferred <date> to <file:line>, approved by <who>` because src/lessons.ts:21,86-92 treat any added `Applied` line as proof the mechanism is stopped. A moved to B: transfers happen only in the root learn diff, so nothing needs the parser to see them, and `Applied` keeps one meaning (A,B).
- Q3: A proposed same-repo only plus a printed seed line; B agreed on same-repo only and rejected the seed line because lesson-rule.md:6 says a judgment lesson files nothing and learn-issues prints seeds only for Checkable (SKILL.md:29). A moved to B: the lesson stays and learn-issues names the owning repo and step (A,B).
- Research: operator tier, the framework decision above. Better-than-training, the inspected surfaces in INTAKE.md Agent findings, 2026-10-16. No outside practitioner source applies to this repo-internal record rule; none searched.

## Taken
2026-10-16, operator: "1a | 2a | 3a" (after two plain re-explanations).

1. 1a: a line retires when a leaf or the root learn pass shows its mechanism stopped on every reachable path by removal, by a reader or writer refusing loudly at the point of use before the lesson's harmful effect, or by a running guard. A deleted cited file is not enough for a pattern lesson. learn-issues' Guarded outcome becomes Stopped; Checkable means mechanically detectable, still reachable and unstopped; Stays is the default. The record stays `Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>`, appended without rewriting the case. lesson-rule.md, learn-issues, implement-issue, check-issue:61, shapes.md:289 and chart-issues SKILL.md:75 change together, with the prose sites in INTAKE.md. Report closure, duplicate or rejection still never removes a line. Foreclosed: 1b guard-only.
2. 2a: a judgment (Stays) lesson may move to the one live review step reached for its case, only in the root learn-issues pass's uncommitted diff, completed by the operator's approval of that diff, recorded as `Transferred <YYYY-MM-DD> to <file:line>, approved by <who>` and never as Applied, Stopped or Guarded. Leaves never transfer; Checkable never transfers; an unreached step keeps the lesson. No src/lessons.ts change. Foreclosed: 2b Applied by transfer.
3. 3a: a transfer stays inside the target repo; when the live step belongs to another repo the lesson stays and learn-issues names that repo and step; no seed line is printed for it. Foreclosed: 3b printed seed line.
