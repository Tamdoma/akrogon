# Content map and rebuttal brief, slot B

You are consultant slot B for the chart door (slot A, terminal t15). You start fresh. Part 1 is blind: you will not see other slots' content maps until all finish. Do not edit code, commit, launch agents or touch the operator's windows. Write only your two return files.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. This rule covers process text only; the Tasks source files below are the subject of the work and may be read whole.

## Intake (operator, verbatim)

"This looks perfect. The only thing I'm not happy with is how the Tasks UI looks like. I don't know exactly what it is, but it could be the active issue that has the same color and typography hierarchy. I think the hierarchy overall isn't that good. Also, it could be that the initial layout might not be ideal. Let's clean up and chart out the UI changes."

## Intake, second note (operator, verbatim)

"We also need to talk about the actual elements in there. Like what really matters for me to be displayed. Consult with consultants and see what categories we need and what forks."

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

## Part 1: content map (blind)

Inventory every element the board shows today (header, alerts, repo sections, group headings, row parts, the open row's detail lines and buttons, empty states), from main.js and model.js, each with the data source it renders. Then answer, from the operator's seat: what should the operator see in two seconds, what on demand, and what never. Propose the categories the board needs (for example: needs me, working, waiting, queued, recently done, problems with the machine) and say which existing elements fall into each, which should go, and what is missing that the operator would act on. Name the forks that change the outcome, with options and what each could break or invite later. Ground claims as before (inspected file, screenshot, named outside source, or model knowledge with the searches that found nothing stronger). Be proportional: one panel.

Write it to /home/ivan/Work/infra/akrogon/issues/chart/tasks-hierarchy/slots/content-B.md.

## Part 2: rebuttal on the merged hierarchy map

Read /home/ivan/Work/infra/akrogon/issues/chart/tasks-hierarchy/slots/map-merged.md (A, B and C's opening maps merged with slot tags; the source maps map-A.md, map-B.md, map-C.md sit beside it). Write only disagreements: a line tagged with your slot that misstates what you wrote, a problem or fork you think is wrong or missing, or a pitfall whose removal would not work. Give evidence for each. If you have none, write "no disagreement".

Write it to /home/ivan/Work/infra/akrogon/issues/chart/tasks-hierarchy/slots/map-rebuttal-B.md.

## Return

Report with hc send t15 when done or stuck: hc send t15 "content-B and rebuttal-B ready".
