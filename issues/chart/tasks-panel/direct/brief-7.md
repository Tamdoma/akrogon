# Brief U7: Tasks board look repair (akrogon `herdr-app/tasks`)

## 1. Goal

The operator saw the Tasks board live and said: "It just looks really bad, the entire UI." They approved fixing it (D5 "yes"). Make the board read as a calm, scannable task list in herdr-app's own visual language, and turn the three red planned tests green. Contract (binding, read it): `/home/ivan/Work/infra/akrogon/issues/closed/tasks-board/tasks-mod/{brief,design}.md` and the look decisions in `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/forks/look.md` and `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-final.md` (pill colors and shape, logos, straight edges are locked).

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/tasks-look` (branch `tasks-look`, HEAD `17252e69` = the planned tests). Commit there.

## 2. Acceptance criteria

1. `bun test tests/tasks-mod.test.ts tests/tasks-mod-host.test.ts` passes; the three new or changed cases fix the model API:
   - `board(...).repos` holds only repos with leaves, errors or unreadable entries; `board(...).quiet` is the sorted names of the rest and `quietLine` is `No open tasks: <names joined by ", ">`.
   - `board(...).alerts` holds only actionable lines (run, deploy failed, Failed, Missing, unreadable, repo error, Slow merge); `Unpacked:` and `Kept:` lines move to `board(...).housekeeping`, with `housekeepingFolded` = `Housekeeping (<n>)`, drawn folded by default like Last merges.
   - A row's `line2` shows the group path and the last history entry as `<from> → <to>` when the entry is a JSON log line (parse it; fall back to the plain text when it is not JSON), never raw JSON.
   Keep `model.d.ts` in step with `model.js`.
2. `herdr-app check herdr-app/tasks` passes; `bun run typecheck` passes.
3. Visual pass, judged by you against live shots at full width (~1560x950 logical) and side size (368 px), before and after kept in `/home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/live/`: clear hierarchy (repo heading, group, leaf row with one primary line and one muted line), consistent spacing on a 4 px grid, aligned columns (seats, slug, pill, time at the right), readable seat logos (`<logo>A <logo>B`, 16 px; a seat with no matching program shows its letter alone), no text running under other text, a sensible empty state, folded sections (Charts, Last merges, Housekeeping) consistent with each other, red only for real blocks. Colors only from `theme()` and ANSI slots; straight outer edges; the root paints `t.background` edge to edge.
4. The failed row stays visibly red and its reason readable (one line, truncated with the full text on expand).

## 3. Read first

- `herdr-app/tasks/{main.js,model.js,model.d.ts,schedule.js}`, `tests/tasks-mod.test.ts`, `tests/fixtures/status-envelope.json`, `herdr-app/AREA` notes in `src/AREA.md` ("herdr-app/tasks/" bullet).
- herdr-app API: `~/.config/herdr-app/AGENTS.md`, `herdr.d.ts`, `gpui-kit.d.ts`; shipped look references `~/.config/herdr-app/mods/{files,changes,agents}/main.js`, herdr-setup `mods/agents-by-tab/main.js` (`icon()` helper).
- `/home/ivan/Work/infra/akrogon/skills/implement-issue/ponytail.md`.

## 4. Live method (exact; anything else risks the operator's desktop)

- Session home `~/.config/herdr-app-sessions/tasks-look` is prepared: `mods/tasks` links to your worktree's `herdr-app/tasks`; flat layout and the right-panel mods link to the herdr-setup lane; a session-only `driver` mod sets shared values.
- Env for every herdr-app call: `export HERDR_APP_HOME=$HOME/.config/herdr-app-sessions/tasks-look HC_SESSION=tasks-look; unset HC_TERMINAL_SOCKET HC_TERMINAL_ID HC_SCOPE`.
- Launch the window only on the invisible headless output `HERDRTEST2` (workspace 8): `hyprctl eval "hl.exec_cmd('env HERDR_APP_HOME=$HOME/.config/herdr-app-sessions/tasks-look HC_SESSION=tasks-look herdr-app >>$HOME/.local/state/herdrapp/tasks-look.log 2>&1', { workspace = '8 silent' })"`; then `herdr-app do space.new` once if it has no space. Close with `herdr-app do window.close`. Never use `herdrapp --session`/`attach` or a plain `herdr-app` (they open on the operator's screen); never move windows between workspaces; never start a compositor.
- Open the board: `sh /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct/live/drive.sh toggle tasks`; shots: `sh .../live/shot.sh <name>`; state: `sh .../live/state.sh`. Mod edits reload with `herdr-app do layout.switch --name board` then `--name flat`.
- The board reads the real `akrogon status --json`; that is fine (read-only).
- Never run `app.theme`; never create, rename, move or delete anything under `~/.config/herdr-app/`. Window opacity is the operator's Hyprland rule, not yours.

## 5. Do-not, reasons and exceptions

- Tests are A's: do not edit `tests/` (a wrong expectation is a mismatch returned with evidence).
- Do not change the envelope producer (`src/status.ts`) or anything outside `herdr-app/tasks/`.
- Do not change locked look decisions (pill colors, pill shape, logos, straight edges, red meaning).
- No pushes, no `akrogon install`, no deploy.
- Reasons: locked tests and decisions, the producer contract, the operator's desktop. Exception: a revised brief from A.

## 6. Ordered steps

1. Model changes until the tests pass.
2. Launch the window, shot the board before.
3. Visual pass in `main.js`, shots after, iterate.
4. `herdr-app check herdr-app/tasks`, `bun run typecheck`, the two test files; commit with plain messages, no co-author lines.
Advisory size: 3 files, under 80 turns.

## 7. Commands

From `/home/ivan/Work/infra/akrogon`: `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/tasks-panel/direct --name u7-<label> -- sh -c "cd /home/ivan/.akrogon/worktrees/akrogon/tasks-look && <cmd>"`.

## 8. Report

Commits, before/after shots with reasons, and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
