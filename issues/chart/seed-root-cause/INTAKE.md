# Intake: seed-root-cause

## Scope
seed-issue (skills/seed-issue/SKILL.md, used from every consumer repo) records a labeled suspected cause, related issues and an optional root-report line at filing, plus docs/guide/create.md. chart-issues is unchanged: its existing consolidation verifies and groups at import (chart-grouping 1a). Destination: registered repo akrogon.

## Provenance
- GitHub: Tamdoma/akrogon#56
- Operator: 2026-10-05 chart-issues invocation

## Source: Tamdoma/akrogon#56
# seed-issue files symptoms only; intake should lead to the root cause and link related issues

Source: Tamdoma/akrogon#56
URL: https://github.com/Tamdoma/akrogon/issues/56

Unverified intake.

## Observation
`seed-issue` records symptoms but does not push the report toward the root cause. The reporter's goal is to always fix the root issue.

The skill tells the agent to write the report "without diagnosis, recommended fixes or planning metadata" and to stop after one issue. In one session in a consumer project (Stopsol, filed to Tamdoma/tamdoma-framework), this produced four separate symptom issues: #124 (abandoned variants block the mockups close), #125 (phases close on run history), #126 (motion CLI false failures) and #127 (photo-path rule conflict).

The shared cause only came out when the reporter asked "what's the systemic issue?" and filed it as a fifth issue: the blueprint has no state for an operator choosing one mockup variant early. Nothing in the skill asks whether a new report shares a cause with issues already filed, or asks for the reporter's suspected root cause. So the backlog collects symptom fixes for one root problem.

## Location
`seed-issue` skill (`~/.claude/skills/seed-issue/SKILL.md`), Report section. Used against Tamdoma/tamdoma-framework.

## Reproduction
1. In one session, hit several failures that come from one design gap.
2. Run `seed-issue` for each failure as it appears.
3. Each report describes its own symptom. None names or links the shared cause until the reporter asks for it and files it separately.

Frequency: seen once in one session (4 symptom issues, then 1 root-cause issue).

## Expected behavior
Each intake captures the root cause, or at least leads toward it, without the reporter having to ask. For example, the report could record the reporter's or agent's suspected root cause as clearly labeled unverified context, and check for and link issues from the same session or the same repo that share it. The goal is to fix the problem class, not each symptom.

## Urgency
Backlogs fill with symptom-level issues, and the shared cause only gets filed when someone asks for it. Workaround: the reporter asks for the systemic cause by hand and files it as a separate issue.


## Source: operator 2026-10-05
We need to chart the seed issue problem. The seed issue skill should also try to discover the root cause of the problem so that every repo that consumes Akrogon can actually fix the root. Spawn consultant B and C slots. B slot should be codex C slot should be claude fable 5-1 with medium effort.

## Agent findings
See slots/map-merged.md. Case evidence read 2026-10-05 with gh issue view: Tamdoma/tamdoma-framework #124-#127 filed 08:13-08:59, #128 root-cause report 09:09 lists #124 as a symptom of the missing variant-choice state, #125 as a separate gate-design problem, #126 and #127 as contributing rule conflicts.
