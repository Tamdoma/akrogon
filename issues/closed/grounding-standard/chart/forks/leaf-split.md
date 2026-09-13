# How is the work split into leaves?

## Question
Relocation (guide to `docs/guide/`, index to `docs/reference-index.md`, reference updates) and the area-file standard (skill rules plus akrogon's own area files) share one destination. One leaf, or two leaves with the standard blocked by relocation?

### Carries
Operator lock: one issue. Shapes: only an actual dependency orders work.

## Findings
The area files link from the index, so their index lines depend on the index's final path. Both changes together touch about 12 files. A single leaf fits one plan and one review pass.

## Taken
Operator: `4a`, 2026-09-11. One leaf. Reason: one plan and one review for about 12 files, index lines written against the final index path. Foreclosed: a relocation leaf blocking a standard leaf.
