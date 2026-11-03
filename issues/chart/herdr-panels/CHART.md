# Chart: herdr-setup panels

## Destination

herdr-setup (`/home/ivan/Work/infra/herdr-setup`): the flat layout's right panel gets Needs you, cloned Files and Changes with new views, a top bar that opens every panel full width with `ctrl-b` keys, and a shorter scrolling Spaces list. The Tasks board is the sibling chart `issues/chart/tasks-panel` (destination akrogon).

Route: direct (operator 2026-11-03: "use manual mode to finish everything and to deploy it so we can have it working here now", slot B reviews; the five handed-off herdr-setup leaves were never dispatched)

## Forks taken

- [Code home](forks/code-home.md): herdr-setup repo; everything in the flat layout.
- [Needs you](forks/needs-you.md): blocked and finished agents with a reply box and option buttons; per-harness send rules; Codex fix belongs to herdr-core.
- [Spaces](forks/spaces.md): smaller fixed share that scrolls; rows unchanged.
- [Files and Changes](forks/files-changes.md): clones with Working/Branch/Commits, markdown, filter, Recent, pin; no Commit.
- [Panel width](forks/panel-width.md): every view opens full width; one open/close routine.
- [Look](forks/look.md): straight edges, logos, stage palette, counts, `ctrl-b t` and `ctrl-b y`.

## Open forks

none

## Fog

## Off route

- A7 cost meter: dropped by the operator (message 2).
- Codex question detection in Needs you: herdr-core's change, reported through `herdr-app feedback` ([Needs you](forks/needs-you.md) Q6).
- Go to A / Go to B seat jumps: wait for akrogon's herdr-app port (chart `issues/chart/herdr-app`).

## Pending steps

- After akrogon leaf `status-json` lands and deploys and herdr-setup leaf `panel-top-bar` lands: the door checks once, in a throwaway session, that the Tasks button's red dot follows `akrogon status --json` `red`. Owner: the chart door. Check: dot shown with a red row present, gone after it clears. Done 2026-11-03 for the shown half: after deploy `akrogon status --json` reports `red: 1` and the operator's main window shows the Tasks dot (`direct/live/deploy-main-window.png`); the cleared half was not observed.
- After `tasks-mod`, `panel-top-bar`, `files-panel` and `changes-panel` land: the door checks once that Tasks' Files and Changes buttons open those panels pinned to the leaf's worktree. Owner: the chart door. Check: both panels show the worktree's files and changes. Not run live: B round 2 traced a real `pinIntent()` pin and `f4-17` shows the picker for such a pin; the click from a Tasks row in a running window is left to the operator.

## Mode record

Handed off 2026-11-03

## Direct attempt

- branch: right-panel
- worktree: /home/ivan/.akrogon/worktrees/herdr-setup/right-panel
- base: b1d904d645a45c991d0682e0571aa07761a060b0
- head: 20cd68b0ab245863e76341a7e51ef832ecd1c00a
- rounds used / fix_rounds: 2 / 3
- operator 2026-11-03 Q5 O1: panel-top-bar criterion 4 keeps one upstream exception (plan D20); deploy once B approves ("ok, deploy it when B approves")
- push attempts: 1 / 2
- broadcast delivered 2026-11-03 (DISCORD_WEBHOOK_URL)
- cleanup 2026-11-03: worktrees right-panel and right-panel-u8 removed, branch right-panel deleted (right-panel-u8 had no branch left), sessions right-panel-1 and tasks-look stopped and deleted, outputs HERDRTEST and HERDRTEST2 removed, the five superseded lifecycle leaves moved from herdr-setup issues/open/right-panel to handed-leaves/, `akrogon pack` 41 logs
- landed: 20cd68b0ab245863e76341a7e51ef832ecd1c00a on herdr-setup main 2026-11-03 after B round 3 ready (slots/review-B-3.md); verify receipt with holder ~/Work/infra/herdr-setup/issues/chart/herdr-panels/direct (run-check maps a holder into the destination repo; a holder in akrogon fails with EACCES), direct-guards passed, ./install run
- done: panel-top-bar 1-11 (criterion 4 with the D20 exception), files-panel 1-7, changes-panel 1-5, needs-you-panel 1-7, spaces-scroll 1-2
- not done: none
- trigger: none
- review files: none
- landed SHA: none

Closed 2026-11-03
