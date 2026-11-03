# Chart: herdr-setup panels

## Destination

herdr-setup (`/home/ivan/Work/infra/herdr-setup`): the flat layout's right panel gets Needs you, cloned Files and Changes with new views, a top bar that opens every panel full width with `ctrl-b` keys, and a shorter scrolling Spaces list. The Tasks board is the sibling chart `issues/chart/tasks-panel` (destination akrogon).

Route: lifecycle

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

- After akrogon leaf `status-json` lands and deploys and herdr-setup leaf `panel-top-bar` lands: the door checks once, in a throwaway session, that the Tasks button's red dot follows `akrogon status --json` `red`. Owner: the chart door. Check: dot shown with a red row present, gone after it clears.
- After `tasks-mod`, `panel-top-bar`, `files-panel` and `changes-panel` land: the door checks once that Tasks' Files and Changes buttons open those panels pinned to the leaf's worktree. Owner: the chart door. Check: both panels show the worktree's files and changes.

## Mode record

Handed off 2026-11-03
