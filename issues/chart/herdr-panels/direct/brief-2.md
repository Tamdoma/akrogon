# Brief U2: mods/panel-bar (the top bar and its open/close routine)

## 1. Goal

Build `mods/panel-bar/`, a clone of herdr-app's shipped `tabs` mod that owns the top bar's panel buttons and the one open/close routine every entry point uses. Plan decisions D1, D3-D10 in `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/plan.md`. The leaf contract is `/home/ivan/Work/infra/herdr-setup/issues/open/right-panel/panel-top-bar/{brief,design}.md` (read both; the design's "Leaf architecture" bullets are binding).

## 2. Acceptance criteria

1. `bun test tests/panel-bar.test.js` passes (the planned test; you do not edit it). It fixes the exports of `mods/panel-bar/routine.js`: `request`, `shrink`, `grow`, `fresh`, `presentViews`, `needsYou`, `redDot` with the exact shapes in the test.
2. `herdr-app check mods/panel-bar` passes.
3. `main.js` keeps the shipped tabs bar as it is (tab pills, +, window buttons, drag, scroll) and replaces the two hardcoded panel buttons with: ⤢/⤡ (icon only, shown only while the panel is open, left of the panel buttons), then Tasks, Needs you, Files, Changes, each shown only for views `presentViews` returns.
4. Every entry point goes through `request`: button clicks (`toggle`), and `shared("panel.request")` values `{op, view, seq}` set by other mods, handled once per new `seq` (`fresh`). After a close, focus returns to the pane focused before the panel opened (`run("pane.focus", {pane})`).
5. ⤡ runs `shrink`, ⤢ runs `grow`. On the first render when `main` is hidden, `shrink` (window start). When `focused().terminal` changes between renders while `main` is hidden, `shrink` (focus jump). On a space switch while full, `shrink` before the per-space restore.
6. Per-space memory: keep the shipped `syncPanel` logic; the clone's `localStorage` `panels` key, when absent, is seeded once from `readTextFile(appHome() + "/data/tabs/store.json")` → JSON `.panels` (a JSON string of `{spaceId: view|null}`).
7. Gating: views = ids in `shared("workspace.panels")`; a view's mod = `content.mod` of the `panel-body` child with that id in `layout()`; shipped = top-level keys of `JSON.parse(await readTextFile(appHome() + "/installed.json"))`; present = mods whose `readTextFile(appHome() + "/mods/<mod>/mod.json")` resolves non-null. Read these once at init and again when `layout()` changes; a gated-out view's key or request does nothing.
8. Seeding (D8): once per home (localStorage flag `seeded`), when `workspace.panels` lacks any of `tasks, needs-you, files, changes`, `setShared("workspace.panels", <current list followed by the missing ids>)`.
9. Needs-you count: a small pill on the Needs you button with `needsYou(terminals()).count` when > 0, background `t.ansi[1]`-equivalent red (`ansi1`, see how the shipped mods read ANSI colors from `theme()`) when `blocked`, else `t.done`.
10. Tasks red dot: a 6 px `ansi1` dot on the Tasks button when `redDot(result)` is true for `await exec("akrogon", ["status", "--json"])` (a rejection counts as null). Rerun when any envelope `watch.folders` entry changes (`watchFolder`, recursive; never watch `~/.akrogon` itself) with no overlapping runs (a change during a run marks dirty and reruns once after); poll `watch.files` contents every 30 s with `readTextFile` and rerun on a change. The envelope fields: `{schema, generated, red, watch: {folders: string[], files: string[]}, ...}`.
11. Narrow window (below 760 px `window()` width; check what `window()` returns in herdr.d.ts): buttons show icons only; every panel button and ⤢/⤡ carries its name as tooltip and accessible label (find tooltip/accessibility in `~/.config/herdr-app/gpui-kit.d.ts`).
12. Icons: Files `mods/files/file.svg`, Changes `mods/changes/changes.svg` (shipped). Tasks and Needs you: an svg you add in `mods/panel-bar/` (a simple list-check and a speech bubble with a question mark, 14 px, `currentColor` stroke like the shipped icons). ⤢/⤡: svgs in `mods/panel-bar/`.

## 3. Read first

- `~/.config/herdr-app/mods/tabs/main.js` (the source to clone, 103 lines) and its `mod.json`.
- `~/.config/herdr-app/herdr.d.ts` (exec, readTextFile, appHome, watchFolder, shared/setShared, layout, focused, terminals, run, window, theme), `~/.config/herdr-app/AGENTS.md` sections on mods, localStorage ("Other built-ins"), shared state, `cx.timer`/`cx.spawn`.
- `~/.config/herdr-app/gpui-kit.d.ts` for tooltip and accessible label.
- `/home/ivan/Work/infra/akrogon/herdr-app/tasks/main.js` for an existing herdr-app mod that runs `exec("akrogon", ["status","--json"])` with `watchFolder` loops and no overlapping scans; copy its pattern.
- `/home/ivan/Work/infra/akrogon/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- New `mods/panel-bar/mod.json`: `{"place": "none", "title": "Top bar", "cloned_from": {"name": "tabs", "version": "0.1.12"}}`.
- New `mods/panel-bar/main.js` (host calls), `mods/panel-bar/routine.js` (pure, no imports from `herdr`/`gpui-*`), svgs.
- Copy the shipped `win-*.svg` the bar uses into `mods/panel-bar/` and point to them there (the shipped path `mods/tabs/...` also works; keep whichever `herdr-app check` accepts).
- Owned paths: `mods/panel-bar/**` only. Must land first: the test commit (already at HEAD). No shared test resource.
- The `panel.request` contract: `setShared("panel.request", { op: "toggle" | "open", view: "tasks" | "needs-you" | "files" | "changes", seq: number })`. Layout ids: `main` (terminal area), `panel` (column), `panel-body` (stack of `tasks`, `needs-you`, `files`, `changes`).

## 5. Do-not, reasons and exceptions

- Do not edit `layouts/`, `mods/prefix`, `install`, `bin/`, other mods or anything under `tests/`: A owns them, and tests are locked; a wrong or red planned test is a mismatch you return with evidence.
- Do not open herdr-app windows, throwaway sessions, `herdrapp`, `herdr-app do`, `herdr-app shot` or `hc`: live checks share one display and run serially by A afterwards.
- Never create, rename, move or delete anything under `~/.config/herdr-app/` (an earlier test broke the operator's theme there); read only.
- Do not change the shipped `tabs` mod or its folder name; the clone is `panel-bar`.
- Reasons: locked tests, one display, the operator's live config. Exception: a revised brief from A.

## 6. Ordered steps

1. Write `routine.js` to make `bun test tests/panel-bar.test.js` green (criterion 1).
2. Clone `tabs/main.js` into `panel-bar/main.js`; wire criteria 3-12 through `routine.js`.
3. `herdr-app check mods/panel-bar` (criterion 2); fix what it reports.
4. Commit in this worktree only your paths, one or two commits.
Advisory size: about 6 files, under 30 turns.

## 7. Commands

Run from `/home/ivan/Work/infra/akrogon` so output is kept (the holder sits in another repo):

- `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct --name u2-test -- sh -c "cd /home/ivan/.akrogon/worktrees/herdr-setup/right-panel-u2 && bun test tests/panel-bar.test.js"`
- `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct --name u2-check -- sh -c "cd /home/ivan/.akrogon/worktrees/herdr-setup/right-panel-u2 && herdr-app check mods/panel-bar"`

## 8. Report

Return the commit id(s) and cite the `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
