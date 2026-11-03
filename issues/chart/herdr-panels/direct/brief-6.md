# Brief U6: visual pass and live checks for the right panel (herdr-setup)

## 1. Goal

The operator saw the first live look and said: "It just looks really bad, the entire UI." Make the top bar and the four panel views look like a deliberate, polished part of herdr-app, fix the icon loading (plan D18), and prove the live done-criteria with shots. Plan: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/plan.md` (read all of it, including "Implementation notes"). Leaf contracts (binding): `/home/ivan/Work/infra/herdr-setup/issues/open/right-panel/{panel-top-bar,files-panel,changes-panel,needs-you-panel,spaces-scroll}/{brief,design}.md`. The operator's look decisions are in `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/forks/look.md` and `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-final.md`.

You work directly in the lane worktree `/home/ivan/.akrogon/worktrees/herdr-setup/right-panel` (branch `right-panel`; A is not editing it while you run). The throwaway session `right-panel-1` links its mods and `layouts/flat.json` to this worktree.

## 2. Acceptance criteria

1. D18: no `mods/*/` folder in the repo holds an `.svg` or image the mod draws. Clones use the shipped icons by path (`mods/files/{file,folder,chevron-down,chevron-right}.svg`, `mods/changes/changes.svg`, `mods/tabs/win-*.svg`, `mods/pane/close.svg`); new icons (Tasks, Needs you, ⤢, ⤡) are Nerd Font glyphs drawn with `.font_family(settings().font)` (settings.json font is "JetBrainsMono Nerd Font"; `settings` is in `herdr`). Delete the copied svgs.
2. Every icon in the bar and the four views shows in a shot of the live session.
3. Visual quality, judged by you against shots at full width (window ~1560x950 logical) and side size (368 px): the bar and views read as one family with the shipped Files and Changes panels the operator likes; clear hierarchy (one primary line per row, secondary text muted, consistent type sizes from the shipped mods), consistent spacing on a 4 px grid, aligned left edges, no clipped or overlapping text, controls sized and spaced like the shipped `panelButton`, nothing pressed-looking unless selected, sensible empty states, straight outer edges (decision 1b), colors only from `theme()` tokens and the theme's ANSI slots. For each view keep a before and after shot pair in `live/` and write in your report what you changed and why.
4. Live criteria (record each with its shot or state read in your report): panel-top-bar 1, 2 (⤢/⤡ have no CLI click: prove through the routine via shot of state after `drive.sh` requests and say so), 3, 4, 5, 6, 7, 9, 10 (count with real agents in criterion 5 below, dot with the current envelope), 11; spaces-scroll 1, 2 (eight spaces); files-panel 1, 2, 3, 5, 6, 7; changes-panel 1, 2, 3, 4, 5.
5. needs-you-panel 1, 3, 4, 5, 6, 7 live, under grant G1 (`/home/ivan/Work/infra/herdr-setup/issues/open/right-panel/needs-you-panel/readiness.yaml`): at most four agent launches (claude --model haiku, codex, pi, agy), one sample decision-round question each plus one reply each, in the throwaway session only; cleanup `hc kill` each, and at the end `herdrapp session stop right-panel-1` is A's, not yours. Record launches and IDs in your report.
6. `bun test` (all) and `herdr-app check` on each changed mod pass at your last commit.

## 3. Read first

- The plan and contracts above; `~/.config/herdr-app/AGENTS.md` (mods, layouts, "Images and SVGs"), `herdr.d.ts`, `gpui-kit.d.ts`.
- Shipped look references: `~/.config/herdr-app/mods/{files,changes,tabs,agents,spaces}/main.js`; herdr-setup `mods/agents-by-tab/main.js`.
- Current shots: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/live/l1-files-full.png`, `bar-copy.png` (icons when copied), the operator's screenshot problems: icons missing on Tasks/Needs you, Tasks button looking pressed.
- `/home/ivan/Work/infra/akrogon/skills/implement-issue/ponytail.md`.

## 4. Live method (exact; anything else risks the operator's desktop)

- Env for every herdr-app/hc call: `export HERDR_APP_HOME=$HOME/.config/herdr-app-sessions/right-panel-1 HC_SESSION=right-panel-1; unset HC_TERMINAL_SOCKET HC_TERMINAL_ID HC_SCOPE`.
- The window must run on the headless output `HERDRTEST` (workspace 7, invisible to the operator). If it is not running: `hyprctl eval "hl.exec_cmd('env HERDR_APP_HOME=$HOME/.config/herdr-app-sessions/right-panel-1 HC_SESSION=right-panel-1 herdr-app >>$HOME/.local/state/herdrapp/right-panel-1.log 2>&1', { workspace = '7 silent' })"`. To close it: `herdr-app do window.close`. Never use `herdrapp --session`, `herdrapp session attach` or plain `herdr-app` to open it: those open on the operator's screen. Never move windows between workspaces and never start another compositor.
- Mod edits do not hot-reload: `herdr-app do layout.switch --name board` then `--name flat`, or close and relaunch as above (needed for window-start checks).
- Requests: `sh /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/live/drive.sh <toggle|open> <view>` (prints layout state); shots: `sh .../live/shot.sh <name>` → `live/<name>.png`; layout state: `sh .../live/state.sh`. Read shots with your image-reading tool; crop with `magick`.
- Other commands: `herdr-app do space.new --name <n> --folder <dir>`, `space.next`, `pane.focus`, `tab.new`, `herdr-app status` (errors), `herdr-app ls`.
- Theme: only the current `omarchy` theme; never run `app.theme`; never create, rename, move or delete anything under `~/.config/herdr-app/` (the session's `themes` and `settings.json` are links into it). The session home `~/.config/herdr-app-sessions/right-panel-1/` is yours to change (its `mods/`, `layouts/`, `shared.json`).
- Window opacity (0.895, the operator's Hyprland rule for herdr-app) is not yours to change.

## 5. Do-not, reasons and exceptions

- Do not edit `tests/` except under the implement-issue exceptions (a wrong expectation with a cited source, in its own commit with a `Test-Change:` trailer); never weaken a test. Do not edit `install`, `bin/`, `keys.json`, `settings.json`, `omarchy/`.
- Do not change locked decisions in the contracts (straight edges, top bar order, keys, the request contract, colors from ANSI slots, Commit removed, etc.). A look change that would break one is a mismatch you return with the shot that shows the problem.
- Do not edit the Tasks board (`/home/ivan/Work/infra/akrogon/herdr-app/tasks/`): another worker owns it.
- No pushes, no `./install`, no edits outside the lane worktree and the session home.
- Reasons: locked tests and decisions, the operator's live desktop and config. Exception: a revised brief from A.

## 6. Ordered steps

1. D18 icons; relaunch; shot every view.
2. Visual pass per view (bar, Files, Changes, Needs you), shot before and after each.
3. Live criteria (section 2.4), then Needs-you with agents (2.5).
4. `bun test`, `herdr-app check` per mod; commit in small commits with plain messages, no co-author lines.
Advisory size: about 8 files, under 120 turns.

## 7. Commands

From `/home/ivan/Work/infra/akrogon` (keeps output): `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct --name u6-<label> -- sh -c "cd /home/ivan/.akrogon/worktrees/herdr-setup/right-panel && <cmd>"` for `bun test` and each `herdr-app check mods/<m>`.

## 8. Report

Commits, shot paths per criterion, before/after per view with the reasons, the agent launches and cleanup, and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
