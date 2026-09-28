# Chart: seats never freeze on subagent faults or prompts

## Destination
A seat is never frozen by a stale subagent admission fault or by an outside-root confirm that nobody can answer. The watch labels a seat's age as busy time.

## Forks taken
- [Restart hung seat](forks/restart-hung-seat.md): same-repo worktrees approved by rule, others fail fast, and the signal is passed. No time limit and no restart verb.
- [Fault status](forks/fault-status.md): tamdoma-subagents stops publishing admission faults as herdr blocked and keeps the one-shot notification.
- [Status age](forks/status-age.md): the watch labels the existing age as busy time, with no new state.

## Open forks

## Fog
None.

## Off route
- A time limit or restart verb for hangs with no known cause. Ruled out by restart-hung-seat Q2-A.
- Direct edits to herdr-managed herdr-agent-state.ts.
Handed off 2026-09-28
