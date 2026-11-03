# Design: tasks-mod

## Binding decisions, verbatim

### Tasks board (A4) (`issues/chart/tasks-panel/forks/tasks-panel.md`)

Operator, verbatim: "1b - because it's not unusual for the agents to work for more than 1h. The red is when something's really blocked, not time-dependent | 2a | 3a - ... | 4a | 5a | File the seed." Round 3b: "1a | 2a".

- Red marks real blocks only, never time: failed, prompt not delivered, Missing key, deploy failed, unreadable repo; after the herdr-app port also a seat `blocked` on a prompt. Time shows uncolored. Slow merge stays an amber alert line.
- 2a: a click expands the row (history, seats, plan path, kept paths) with buttons that point Files and Changes at the leaf's worktree. Go to A / Go to B wait for the port.
- 3a + 3b 1a: closed until opened; Tasks button in herdr-setup's top bar; `ctrl-b t` opens Tasks and closes it when Tasks shows.
- 4a: folded "Last merges (5)" across repos with age and total time. 5a: open charts folded under each repo.
- Defaults: `--json` always covers all registered repos; each leaf's detail is embedded; read-only; repo groups with epic/issue folders; alerts on top and tagged on their row; two-line rows with Program logos; current space's repo first; a 60 s redraw while visible; watch each repo's `issues/` plus `~/.akrogon` control paths only.

### Look of the new panels, stage colors and keys (`issues/chart/herdr-panels/forks/look.md`)

Operator, verbatim (round 5): "1b | 2a | 3a - I also need a keyboard shortcut for "Needs you", find the most intuitive one that's not taken | 4a | 5a | 6b - but pick a palette that actually makes sense, not a random one. Do some research on this. It needs to fit the overall Omarchy theme, too (not the colors per se, but saturation, etc) | 7a"

Operator, verbatim (round 5b): "1a | 2a |"

- 1b: straight edges on all four views; no outer radius or border; rows inside keep small rounding.
- 2a: "<logo>A <logo>B", 16 px logos via the agents-by-tab `icon()` helper; no match shows the letter only.
- 3a: top bar ⤢, Tasks, Needs you, Files, Changes; ⤢ left of the buttons.
- 4a: narrow window folds buttons to icons with hover names.
- 5a: Needs you count when > 0 (red when an agent is blocked); Tasks red dot when any row is red.
- 6b + 5b 1a: plan blue `ansi4`, implement cyan `ansi6`, check magenta `ansi5` (fix rounds too), merge green `ansi2`, failed red `ansi1`, parked/stopped/paused grey, yellow `ansi3` only for slow merge. Pill: stage word in `t.foreground` on its own `t.background` base with a ~12% stage tint layer, plus a 6 px stage-colored dot. Merged rows have no pill.
- 7a: red is the theme's `ansi1`; the omarchy hook and Agents list stay as they are.
- 5b 2a: `ctrl-b y` toggles Needs you; `ctrl-b t` toggles Tasks (round 3b); a key over another view switches views.

### Right panel width (`issues/chart/herdr-panels/forks/panel-width.md`)

Operator, verbatim: "1a | 2a | 3a | 4a | 5a | 6a"

- 6a: every right-panel view (Tasks, Needs you, Files, Changes) opens filling the terminal area (`layout.hide main`, panel `{weight: 1}`); the left sidebar stays. ⤡ shrinks to 368 px, ⤢ makes it full again; every new opening starts full. Closing brings the terminal back with keyboard focus in it.
- One open/close routine in the cloned `tabs` mod serves every entry point; other mods reach it through `setShared("panel.request", {op, view, seq})`. flat.json `panel` loses `max: 900`. A space switch restores side size with `main` shown, then that space's remembered panel. A jump to a terminal while full shrinks to side size. When the window starts, `main` shows and the panel is at side size.


Excluded here: the Tasks top-bar button, `ctrl-b t` and the red dot (herdr-setup `panel-top-bar`, which reads `red` itself because a hidden mod does not run); the producer (`status-json`); Go to A/B (the port).

Standing design: `~/.akrogon/current/skills/chart-issues/assets/standing-design.md`. Applied here: the view model is tested over a recorded envelope (re-recorded from a real run, never hand-patched); one live session run for rendering and the panel wiring; no new machinery.

## Leaf architecture

Shared literal interfaces (identical in every leaf that names them; owner in brackets):

- `setShared("panel.request", { op: "toggle" | "open", view: "tasks" | "needs-you" | "files" | "changes", seq: number })` [handled by herdr-setup leaf `panel-top-bar`]. `toggle`: the view showing closes the panel; otherwise it opens that view. `open`: shows that view, never closes. Opening from closed starts full width; switching views while open keeps the current size. `seq` increases per request so a repeated request is a new one.
- `setShared("worktree.pin", { [spaceId: string]: { machine: string | null, folder: string } })` [read and written by `files-panel` and `changes-panel`; written by akrogon leaf `tasks-mod`]. A space without an entry follows the focused pane. `machine: null` means this machine; otherwise a space's `machine` name (C). The `<slug>` in "<slug> worktree is gone" is the last path segment of `folder` (D).
- `workspace.panels` (shared, the shipped tabs mod's list of enabled panel ids) [seeded by `panel-top-bar`]: holds `tasks`, `needs-you`, `files`, `changes`.
- Layout block ids in `layouts/flat.json` `panel-body`: `tasks`, `needs-you`, `files`, `changes`. `panel-top-bar` adds the `tasks` block (mod `tasks`, linked by akrogon) and the `needs-you` block (mod `needs-you`, owned by `needs-you-panel`) (D); `files-panel` and `changes-panel` change only their block's `content.mod`. Every new mod's `mod.json` has `"place": "none"` so herdr-app does not dock a second copy (D).
- `akrogon status --json` envelope field `red`: the number of rows the Tasks board paints red, each red leaf counting once, plus one for a failed deploy and one per unreadable repo or leaf (D) [produced by akrogon leaf `status-json`; read by `tasks-mod` and `panel-top-bar`].
- Agent rows and counts (`panel-top-bar` count, `needs-you-panel` rows): `terminals()` gives `status`, `report.kind`, `status_ms`, `parent` and `turn`; `agents()` gives place and the live `program`, joined by `address`; `AgentInfo` has no kind, parent or turn (`~/.config/herdr-app/herdr.d.ts` `AgentInfo`, `terminals`) (B,C,D). Counted: `blocked` terminals (sub-agents included) and `done` terminals with no `parent`.

Envelope names, verbatim in `status-json` and `tasks-mod` (D):

```text
{ schema: 1, generated: <ms>, red: <n>,
  watch: { folders: [<path>], files: [<path>] },
  deploy: { failed: bool, attempted, active, step, error } | null,
  run: <run line text> | null, kept: [{ path, reason }] (host),
  merges: [{ repo, slug, merged: <ms>, total_ms }] (5),
  repos: [{ name, root, paused, error | null, unreadable: [{ path, error }],
            slow: { leaf, run, ms, normal_ms } | null, unpacked: [{ path, command }],
            queue: [{ slug, place }], kept: [{ path, reason }], charts: [<--charts row cells>],
            leaves: [{ slug, group: [<folder>], phase, phase_since, first_prompt, stopped, blocked_by: [{ slug, label }],
                       broadcast_pending, land, busy_since: { a, b }, done, attempts, fix_rounds, verdict,
                       delivery_errors, failure, missing: [{ kind, name, holder, steps }], worktree, plan,
                       red: bool, seats: { a: { harness, command, source }, b: { harness, command, source } },
                       history: [<line>] (10) }] }] }
```

Owned: the mod folder in akrogon (path chosen by the plan, e.g. `herdr-app/tasks/`, holding `mod.json` with `"place": "none"`, `main.js` and pure modules) and `src/install.ts` link planning: the link goes through `planSkillLinks`/`applySkillLinks`, which both `install()` and the self-update deploy (`src/self-update.ts` `deployStage`) apply, so a deploy after merge creates it too; `tests/self-update.test.ts`'s fixture repo must stay valid (D). herdrapp links personal mods from `~/.config/herdr-app/mods` into every session on open. Block `tasks` in herdr-setup's flat.json is `panel-top-bar`'s.

- Data: `exec("akrogon", ["status", "--json"])` (proof P5: `akrogon` resolves on PATH from a mod, ~370 ms for all repos, far under the 30 s / 8 MiB exec limits); `watchFolder` (recursive) on each `watch.folders` entry. Open for the plan: how changes to `watch.files` reach the board without a recursive watch of `~/.akrogon` (B).
- Logos: `knownAgents()` (proof in `readiness.yaml`) matched by `key` or `run[0]` against the JSON's harness key and command first word.
- `TextView` (if used) imports from `gpui-base`.
- Open for the plan: the akrogon test runner must import the pure modules without `gpui-kit` or `herdr` (host-only modules), keeping host imports in `main.js`; herdr-app loads `.js` while akrogon's `typecheck` runs strict `tsc` without `allowJs`, so the pure module needs a typed boundary (D).
