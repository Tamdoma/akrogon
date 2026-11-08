# Fork notes A: board-focus

## Q1 scope
- Pick: in this epic, as one small part of the leaf that changes `akrogon status --json` seat fields (the engine or its follow-up), not a separate issue. Reason: the operator already chose this behavior (tasks-hierarchy 1b, 2026-11-04); it was blocked only by old herdr pane ids, which this epic replaces with hc addresses, so it is exactly "an improvement herdr-app makes possible" (signposts direction). The producer field must change in this epic anyway (pane ids go away). Cost: a few lines in the board and one field in status.
- Rejected: a later issue (the producer would ship an address field nobody reads, and the board keeps a click that ignores the recorded direction).

## Q2 shape
- Pick: `agent.focus { terminal: <address> }`, the same call herdr-setup's board makes (`mods/board/main.js:37`), so both boards behave alike (tasks-hierarchy 6c: follow herdr-app's own panels). Row target: on a Needs you row the problem seat; otherwise the seat the leaf currently waits on (the active slot); a row with no live seat keeps today's Files open. `akrogon status --json` gives each seat's address (null when no live terminal). Reason: closest to today for rows without a seat, the recorded direction for rows with one. Pitfall: `agent.focus` on a terminal whose tab the window has not created yet (window opened later) may fail; probe what `agent.focus` does then and fall to Files on an error answer.
- Evidence: better-than-training · `herdr-app/tasks/main.js:249`, herdr-setup `mods/board/main.js:37`, `herdr-app commands` (agent.focus, pane.focus), direction.md 1b, 6c · 2026-11-07.
