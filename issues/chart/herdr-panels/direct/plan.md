# Direct plan: right-panel (herdr-setup)

Route: direct, operator 2026-11-03 ("use manual mode to finish everything and to deploy it so we can have it working here now", slot B reviews). Task: the five handed-off leaf contracts read in place under `/home/ivan/Work/infra/herdr-setup/issues/open/right-panel/<leaf>/{brief,design,readiness}.yaml|md`: panel-top-bar (PT), files-panel (FP), changes-panel (CP), needs-you-panel (NY), spaces-scroll (SS). Worktree `/home/ivan/.akrogon/worktrees/herdr-setup/right-panel`, branch `right-panel`, base `b1d904d`.

## Read first

- herdr-app API: `~/.config/herdr-app/herdr.d.ts`, `~/.config/herdr-app/AGENTS.md` (mods, layouts, shared, localStorage), `~/.config/herdr-app/gpui-kit.d.ts` (tooltip, accessibility, `TextView` lives in `gpui-base`).
- Shipped sources to clone: `~/.config/herdr-app/mods/{tabs,files,changes}/`; Agents list `icon()` and jump: `mods/agents-by-tab/main.js`.
- Repo: `layouts/flat.json`, `mods/prefix/main.js`, `install`, `bin/herdrapp`, `mods/AREA.md`, `docs/reference-index.md`, `README.md`.
- Proof records: `issues/chart/herdr-panels/forks/{panel-width,needs-you,look,files-changes}.md`; fixtures `issues/chart/herdr-panels/slots/fixtures/needs-you/`.

## Decisions

- D1 Mod folders: `mods/panel-bar` (tabs clone), `mods/files-view` (files clone), `mods/changes-view` (changes clone), `mods/needs-you` (new). Each `mod.json` has `"place": "none"`; clones carry `cloned_from` `{name, version}` of the shipped mod (version `0.1.12`, the installed herdr-app).
- D2 Pure modules beside each `main.js`, plain ES modules with no `herdr` or `gpui` import, tested by `bun test` from `tests/*.test.js`: `mods/panel-bar/routine.js`, `mods/files-view/paths.js`, `mods/changes-view/git.js`, `mods/needs-you/rows.js`. `main.js` holds every host call.
- D3 Routine (`routine.js`), state `{open, view, full}` (`open` = panel shown, `view` = `panel-body` active, `full` = `main` hidden). Commands are `[name, args]` lists run in order by `panel-bar`:
  - `request(state, {op, view})`: closing (toggle, open, same view) returns `{commands: CLOSE, closed: true}` where CLOSE = `layout.hide panel`, `layout.show main`, `layout.resize panel px 368`; opening from closed = `layout.select panel-body view`, `layout.show panel`, `layout.hide main`, `layout.resize panel weight 1`; switching while open = `layout.select` only; `open` on the view showing = no commands.
  - `shrink(state)` (⤡, focus jump while full, window start while full, space switch while full) = `layout.show main`, `layout.resize panel px 368`, nothing when not full; `grow(state)` (⤢) = `layout.hide main`, `layout.resize panel weight 1`.
  - `fresh(seq, last)`: a `panel.request` is handled once per new `seq`.
- D4 After a close, `panel-bar` runs `pane.focus {pane}` with the pane focused before the panel opened (kept in the mod on open; falls back to the tab's first pane). A reply box in `needs-you` closes through `panel.request` toggle, so the same path returns focus.
- D5 Gating (PT 4): a panel button shows when `workspace.panels` holds its id and the mod its `panel-body` block names is shipped (a top-level key `<name>` in `appHome()/installed.json`) or present (`readTextFile(appHome()/mods/<name>/mod.json)` resolves). `presentViews(panels, blocks, shipped, present)` in `routine.js` is the pure decision. A key or request for a gated-out view does nothing.
- D6 Per-space memory: `syncPanel` from the shipped tabs mod, kept; the clone's `localStorage` `panels` is seeded once from `readTextFile(appHome() + "/data/tabs/store.json")` `.panels` when its own key is absent (PT 5). On a space switch while full, `shrink` runs before the restore.
- D7 Window start (PT 6): on the first render, when `main` is hidden, `shrink`. Focus jump (PT 7): `focused().terminal` changed between renders while `full` → `shrink`.
- D8 Seeding `workspace.panels` (PT 8): `install` and `bin/herdrapp` both call one helper, `herdrapp session seed`, which for the main home and every session home sets `workspace.panels` to the ordered union of its current list and `tasks, needs-you, files, changes` with `jq` (atomic tmp + mv, `{}` when the file is missing). A new session gets it at creation. A running window: herdr-app keeps shared state in memory and saves the latest change, so `panel-bar` also adds missing ids once per home (localStorage flag `seeded`) through `setShared`; this is the same union, not a second rule.
- D9 Needs-you count (PT 10): `needsYou(terminals)` in `routine.js` = `{count, blocked}` over `blocked` terminals plus `done` terminals with no `parent`. Red dot: `redDot(result)` takes `exec("akrogon", ["status","--json"])`'s result (or a rejection) and returns true only for exit 0 with a JSON envelope whose `red` > 0. Rerun on `watchFolder` of each `watch.folders` entry, never overlapping (a run in flight marks dirty and reruns once after); `watch.files` (Open for the plan) are polled by content every 30 s with `readTextFile`, compared to the last read.
- D10 Narrow window (PT 9): below 760 px window width the panel buttons drop labels; every button carries its name as tooltip and accessible label.
- D11 Files (FP): clone of `files`, outer card without `rounded`/`border_1`, header control row: filter input, Recent button, pin label. Filter source `git ls-files -co --exclude-standard -z` in the shown root (`paths.js` `parseLsFiles`, `filterPaths(paths, query)` = case-insensitive substring on the path, limit 200); filter hidden when `git rev-parse --show-toplevel` fails. Recent: `recent(statusZ, logNames, exists)` = uncommitted paths first (porcelain `-z` order), then names from `git log -20 --name-only --format=` that still exist, de-duplicated. `.md` opens through `TextView.markdown` with a Raw toggle back to the shipped read-only editor view. An open file re-reads on change (`watchFolder` on its folder).
- D12 Pin (FP 5-6, CP 5): `worktree.pin[spaceId] = {machine: null, folder}` set from a picker over `git worktree list --porcelain` (`parseWorktrees` and `slugOf` in `files-view/paths.js`; `changes-view/git.js` carries the same two functions verbatim because herdr-app refuses a mod import from another mod's folder: `herdr-app check` → "module `../a/lib.js` resolves outside the application directory", probed 2026-11-03); × deletes the space's entry. A pin whose folder no longer exists shows "<slug> worktree is gone", slug = last path segment (`slugOf`).
- D13 Changes (CP): clone of `changes` without `commit()` and its row, outer card straight. Header switch Working | Branch | Commits plus pin label. `git.js`: `resolveBase(refs)` picks `origin/HEAD` target, else `main`, else `master`, else none; `parseLog(out)` parses `git log -20 --format=%H%x1f%P%x1f%s%x1e` into `{sha, parents, subject}`; `diffRange(commit)` = first parent for a merge, `4b825dc642cb6eb9a060e54bf8d69288fbee4904` (empty tree) for a root. Branch = `git diff <merge-base base HEAD> <HEAD>` with base and HEAD SHAs read once per refresh; "nothing on this branch beyond <base>" when empty. Empty Working with commits beyond base offers "view Branch diff (N files)".
- D14 Needs you (NY): `rows.js` holds `agentRows(terminals, agents)` (D9 rule, joined by `address`), `parseRound(screen)` (D15), `draft(picks)` = picks joined by " | " in question order, `recommendedPicks(round)`, `sendAction(row)` = `"send"` for `done`, `"force"` for `blocked` + `kind: question` + program key `claude`, else `"open"`, `stale(rendered, current)` = terminal, status or turn differs.
- D15 Round parser: an option line matches `^\s*(?:[-•*]\s+)?(\d+)([a-z])[.):]?\s+(\S.*)$`; options group by number in screen order into questions; a round needs every question to hold at least two options; the last round on screen counts only if no reply-start line (`●`, `⏺` or `•` at column 0) follows its last option line. `(recommended)` marks a recommended option. Proven on every fixture (round-* give two questions each, none-* give none).
- D16 Spaces (SS): flat.json `spaces` `size` `{"px": 180}` (five 32 px rows plus the 20 px header; measured in the live check and adjusted in the same unit), `agents` `{"weight": 1}`; `min` stays.
- D17 flat.json (A's own unit): `tabs` block mod `panel-bar`; `panel` loses `max`; `panel-body` children `tasks` (mod `tasks`), `needs-you` (mod `needs-you`), `files` (mod `files-view`), `changes` (mod `changes-view`); D16 sizes. `mods/prefix/main.js`: `t` → `panel.request toggle tasks`, `y` → `toggle needs-you`, `f` → `open files`, each with `seq: Date.now()`.

## Units and waves

- Wave 1 (A, serial): U0 tests (below), committed first. U1 flat.json + prefix + `install`/`bin/herdrapp` seed (D8, D16, D17); owns `layouts/flat.json`, `mods/prefix/main.js`, `install`, `bin/herdrapp`.
- Wave 2 (workers, disjoint paths, no shared test resource; live sessions are not used by workers): U2 `mods/panel-bar/` (D3-D10); U3 `mods/files-view/` (D11, D12); U4 `mods/changes-view/` (D13, D12 by import).
- Wave 3 (worker): U5 `mods/needs-you/` (D14, D15).
- Wave 4 (A, serial, one display): live checks L1-L6 below in throwaway sessions, then docs: `mods/AREA.md`, `docs/reference-index.md`, `README.md` lines for the four mods and the keys.

## Criteria → proof

Pure (`bun test`, seconds, rerun on any change to the module or test): PT 3, 4 (decision), 10 (count, dot) → `tests/panel-bar.test.js`; FP 3, 4, 6 (slug) → `tests/files-view.test.js` against a temporary git repo; CP 2, 3 → `tests/changes-view.test.js` against temporary git repos (merge, root, empty branch); NY 2, 4, 5, 3 (draft) → `tests/needs-you.test.js` over the committed fixtures (copied into `tests/fixtures/needs-you/` from the chart folder, recorded 2026-11-03 per its README).

Live (minutes each, one session at a time, sessions `right-panel-<n>`, theme rule from the briefs; rerun when the mod under test changes):
- L1 PT 1, 2, 3, 5, 6, 7, 9, 11 + SS 1, 2: session with flat linked from the worktree, eight spaces, `herdr-app do` clicks via `layout.*` state reads and `shot`; restart via `herdrapp session stop`/`attach`.
- L2 PT 4: a `panel-body` block naming an absent mod → no button, `herdr-app status` errors empty.
- L3 PT 8: `bin/herdrapp session seed` against copies of homes under `$TMPDIR` (HOME overridden), then `herdrapp --session` creation in a throwaway session; never the operator's homes.
- L4 FP 1, 2, 5, 6, 7 and CP 1, 4, 5: shots and state reads with a pinned throwaway worktree.
- L5 NY 1, 3, 4, 6, 7: grant G1 (needs-you-panel `readiness.yaml`), session `needs-you-panel-1`, at most four agent launches (claude haiku, codex, pi, agy), one sample question each plus one reply each; cleanup `hc kill`, session stop and delete, absence read `herdrapp session list`.
- L6 PT 10 live count/dot: under grant G1 (panel-top-bar), reusing L5's blocked and done agents is not allowed across sessions, so one claude haiku launch in `panel-top-bar-1`.

Machinery: none added; the runner is `bun test`, live checks use `herdr-app`, `herdrapp`, `hc` as they are.

## Docs

`mods/AREA.md` (four new mods, the routine and the request contract), `docs/reference-index.md` (no new area), `README.md` keys line (`ctrl-b t`, `ctrl-b y`).

## Test interfaces (U0, committed `02c7a2e`, red: `check tests-red-before-code: 1 .../direct/check-tests-red-before-code-1793734607073-152598.log`, modules missing)

- `routine.js`: `request(state, req) → {commands, closed}`, `shrink(state)`, `grow(state)`, `fresh(req, lastSeq)`, `presentViews(panels, blockMods, shipped, present) → ids in bar order`, `needsYou(terminals) → {count, blocked}`, `redDot(execResult | null)`.
- `paths.js`: `parseLsFiles(zOut)`, `filterPaths(paths, query)`, `recent(statusZ, logNames, exists)`, `parseWorktrees(porcelain) → [{folder, branch|null}]`, `slugOf(folder)`.
- `git.js`: `LOG_FORMAT`, `EMPTY_TREE`, `resolveBase({originHead, branches})`, `parseLog(out) → [{sha, parents, subject}]`, `diffRange(commit) → [from, to]`.
- `rows.js`: `agentRows(terminals, agents) → [{address, status, kind, program, turn, ...}]` (program = the agent's live `program`), `parseRound(screen) → [{number, options:[{code, label, recommended}]}] | null`, `draft(round, picks)`, `recommendedPicks(round)`, `sendAction({status, kind, program}) → "send"|"force"|"open"`, `stale(rendered, current)`.
- Keeping command output: `akrogon run-check --holder <chart>/direct` refuses from the herdr-setup worktree (EACCES mkdir `/akrogon`: the holder sits in another repo), so runs start from the akrogon checkout with `sh -c "cd <worktree> && <cmd>"`.

## Implementation notes (2026-11-03, after first live look)

- D18 Icons: herdr-app loads a mod linked as a whole folder (what `install` does), but `svg()`/`image()` paths that resolve through that link are refused (shot: blank icons), and a real folder of file links refuses the modules (`herdr-app status`: "module `./routine.js` resolves outside the application directory"). So no herdr-setup mod ships its own svg: clones use the shipped icons (`mods/files/*.svg`, `mods/changes/changes.svg`, `mods/tabs/win-*.svg`), and new icons are Nerd Font glyphs drawn with `font_family(settings().font)` (JetBrainsMono Nerd Font, set in settings.json).
- Live windows run on a headless Hyprland output `HERDRTEST` at 20000x20000 (never adjacent to the operator's monitors) on workspace 7: created with `hyprctl output create headless HERDRTEST` and `hl.monitor({output='HERDRTEST', mode='2560x1600@60', position='20000x20000', scale=1.6})`; the window is launched there with `hyprctl eval "hl.exec_cmd('env HERDR_APP_HOME=<home> HC_SESSION=<name> herdr-app', { workspace = '7 silent' })"`. A window moved there later, or sent to a special workspace, stops drawing. Operator 2026-11-03: "use a separate workspace".
- Requests are driven by a session-only overlay mod `driver` (in the session home, never in the repo) that sets one shared value from `live/request.json` and closes: the same `panel.request` path Tasks and Needs you use. Clicks have no CLI; button clicks call the same `act()` as requests.
- Operator 2026-11-03 on the first look: "It just looks really bad, the entire UI." The four views and the bar get a visual pass against shots before review.

D19 (2026-11-03, operator: "the UI still looks really, really bad ... more Omarchy-like ... and more herdr-app like (the defaults)"). One look for the four panel views and the Tasks board, taken from herdr-app's shipped mods (geometry, so the panels match the sidebar and tabs beside them) and Omarchy's shell controls (`/usr/share/omarchy/shell/Ui/Button.qml`, `TextField.qml`, `PanelSectionHeader.qml`: borderless until hovered, selected = filled and bolder):
- Header: h42, px14, title 13 semibold; a count uses the shipped Changes view's small outlined chip (`mods/changes/main.js:185`), so all panel headers match herdr-app's own.
- Buttons: no border. Idle muted text; hover `t.hover` bg and foreground; selected `t.selected` bg, foreground, medium weight; h26, px8, radius 6, text 12. One primary action (Send) is `t.solid` only when it can act; otherwise a plain muted label.
- Inputs: filled `t.hover`, no border, `t.accent` border while focused; h28, radius 6.
- Status pills: the Agents list's shape (h18, px6, radius 5, text 10.5 semibold, status color text on its 15% fill).
- Section labels: 11.5 medium dim, as the sidebar's "Agents".
- Reading width: Needs-you and Tasks content keeps a 760 px column at full width, so lines do not run across the whole window.

D20 (2026-11-03, operator Q5 O1 "accept it and deploy now", replying "q1 o1" to the single open question Q5). panel-top-bar criterion 4 reads: a view whose mod is neither shipped nor present has no button, its key does nothing, and `herdr-app status` shows no error, except one case herdr-app owns: a view left open whose mod is removed before the next start records `mod <name>: no mod folder ...` once (drawn before any mod runs, `check pt4-saved-open`); the bar closes the panel and the next reload clears it. The upstream fix is drafted to herdr-app with `herdr-app feedback` for the operator to send.
