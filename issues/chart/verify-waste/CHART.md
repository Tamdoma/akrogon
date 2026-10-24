# Chart: akrogon

## Destination

akrogon spends no test CPU on work whose verdict is already known, so a landed leaf costs fewer full-suite runs and less CPU, measured from the systemd journal on this host before and after, while every check still blocks every merge.

Route: lifecycle

## Forks taken

- [receipts](forks/receipts.md): member receipts, base reuse, run-check refusal plus merge-scope route; Q2 reported to operator.

## Open forks

none

## Fog

none

## Off route

## Pending steps

- framework members (step on main, owner: this door, waits on akrogon leaf member-receipts merged and installed). Edit /home/ivan/Work/infra/tamdoma/framework/issues/config.yaml: replace `merge_checks: {verify: bun run framework:verify}` with one entry per member of `framework:verify:core` (FW package.json:177), each `bun .claude/hooks/scripts/run-with-root-state-guard.ts -- bun run <member>`, and drop `merge_covers: [cheap]` so `checks.cheap` runs as the first stage. Done check: `akrogon config` at the framework root prints 14 merge checks and no merge_covers, and the next framework merge receipt lists cheap plus 14 members. Then measure: rerun the journal join (run scopes, CPU per landed leaf) for the 7 days after against 2026-10-14..24 and record both in this chart.

## Mode record

- mode 2026-10-24T19:57:37Z w8:pNP bacd17ee-47fd-4d72-9f7c-ee61ee8698cf: on, handed [verify-waste], consultants B w8:pV5 (codex), D w8:pWD (claude, claude-fable-5-1, effort high)

## Autopilot

- switch-on: INTAKE.md `## Source: operator 2026-10-24 w8:pNP`
- consultant: B w8:pV5 codex, D w8:pWD claude
- recorded only: akrogon flaky lists 15+ merge-flow tests (2026-10-24); herdr-session leaves in progress

Handed off 2026-10-24
