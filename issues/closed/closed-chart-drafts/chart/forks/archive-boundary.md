# archive-boundary

## Question
Q1. Which layer keeps chart-owned files out of the leaf inventory after an owner closes: stop `completeOwner` moving the chart into `issues/closed`, exclude the archived chart subtree in every leaf reader, or rely on the door not writing state.yaml?
Q2. If the chart stays in `issues/chart`, does completion append the `Closed <YYYY-MM-DD>` marker to CHART.md?

### Carries
- No locks. Related: forks/unreadable-capacity.md, forks/draft-contract.md.

## Findings
Tier better-than-training: inspected repo code, tests and skill contracts, 2026-09-28. No outside source applies to this repo-internal mechanism (A,B).
- Merged round: slots/archive-boundary-merged.md. Independent rounds: slots/archive-boundary-B.md, A in merged file.
- Q1 recommend stop moving the chart (A,B). The move (src/phase.ts:173-174) came in a2b9e07 with no stated reason and contradicts SKILL.md:67 and shapes.md:36. Scanners read only open/closed.
- Q2 recommend no Closed marker (A,B). A failed append after renameSync cannot retry since completeOwner returns early for closed leaves (src/phase.ts:139) (B).
- Rebuttal B accepted: option 1b reserves only the closed owner's immediate `chart` child, not the slug everywhere.

## Taken
Operator 2026-09-28, verbatim: `1a - but what will happen then, where will they stay? How is it gonna work? | 2a |`

Q1 1a: `completeOwner` stops moving `issues/chart/<owner>` into `issues/closed`. Charts stay in `issues/chart/<slug>/` permanently. Completed lifecycle records still move to `issues/closed/<owner>/`. Reason: removes the only path by which chart files enter a scanned area, and matches the door contract that charts stay in place. Foreclosed: 1b reader exclusions for `closed/<owner>/chart`, 1c door-only rule as the boundary. Already archived charts under `issues/closed/*/chart` stay where they are.
Q2 2a: completion writes no `Closed` marker. Reason: not needed by #39, and `Handed off` stays accurate history. Foreclosed: 2b completion-authored marker.
