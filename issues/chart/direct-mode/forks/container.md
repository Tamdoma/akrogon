# Container: leaf record or chart-held

## Question
Should a direct job skip the normal leaf (`state.yaml`) and live only in the chart folder?

### Carries
None.

## Findings
- 1a No state.yaml; chart folder holds brief/design/readiness, review files and `Closed <date>` marker with the delivering commit. (B,C)
- 1b hand_built leaf: dead end, `mergeQueue` excludes hand-built leaves (src/turn.ts:9-10). (C) Withdrawn by A.
- 1c ordinary leaf with `akrogon next` merge: merge allocates a fresh tab with new panes (src/next.ts:337-438). (B,C)
- Research: better-than-training, src/turn.ts:9-10, src/next.ts:337-438, src/phase.ts:185-220, read 2026-10-08. Practitioner (B): Google eng-practices Small CLs; Trunk Based Development short-lived feature branches, both read 2026-10-08.
- Rebuttal C: under 1a, inputs/grants/produces must be hard refusals of the direct option, since no presence gate exists without state.yaml (chart-issues/SKILL.md:83, implement-issue/SKILL.md:45,59). Carried to eligibility.

## Taken
Operator 2026-10-08: `1a |`

1a: no leaf record. Direct work lives in the chart folder, closed with a `Closed <date>` marker naming the delivering commit.
Reason: keeps the same A and B sessions from start to finish, as the intake asks.
Binding: the door runs the phase guards itself (clean tree, no `issues/` diff on the branch, Test-Change citations,
non-empty branch); worktree and branch removal is part of done, before the `Closed` marker.
Foreclosed: hand_built leaf (cannot merge); ordinary leaf with dispatched merge (third session lands the code).
