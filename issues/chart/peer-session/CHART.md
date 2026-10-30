# Chart: peer-session

## Destination

The chart peer scripts act only in the herdr session of the door pane they run under, and refuse visibly when the inherited herdr env does not name that pane, never acting on a same-id pane in another session.

Route: lifecycle

## Forks taken

- [peer-anchor](forks/peer-anchor.md): A's pick 1a 2a: each peer script verifies by process ancestry that its inherited herdr env names its own pane, refuses otherwise, and keeps calls unchanged; consultants share A's session

## Open forks

none

## Fog

none

## Off route

- A herdr server replaced under the same session name: the check pins the pane's live shell, not a server generation (B Q6).
- Cross-session consultants: not supported (peer-anchor Q2).

## Pending steps

none

## Mode record

- mode 2026-10-29T07:29:36Z w8:pNP df4e7766-cbbc-4c40-8f28-60e419fee3e1: on handed [peer-session, pull-gh-path]; consultants B w8:pXC (codex)

## Autopilot

- switch-on: [INTAKE.md](INTAKE.md) `## Source: operator 2026-10-29T07:29Z`
- route: lifecycle (direct refused: autopilot)
- consultant: B w8:pXC codex restarted 2026-10-29T07:29Z (session 01a18690-809a-7a20-8f8b-57936db4ebf2); exchanges: shared opening map, rebuttal, final-shape check, leaf review, all `done`, no loss. A's own mistake: the map's peer-ask was started in the background; A stopped its own process by pid and resumed with a foreground `peer-wait.ts` (exchange boundary null), outcome done.
- handed off: peer-session/peer-pane-anchor (akrogon status: plan.synthesis, 2026-10-29T07:46Z)
- usage: [USAGE.md](USAGE.md)

Handed off 2026-10-29
