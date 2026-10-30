# Chart: bun-copyfile

## Destination

Every Bun install akrogon proposes, runs or documents passes `--backend=copyfile`, so `node_modules` files are private copies instead of hardlinks into the shared Bun cache.

Route: lifecycle

## Forks taken

- [Flag sites and proof](forks/flag-sites.md): literal flag at every Bun install site except akrogon's own config; fail-first inode test on the release fixture

## Open forks

## Fog

## Off route

- akrogon's own `issues/config.yaml` `setup` line: consumer config that the operator's guide Step 4 changes only with operator approval in its own commit; offered to the operator.
- Rebuilding existing `releases/<sha>`: `buildRelease` reuses an existing release, only new builds change.

## Pending steps

none

## Mode record

- mode 2026-10-27T19:17:30Z w8:pNP 5b635ed5-411e-4538-8efb-f5eb9f85a809: on; handed Tamdoma/akrogon#122 (operator message 2 narrowed message 1's set to this one issue); consultants B codex default settings, pane w8:pXC

## Autopilot

- switch-on: INTAKE.md, Source: operator 2026-10-27 messages 1 and 2
- consultant: B codex (default settings), pane w8:pXC, created by the door
- route: lifecycle
- handed off: akrogon issues/open/bun-copyfile/copyfile-installs (akrogon status lists it at plan.synthesis)
- main step: issues/config.yaml setup gained --backend=copyfile on operator approval, commit 3e49c3d5 pushed to origin/main; real install proof 1540 of 1540 files at 1 link
- recorded only: framework seeds #404-#445 (held: the chart-framework door, pane wA:pMT was already charting them on autopilot; operator narrowed the list to #122); akrogon flaky lists 10 tests (none handed); akrogon's own issues/config.yaml setup line offered to the operator per guide Step 4
- friction: B's map named tests/install.test.ts from a real install at line 320; A wrongly dropped it after reading only the cli install calls, and B caught it at leaf review
- usage: chart bun-copyfile - operator wait 4.5 min, operator turns 1; A=20241, B=3877 output

Handed off 2026-10-27
