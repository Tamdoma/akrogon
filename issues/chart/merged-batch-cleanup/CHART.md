# Chart: merged-batch-cleanup

## Destination

A merged leaf whose merge batch a `next` or unpause pass releases is cleaned up (tab closed, seats ended, worktree and branch removed) by that same pass, with every existing retention veto kept and no timer, event or listener change.

Route: lifecycle

## Forks taken

- [Signposts](forks/signposts.md): A's picks 1a 2a 3a 4a 5a 6a 7a; needs none
- [Cleanup after release](forks/cleanup-after-release.md): cleanup runs last in `nextCommand` and `unpausePass`; `mergeWake` unchanged

## Open forks

none

## Fog

none

## Off route

- Periodic pass, listener events, durable cleanup work (signposts 1a, 2a, 4a).
- Leftover display for kept-for-batch leaves (signpost 5a).
- Open-owner worktree retention in `mergedWorktree` (existing rule).
- L1 land-unit exit race and L2 (fork cleanup-after-release, stated limits): recorded only.
- The framework leaf `scenario-settle-read` leftovers: the operator's; a later `akrogon next` in framework.

## Pending steps

none

## Mode record

- mode 2026-11-09T14:14:01Z t15 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/70154c62-73f9-47a5-8e8e-e3f78f692cf8.jsonl: on full autopilot; handed: Tamdoma/akrogon#132 (this chart); consultants: B t10p (codex gpt-6.1-sol high, door-created); signposts: A
- mode 2026-11-09T14:35:06Z t15 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/70154c62-73f9-47a5-8e8e-e3f78f692cf8.jsonl: off (every handed chart handed off); B restarted as t11d

## Autopilot

- switch-on: INTAKE.md, Source: operator 2026-11-09T14:14Z
- consultant: B t10p codex gpt-6.1-sol high (door-created, restarted for this chart)
- signposts: A — original in issues/chart/merged-batch-cleanup/forks/signposts.md
- route: lifecycle
- handed off: merged-batch-cleanup/cleanup-last-in-pass (issues/open/merged-batch-cleanup/cleanup-last-in-pass), sources Tamdoma/akrogon#132; leaf review B: no disagreement
- recorded only: L1 land-unit exit race and L2 (forks/cleanup-after-release.md, stated limits); framework leaf scenario-settle-read leftovers (t114, t117, worktree, branch, slice) remain for the operator, workaround a later `akrogon next` in framework; consultant C t10q not in this session, left untouched
- usage: chart merged-batch-cleanup - operator wait 19.1 min, operator turns 1; A=49332, B=20459 output (outcome done, before handoff)

Handed off 2026-11-09
