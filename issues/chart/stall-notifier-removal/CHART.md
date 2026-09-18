# Chart: akrogon stops carrying a stall notifier that cannot fire during a stall

## Destination
`observeBusy` no longer contains an elapsed-time threshold or a notification. `busy_since` remains as recorded bookkeeping.

## Forks taken
- [Delete the dead notifier](forks/delete-notifier.md): settled 2026-09-18 as keep unchanged. The original answer was to delete `STALL_MS`, the `herdr notification show` call and the `busy_notified` field; the dated operator correction in the fork reverses it and emits no leaf.

## Fog
None.

## Off route
- Deleting the notifier. Ruled out 2026-09-18 on the scan above: it fires in the two-seat case, it introduces no clock of its own, and after the pi admission fix it is the only remaining signal for non-admission stalls.
- Replacing it with any other trigger. The operator rule forbids clocks, polls and watchdogs, and the replacement destination was ruled out at `../seat-stall-detection/`.
- `busy_since`. It is a recorded timestamp read by status and state, not a timer.

## Territory findings
- `src/next.ts:172` defines `STALL_MS = 60 * 60 * 1000`. `observeBusy` at `:191-203` fires one `herdr notification show` once an episode passes it and records `busy_notified`.
- The notifier can only execute inside an `akrogon next` run, and `akrogon next` runs only at herdr startup and on four herdr events (`plugin/herdr-plugin.toml:7-27`), with `working` status events returning early (`src/next.ts:602`). During the event silence it exists to catch, it cannot run.
- Observed live: the 2h07m stall in Tamdoma/akrogon#16 had `busy_since.B` set and `busy_notified: {}` empty at 14:15.
- `busy_notified` is part of the state schema and is cleared by `observeBusy` when a pane goes idle (`src/next.ts:178-184`).
- Correction 2026-09-18: the claim that the notifier cannot run during a stall is too strong. It cannot run during *total* event silence, but a second busy seat on the same leaf keeps producing pane events, and each `akrogon next` pass observes both seats. A live scan of all six registered repos found one real fire (`framework .../portal-activation`, `busy_notified.B: 2026-09-12T23:20:36.219Z`, both seats busy) against 261 `busy_since` records.

Closed 2026-09-18: destination ruled out, notifier retained, nothing handed off.
