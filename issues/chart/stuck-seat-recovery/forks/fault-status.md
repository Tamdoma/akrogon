# Where is the stuck blocked seat fixed?

## Question
Q1 · Where is a lasting admission fault kept from freezing the seat?
- A pi-extensions: stop publishing the admission fault as herdr blocked. Keep the one-shot notification. The pane then shows its real state, so akrogon dispatches it normally.
- B akrogon watch-issues: diagnose the admission fault, notify on the first tick, and allow one /reload only with evidence that no live child ownership remains. pi-extensions is fixed later.

### Carries
- seat-stall-detection (akrogon, 2026-09-18): pi-extensions owns admission faults (Tamdoma/akrogon#16). No clock, poll or watchdog anywhere. herdr-agent-state.ts is herdr-managed and not edited directly.
- stall-notifier-removal (2026-09-18): the 1 h notifier in next.ts stays.
- pi-extensions admission-fault-surface (closed): chose a held blocked claim for the whole fault episode as the operator signal.
- [restart-hung-seat](restart-hung-seat.md) Taken 2026-09-28: fix known hang causes at their source, no restart verb, watch-issues Never list unchanged.

## Findings
- Root cause (C): a lasting fault is published under blocked, a status meant for human input, so no consumer owns clearing it. A and C recommend A. C also offered a distinct fault state, which needs a herdr-agent-state change the carry forbids.
- B recommends B plus an upstream fix: an unconfirmed retirement does not prove the child stopped (manager.ts:1122,1141), so reload needs evidence, and unknown means notify only.
- Pitfall: blocked also covers real approval dialogs. No option may treat every blocked pane as idle. (B,C)
- Pitfall under A: it undoes part of admission-fault-surface. The notification keeps the operator signal. pi-extensions has its own seat, currently on subagent-concurrency-three. (A)

## Taken
2026-09-28, operator: "1a"
tamdoma-subagents stops publishing a subagent admission fault as herdr blocked and keeps the one-shot `herdr notification show`. The pane reports its real state, so akrogon dispatches it normally. Reason: fixes the cause at its source, consistent with restart-hung-seat Q2-A. Foreclosed: an akrogon watch-issues reload (B). Partly supersedes pi-extensions admission-fault-surface's held blocked claim. The notification remains the operator signal.
