# Chart: killed-run-fixture

## Destination

After a live `akrogon run-check` dies before its test's own cleanup ran, the leaf cannot move on while that run's outside fixtures may still exist (Tamdoma/akrogon#124). Shared opening map: [slots/map-A.md](slots/map-A.md), [slots/map-B.md](slots/map-B.md).

Route: lifecycle

## Forks taken

- [killed-run-stop](forks/killed-run-stop.md): A's pick 1a 2a 3a: `akrogon phase` refuses non-failed moves while the leaf holds an abandoned capture pair without `cleared-<run>.md`; liveness by one shared flock on the capture-out description; the seat clears it by grant cleanup, absence read and a non-blank `cleared-<run>.md`

## Open forks

none

## Fog

none

## Off route

- A test killed while its wrapper survives: the wrapper publishes a red `check` line and kept log, and through `sh -c` a signal end cannot be reliably told from an exit code of 128 or more, so it is not part of this stop (B Q4); the existing incomplete-evidence lines in check-issue and implement-issue cover it.
- Making a run survive its wrapper (#120 Off route): not chosen, see the fork.
- The chart direct route's holder (`direct-guards.ts`): direct is refused whenever a done-criterion needs a live run, so a direct holder never runs live fixtures.

## Pending steps

none

## Mode record

- mode 2026-10-28T12:31:28Z w8:pNP e9eb89a0-d477-43b1-921b-6eaeb9fba7d8: on handed [Tamdoma/akrogon#123 as merge-slow-alarm, Tamdoma/akrogon#124 as killed-run-fixture]; consultants B w8:pXC (codex)
- mode 2026-10-28T12:52:13Z w8:pNP e9eb89a0-d477-43b1-921b-6eaeb9fba7d8: handover 2026-10-28T12:52:13Z /home/ivan/Work/infra/akrogon/issues/chart/killed-run-fixture/slots/handover-2026-10-28T12:52:13Z.log: handed killed-run-fixture; consultants B w8:pXC (codex); instructions "Nudge the watch-akrogon tab watcher to start the lifecylce." (operator, door pane w8:pNP, 2026-10-28T12:31Z, scope: after each handed chart's handoff, prompt the watcher in tab watch-akrogon, pane w8:pQ6; done for merge-slow-alarm at 12:51:38Z)
- mode 2026-10-28T12:53:36Z w8:pNP df4e7766-cbbc-4c40-8f28-60e419fee3e1: continue autopilot (handover 2026-10-28T12:52:13Z)
- mode 2026-10-28T13:14:40Z w8:pNP df4e7766-cbbc-4c40-8f28-60e419fee3e1: off (every handed chart handed off: merge-slow-alarm, killed-run-fixture)

## Autopilot

- switch-on: [INTAKE.md](INTAKE.md) `## Source: operator 2026-10-28T12:31Z`
- consultant: B w8:pXC codex; worked on merge-slow-alarm, so fresh A restarts it before this chart's first exchange
- route: lifecycle (direct refused: autopilot)
- consultant: B w8:pXC codex restarted 2026-10-28T12:54Z by fresh A (session 01a18292-ed39-7173-9896-11f60473ed82); five exchanges (fork notes, rebuttal, two final-shape checks, leaf review), all `done`, no loss
- handed off: killed-run-fixture/abandoned-capture-stop (akrogon status: plan.synthesis, 2026-10-28T13:14Z)
- watcher: operator asked for a nudge; sent `/watch-issues tick /home/ivan/Work/infra/akrogon` to w8:pQ6 at 2026-10-28T13:14:23Z, prompt accepted (watcher working); its result was not read by the door
- usage: [USAGE.md](USAGE.md)

Handed off 2026-10-28
