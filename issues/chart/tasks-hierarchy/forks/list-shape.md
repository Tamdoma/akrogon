# Fork: list-shape

## Question

Should the Tasks board group rows by what they need from the operator (sections across repos, like herdr-app's Agents list), or keep repo then issue folder with each row showing its state?

## Findings

- better-than-training · herdr-setup `mods/agents-by-tab/main.js` SECTION and shipped `~/.config/herdr-app/mods/agents/main.js` SECTION (Needs you / Done / Working / Idle), read 2026-11-03 · the list beside Tasks sections by state and rows move between sections (A,C).
- better-than-training · akrogon `herdr-app/tasks/model.js` board/repoRows, read 2026-11-03 · today: current repo first, then alphabetical, group headings from issue folders (A,B,C).
- better-than-training · Linear docs, Display options (https://linear.app/docs/display-options), read 2026-11-03 · list views can group by status, project, assignee, priority, cycle; grouping is a per-view choice, not one rule.
- operator · D19 (herdr-panels plan.md): right panel follows herdr-app shipped-mod geometry (C reads this as match-the-mods).
- Slot positions: content-merged.md N1; rebuttals content-rebuttal-B.md, content-rebuttal-C.md.

## Taken

1a, operator 2026-11-04 round 1, reply verbatim: "1a".
Sections by what each task needs, across all repos (Needs attention, Working, Waiting, Paused/parked; exact set settled in the sections fork). Each row starts with a grey repo name. Empty sections are hidden.
Binding avoidance: rows keep expand and pin across a section move (row key repo/slug); empty sections hidden; a row is "needs attention" only on a recorded fact (sections fork sets the list).
Consequence: repo headings and issue-folder headings as rows go; repo-level facts (paused, merge queue place, parked) become row facts.
