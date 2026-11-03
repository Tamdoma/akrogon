# Brief U8: Agents list nests sub-agents under their parent even when the parent reports no status

## 1. Goal

Operator, 2026-11-03, on the live sidebar: "slot b and c and d are not even indented in the Agents tab anymore, and they should be. This is completely wrong. Fix it." and "the solution has to be elegant, and not only focus on akrogon, but in general."

Cause (A, verified): `mods/agents-by-tab/main.js:224` keeps an agent at top level unless its parent is in `agents()`; `agents()` lists only terminals whose program currently reports a status (OSC 7501). The operator's Claude terminal t15 reports `status: null` right now, so its sub-agents t2s/t2t/t2v (each `parent: "t15"` in `terminals()`) show as three top-level rows named after the tab, and t15 itself is missing.

One general rule: the tree comes from herdr-core's parent links in `terminals()`; status only colours rows. An agent whose `parent` is a live terminal is a sub-agent and shows only under that parent. A live parent missing from `agents()` still gets its own row, built from its terminal and pane (program, place, title from `terminals()`/`panes()`/`spaces()`), drawn with no status (the idle look without the "done" dot), clickable like any row (`pane.focus {pane}`), placed where `agents()` order would put it (space, tab, pane order). No akrogon or name-based special cases.

Worktree: `/home/ivan/.akrogon/worktrees/herdr-setup/right-panel-u8` (detached at the lane head `8dcfc99`; commit there; another worker edits other files in the lane, so touch only `mods/agents-by-tab/`).

## 2. Acceptance criteria

1. The rule above in `mods/agents-by-tab/main.js`, with the tree choice in a pure function (new file `mods/agents-by-tab/tree.js`, no `herdr`/`gpui` imports): `topLevel(agents, terminals, panes)` returning the ordered top-level rows (real `AgentInfo`s plus synthesized parent rows with `status: null`) and leaving sub-agents to the existing `tree()`. You may not add tests (A writes them); return its signature and the cases it must satisfy in your report.
2. Live, in a throwaway session on an invisible output: a parent terminal with no status and two sub-agents that report a status show as one parent row with two indented sub rows; a parent with a status still behaves as today; agents without parents are unchanged. Before and after shots.
3. `herdr-app check mods/agents-by-tab` and `bun test` in the worktree pass.

## 3. Read first

- `mods/agents-by-tab/main.js` (whole file; `tree()`, `subRow()`, `row()`, `render()`), `~/.config/herdr-app/herdr.d.ts` (`agents`, `AgentInfo`, `terminals`, `panes`, `PaneInfo`, `spaces`), `~/.config/herdr-app/AGENTS.md` "Agents" (OSC 7501).
- `/home/ivan/Work/infra/akrogon/skills/implement-issue/ponytail.md`.

## 4. Live method (exact; anything else risks the operator's desktop)

- Session `tasks-look` (home `~/.config/herdr-app-sessions/tasks-look`, yours now; its window is closed). Point its `mods/agents-by-tab` at your worktree: `ln -sfn /home/ivan/.akrogon/worktrees/herdr-setup/right-panel-u8/mods/agents-by-tab ~/.config/herdr-app-sessions/tasks-look/mods/agents-by-tab`.
- Env: `export HERDR_APP_HOME=$HOME/.config/herdr-app-sessions/tasks-look HC_SESSION=tasks-look; unset HC_TERMINAL_SOCKET HC_TERMINAL_ID HC_SCOPE`.
- Launch only on the invisible output `HERDRTEST2` (workspace 8): `hyprctl eval "hl.exec_cmd('env HERDR_APP_HOME=$HOME/.config/herdr-app-sessions/tasks-look HC_SESSION=tasks-look herdr-app >>$HOME/.local/state/herdrapp/tasks-look.log 2>&1', { workspace = '8 silent' })"`; close with `herdr-app do window.close`. Never `herdrapp --session`/`attach`, plain `herdr-app`, window moves or another compositor.
- Shots: `herdr-app shot <file>` into `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/live/u8-<name>.png`.
- Fake agents without paid launches: terminals in this session (`hc run --bg ...`, `hc run --bg --parent <t> ...`) running a shell that prints an OSC 7501 status (read AGENTS.md and `hc --help` for the exact sequence; e.g. a bash loop printing it). Clean up with `hc kill` and close the window at the end.
- Never run `app.theme`; never create, rename, move or delete anything under `~/.config/herdr-app/`.

## 5. Do-not, reasons and exceptions

- Only `mods/agents-by-tab/`; no tests; no pushes; no `./install`. Keep every other behaviour of the list (sorting, pins, folding, compact mode, names) as it is.
- No paid agent launches.
- Reasons: another worker's files, locked tests, the operator's desktop and money. Exception: a revised brief from A.

## 6. Ordered steps

1. `tree.js` + wiring in `main.js`. 2. Live before/after. 3. Check, `bun test`, commit (plain message, no co-author line).

## 7. Commands

From `/home/ivan/Work/infra/akrogon`: `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct --name u8-<label> -- sh -c "cd /home/ivan/.akrogon/worktrees/herdr-setup/right-panel-u8 && <cmd>"`.

## 8. Report

Commit id, shots, `topLevel` signature and cases, and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
