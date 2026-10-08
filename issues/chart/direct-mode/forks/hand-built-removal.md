# Hand-built removal

## Question
Delete the `hand_built` leaf field now that `akrogon park` keeps work out of dispatch and direct mode covers attended small builds?

### Carries
- INTAKE.md agent finding: hand_built leaves cannot reach `merged` (src/turn.ts:9-10).

## Findings
- Only users: issues/closed/akrogon-loop/bootstrap/command and core-skills (2026-09 bootstrap). No other registered repo has it (grep of every registered repo's issues/, 2026-10-08).
- `stateSchema` is strict (src/state.ts:61), so dropping the field requires removing it from those records first. Done by the door on main 2026-10-08; `akrogon status` still parses.
- Owners of the field: src/state.ts:69, src/next.ts:611, src/turn.ts:9, tests (state, status, batch-dispatch, next), skills/chart-issues/SKILL.md:59, skills/chart-issues/assets/shapes.md:167,259, docs/guide/state.md:32,47-60, docs/guide/problems.md:12.
- Park (`issues/parked`, src/park.ts) keeps whole issues out of dispatch and is reversible.

## Taken
Operator 2026-10-08: "But do we even need it? Can we just delete that now that we have this proper way of doing it?" then "I don't want to have two ways to do the same thing."

Delete `hand_built` everywhere: schema field, dispatch and merge-queue branches, tests, door and shapes mentions, guide pages. Park is the one way to keep work away from agents. Leaf `hand-built-removal`, parallel to the other leaves.
Foreclosed: keeping hand_built; repairing it so hand-built leaves can merge.
