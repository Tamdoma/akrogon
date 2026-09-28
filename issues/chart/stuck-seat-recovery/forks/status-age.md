# What age does the watch show for a seat?

## Question
Q1 · What age does watch-issues show beside a seat's status?
- A Label the existing age as busy time (`A=wA:pC1/blocked busy=1h40m` instead of `A=wA:pC1/blocked+1h40m`). No new state.
- B Keep busy time and add a new recorded status-change time per seat, to show the current status age.

### Carries
- No clock, poll or watchdog (seat-stall-detection).
- busy_since is bookkeeping read by status and state (stall-notifier-removal).

## Findings
- next.ts:196 keeps busy_since across working to blocked, and observe.ts:224 prints it beside the new status, so blocked age is overstated. (A,B)
- The first sighting of a status is only a lower bound on its age unless herdr supplies the transition time. (B)

- Reshaped 2026-09-28 after fault-status 1a: the stale blocked case is fixed at its source, so the remaining defect is a misleading label. observe.ts:218-227 prints `pane/status+age` with age from busy_since. (A)

## Taken
2026-09-28, operator: "1a"
watch-issues labels the existing age as busy time (`A=<pane>/<status> busy=<h>h<mm>m`). No new state. Reason: the number is total busy time, and a label says so with no new data. Foreclosed: a recorded status-change time (B).
