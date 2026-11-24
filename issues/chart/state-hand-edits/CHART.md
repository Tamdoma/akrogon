# Chart: akrogon

## Destination

A seat's hand write to a leaf's `state.yaml` fails in the seat's own turn, so lifecycle moves go through `akrogon phase` and its guards.

Route: lifecycle; corrected 2026-11-24 to direct by the operator's words "do it come one" (built by A on main, no peer review)

## Forks taken

- [Signposts](forks/signposts.md): A's picks
- [Guard shape](forks/guard-shape.md): A's pick

## Open forks

none

## Fog

none

## Off route

- The format of `akrogon next`'s invalid-state report (src/next.ts `report`). It is loud and keeps other repos dispatching, which is correct; reformatting was not handed.
- The framework leaf halt-record: repaired by the door on 2026-11-24 (INTAKE.md F3). Its remaining `Test-Change` citations are seat A's work in that leaf.

## Pending steps

none

## Mode record

- mode 2026-11-24T16:09:28Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/17a06be8-1e2f-496a-baf7-2f80e7d816bd.jsonl: on full autopilot (autopilot signposts); handed state-hand-edits; consultants none
- mode 2026-11-24 t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/17a06be8-1e2f-496a-baf7-2f80e7d816bd.jsonl: changed list: operator "do it come one", A builds the leaf itself on main

## Autopilot

- switch-on: INTAKE.md `## Source: operator 2026-11-24 t126`
- consultant: none named, single slot
- signposts: A — forks/signposts.md in this chart holds the original
- route: lifecycle, then direct on 2026-11-24 by the operator's words "do it come one"; the leaf was removed before any dispatch (akrogon status showed no seat or prompt)
- main step: framework issues/open/walk-stop-truth/step-halts/halt-record/state.yaml restored from seat A's transcript `oldText` (phase plan.synthesis, busy_since, busy_notified, attempts.A); `akrogon status halt-record` reads it valid; `akrogon phase halt-record implement --slot A` then refused for missing Test-Change citations, left to seat A
- handed off: akrogon issues/open/state-file-read-only/state-file-read-only (plan.synthesis, validated by akrogon status)
- usage: chart state-hand-edits - operator wait 4.4 min, operator turns 1; A=22484 output
- main step: built on main, uncommitted: src/state.ts saveState sets 0444; tests/state.test.ts and tests/phase.test.ts add the two criterion cases (red with the chmod removed, green with it); tests/state.test.ts and tests/state-inventory.test.ts corruption fixtures chmod 0644 first; docs/reference/state-and-phases.md and docs/use/when-work-fails.md name the block. Full suite 1417 pass + 2 fixed, changed files 615/615 over --rerun-each=5, typecheck and prettier clean
- recorded only: flaky tests listed by `akrogon flaky` at open (10 rows, none in scope); seeds Tamdoma/akrogon#153 and #154 do not match this scope

Handed off 2026-11-24
