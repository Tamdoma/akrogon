# Opening map brief, slot B

You are consultant slot B for the chart door (slot A, terminal t15). Work alone; you will not see other slots' maps until all finish. Do not edit code, commit, launch agents or touch the operator's windows. Write only your return file.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. This rule covers process text only; the Tasks source files below are the subject of the work and may be read whole.

## Intake (operator, verbatim)

"This looks perfect. The only thing I'm not happy with is how the Tasks UI looks like. I don't know exactly what it is, but it could be the active issue that has the same color and typography hierarchy. I think the hierarchy overall isn't that good. Also, it could be that the initial layout might not be ideal. Let's clean up and chart out the UI changes."

## Live surface

- Tasks mod (akrogon repo, deployed): /home/ivan/Work/infra/akrogon/herdr-app/tasks/main.js (render), model.js (rows), model.d.ts (types), schedule.js. Tests: /home/ivan/Work/infra/akrogon/tests/tasks-mod.test.ts, tests/tasks-mod-host.test.ts. Area doc: /home/ivan/Work/infra/akrogon/src/AREA.md (Tasks entry).
- Current look, live data, taken today after the footer cleanup: /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/live/tt-01-small.png (half scale; the Tasks panel opened full width).
- herdr-app's own look to match: shipped mods under /home/ivan/.config/herdr-app/mods/ (agents, files, changes, tabs), the herdr-app manual /home/ivan/.config/herdr-app/AGENTS.md (sections on mods and theme), the gpui types /home/ivan/.config/herdr-app/gpui-kit.d.ts.
- The operator's look rule for the right panel: D19 in /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/plan.md ("herdr-app shipped-mod geometry plus Omarchy controls ...").
- Sidebar redone today in one color: Spaces avatars a translucent white tile, agent icons translucent white (/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js, mods/spaces-list/main.js).

## Existing locks (operator decisions still in force)

- Seats: both seat icons as herdr-app's program icons, no letters, sized to the row; a working seat spins (operator 2026-11-03: "the same ones that herdr-app is using only appropriate size. Icons no letters, but here they need to be big to fit the design.").
- Text sizes follow settings().font_size, default 14 ("Increase it to what we have by default here in normal terminals").
- Clicks redraw at once (fixed today).
- Removed today, stay removed: the "No open tasks" line, Charts, Last merges, Housekeeping folds.
- The "kept ... live tab" row stays as is for now (operator: "we're gonna move to herdr-app soon. So don't do anything about it yet").
- Tasks lives in akrogon's herdr-app/tasks and is deployed by akrogon's release; herdr-setup only lays out the panel.

## Task

Write an independent territory map for this work: the forks that change the outcome (what to decide, with options), the questions an experienced UI practitioner would ask, and the pitfalls over the work's lifetime, with what each option could break or invite later and not only now. Ground every claim in the inspected files, the screenshot or a named outside source (tier: operator, practitioner, primary docs/code, or model knowledge with the searches that found nothing stronger). Be proportional: this is one panel. Name concrete hierarchy problems you can see (for example the active row's color and type matching other rows), and say which of them you would ask the operator about versus treat as settled by the existing locks.

## Return

Write your map to /home/ivan/Work/infra/akrogon/issues/chart/tasks-hierarchy/slots/map-B.md, then report with: hc send t15 "map-B ready: <path>". Report the same way if stuck.
