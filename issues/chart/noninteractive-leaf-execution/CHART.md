# Chart: a dispatched seat never waits for a human, and a seat that cannot proceed becomes a visible pushed failure on the event

## Destination
Execution seats cannot open a question batch. A seat that cannot proceed ends its own attempt with `akrogon phase <slug> failed --reason`, a reason-bearing terminal outcome that keeps the worktree, shows distinctly in `akrogon status` and raises one herdr notification and a renamed tab. Merged leaves show no live busy state. No clock, poll or watchdog.

## Forks taken
- [How a blocked seat ends its attempt](forks/blocked-ends-attempt.md): the seat declares the stop, `failed` with a typed cause, everything preserved, explicit operator restart. Corrected 2026-09-19 after #21: no event-driven entry.
- [Where execution loses the ability to ask](forks/ask-tool-availability.md): `--exclude-tools request_user_input` on the pi harness template (operator config step); seats write the blocker and stop themselves; failed leaves are resumable and do not count toward capacity.
- [Where a failure notification goes](forks/push-notification.md): herdr only: notification with sound and recorded reason, tab renamed `<slug> failed`; operator sets system toast delivery.

## Fog
None. Every open question is in forks/.

## Off route
- Ending an attempt on a herdr `blocked` event. Tamdoma/akrogon#21 shows the signal also fires for a subagent child asking its parent; seeded as Tamdoma/pi-extensions#1 (operator 2026-09-19).
- herdr answer/read API for a pending question (#20 item 4). Herdr upstream. Not needed once execution cannot ask.
- Consumer repairs: boulevard GHL scopes, the pending pi session in w4:pA, the external watchdog. Operator-owned; the watchdog history stays evidence only.
- Any pi-extensions change. The pi launch flag `--exclude-tools` covers it (fork ask-tool-availability).
- Discord, webhooks, any external program for alerts. Operator 2026-09-19.
- Deleting or retiming the 60-minute busy notice. Locked at `../stall-notifier-removal/` (retained) and `../seat-stall-detection/` (no clocks).
- #20 item 2. It is #18, shipped in c9e31af and c8dac2a (`../../closed/authoritative-leaf-artifacts`).

## Territory findings
See `slots/map-merged.md` (A/B attributed) and the fork files.

Handed off 2026-09-19
