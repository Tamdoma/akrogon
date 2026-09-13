# Brief: rename-vocabulary

## What
The chart-issues skill, the `akrogon status --charts` output and every chart folder in this repo use one land vocabulary: territory, map, fog, fork, question, round, chart, off route.

Skill text: `skills/chart-issues/SKILL.md`, `assets/questions.md`, `assets/shapes.md`, `assets/standing-design.md` are rewritten in these words with these meanings.

- Territory: the whole problem space for one destination.
- Map: what the agent sees when it looks at the territory: forks, practitioner questions, beginner pitfalls. Drawn at open, redrawn after every answer, shown to the operator, never saved as its own file. Blind peer exchange files under `slots/` remain, as temporary exchange, not a saved map.
- Fog: a part of the map the agent can see but cannot yet phrase as a sharp question. Bullets in CHART.md, one patch per bullet. Clears into forks as answers land.
- Fork: one topic where the route splits. One file per fork. A fork holds one or more questions that always travel together: one file, one screen. A fork is taken when every material question in it is taken. Partial answers are recorded under Findings and `## Taken` is written only when the fork is taken. A taken fork is never reopened; a correction before handoff is a new fork that names the one it supersedes, the original stays verbatim, and only the effective answer becomes a binding decision.
- Question: one Q block inside a fork, same detail as today: explainer, evidence, exhaustive options with one recommended, pitfalls. An explicit choice takes a question. A request for explanation does not. An omitted material answer stays open. Numbering is continuous within a round.
- Round: one screen put to the operator: every currently material question across all open forks, one reply key, one challenge check. New forks appear after any answer, challenge check or live-surface inspection.
- Chart: the one page per destination: forks taken, forks open, fog, off route.
- Off route: work deliberately left past the destination, with the reason.

Disk names: `decisions/` becomes `forks/`. CHART.md headings become `## Forks taken`, `## Forks open`, `## Fog`, `## Off route`. Fork files use `## Taken` instead of `## Resolution`. `Handed off <date>` is unchanged. `slots/` example names in questions.md become `fork-name-A.md` and so on.

Command: `chartRow` and `chartRows` in `src/status.ts` read `forks/`, `## Taken` and the `Fog` section. The column header becomes `CHART  TAKEN  FOG  STAGE  AGE`. `tests/status.test.ts` fixtures follow. Stage logic is unchanged.

Migration in this repo: `issues/chart/status-empty-open`, `issues/chart/charting-vocabulary` and every `issues/closed/*/chart`: rename the folder, rewrite the headings, rewrite relative `decisions/` links. Bodies are otherwise byte-identical.

Docs word sync: `docs/guide/files.html:106`, `docs/guide/in-practice.html:75`, `docs/guide/create.html:58` and the chart-issues row in `README.md` use fork, taken, fog. The larger guide rewrite is the sibling leaf `guide-chart-picture`.

Kept as they are: "binding decisions" in leaf designs, D1…Dn in plan-issue, the close-time chart move in `src/phase.ts`, the implement-issue and plan-issue skills, handoff tree, preflight, footer.

## Why
The skill mixes land words with meeting words. Every read of a chart or a round costs a translation, for the operator and for every new seat. The two unnamed things in practice, fuzzy map parts and topic groups of questions, get handled inconsistently until they have names.

## Operator inputs
None.

## Done-criteria
1. Each of territory, map, fog, fork, question, round, chart, off route appears in `skills/chart-issues/` with the meaning above.
2. `grep -rniE "decision|batch|not yet specified|out of scope" skills/chart-issues/` matches only lines about binding decisions in leaf designs.
3. `assets/shapes.md` states that one fork file holds one or more questions always presented on one screen, that a fork is taken when every material question is taken, and that a pre-handoff correction is a new fork naming the superseded one.
4. `bun test` passes and `bun run typecheck` passes.
5. `akrogon status --charts` in this repo prints header `TAKEN` and `FOG` and lists `status-empty-open` as `1/1` and `charting-vocabulary` as `5/5`, both `handed off`.
6. `find issues/chart issues/closed -type d -name decisions` prints nothing and `grep -rlE "^## (Decisions So Far|Open Decisions|Not Yet Specified|Out Of Scope|Resolution)" issues/chart issues/closed/*/chart` prints nothing. Closed leaf designs under `issues/closed/*/<leaf>/design.md` keep their copied `## Resolution` headings untouched.
7. The four docs lines and the README row use the new words; `grep -niE "decision|unspecified" docs/guide/files.html docs/guide/in-practice.html docs/guide/create.html` matches only the design.md row about locked decisions.
