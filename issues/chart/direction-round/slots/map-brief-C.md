# Opening map brief, slot C

You are consultant slot C for the chart door (slot A, terminal t15). Work alone; you will not see other slots' maps until all finish. Do not edit code, commit, launch agents or touch the operator's windows. Write only your return file.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. The chart-issues skill files are the subject of this work and may be read whole.

## Intake

/home/ivan/Work/infra/akrogon/issues/chart/direction-round/INTAKE.md (GitHub Tamdoma/akrogon#128 verbatim, with the operator's words).

## Direction (answered by A at the operator's word "You answer the directions.")

/home/ivan/Work/infra/akrogon/issues/chart/direction-round/forks/direction.md, whole.

## Live surface

- Skill source in the repo: /home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md (Open, Drain, Take, Handoff, Autopilot, Handover sections), assets/questions.md, assets/shapes.md (Chart records, Mode record, Autopilot sections), scripts/ (chart-usage.ts and others), and any tests of the skill under /home/ivan/Work/infra/akrogon/tests (search for chart-issues).
- The observed case: /home/ivan/Work/infra/akrogon/issues/chart/tasks-hierarchy/forks/direction.md, slots/direction-brief-C.md, slots/direction-C.md, CHART.md (Mode record, Autopilot).

## Locks (operator words, verbatim in the intake)

- Attended: the direction round is mandatory before any individual fork round, and it shapes the opening map.
- Autopilot: also required; answered by the operator, or by A automatically when the first message says so (example "Autopilot for general direction as well").

## Task

Write an independent territory map: the forks that change the outcome (what to decide, with options), the questions a practitioner who designs agent workflows would ask, and the pitfalls over the work's lifetime, with what each option could break or invite later. Ground every claim in the inspected files or a named outside source (tier: operator, practitioner, primary docs/code, model knowledge with the searches that found nothing stronger). Include where the round sits in the door's order (Open, map, Drain), how the map changes because of it, what records and tests change, and what a leaf could check mechanically versus what stays judgment. Be proportional: one door step.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/direction-round/slots/map-C.md, then report with hc send t15 when done or stuck: hc send t15 "map-C ready".
