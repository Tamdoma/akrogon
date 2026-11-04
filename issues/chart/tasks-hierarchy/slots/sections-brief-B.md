# Fork notes brief: sections, slot B

You are consultant slot B for the chart door (slot A, terminal t15). Work alone; you will not see A's or the other slot's notes until all finish. Do not edit code, commit, launch agents or touch the operator's windows. Write only your return file.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. Source files of the Tasks mod and akrogon's status producer are the subject of the work and may be read whole.

## Intake

/home/ivan/Work/infra/akrogon/issues/chart/tasks-hierarchy/INTAKE.md (both operator notes, verbatim).

## Operator answer so far (verbatim)

Round 1, list shape: "1a" — sections by what each task needs, across all repos (Needs attention, Working, Waiting, Paused/parked; exact set to settle now), each row starting with a grey repo name, empty sections hidden. Fork file: /home/ivan/Work/infra/akrogon/issues/chart/tasks-hierarchy/forks/list-shape.md (read only its Question and Taken sections).

## Current question

/home/ivan/Work/infra/akrogon/issues/chart/tasks-hierarchy/forks/sections.md, Question and Carries sections.

## Related

- Producer: /home/ivan/Work/infra/akrogon/src/status.ts (leafRed, undelivered, blockedBy, envelope red), src/stop.ts, the watch rule /home/ivan/Work/infra/akrogon/skills/watch-issues/SKILL.md (Judge section: required seats by phase).
- Mod: /home/ivan/Work/infra/akrogon/herdr-app/tasks/model.js, main.js. Panel-bar red dot: /home/ivan/Work/infra/herdr-setup/mods/panel-bar/routine.js (redDot).
- The Agents list's sections: /home/ivan/.config/herdr-app/mods/agents/main.js (SECTION, status()).

## Locks

- Seat icons as herdr-app program icons, no letters, sized to the row; a working seat spins. Text follows settings().font_size. Clicks redraw at once. Removed today and stay removed: the "No open tasks" line, Charts, Last merges, Housekeeping. The kept/live-tab treatment stays as is. The Needs you panel was removed from herdr-app today; Tasks is the only board.

## Task

Write blind notes for this question in five parts: your pick with its reason and cost; each rejected option with its reason; evidence with tier (operator, practitioner, primary docs/code, model knowledge with the searches that found nothing stronger), source and date; pitfalls with what removes each; any question you would ask that the fork does not ask. Cover each sub-question: Needs attention facts, between-seats placement, stopped, merged rows under an open epic, header count scope (task-only or all problems, and its relation to the red dot). Be proportional.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/tasks-hierarchy/slots/sections-B.md, then report with hc send t15 when done or stuck: hc send t15 "sections-B ready".
