# Slot A territory map

Destination: the chart-issues skill text uses one land vocabulary (territory, map, fog, fork, question, round, chart, off route) with behavior, files, preflight, handoff and footer unchanged.

## Forks

1. Disk names. `src/status.ts:238-252` (`akrogon status --charts`) reads the `decisions/` folder, a non-empty `## Resolution` heading in each decision file, and bullets under `## Not Yet Specified` in CHART.md. `tests/status.test.ts:460-482` writes those literals. Renaming on disk touches src and tests, so done-criterion 3 "suite passes unchanged" cannot hold literally. Recommended: keep disk names, new words in prose only, with the template literals exempt from the ban. Alternative: rename `decisions/`→`forks/`, `Not Yet Specified`→`Fog`, `Out Of Scope`→`Off route`, `Resolution`→`Taken`, update status.ts and its test, migrate the one live chart and eight closed charts.
2. Fog record shape. Status counts bullet lines under the section. Fog written as paragraphs counts zero and a fog-only chart shows stage `empty`. Recommended: fog is bullets, one patch per bullet.
3. Fork taking rule. A fork with several questions is taken only when every material question has an explicit answer; a partial reply keeps the fork open and records the answered parts. Continuous Q numbering across the round.
4. Corrections after taking. Intake says a taken fork is never reopened. A pre-handoff correction needs a rule: new fork that names the superseded one, original stays verbatim.
5. docs/guide/files.html:106 says "chart and its decision files". Lesson 2026-09-11 stale-rule-in-docs says grep docs for changed rules. Recommended: leave it, folder is still `decisions/` under option 1.

## Contradictions with the intake
- implement-issue does not read chart files. The disk dependency is the command's `status --charts` and `phase.ts:103` close-time move, plus its tests.
- "Map never saved" vs the blind exchange files under `slots/` that questions.md requires. Peer files are temporary exchange, not a saved map.
- Current rule is "each question decides one thing", not "each file decides one thing".

## Pitfalls
- Grep-shaped done-criterion 1 against verbatim template literals (lesson 2026-09-11 lock-vs-criterion): the CHART.md and decision templates in shapes.md contain the banned words if disk names stay.
- questions.md slot path examples `decision-name-A.md` become `fork-name-A.md`; closed charts keep old names, fine.
