# Brief: fork notes, cutover (herdr-app chart)

You are a consultant seat (letter in the message that pointed you here) for the chart door A in hc terminal `t15`. Work alone and blind: do not read other seats' files in `slots/` except this brief and `map-merged.md`. Do not start agents, do not edit any file except your return file, do not ask the operator. Read-only commands only (as in slots/map-brief.md); no `hc run`, `hc kill`, `herdr-app do`.

## Task

Write independent notes on the three questions in `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/cutover.md` (`## Question` and `### Carries`; the Carries are binding). For each question give five parts:

1. your pick, its reason and its cost;
2. each rejected option with its reason;
3. the evidence: tier (operator, practitioner, better-than-training, model-knowledge), source with path:line or command, date read;
4. the pitfalls, each with what removes it (a design part, a probe before handoff, a leaf done-criterion, or an operator step);
5. any question you would ask that this fork does not ask.

This is your own position, not a review of anyone else's. Practitioner tier first for anything outside this repo (how teams cut over a self-deploying tool from one runtime to another with no dual-support period: drain, rollback, removal); name a source or say you searched and found none. Keep it under 90 lines.

## Read

- `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/cutover.md`
- `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/signposts.md` section `## Taken`
- `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/map-merged.md` (merged territory map; its corrections section lists commands that do not exist)
- `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/INTAKE.md`
- `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/forks/*.md` sections `## Taken` of every taken fork (binding; CHART.md lists them).
- Code and live surface: `docs/reference/commands.md` (rollback, deploy), `src/install.ts` (herdr integration and plugin), rollback and deploy sources under `src/` (locate them), `~/.akrogon/config.yaml` (repos), `~/.akrogon/deploy.yaml`, `learnings/LESSONS.md` and `learnings/history/` (herdr mentions), `/home/ivan/Work/omarchy-customizations/herdr/README.md`, `systemctl --user list-units '*herdr*' --all`, `ls ~/.config/herdr ~/.local/bin/herdr`, `skills/chart-issues/SKILL.md` and `assets/shapes.md` (handoff, split, ordering rules). Read-only.

Reading rule: read process text by named section for the step you are answering. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges.

## Return

Write to exactly one path, by your letter:

- B: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/fork-cutover-B.md`
- C: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/fork-cutover-C.md`
- D: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/fork-cutover-D.md`
- E: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-app/slots/fork-cutover-E.md`

Then, as your last action: `hc send t15 "done <letter>: <your return path>"` (or `hc send t15 "stuck <letter>: <reason>"`).
