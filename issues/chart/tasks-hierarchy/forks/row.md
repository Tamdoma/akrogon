# Fork: row

## Question

What does one task row show at 368 px and at full width, and what does a click do? Parts in play: grey repo prefix, slug, state reason (one short phrase, direction 2a), subphase (review vs repair), seat icons and spinner (locked: program icons, no letters, sized to the row), time (busy duration for Working, phase age otherwise), "blocks N". Direction 1b says a click jumps to the agent's pane or log; which target for which state (busy seat pane, failed leaf with no pane, log), and what the producer must report for it.

## Carries

- forks/direction.md (all answers), forks/list-shape.md Taken, forks/sections.md Taken.

## Findings

- better-than-training · read-only check 2026-11-04: framework leaf `fixture-weave-recorder` state.yaml records `tab: wA:tY8`, `pane: {A: wA:p1WA, B: wA:p1WB}` (old herdr session ids); herdr-app pane ids look like `p0422ad5c704a0240fe38105670d438bc` (`herdr-app do terminal.keep` output this session). No akrogon-recorded pane resolves in herdr-app today, so `run("pane.focus")` from the board has no valid target until seats run in herdr-app. Limits: one leaf inspected; did not call pane.focus with the old id.

Notes: slots/forks2-A.md, forks2-B.md, forks2-C.md; merged slots/forks2-merged.md; rebuttals slots/forks2-rebuttal-B.md, forks2-rebuttal-C.md.

## Taken

A's pick under autopilot (2026-11-04), not operator words.
Two lines at every width (C; direction 2a, 5c). Line 1: grey repo prefix (`flex_none`) + slug (truncates first), seat icons at the right end with the busy one spinning, then the disclosure chevron. Line 2, all inline left: full phase word (subphase visible), the one reason phrase (red on Needs you, muted otherwise), "· 12m" (busy duration on Working, phase age otherwise), "· blocks N" when above zero; truncates, the expansion shows it whole (C; B's third line rejected: 2a, 5c). Nothing right-aligned except icons and chevron.
Click on the row body opens the leaf's own issue folder in Files (the folder of `plan`: state, reviews, design), the nearest record of the problem akrogon writes today, through the existing pin and panel request. Reason: direction 1b asks a click to point at the pane or log; no akrogon-recorded pane resolves in herdr-app today (Findings), so a pane jump has no valid target, and the leaf folder is where the failure and reviews are read. Rejected: body expands (A's notes; contradicts 1b, B,C); busy seat → tab → worktree cascade (C; B: a tab or worktree is not the problem record); a diagnostic log viewer (B; akrogon records no log path, a new producer field and surface for one draft board). Standing dissent: B wants a problem-specific live target or diagnostic viewer. Parked rows (folder names only) have no click target (B).
Carry, recorded only: the pane jump belongs to the herdr-app chart, when seats run as herdr-app terminals; added to issues/chart/herdr-app/INTAKE.md.
