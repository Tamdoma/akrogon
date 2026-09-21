# Reporting a charted identity that is still open

## Question

### Q1 · When a mirrored identity is already in a chart intake but still open on GitHub, who says so: the chart door at open, or `akrogon pull`?

### Carries
- close-path taken 2026-09-21: closes run through `akrogon close`, pushed by the operator from the door. Pull stays a mirror.
- Function over form: mechanical checks validate function, never prose shape; pull parsing INTAKE.md prose would be a format check on agent-written text.
- Related: `skills/chart-issues/SKILL.md:29` dedup rule skips such identities silently today.

## Findings
- better-than-training · `skills/chart-issues/SKILL.md:29` and `assets/shapes.md` GitHub identity paragraph, read 2026-09-21 · the door already reads every intake and leaf `sources` for dedup, so it holds the list of skipped identities at open · printing them costs one sentence in the skill.
- better-than-training · `src/pull.ts:42-77`, read 2026-09-21 · pull has no reader for charts or leaf states · a warning there adds chart parsing to the command.

## Taken
1-A (operator 2026-09-21). The chart door, at open, names each skipped identity that is still open on GitHub and offers `akrogon close` for it. Skill prose only; pull stays a pure mirror. Reason: the door already holds the dedup list and the verdict; a pull warning would need the command to parse INTAKE.md prose and would fire for in-progress charts. Foreclosed: a warning in `akrogon pull` (B).
