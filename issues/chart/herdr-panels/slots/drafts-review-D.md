# Drafts Review — Seat D

## Cross-leaf (`herdr-setup` issue `right-panel`)

1. **Unsequenced shared file `layouts/flat.json` across all five parallel leaves**:
   - **Evidence**: `/home/ivan/.akrogon/current/skills/chart-issues/assets/shapes.md` (`## Leaf files`: *"Where two leaves touch one file, `blocked-by` sequences them."* and `## Preflight and validation`: *"refuses an unsequenced shared file across parallel leaves"*); `panel-top-bar/design.md:48`, `files-panel/design.md:46`, `changes-panel/design.md:46`, `needs-you-panel/design.md:46`, `spaces-scroll/design.md:24`; all five `state.yaml:5` have `blocked-by: []`; `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:29-49,80-83,127-154`.
   - **Disagreement**: All five `right-panel` leaves edit `layouts/flat.json` with `blocked-by: []`. Worse, `panel-top-bar`, `needs-you-panel`, `files-panel`, and `changes-panel` all edit adjacent lines inside `panel-body.children` (`layouts/flat.json:129-145`), which both violates `shapes.md` (`## Leaf files` / `## Preflight and validation`) and causes git merge conflicts when the leaves land. Either:
     - pin the cloned mod folder names as shared literals in `design.md` (e.g., `tabs-bar`, `files-panel`, `changes-panel`, `needs-you`, `tasks`), have `panel-top-bar` own all `panel`/`panel-body`/`tabs` edits in `layouts/flat.json` (and sequence `spaces-scroll` with `panel-top-bar` via `blocked-by`), or
     - sequence every leaf that touches `layouts/flat.json` via `blocked-by`.

2. **Throwaway session (`herdrapp --session <name>`) links `~/.config/herdr-app`, not the leaf worktree**:
   - **Evidence**: `/home/ivan/Work/infra/herdr-setup/bin/herdrapp:9,79-103,121-136` and `/home/ivan/Work/infra/herdr-setup/install:7,26-46`; `panel-top-bar/brief.md:24`, `files-panel/brief.md:21`, `changes-panel/brief.md:19`, `needs-you-panel/brief.md:21`, `spaces-scroll/brief.md:16`.
   - **Disagreement**: `bin/herdrapp:9,96-103` symlinks personal mods and layouts into `~/.config/herdr-app-sessions/<name>` from `main_home="$HOME/.config/herdr-app"` (the host's `main` checkout), not from the leaf's worktree (`~/.akrogon/worktrees/herdr-setup/<slug>`). Running `./install` from a leaf worktree would overwrite the host's live `~/.config/herdr-app` symlinks and switch the operator's main window (`install:37-38`), colliding across parallel leaves. Each `herdr-setup` leaf `design.md` must state that live session checks link the worktree's `layouts/flat.json` and `mods/*` directly into `$HERDR_APP_HOME` (`~/.config/herdr-app-sessions/<name>`) rather than running `./install`.

3. **Live-run multiple-session rule vs shared Wayland display for `herdr-app shot`**:
   - **Evidence**: `/home/ivan/.akrogon/current/skills/chart-issues/assets/shapes.md` (`## Preflight and validation`: *"refuses a live-run done-criterion that runs sessions one after another without naming the shared resource that forces serial order"*), `/home/ivan/.akrogon/current/skills/chart-issues/assets/standing-design.md` (`## Principles`, **Live runs**), `panel-top-bar/readiness.yaml:14` (`limits: "shots go stale when the window is covered"`), and `panel-top-bar/brief.md:24`, `files-panel/brief.md:21`, `changes-panel/brief.md:19`, `needs-you-panel/brief.md:21`, `spaces-scroll/brief.md:16`.
   - **Disagreement**: Each brief says *"each criterion in its own session with its own log, deleted afterwards; `herdr-app shot` evidence is taken after `herdrapp session stop` and `attach` so the frame is fresh"* without naming the shared resource (the Wayland compositor/display where covered windows produce stale `herdr-app shot` frames, `panel-top-bar/readiness.yaml:14`) that forces `shot` capture across sessions to run one after another, or running the leaf's checks in a single throwaway session (as `spaces-scroll/design.md:20` and `tasks-mod/design.md:40` say).

---

## `herdr-setup/right-panel/panel-top-bar`

1. **Done-criterion 3 (`panel-top-bar/brief.md:15`) cannot pass within `panel-top-bar`'s ownership (`panel-top-bar/brief.md:5`, `design.md:43,48`)**:
   - **Evidence**: `panel-top-bar/brief.md:5,15-16`, `panel-top-bar/design.md:43,48`, `needs-you-panel/design.md:46`, `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:127-146`.
   - **Disagreement**: Criterion 3 (`panel-top-bar/brief.md:15`) requires `ctrl-b t`, `ctrl-b y`, and `panel.request` `toggle`/`open` to open and switch between views, while Criterion 4 (`panel-top-bar/brief.md:16`) requires that a view whose mod folder is missing from the session's `mods/` *"has no button and its key does nothing"*. Yet `panel-top-bar/brief.md:5` and `design.md:48` only add the `tasks` block to `layouts/flat.json`'s `panel-body`, leaving the `needs-you` block to `needs-you-panel` (`needs-you-panel/design.md:46`). In `panel-top-bar`'s worktree:
     - `panel-body` has no `needs-you` child, so `run("layout.select", { stack: "panel-body", child: "needs-you" })` for `ctrl-b y` cannot select `needs-you`; and
     - neither `mods/tasks` nor `mods/needs-you` exists in the worktree, so by Criterion 4 both `ctrl-b t` and `ctrl-b y` do nothing unless `panel-top-bar` adds **both** `tasks` and `needs-you` blocks to `layouts/flat.json` and the live check populates stub `mods/tasks` and `mods/needs-you` in the throwaway session's `$HERDR_APP_HOME/mods/` for Criterion 3 (then removes them for Criterion 4).

2. **Mod-folder existence check (`panel-top-bar/design.md:54`) hides shipped `files` and `changes` in throwaway sessions and breaks when `files-panel` / `changes-panel` rename their mod folders**:
   - **Evidence**: `panel-top-bar/design.md:54`, `files-panel/design.md:46`, `changes-panel/design.md:46`, `/home/ivan/Work/infra/herdr-setup/bin/herdrapp:79-94,96-103`.
   - **Disagreement**:
     - `panel-top-bar/design.md:54` says: *"a button shows when `workspace.panels` holds its id and its mod folder exists (`readTextFile(appHome() + "/mods/<mod>/mod.json")`)*.
     - In a throwaway session (`HERDR_APP_HOME=~/.config/herdr-app-sessions/<name>`), `bin/herdrapp:83-89` skips all shipped mods listed in `installed.json` (`files`, `changes`). Before `files-panel` and `changes-panel` merge, `appHome() + "/mods/files/mod.json"` and `appHome() + "/mods/changes/mod.json"` do **not** exist in `$HERDR_APP_HOME`, so `readTextFile(...)` returns `null` and hides the `Files` and `Changes` buttons.
     - After `files-panel` and `changes-panel` merge, the `panel-body` block `id` remains `"files"` / `"changes"` while `block.content.mod` becomes `<files clone>` / `<changes clone>` (`files-panel/design.md:46`, `changes-panel/design.md:46`). `panel-top-bar` must read `block.content.mod` from `find(layout(), "panel-body").children` (not the block `id`), treat shipped mod names (`"files"`, `"changes"`) as always present, and check `readTextFile(appHome() + "/mods/" + mod + "/mod.json")` only for personal/non-shipped mods.

3. **`panel-top-bar/design.md:56` names `agents()` fields that do not exist on `AgentInfo` in `herdr.d.ts`**:
   - **Evidence**: `panel-top-bar/design.md:56` (*"Needs you count from `agents()` (blocked plus top-level done; red `t.ansi1` when any is blocked)"*), `/home/ivan/.config/herdr-app/herdr.d.ts:155-176` (`AgentInfo`), `/home/ivan/.config/herdr-app/herdr.d.ts:209-212` (`terminals()`), `/home/ivan/.config/herdr-app/mods/agents-by-tab/main.js:43-48,215-225`.
   - **Disagreement**: `AgentInfo` from `agents()` (`herdr.d.ts:155-176`) has no `parent` field (so it cannot distinguish top-level `done` agents from sub-agents that have a pane, `agents-by-tab/main.js:222-224`), and pane-less blocked sub-agents are not in `agents()` at all (`agents-by-tab/main.js:43-44`). Both `panel-top-bar` and `needs-you-panel` must join `agents()` with `terminals()` (`herdr.d.ts:209-212`) by `address` so top-level `done` (`!parent`) and pane-less `blocked` sub-agents are counted identically in the top-bar badge and the `needs-you` panel.

4. **`panel-top-bar/design.md:50` contradicts Criterion 5 (`panel-top-bar/brief.md:17`) on preserving per-space panel choices**:
   - **Evidence**: `panel-top-bar/brief.md:17` (*"each space's remembered panel from before this leaf is kept"*), `panel-top-bar/design.md:50` (*"Open for the plan: copy the shipped mod's stored `panels` value or accept losing remembered choices once (criterion 5 requires keeping them)"*), `/home/ivan/.config/herdr-app/data/tabs/store.json:1-3`.
   - **Disagreement**: Accepting losing remembered choices contradicts Criterion 5 (`brief.md:17`). The shipped `tabs` mod's `localStorage` is stored at `appHome() + "/data/tabs/store.json"` (`{"panels": "{...}"}`, verified at `/home/ivan/.config/herdr-app/data/tabs/store.json:1-3`), so the cloned `tabs` mod can seed its `localStorage.getItem("panels")` from `readTextFile(appHome() + "/data/tabs/store.json")` on first run.

---

## `herdr-setup/right-panel/files-panel`

1. **Done-criterion 2 (`files-panel/brief.md:14`) requires a scroll-position API that does not exist in `gpui-kit.d.ts` and is not in the binding decision**:
   - **Evidence**: `files-panel/brief.md:14` (*"2. A `.md` file opens formatted; Raw shows its source; switching back keeps the scroll position near the same place."*), `/home/ivan/.config/herdr-app/gpui-kit.d.ts:20701-20710` (`TextViewElement`), `/home/ivan/.config/herdr-app/gpui-kit.d.ts:21430-21460` (`EditorState`, `Editor`), `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/forks/files-changes.md:24`.
   - **Disagreement**: `TextViewElement` exposes only `on_link_click`, `selectable`, and `scrollable` (`gpui-kit.d.ts:20701-20706`); `EditorState` exposes only `value`, `set_value`, `on`, and `release` (`gpui-kit.d.ts:21430-21436`). Neither `TextView.markdown` nor `Editor` exposes scroll offset read/write, and switching between `TextView.markdown` and `Editor.new(this.code)` swaps two distinct native elements. The binding decision (`forks/files-changes.md:24`) only specifies *"formatted markdown with Raw"*, not cross-widget scroll synchronization.

2. **Derivation of `<slug>` in `"<slug> worktree is gone"` (`files-panel/brief.md:17`) is unspecified on `worktree.pin`**:
   - **Evidence**: `files-panel/brief.md:17`, `files-panel/design.md:41` (`setShared("worktree.pin", { [spaceId: string]: { machine: string | null, folder: string } })`), `changes-panel/brief.md:17`.
   - **Disagreement**: `worktree.pin` stores only `{ machine, folder }`. When the pinned worktree directory has been deleted from disk (so `git` cannot run in it), the implementer has to guess how `<slug>` in `"<slug> worktree is gone"` is obtained (`folder.split(/[\\/]/).pop()`). State explicitly in the shared interface that `<slug>` is the last path segment of `folder`.

---

## `herdr-setup/right-panel/changes-panel`

1. **Same `layouts/flat.json` parallel-edit conflict, `herdrapp --session` worktree linking gap, and `<slug>` derivation on `worktree.pin` as `files-panel`**:
   - **Evidence**: `changes-panel/state.yaml:5`, `changes-panel/design.md:41,46`, `changes-panel/brief.md:17,19`, `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:138-145`.
   - **Disagreement**:
     - `changes-panel` edits `layouts/flat.json` in parallel with four other `blocked-by: []` leaves (`shapes.md` `## Leaf files` / `## Preflight and validation`).
     - `changes-panel/brief.md:17` requires `"<slug> worktree is gone"` when a pinned worktree is deleted, without stating in `design.md:41` that `<slug>` is `folder.split(/[\\/]/).pop()`.
     - `changes-panel/brief.md:19` uses `herdrapp --session <name>` without noting that the worktree's `layouts/flat.json` and `mods/<changes clone>` must be linked into `$HERDR_APP_HOME`.

---

## `herdr-setup/right-panel/needs-you-panel`

1. **`needs-you-panel/design.md:48` names `kind`, `status_ms`, and `parent` on `agents()`, which do not exist on `AgentInfo` in `herdr.d.ts`**:
   - **Evidence**: `needs-you-panel/design.md:48` (*"Data: `agents()` for status, `kind`, `status_ms`, parent"*), `/home/ivan/.config/herdr-app/herdr.d.ts:155-176` (`AgentInfo`), `/home/ivan/.config/herdr-app/herdr.d.ts:209-212` (`terminals()`), `/home/ivan/.config/herdr-app/mods/agents-by-tab/main.js:43-48,215-225`, and `hc ls --json` / `hc get t15 --json`.
   - **Disagreement**: `agents()` (`herdr.d.ts:155-176`) returns `AgentInfo[]` (`address, pane, space, space_name, tab, tab_index, tab_name, status, app, program, title, seq, focused`) — it does **not** carry `kind`, `status_ms`, `parent`, or `turn`, and pane-less sub-agents are not in `agents()` (`agents-by-tab/main.js:43`). Those fields live on `terminals()` (`herdr.d.ts:209-212`: `parent`, `status_ms`, `turn`, and `report.kind`) and `hc(["get", <t>, "--json"])`.

2. **Jumping to a blocked sub-agent without a pane (`needs-you-panel/design.md:51` vs `panel-top-bar/design.md:52`)**:
   - **Evidence**: `needs-you-panel/brief.md:5,13,16`, `needs-you-panel/design.md:51` (*"Jump: `run(\"pane.focus\", ...)`; the top bar's focus watch shrinks a full panel (`panel-top-bar`)"*), `/home/ivan/.config/herdr-app/herdr.d.ts:57,61,64,215-219`, `/home/ivan/.config/herdr-app/mods/agents-by-tab/main.js:157-159,190,341`.
   - **Disagreement**: A sub-agent started with `hc run --bg` has no model pane (`!a.pane`), so `run("pane.focus", { pane: a.pane })` has no `pane` to target, and `run("pane.focus", { terminal })` fails when the sub-agent has no model pane (`herdr.d.ts:218-219`). In `agents-by-tab/main.js:158,190`, clicking a sub-agent calls `run("terminal.peek", { terminal: k.address })` (or `run("agent.focus", { terminal })`, `herdr.d.ts:64`), and peeking an overlay while `main` is hidden will not change `focused()` unless the parent's pane is also focused or a panel shrink is requested.

3. **`mods/needs-you/mod.json` must specify `"place": "none"`**:
   - **Evidence**: `/home/ivan/.config/herdr-app/AGENTS.md:725-726` (*"The first time Herdr sees a folder, it docks one copy per `mod.json` into the shown layout (`\"none\"`: only where a layout or another mod puts it)"*), `/home/ivan/.config/herdr-app/mods/files/mod.json:1` (`{ "place": "none" }`).
   - **Disagreement**: `needs-you-panel/design.md:46` does not specify `"place": "none"` in `mods/needs-you/mod.json`. Any other `place` value causes `herdr-app` to auto-dock a duplicate block into the shown layout on first discovery.

---

## `herdr-setup/right-panel/spaces-scroll`

1. **Unsequenced shared file `layouts/flat.json` and `herdrapp --session` worktree linking**:
   - **Evidence**: `spaces-scroll/state.yaml:5` (`blocked-by: []`), `spaces-scroll/design.md:24`, `spaces-scroll/brief.md:16`, `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:29-49`, `/home/ivan/Work/infra/herdr-setup/bin/herdrapp:9,96-103`.
   - **Disagreement**: `spaces-scroll` touches `layouts/flat.json` in parallel with the other four `right-panel` leaves (`blocked-by: []`), violating `shapes.md` (`## Leaf files` / `## Preflight and validation`), and its live check in `brief.md:16` requires linking the worktree's `layouts/flat.json` into `$HERDR_APP_HOME/layouts/flat.json` so `herdrapp --session <name>` does not read `~/.config/herdr-app/layouts/flat.json`.

---

## `akrogon/tasks-board/status-json`

1. **Missing shared JSON field names across `status-json` and `tasks-mod` (`shapes.md` `## Leaf files`)**:
   - **Evidence**: `/home/ivan/.akrogon/current/skills/chart-issues/assets/shapes.md` (`## Leaf files`: *"Names that cross leaves — function signatures, file paths, event names, config keys — appear verbatim here, identical in every leaf that touches them"*), `status-json/design.md:26-33`, `tasks-mod/design.md:42-51`.
   - **Disagreement**: Only the top-level `red` field name is specified in `design.md`. All other JSON keys consumed by `tasks-mod` (schema version, generated time, watch targets, deploy failure, run line, last merges, repo fields, chart fields, leaf fields, seat fields) are left unpinned (`status-json/design.md:33` even leaves *"the schema-version field name and value"* open for the plan).

2. **`status-json/brief.md` omits `root` per repo, which `tasks-mod` needs to sort the current space's repo first**:
   - **Evidence**: `status-json/brief.md:13-20`, `tasks-mod/brief.md:13` (*"the board renders every repo from a recorded `akrogon status --json` envelope, the current space's repo first, then alphabetical"*), `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/tasks-panel-final.md:7` (*"Per repo: name, root, paused, ..."*), `/home/ivan/.config/herdr-app/herdr.d.ts:109-128` (`SpaceInfo`).
   - **Disagreement**: `tasks-panel-final.md:7` included `root` on each repo, but `status-json/brief.md` omitted it (and text `akrogon status` only prints `scan.repo.name`, `src/status.ts:564`). Without `root` on each repo in `status --json`, `tasks-mod` cannot match `space.folder` / `focused()?.cwd` to a repo when a space is renamed (`space.named === true`) or in a subdirectory/worktree.

3. **`status-json/design.md:28,32` says `scanRepo` is the single source of every fact, but `scanRepo` drops merged leaves in `issues/closed/` and lacks `worktree`**:
   - **Evidence**: `status-json/design.md:28,32`, `status-json/brief.md:16-17`, `/home/ivan/Work/infra/akrogon/src/status.ts:74-78`, `/home/ivan/Work/infra/akrogon/src/config.ts:127` (`worktreeStore`).
   - **Disagreement**:
     - `scanRepo` (`src/status.ts:76-77`) filters `inventory.leaves` to `leaf.path.startsWith(open + sep)` (`issues/open` only). Once an issue closes and moves to `issues/closed/`, its merged leaves are in `inventory.leaves` (and `scan.log`), **not** in `scan.leaves`. Computing `last_merges` from `scan.leaves` misses every merged leaf in `issues/closed/`.
     - `src/status.ts` never computes a leaf's `worktree` path (`status-json/brief.md:16`); that comes from `resolve(worktreeStore(), repo.name, slug)` (`src/config.ts:127`).

4. **`kept` paths scope (`status-json/brief.md:16` vs `src/status.ts:492-493` and `tasks-panel-final.md:6`) and `red` row vs alert counting (`status-json/brief.md:18` vs `design.md:30`)**:
   - **Evidence**: `status-json/brief.md:16,18`, `status-json/design.md:30`, `/home/ivan/Work/infra/akrogon/src/status.ts:492-493,516-543`, `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/tasks-panel-final.md:6`.
   - **Disagreement**:
     - In `src/status.ts:492-493`, `readKept(repo)` is per-repo and `readHostKept()` is per-host (`tasks-panel-final.md:6`), not per-leaf as `status-json/brief.md:16` states (*"Each leaf carries ... kept paths"*).
     - `status-json/brief.md:18` says `red` *"counts rows that are failed, a prompt not delivered, a Missing key, deploy failed or an unreadable repo"*, while `status-json/design.md:30` says `red` *"is computed from the same predicates the text alerts use"*. A single leaf that is both `failed` and has two `Missing` keys produces multiple text alert lines (`src/status.ts:530-541`) but is one leaf row on the board (`panel-top-bar/design.md:44`: *"the number of rows the Tasks board paints red"*). Pin that each red leaf counts as `1` (plus `1` for `deploy failed` and `1` per `unreadable` repo/leaf-failure entry).

---

## `akrogon/tasks-board/tasks-mod`

1. **`src/install.ts` (`tasks-mod/brief.md:19`, `tasks-mod/design.md:52`) must wire `~/.config/herdr-app/mods/tasks` through `planSkillLinks` without breaking `tests/self-update.test.ts`**:
   - **Evidence**: `tasks-mod/brief.md:19`, `tasks-mod/design.md:52`, `/home/ivan/Work/infra/akrogon/src/install.ts:19-41,111-138`, `/home/ivan/Work/infra/akrogon/src/self-update.ts:256-272`, `/home/ivan/Work/infra/akrogon/tests/self-update.test.ts:34-60`.
   - **Disagreement**:
     - When `akrogon` self-deploys on merge, `deployStage` (`src/self-update.ts:258-271`) calls `planSkillLinks` + `applySkillLinks`, **not** `install()`. If `~/.config/herdr-app/mods/tasks` is linked only inside `install()` (`tasks-mod/design.md:52`), auto-deploy after `tasks-mod` merges will not create the link.
     - Conversely, `planSkillLinks` is tested by `tests/self-update.test.ts:34-60`, whose synthetic `seed` repo has no `herdr-app/tasks` folder unless `planSkillLinks` gates the mod link on `existsSync(resolve(listRoot, ...))` (or `selfUpdateFixture` is updated).
     - `tasks-mod/brief.md:21` (*"Proof:"*) omits how Criterion 7 (`akrogon install`) is tested without mutating the host's live `~/.config/herdr-app` (via `planSkillLinks`/`applySkillLinks` against a temporary `home` in `bun test`).

2. **Working-seat spinner from `look-final.md:7` is missing from `tasks-mod/brief.md` and `tasks-mod/design.md`**:
   - **Evidence**: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/look-final.md:7` (*"A two-seat row shows `<logo>A <logo>B` ... A working seat shows the Agents-list spinner (`t.working`)."*), `tasks-mod/brief.md:14`, `tasks-mod/design.md:22`.
   - **Disagreement**: `look-final.md:7` requires a working seat to show the Agents-list spinner (`t.working`), which is omitted from `tasks-mod/brief.md:14` and `tasks-mod/design.md:22`.

3. **Typechecking and `herdr-app check` for the `tasks` mod folder (`tasks-mod/design.md:52,57`)**:
   - **Evidence**: `tasks-mod/design.md:52,57`, `/home/ivan/Work/infra/akrogon/issues/config.yaml:8-10`, `/home/ivan/Work/infra/akrogon/tsconfig.json:1-7`, `/home/ivan/.config/herdr-app/AGENTS.md:725-726,761`.
   - **Disagreement**:
     - `akrogon`'s `typecheck` check (`tsc --noEmit`, `tsconfig.json:3-6`) has `"strict": true` and no `"allowJs": true`. When `tests/*.test.ts` imports a pure `.js` module from `herdr-app/tasks/` (`tasks-mod/design.md:57`), `tsc --noEmit` fails with `TS7016` unless a `.d.ts` declaration file is provided alongside the `.js` module (or the pure view-model module is `.ts` compiled/bundled or paired with `.d.ts`).
     - `akrogon`'s `issues/config.yaml:8-10` does not run `herdr-app check` on the `tasks` mod folder, and `tasks-mod/design.md:52` does not specify `"place": "none"` in `mod.json` (`AGENTS.md:725-726`).
