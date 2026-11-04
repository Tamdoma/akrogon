# Plan: tasks-mod

Ships a herdr-app mod `tasks` in akrogon at `herdr-app/tasks/` (mod.json `"place": "none"`, `main.js`, pure modules `model.js` + `schedule.js` with sibling `.d.ts`), linked into `~/.config/herdr-app/mods/tasks` by `planSkillLinks`, which `install()` and the self-update `deployStage` links step both run. The mod reads `akrogon status --json` (interface locked by leaf `status-json`, now merged at ada0dab9) and draws the board per the design's locked decisions.

## Decisions

- **D1 mod layout.** `herdr-app/tasks/` holds `mod.json` (`{"place": "none", "title": "Tasks"}`), `main.js` (all `herdr`/`gpui-kit`/`gpui-base` imports, host wiring, View), `model.js` (pure: envelope + context → row tree, alert lines, ordering, stage colors/tints, seat logo choice, pin/request intents, watch-file diff), `schedule.js` (pure: scan/run-state machine — event + running flag → whether a rescan launches; keeps last-file-snapshot compare), plus `model.d.ts`/`schedule.d.ts` hand-written types the mod and tests share. `.js` not `.ts` because herdr-app loads `.js` only and the design's "Open for the plan" demands akrogon's strict `tsc` (no `allowJs`) still check the pure modules' boundary; sibling `.d.ts` is the pattern shipped mods use for `gpui-kit.d.ts`.
- **D2 link planning.** `planSkillLinks` gains `{ source: resolve(sourceRoot, 'herdr-app/tasks'), destination: resolve(home, '.config/herdr-app/mods/tasks') }`, emitted only when `resolve(listRoot, 'herdr-app')` is a readable directory (install's listRoot is `sourceRoot`; deploy's is the release tree — pre-mod releases must not plan a dangling link). Stale scan extends with a parallel roots loop over `.config/herdr-app/mods`, probing `listRoot/herdr-app/<name>` for targets under `sourceRoot/herdr-app` and treating releases targets the same as skill links. Nothing else in `planSkillLinks` changes; conflicts and repoint rules apply unchanged to the new destination.
- **D3 data flow.** `main.js`: `exec("akrogon", ["status", "--json"], {cwd: undefined})` → `JSON.parse` → `model.board(envelope, ctx)`. `ctx` = `{ now, currentSpace: spaces().find(s => s.active), agents: knownAgents() }` (knownAgents called once per rescan, never per render — it self-caches 60 s but the call is per-scan anyway). `watch.folders` from the envelope drive `watchFolder` spawn loops (one loop per folder, keyed set like `spaces` mod's `watching`); `watch.files` are polled by `readTextFile` on every render wake (tick 30 s and every notify) and diffed — see D4. No write to the envelope, repo store, or any akrogon path: read-only.
- **D4 watch.files → rescan (design's open question B).** `watchFolder` is folder-recursive only; watching `~/.akrogon` recursively would watch `worktrees/` and `releases/` (node_modules) — the herdr docs warn against whole-home watches. Resolution: `model.filesChanged(newFiles, oldFiles)` compares `readTextFile` results of `watch.files` (≤6 small files) against the snapshot taken at the last envelope fetch; a changed/absent/appearing file returns true and schedules a rescan. Folder events from `watchFolder` hits and file diffs both feed `schedule.next(running)` which returns `{ rescan: true }` only when no scan is in flight — the "never overlap" guarantee is a single boolean guarded by the pure scheduler, tested.
- **D5 ordering (design's open choice).** `model.board` orders `envelope.repos`: the current space's repo first, then `name.localeCompare`. Current repo = the repo whose `name` equals the active space's `name` or whose `root` is the active space's `folder` or an ancestor of it (space folders are terminal cwds; a worktree inside a repo root counts). No match → all repos alphabetical. Empty repo (no leaves, no error, no unpacked, no unreadable, no queue entries worth showing) folds to one line `name — no open leaves` (paused folded with a `paused` mark).
- **D6 alert block.** Top of board, in fixed order: host `run` text (waiting run line, amber ansi3) when present; `deploy.failed` line (red ansi1: `deploy failed: attempted <12> step <step>: <error>`); per-repo `error` (red, whole repo unreadable), `unreadable[]` entries (red, `path — error`), `slow` (amber: `Slow merge: <repo> … <ms>m vs normal <normal>m`), `unpacked[]` (neutral, `Unpacked: <path>: run <command>`); leaf rows carry a red flag/tag when `leaf.red` (source is `leafRed` in status.ts: failed, missing gaps, undelivered prompt). `kept` lines shown neutral under alerts. The board's root always renders at least the alert/error area or `no open leaves` — never blank (criterion 5).
- **D7 row shape.** Two-line leaf row per locked 2a/6b: line 1 = seat logos (`"<logo>A <logo>B"` — 16 px `icon()` replicating agents-by-tab's `svg`/`image` `Program.icon` choice; no Program match → the letter alone; `busy_since.<seat>` non-null → the agents-by-tab spinner `svg("mods/workspace-chrome/spinner.svg").spin(900)` in `t.working` in place of that seat's logo), slug, stage pill, uncolored time (`phase_since` → `clock` format, plain `t.dim`, never colored — D verbatim "Time shows uncolored"), tags (red flag when `leaf.red`; small marks: `stopped`, `parked` styling, `blocked_by` labels `slug:label`, `broadcast_pending`, `land`, `queue` place, `fix_rounds>0`, `delivery_errors`, `missing[]` names). Line 2 = group folder path context + latest history line (truncate) or blocked-by text.
- **D8 stage pill (criterion 3, verbatim).** `phaseColor = { plan: ansi4, implement: ansi6, check: ansi5, merge: ansi2, failed: ansi1 }` on `phase.split('.')[0]`; `stopped/parked/paused` rows → `t.muted` grey; phase `merged` → no pill. Pill = base `t.background` fill + stage color at 12 % alpha overlay + word in `t.foreground` + 6 px stage-colored dot, radius 4 (the look-final.md recipe chosen for hover/selected contrast). `model.pillColor(phase, t)` returns `{ slot: <ansi name> | 'muted' | null, tint: '12%' }`; `main.js` maps the slot name to `t[ansiN]`/builds the layered div.
- **D9 expansion & buttons (criterion 4).** Click toggles the row's `expanded` set entry (any number open; in place). Expanded area renders: `history[]` lines, seat lines (`harness — command — source`), `plan` path, `worktree` path, repo `kept` entries, `blocked_by` list, then Files and Changes buttons. Button `files` → `setShared("worktree.pin", { ...shared("worktree.pin"), [spaceId]: { machine: null, folder: leaf.worktree } })` then `setShared("panel.request", { op: "open", view: "files", seq: ++seq })`; `changes` same with `"changes"`. `machine: null` per the locked interface (leaf worktrees are local). `seq` = a number stored in the mod's model state, incremented per press (shared `seq` counter read from `shared("tasks.seq")` so a reloaded mod continues, or a monotonic in-memory counter — decision: in-memory `Date.now()`-seeded counter, `seq` need only increase). Expansion's pin/request intents are produced by pure `model.pinIntent(spaceId, leaf, view)` returning the two shared writes — testable without the host.
- **D10 command surface for proof.** Each interactive control also accepts a `<mod>.<command>` via `nextCommand()`: `tasks.expand <slug>` performs the same handler as the row click; `tasks.pin <slug> files|changes` the same as the buttons. This is how the live proof clicks rows without pointer injection (no `herdr-app` click command exists; `wtype` types only keys). Product-visible cost: two commands keys.json could bind — cheap, and the handler is one function.
- **D11 demo prop for shots.** `props().envelope` (a file path read via `readTextFile`, or inline JSON string) overrides the live scan for the throwaway session: hand-built envelopes exercise every pill phase, red rows, busy seats, merges, alerts without touching the operator's akrogon state. Absent the prop the mod runs live.
- **D12 theme staging for screenshots.** `omarchy/apply-herdr-app-theme` needs `XDG_STATE_HOME` temp holding `omarchy/current/theme/{colors.toml,ghostty.conf}`. sage-terra (`~/.config/omarchy/themes/sage-terra`) is a fully staged theme → copy both files. miasma, gruvbox, flexoki-light ship only `colors.toml` in `/usr/share/omarchy/themes/<n>` → generate `ghostty.conf` once into the temp folder by resolving `omarchy-theme-color --file colors.toml --all` into `/usr/share/omarchy/default/themed/ghostty.conf.tpl` (16 palette entries: 0=background 1=red 2=green 3=yellow 4=blue 5=magenta 6=cyan 7=foreground 8=muted 9=bright_red 10=bright_green 11=bright_yellow 12=bright_blue 13=bright_magenta 14=bright_cyan 15=bright_foreground). `omarchy-theme-set-templates` itself writes to `$HOME/.local/state` unconditionally, so it's not used. Operator's real theme untouched; light theme = flexoki-light.
- **D13 serial-solo.** Waves hold one unit each → serial-solo: A implements the plan itself, no workers (implement-issue rule).
- **D14 probe layout.** Throwaway session gets `layouts/probe.json`: root column → tasks block (full) + a terminal block, copied from flat.json's block shape; `shared.json` seeded `workspace.panels` unused — the block is directly visible. Session via `herdrapp --session <name>` with `HERDR_APP_HOME`/`HC_SESSION` set and `HC_TERMINAL_*`, `HC_SCOPE` unset; mod folder symlinked into session `mods/tasks`. Deleted after.
- **D15 proof shots.** `herdr-app shot /tmp/tasks-<theme>-<state>.png` per theme; hovered/selected rows produced by demo envelopes naming rows `tasks.expand`ed (selected) and a one-shot pointer move is not needed for hover: hover state comes from a real pointer rest — plan uses `on_hover` state? No: hover is drawn by `.hover()` style callback; for the shot the seat moves the pointer over a row with `hyprctl dispatch movecursor` — verify availability at implementation; fallback: the demo prop `hover: <slug>` forces the hover style on one row (accepted deviation only if movecursor fails). Recorded in report.

## Read-first paths

- `src/status.ts` — envelope producer (`JsonEnvelope`/`JsonLeaf` types, `leafRed`, `unpackedEntries`, merges/watch composition). Interface locked in design; do not edit.
- `src/install.ts` — `planSkillLinks`/`applySkillLinks` (D2 change site).
- `src/self-update.ts` — `deployStage` links step calls `planSkillLinks(home, currentLink(), ownedRoots, releases/sha)` (D2 caller).
- `tests/install.test.ts` — install link assertions + `self-update` deploy-link tests (`links a skill added on the remote…`, `links akrogon.slice…`).
- `tests/helpers.ts`, `tests/status-fixture.ts` — fixture/`cli` harness.
- `tests/status-json.test.ts` — envelope zod schema (shape reference for the mod's parser).
- `~/.config/herdr-app/herdr.d.ts` — mod API (exec, watchFolder, readTextFile, setShared, shared, knownAgents, spaces, theme, cx.timer.every).
- `~/.config/herdr-app/AGENTS.md` — mod conventions (id/on_click/hover, TextView, nextCommand, `herdr-app check`).
- `~/.config/herdr-app/mods/{agents-by-tab,board,spaces,files}/main.js` — icon() helper, spinner (`workspace-chrome/spinner.svg`, `t.working`, `spin(900)`), `cx.timer.every(30000, …)` tick, watchFolder keyed loops, exec cwd pattern.
- `~/Work/infra/herdr-setup/{bin/herdrapp,layouts/flat.json,omarchy/apply-herdr-app-theme}` — session tool, panel block shape, theme generator input.
- `~/Work/infra/herdr-setup/issues/open/right-panel/panel-top-bar/brief.md` — session/env conventions this leaf mirrors (HERDR_APP_HOME, HC_SESSION, HC_TERMINAL_*/HC_SCOPE unset).
- `issues/chart/herdr-panels/slots/look-final.md` — pill recipe (12 % tint on own base, fg word, 6 px dot, radius 4).
- `/usr/share/omarchy/bin/{omarchy-theme-color,omarchy-theme-set-templates}`, `/usr/share/omarchy/default/themed/ghostty.conf.tpl`, `/usr/share/omarchy/themes/*/colors.toml` — D12.
- `learnings/LESSONS.md` — relevant: run-check TMPDIR cross-device (copy not rename for evidence under home), bun `-e` argv shift, `bun run format` rewrites unrelated drift (run prettier on changed files only is not allowed by checks — run the check and revert foreign churn if it appears), stale-rule-in-docs (grep docs for changed behavior lines).

## Interfaces needed

- `setShared("panel.request", { op, view, seq })` — locked (herdr-setup `panel-top-bar` consumes; this leaf only writes `open`).
- `setShared("worktree.pin", { [spaceId]: { machine, folder } })` — locked (files/changes read; this leaf writes `machine: null`).
- `akrogon status --json` envelope `schema: 1` — locked, merged.
- `knownAgents() → (Program & {run, installed})[]`, `Program.icon/tint/tile/color` — probed P (readiness.yaml).
- `exec("akrogon",…)` ~370 ms — probed P5.
- `cx.timer.every(ms, cb)` — board mod precedent.
- `herdr-app check <folder>`, `herdr-app do <mod>.<command>`, `herdr-app shot`, `herdrapp --session` — verified on this machine.
- `omarchy/apply-herdr-app-theme` + `omarchy-theme-color --all` — verified on this machine.

## Checklist

### Wave 1 — U1: mod + install links (serial-solo: single unit, then live runs)

Owns: `herdr-app/tasks/{mod.json,main.js,model.js,model.d.ts,schedule.js,schedule.d.ts}`, `src/install.ts` (D2), `tests/tasks-mod.test.ts` (new), `tests/install.test.ts` (Test-Change case extension), `tests/self-update.test.ts` or the deploy test in `tests/install.test.ts` (Test-Change case extension: seed `herdr-app/tasks/mod.json`, assert release link), `tests/fixtures/status-envelope.json` (committed recording), `src/AREA.md` (install.ts key-file line + pattern line for the mod folder), `implementation/report.md` (evidence: fixture provenance, red outputs, session commands, shots, check output).

Shared test resource: none in bun tests (isolated fixtures). Live session runs are the one shared resource — one throwaway session at a time (brief P6: covered window stops drawing).

Steps:
1. Record `akrogon status --json` → `tests/fixtures/status-envelope.json` (done at planning; commit with tests).
2. Bun tests: `tests/tasks-mod.test.ts` (model + schedule + pin intents over fixture and derived inputs); extend `tests/install.test.ts` "install creates all four absent harness roots and repeats without changing links" to also assert `.config/herdr-app/mods/tasks` link + stability on second run (Test-Change trailer); extend the deploy-links test in `tests/install.test.ts`'s self-update describe to seed `herdr-app/tasks` and assert `~/.config/herdr-app/mods/tasks → releases/<sha>/herdr-app/tasks` (Test-Change trailer).
3. `herdr-app/tasks/` mod per D1–D11; `src/install.ts` per D2; AREA.md line.
4. `herdr-app check herdr-app/tasks` (criterion 7d).
5. Live session per D14/D15: render board live (criterion 1: akrogon first — session's space folder is `$HOME` so no space match → alphabetical check in model test; live shot shows every repo + folded empties); demo envelopes for pills/red/busy; `tasks.expand`/`tasks.pin` commands → session `shared.json` `worktree.pin`/`panel.request` (criterion 4); shot pair ≥61 s apart for advancing times (criterion 6a); touch a file under a `watch.folders` dir → rerun + shot, and during a running scan force a second event → assert no overlap via envelope `generated` deltas/log (criterion 6b); exit-1 envelope via demo (criterion 5); theme shots ×4 (criterion 3); `akrogon install`/deploy link via bun tests + a throwaway-home run of the release binary? — criterion 7 says proven against temporary home: the bun fixture IS a temporary home for install; deploy covered by the self-update test. `herdr-app check` exit 0 printed.
6. `implementation/report.md` + evidence (shots under `implementation/evidence/`, session log, check output).

Docs affected (one line each):
- `src/AREA.md` — key-file line for `src/install.ts` gains the herdr-app mods link behavior; pattern line for `herdr-app/` folder contents.
- `README.md` — check for an install description naming linked paths; update only if it enumerates destinations.
- `docs/` — grep for `planSkillLinks`-level install destinations; update only on a hit naming skill roots.
- `~/.config/herdr-app/AGENTS.md` — not touched (host file, generated).
- `docs/reference-index.md` — unchanged (no new area).

## Done-criteria → proof

C1 (repos render; current space's repo first; empty repos fold):
- Model test `tests/tasks-mod.test.ts` `board orders current repo first then alphabetical, empty repos fold to one line` over the recorded envelope (12 repos, 8 empty) with `ctx.currentSpace` matched and unmatched; run: `akrogon run-check --name tasks-model -- bun test tests/tasks-mod.test.ts`. Catches: wrong order/fold breaks the board's primary question. Size: seconds. Rerun: model or envelope shape changes.
- Live session shot: every repo visible, empties folded. Minutes; manual evidence.

C2 (row parts: logos, slug, pill, uncolored time, tags, red only flagged, spinner):
- Model test `leaf row model carries seat logo choice, red flag, stage slot, tags` — asserts `seats` pick Program by `key`/`run[0]` with letter fallback, `busy` flag for spinner, `time` uncolored (no color field on the time cell at all), `red` only from `leaf.red`. Catches: wrong red marking (the "is it really blocked" question) and wrong logo pairing. Seconds.
- Live: busy-seat spinner needs `busy_since` set — a demo envelope sets it; shot shows spinner + logos. Minutes.

C3 (pill ANSI slots, 12 % tint, dot, 4 themes, readable, cyan≠green):
- Model test `stage slot map and tint` asserts the verbatim map + 12 % + merged→null. Seconds.
- Live: 4 theme sessions (D12), shots of pills on plain/expanded rows; seat judges readability/cyan-vs-green in report. Minutes each; rerun trigger: theme file or pill code change; recording: committed shots in `implementation/evidence/`; consumers replay = re-shoot (outside stage; inputs are theme colors.toml + the mod, named).

C4 (expand in place; pin + request writes):
- Model test `pin intent writes spaceId → {machine:null,folder:worktree} and open request with increasing seq`. Seconds.
- Live: `herdr-app do tasks.pin …` then read session `shared.json` for `worktree.pin` entry + `panel.request {op:"open",view,seq}`; expansion shot. Minutes. The panels actually opening pinned is chart pending check (brief).

C5 (exit-1 envelope: healthy repos + error, never blank):
- Model test `error envelope keeps healthy repos and yields alert lines` (fixture-derived envelope with `error`/`unreadable`/`deploy.failed`, `schema:1` valid). Seconds.
- Live: demo envelope with repo error shown → shot. Minutes.

C6 (times advance ≥1/min without rerun; watch.folders rerun, no overlap):
- `cx.timer.every(30000)` + `watchFolder` loops + `filesChanged` poll; pure `schedule.js` test `a folder hit or file diff rescans only when idle` covering: event while running → no second exec; file change → rescan; file absent→present → rescan; unchanged → none. Seconds.
- Live: two shots ≥61 s apart show advanced times with one `generated` value (no rescan); a touch under `<repo>/issues` produces a new `generated` (rerun observed via mod's last-scan stamp or log). Minutes; one after another per P6.

C7 (install + deploy link; idempotent; herdr-app check):
- Bun: extended install test asserts link + second-run stability; extended deploy test asserts release-sourced link. Seconds. (fixture home = temporary home.)
- `herdr-app check herdr-app/tasks` exit 0 — printed `checks` run. Seconds.

## Planning red results (run 2026-11-03, stubs removed before commit)

- `check tasks-model-red: 1 implementation/check-tasks-model-red-1793722821592-3402675.log` — all 10 `tests/tasks-mod.test.ts` cases fail against a stub exporting wrong shapes (empty board, every pill ansi2, `op: toggle` + `machine: "other"`, `filesChanged`/`next` unconditional): covers the C1 order/fold case (TypeError on empty `repos`), C1 nested-folder match case (same), C2 logo/red/uncolored-time case (row undefined), letter fallback (same), C3 pill map + merged→null (`ansi2` for every input), C5 never-blank + alert lines (empty `alerts`), C4 pin intents (`machine "other"`, `op: toggle`, seq un-incremented), `filesChanged` diffs (all false), C6 no-overlap (`rescan: true` while running), merges fold (empty string).
- `check tasks-install-red: 1 implementation/check-tasks-install-red-1793722852084-3403315.log` — `install creates all four absent harness roots…` fails `ENOENT` on `.config/herdr-app/mods/tasks` lstat (D2 link absent).
- `check tasks-deploy-red: 1 implementation/check-tasks-deploy-red-1793722853878-3403590.log` — `links a skill added on the remote…` fails `ENOENT` on the same destination after deploy (D2 deploy path absent).

## Condition cases traced (decision → kept condition → planned red case)

- C1 condition "current repo FIRST then alphabetical, and fold only truly empty repos": D5's sort/fold can break it. Case: `board orders…` asserts first repo name == current-space match and sorted rest; red at planning via temp edit `name.localeCompare` → `b.localeCompare(a)` (records in report).
- C2 "red ONLY where envelope marks red": D7 tags can over-mark. Case asserts rows carry `red` iff `leaf.red` and tags exclude a red color for time/note cells; red via temp edit painting time cell with a color field.
- C3 "merged has no pill; every listed phase has its slot": case `merged → null pill`; red via temp edit `merged → ansi2`.
- C4 "worktree.pin targets leaf worktree for the CURRENT space, machine null; request is open not toggle": case asserts intents; red via temp edit `{machine:'x'}` or `op:'toggle'`.
- C5 "never blank": case asserts `board()` over all-error envelope returns non-empty structure; red via temp edit returning `[]` on `error` presence.
- C6 "never overlap": case asserts `schedule.next('folder-hit', running=true)` → no rescan; red via temp edit dropping the running guard.
- C7 "link goes through planSkillLinks so deploy replays it": covered by the two extended tests; red via temp edit removing the planned link line (install case fails before revert).
- `watch.files` poll (D4) "a changed file reschedules": case `filesChanged` true on content diff/absence/presence; red via temp edit returning `false` always.
- D5 current-repo matching "worktree inside root counts": case with space.folder = `<root>/sub/dir`; red via temp edit exact-match only.

## Recording & limitations

- Fixture `tests/fixtures/status-envelope.json`: recorded 2026-11-03 from `akrogon status --json` on this machine (release ada0dab9, 12 repos, red=0), capture command `akrogon status --json > tests/fixtures/status-envelope.json`. Consumers: `tests/tasks-mod.test.ts` only. Re-record if envelope shape changes (source: src/status.ts schema 1).
- Open limitation: red marking covers the shipped `leafRed` set (failed, missing, undelivered prompt); the "seat `blocked` on a prompt" red variant waits on the herdr-app port leaf (design excludes the port). Panel open-pin end-to-end is the chart's pending check.
- Human-only blockers: none (`akrogon status <slug>` Missing: none; no env names in design/readiness).
