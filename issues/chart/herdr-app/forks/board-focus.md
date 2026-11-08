# Tasks board focus

## Question

Facts read 2026-11-07: akrogon's Tasks board is its own herdr-app mod (`herdr-app/tasks`, linked as `~/.config/herdr-app/mods/tasks`, `"place": "none"`, in none of the operator's layouts, so opened by hand). A row click today opens the leaf folder in Files (`herdr-app/tasks/main.js:249`, `pinFolder`). The tasks-hierarchy chart's operator direction 1b (2026-11-04, `issues/chart/tasks-hierarchy/forks/direction.md`) says "a click jumps to the agent's pane or log where the problem is read"; INTAKE (line 171) records it was blocked only because old herdr pane ids cannot be focused in herdr-app, and asks that the producer report the seat's terminal and the board run `pane.focus`, problem seat first on a Needs you row. herdr-setup's `board` mod already does this for agents: a card click runs `run("agent.focus", { terminal: a.address })`. herdr-app commands: `agent.focus` ("Show an agent"), `pane.focus` ("Focus a pane, or the pane showing a terminal").

1. Scope: is click-to-seat part of this epic (it is the recorded direction, now reachable because seats are hc terminals), or its own later issue?
2. Shape if in: which command (`agent.focus` as herdr-setup's board does, or `pane.focus`), which seat a row jumps to (the problem seat on a Needs you row, else the seat the leaf waits on), what `akrogon status --json` adds (each seat's hc address), and what a click does when the seat has no pane (window shows no tab for it, parked, ended): Files as today, or nothing?

### Carries

- Signposts: forks/signposts.md `## Taken` and its 2026-11-06 directions (closest to today, improvements herdr-core and herdr-app make possible, no new features).
- Taken forks (binding): identity (seat address in state), start-and-pane (leaf tabs by labels, visible panes), session-id.
- tasks-hierarchy direction 1b and 6c (board follows herdr-app's own panels).
- Map: slots/map-merged.md fork "board-focus".

## Findings

- Merged notes: slots/fork-board-focus-merged.md (A,B,C,D,E with rebuttal corrections).
- Agreed: in this epic, one small leaf after the engine leaf; the Tasks board stays opened by hand. Click runs `pane.focus` on the seat's pane, chosen from the window's own data before the call (all after rebuttal). The producer picks the seat beside `attention` and `waits_on`: the first shown problem's seat on Needs you (none for non-seat problems), B on merge and broadcast rows, else the busy seat, then `waits_on[0]`. No pane to show: Files as today. Parked rows inert; Files, Changes and chevron unchanged. Proof: producer and model tests, `herdr-app check`, one attended click in a throwaway window with a free stand-in.
- Open: the producer gives each seat's address and session and the mod matches the address (B,D,E) vs the producer gives only which seat, and the mod finds that seat by its akrogon labels in the window's own terminal list (C).

## Taken
Operator 2026-11-07, door t15, verbatim: "We don't have the Tasks board anymore. I deleted it. So scrap it."

Read as: dropped. No click-to-seat work in this epic; the fork moves to Off route. Fact for the operator (A, 2026-11-07): the Tasks mod code still exists in akrogon (`herdr-app/tasks/`, tests `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts`), and akrogon install still links it (`~/.config/herdr-app/mods/tasks -> ~/.akrogon/current/herdr-app/tasks`, plus the infra session's link). Whether this epic removes it is asked separately.
