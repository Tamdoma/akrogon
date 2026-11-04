# Opening map, slot A

Inspected: `herdr-app/tasks/main.js` (row, pillFor, alertLine, repoSection, render), `model.js` (pill, board), `issues/chart/herdr-panels/direct/live/tt-01-small.png` (today, live data), the operator's earlier screenshot of an expanded row (fixture-weave-recorder, conversation Image #13), herdr-setup `mods/agents-by-tab/main.js` (SECTION grouping), D19 in herdr-panels `direct/plan.md`.

## What the screen shows now (hierarchy problems)

1. Repo heading and task title compete. Repo name is 13 semibold, the task slug 13 medium, the group heading 11.5 medium dim (`repoSection`, `row`). Three levels sit within one point and one weight step, so nothing leads.
2. State does not lead. A working leaf (fixture-weave-recorder, spinner, `check` pill) and a waiting leaf (about-identity-title, `blocked-by …`, `plan` pill) use the same slug size, weight and color; only the small pill and seat spinner differ (`row`: slug color is foreground for every row with a pill).
3. The open row is uniform. In the expanded detail every line is 11 px muted: the failure, seats with config source paths, plan path, worktree path, kept slices, history, buttons (`row` detail block). The two things an operator acts on (failure reason, last moves, Files/Changes) look like the incidental ones (absolute config paths), and long absolute paths dominate the width.
4. Alerts outrank tasks. The slow-merge alert renders in foreground 12 px at the top (`alertLine`), louder than the task rows below it.
5. Layout measure. The list stops at `max_w(880)` on the left while the header ("Tasks · 2 open") spans the full panel, so at full width the right two thirds are empty and the count floats far from the list. The panel opens full width (panel-bar opens every view full, PT 1), which makes that gap the first thing seen.
6. Color mix. Stage pills use six ANSI tints and seat icons are full color, while the sidebar was made one-color today at the operator's request.

## Forks (decisions that change the outcome)

F1 · What leads a row: state or name?
- a (A's lean) State-led: rows grouped or ordered by what they need (needs you: failed/red; working; waiting/blocked; queued), like herdr-app's own Agents list sections (Needs you / Done / Working / Idle in agents-by-tab `SECTION`). Within a row the slug stays primary, the state carried by one quiet marker. Breaks later: grouping by state moves a leaf between sections as it advances, which can feel jumpy; repo grouping becomes a secondary label.
- b Repo/group-led as now, but with a real type scale and state shown by slug contrast (working full, waiting dimmed, failed red). Smaller change; keeps the issue tree the operator knows.

F2 · Type and color scale (three levels).
- a Section labels like the sidebar's "Spaces"/"Agents" (11.5, dim), repo as a quiet label, slug 13.5 medium foreground, metadata 11.5 muted; one accent only for "needs you". Matches herdr-app chrome.
- b Keep sizes, change only color/weight. Cheapest, but Refactoring UI's advice (de-emphasize secondary by color and size, not light weights) says the current near-equal sizes are part of the problem.

F3 · What the open row shows.
- a Actionable first: failure reason, last 3 moves, Files/Changes; seats as icons not "A pi pi — /home/…/config.yaml"; plan/worktree as short `~/…` or behind a "details" line; history beyond 3 folded.
- b Keep every field, only shorten paths and set a label/value scale.

F4 · Initial layout.
- a Tasks opens at side width (368 px) instead of full; the board is designed for that column; full width stays one click (⤢). Breaks: PT 1 ("opens full") is a herdr-setup contract for every view, so Tasks-only side opening is a herdr-setup change and an exception.
- b Keep full width, but use it: center the column under a matching header, or two columns (list left, open row's detail right, Linear "split" view).
- c Keep full width, header and list share the same 880 measure (smallest change).

F5 · Color: stage pills and seat icons.
- a One-color like the sidebar: pills become text in muted with only "needs you" states colored; seat icons translucent white. Consistent with the operator's "a bit too colorful" today.
- b Keep stage colors (herdr-app's Agents status pills are colored) and only fix hierarchy.

## Practitioner questions

- Who is the reader in 2 seconds? The operator glancing to see "is anything stuck or waiting on me?" That favors state-led emphasis (F1a) and quiet metadata.
- How many tasks at once? Today 2; on busy days tens across repos. Grouping by state must stay readable at 30 rows; repo labels must not vanish.
- Does the open row need to be inline? Inline expansion pushes rows down; a split view keeps the list stable at full width.

## Pitfalls over the work's lifetime

- Host tests lock structure (`tests/tasks-mod-host.test.ts`: opaque pill base and 0.12 tint, seat icons). A redesign must change those expectations with Test-Change citations, not leave stale locks.
- `S()` scaling: every new size must go through `S()` or text stops following font_size.
- Panel width varies (368 px side, ~1300 full, narrow windows): truncation and the time column must hold at 368.
- Live proof needs a throwaway window. Today's lesson: creating or removing a headless output froze the operator's window, so screenshots must come from a session window on an existing workspace, never a new output.
- akrogon deploy path: Tasks ships with akrogon's release; a herdr-setup change (F4a) is a second repo and a second landing.

## Evidence

- better-than-training · `herdr-app/tasks/main.js` row/repoSection/alertLine, read 2026-11-03 · sizes 13/13/11.5/11 and uniform muted detail · drives F1–F3.
- better-than-training · herdr-setup `mods/agents-by-tab/main.js` SECTION (Needs you/Done/Working/Idle), read 2026-11-03 · herdr-app's own agent list leads with state · supports F1a.
- practitioner · Linear, "How we redesigned the Linear UI" (https://linear.app/now/how-we-redesigned-the-linear-ui, read 2026-11-03 via search excerpts): reduce visual noise, raise hierarchy of navigation, layouts per view type (list, split) · supports F2a and F4b split.
- practitioner · Refactoring UI, Wathan and Schoger (https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886, read 2026-11-03): de-emphasize secondary text with color or size, keep weights 400–500, avoid grey on colored backgrounds · supports F2a; book text itself not found, summaries only.
- operator · today's sidebar request ("a bit too colorful … monochromatic, like white with transparency") · supports F5a as a likely preference, not a lock for Tasks.

## Questions I would ask the operator

F1, F4 and F5 change the outcome and are the operator's taste; F2 and F3 follow from F1 and can be proposed as a concrete mockup in the same round.
