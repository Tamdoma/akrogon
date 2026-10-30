# Chart: killed-check-log

## Destination

A run-check whose caller is killed, including by SIGKILL, leaves the output its command printed so far readable in the holder and, after packing, through `akrogon log`; normal runs behave as today. Repo: akrogon. Source: Tamdoma/akrogon#120.

Route: lifecycle

## Forks taken

- [Durable check capture](forks/durable-capture.md): A's pick `1a 2a`: capture into run-unique holder files from launch, path printed at start; a kernel lock held by every writer, taken exclusively by pack.

## Open forks

none

## Fog

none

## Off route

- Busy alert while a seat sits in one long tool call (#120's second half): foreclosed by the operator lock of 2026-09-18 (`../seat-stall-detection/forks/no-akrogon-detector.md`): no clocks, polls or watchdogs, and pure silence stays invisible by accepted consequence. The event-driven `STALL_MS` notifier stays unchanged per `../stall-notifier-removal/forks/delete-notifier.md`. (A,B)
- Making a check survive its caller: changes admission and guard ownership, not needed for durable evidence. (A,B)
- Changing the implement-issue timeout wording: it already requires a timeout above the expected run time and does not fix SIGKILL. (A,B)

## Pending steps

none

## Mode record

- mode 2026-10-27T14:38:25Z w8:pNP d99762e2-7b52-4b37-8f95-4f54bef4d6f4: on handed [Tamdoma/akrogon#120]; consultants B w8:pX4 (codex)
- mode 2026-10-27T14:57:00Z w8:pNP d99762e2-7b52-4b37-8f95-4f54bef4d6f4: off every handed chart handed off

## Autopilot

- switch-on: [INTAKE.md](INTAKE.md) `## Source: operator 2026-10-27T14:38Z`
- consultant: B w8:pX4 codex, restarted 2026-10-27 (session none until first exchange)
- route: lifecycle (direct refused: autopilot)
- handed off: killed-check-log/durable-check-capture (sources Tamdoma/akrogon#120), `akrogon status` valid 2026-10-27
- main step: none
- watcher: operator asked for a nudge; sent `/watch-issues tick` to w8:pQ6 at 14:56Z, which ran `akrogon next durable-check-capture` and reported seat A working in w8:pX7
- recorded only: `akrogon flaky` lists merge-flow and prompt-delivery tests (last 2026-10-24); no failed leaves in `akrogon status`
- friction: one peer-ask call found no herdr agent on B's pane during seeding and sent no prompt; rerun succeeded.
- usage: [USAGE.md](USAGE.md)

Handed off 2026-10-27
