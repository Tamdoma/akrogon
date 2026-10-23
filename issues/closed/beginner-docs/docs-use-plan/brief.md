# Brief: docs-use-plan

## What

How-to pages under docs/use/ for planning and running work: a-working-day, plan-work, quick-fix, autopilot, write-issues-by-hand, report-an-observation, run-work, park-pause-stop, watch-while-away; and removal of the door-reset test's wording check on docs/guide/chart.md.

## Why

Each job an operator does before and during a run gets its own findable page. Consumes chart-door.svg and ways-to-run.svg (docs-pictures-concepts), working-day.svg, dispatch-order.svg, control-states.svg and watch-loop.svg (docs-pictures-operations), and links docs/reference/commands.md, skills.md and config.md (docs-reference-commands).

## Done-criteria

1. Each of the nine pages exists, covers its subject from the map, shows optional steps as optional (watch, broadcast, GitHub intake), describes direct work as skipping leaf handoff and dispatch while keeping charted decisions and B review, and describes autopilot as handing off without starting execution.
2. Each page that introduces a concept embeds its picture with alt text, and every page ends with a link to its next step.
3. The door-reset documentation check and its read of docs/guide/chart.md are removed with the reason in the report; door-reset behavior tests are unchanged.
4. Every statement on the owned pages matches current `src/` and `skills/` (seat B checks each page against its listed sources), contains no mention of a command, setting, file or behavior that no longer exists, and contains no dates.
