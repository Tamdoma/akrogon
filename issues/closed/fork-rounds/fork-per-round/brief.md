# Brief: fork-per-round

## What
The chart-issues skill text takes forks one per round again. A round presents one fork's material questions only. After the operator answers, the agent re-reads Fog, moves newly sharp questions into fork files, reshapes the remaining forks, re-sorts an ordered `## Open forks` list in CHART.md, then researches and asks the next fork. A one-fork destination is one round. Vocabulary unchanged: forks, taken, fog, off route. Human guide updated to match. Repository copy only: `skills/chart-issues/` and `docs/guide/chart.md`.

## Why
The 2026-09-11 rewrite dropped the one-decision-per-round rule and kept only "present all currently material questions in one complete round". Every fork's questions now land in one round, nothing is reshaped by earlier answers, and charts after 2026-09-14 hold one or two forks on one date where the 2026-09-08 process held thirty over many. Tamdoma/akrogon#27.

## Done-criteria
1. `skills/chart-issues/assets/questions.md`: the sentence "Present all currently material questions in one complete round" is replaced so a round presents the current fork's material questions only, and the next fork is researched and asked after the answer. No other rule in that paragraph changes.
2. `skills/chart-issues/SKILL.md` Take: the clause "keep sharp questions distinct from fog, and reshape the remaining chart after answers" is replaced by the recorded step: after each answer, re-read Fog, move newly sharp material questions into their own fork files removing only that material from Fog, reshape the remaining forks and update CHART.md's ordered Open forks list before selecting and researching the next fork. The handoff-readiness and prototype rules in that sentence stay.
3. `skills/chart-issues/SKILL.md` Drain or Take states in one sentence that a round takes one fork, the next answerable fork first, preferring the one whose answer reshapes the most remaining forks, and that a destination with one fork costs one round. The Drain sentence "A direct single item whose map finds no fog writes the same chart structure and proceeds to handoff immediately" is changed so the condition is no open fork and no fog. (B)
4. `skills/chart-issues/assets/shapes.md`: the CHART.md template gains `## Open forks` between `## Forks taken` and `## Fog`, holding linked fork names in the order they will be taken, and the sentence "A fork file with no operator answer under `## Taken` is open, and CHART.md lists none" is replaced so an open fork is listed there in that order. The preflight rule that refuses handoff while any fork lacks an answer is unchanged.
5. `docs/guide/chart.md` section "Forks are decisions; fog needs investigation" says forks are taken one per round and the next fork is researched after the answer, and the records paragraph says CHART.md lists open forks in the order they will be taken. Existing diagrams and the export-csv example stay.
6. `skills/AREA.md` and `README.md` are read for a sentence describing chart rounds; a hit is updated, otherwise the implementation report states none was found.
7. No new heading in `SKILL.md`, `questions.md` or `shapes.md` beyond `## Open forks` in the template, and no new field, file or command. Reading the changed Drain, Take, round and fork paragraphs in order gives one consistent procedure: map, one fork per round, reshape, next fork, handoff.
8. `bun test tests/docs-links.test.ts` and `bun test` pass. `src/`, `tests/`, other skills and `issues/` are unchanged on the branch.

Credentials: none.
