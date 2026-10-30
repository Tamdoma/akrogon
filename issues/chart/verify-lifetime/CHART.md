# Chart: akrogon

## Destination

Seats stop throwing away running verify suites: a seat's command timeout, pane loss or task stop no longer kills `akrogon verify` mid-suite and makes the seat start it again, every check still blocks every merge, and a deliberate cancel of a stale run still works.

Route: lifecycle

## Forks taken

- [run-lifetime](forks/run-lifetime.md): A's pick 1a 2a 3a; each verify pass runs in its own user service, a same-caller repeat joins it, `stop-run <verify run id>` stops the whole pass, receipts unchanged.

## Open forks

none

## Fog

none

## Off route

## Pending steps

none

## Mode record

- mode 2026-10-27T07:22:21Z w8:pNP c3774c8f-6ba3-47ca-bc6a-407baccb70a9: on, handed [Tamdoma/akrogon#119 as verify-lifetime], consultants B w8:pX4 (codex, gpt-6.1-sol, effort high)
- mode 2026-10-27T07:50:05Z w8:pNP c3774c8f-6ba3-47ca-bc6a-407baccb70a9: off, every handed chart handed off

## Autopilot

- switch-on: INTAKE.md `## Source: operator 2026-10-27 w8:pNP`
- consultant: B w8:pX4 codex gpt-6.1-sol high, created by the door at open
- route: lifecycle
- handed off: verify-lifetime/verify-pass-service (akrogon), sources Tamdoma/akrogon#119
- recorded only: `akrogon flaky` lists 30+ merge-flow tests, last seen 2026-10-26T12:16:47Z; no failed leaves in `akrogon status`
- usage: [USAGE.md](USAGE.md)
- friction: B was created fresh at open, so the entry restart was skipped as already satisfied (empty context).

Handed off 2026-10-27
