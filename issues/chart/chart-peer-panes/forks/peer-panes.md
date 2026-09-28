# Fork: peer-panes

## Question
Q1. Who creates slot B and C panes?
Q2. Where do the peers' harness and model come from?
Q3. What happens when the chart tab already has other panes?

## Carries
- Peer panes are named at chart open and C is named only with B (`skills/chart-issues/SKILL.md:23`, `assets/questions.md:44`).

## Findings
See ../../failed-leaf-routing/slots/map-merged.md (#34 half) and its rebuttals.

## Taken
2026-09-28, operator: "3a | 4a | 5a"
- Q1-A: when the operator asks for peers without supplying panes, the door creates them: split A right at 0.5, then split B down at 0.5 for C. With B only, B takes the whole right half. Supplied panes still work unchanged. Reason: removes the manual layout step.
- Q2-A: the door asks once at open which harness and model each created peer runs.
- Q3-A: the door arranges only panes it creates and never moves supplied or unrelated panes. Foreclosed: temporary-tab moves.
