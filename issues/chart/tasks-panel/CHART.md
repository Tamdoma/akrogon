# Chart: akrogon Tasks board

## Destination

akrogon: `akrogon status --json` reports every registered repo, and a Tasks mod shipped from akrogon shows it in herdr-app's right panel, installed so herdr-setup's top bar can open it.

Route: lifecycle (tasks-mod merged 44482211); look repair direct (operator 2026-11-03, D5 "yes": fix the board look found in the first live view, slot B reviews)

## Forks taken

- [Status JSON](forks/status-json.md): `akrogon status --json`; the text command stays.
- [Tasks board](forks/tasks-panel.md): real-block red only; expand on click; read-only; `ctrl-b t`.

## Open forks

none

## Fog

## Off route

- Go to A / Go to B: after akrogon's herdr-app port (chart `issues/chart/herdr-app`).

## Pending steps

- Cross-repo checks after `status-json`, `tasks-mod` and herdr-setup's panel leaves land: recorded in `issues/chart/herdr-panels/CHART.md` Pending steps.

## Mode record

Handed off 2026-11-03

## Direct attempt

- branch: tasks-look
- worktree: /home/ivan/.akrogon/worktrees/akrogon/tasks-look
- base: 44482211fff2190ac8fed39fa14a49fce40b9ab7
- head: 59939cfb94187e9d8b25ad290cfc3969dc80ff17
- rounds used / fix_rounds: 1 / 3
- push attempts: 1 / 2
- done: F3 notices fold, F4 move instead of raw log, F5 quiet repos fold, F1 quiet charts fold, visual pass (B ready, review-B-2)
- not done: none
- trigger: none
- review files: slots/review-B-1.md (fix: F1 quiet repo charts), slots/review-B-2.md
- landed SHA: 59939cfb94187e9d8b25ad290cfc3969dc80ff17 (deployed 2026-11-03)

Reopened 2026-11-03 for a second direct attempt (operator on the live board: "the tasks still looks terrible, and it's VERY slow when I click on the actual agent"; Q2 O1 then Q4: "the same ones that herdr-app is using only appropriate size. Icons no letters, but here they need to be big to fit the design"; Q3: "increase the Tasks overall font size ... to what we have by default here in normal terminals").

## Direct attempt 2

- branch: tasks-look-2
- worktree: /home/ivan/.akrogon/worktrees/akrogon/tasks-look-2
- base: 59939cfb94187e9d8b25ad290cfc3969dc80ff17
- head: 554e1654
- brief: direct/brief-9.md
- rounds used / fix_rounds: 0 / 3
- push attempts: 0 / 2
- done: none
- review files: slots/review-B-3.md
- B review round 1: ready (slots/review-B-3.md)
- landed: 5dff80ee on akrogon main 2026-11-03 (554e1654 plus an empty commit citing tests/tasks-mod.test.ts on its own Test-Change line, same tree); verify merge green (receipt 8987d65c, 1301 tests), direct-guards passed, deployed by selfUpdate to release 5dff80ee
- broadcast delivered 2026-11-03 (DISCORD_WEBHOOK_URL, DISCORD_WEBHOOK_URL_2)
- cleanup 2026-11-03: worktree and branch tasks-look-2 removed, `akrogon pack` 11 logs

Closed 2026-11-03
