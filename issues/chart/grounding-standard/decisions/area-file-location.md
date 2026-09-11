# Where does an area file live and what is it called?

## Question
Each area file is 25 to 40 lines with four sections: Commands, Key files, Non-obvious patterns, See also. Does it live beside the code it describes as `<area>/AREA.md`, or under `docs/areas/<area>.md`?

### Carries
Operator lock: guide at `docs/guide/`, index at `docs/reference-index.md`, no new machinery or skills.

## Findings
Placement had no measured compliance effect (McMillan, tier 2). Drift is the known failure (Anthropic docs, tier 2). implement-issue line 27 already tells the worker to update affected docs; a file in the folder being edited is in the worker's view, a file under `docs/areas/` is not.

## Resolution
Operator: `1a`, 2026-09-11. Beside the code as `<area>/AREA.md`, linked from `docs/reference-index.md`. Reason: the worker editing that folder sees the file, which is the only drift guard that costs nothing. Foreclosed: `docs/areas/<name>.md`.
