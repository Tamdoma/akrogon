# Design: panel-top-bar

## Binding decisions, verbatim

### Right panel width (`issues/chart/herdr-panels/forks/panel-width.md`)

Operator, verbatim: "1a | 2a | 3a | 4a | 5a | 6a"

- 6a: every right-panel view (Tasks, Needs you, Files, Changes) opens filling the terminal area (`layout.hide main`, panel `{weight: 1}`); the left sidebar stays. ⤡ shrinks to 368 px, ⤢ makes it full again; every new opening starts full. Closing brings the terminal back with keyboard focus in it.
- One open/close routine in the cloned `tabs` mod serves every entry point; other mods reach it through `setShared("panel.request", {op, view, seq})`. flat.json `panel` loses `max: 900`. A space switch restores side size with `main` shown, then that space's remembered panel. A jump to a terminal while full shrinks to side size. When the window starts, `main` shows and the panel is at side size.

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

### Where the panel code lives and which layout gets it (`issues/chart/herdr-panels/forks/code-home.md`)

Operator, verbatim: "Yes, and it needs to be turned into a repo. I've created the remote repo so it needs to be connected to it: https://github.com/Tamdoma/herdr-setup.git. Also, we need to make sure that all of the customizations I've done so far on herdr-app for myself are also there, not just the layout itself." and "push both, then next round. Make sure that what we do is the default layout. I want everything we're doing to be the default layout. Is that clear?"

Settled: general panels (Files, Changes, Needs you, top bar, Spaces) live in `/home/ivan/Work/infra/herdr-setup`; only the Tasks board ships from akrogon (chart `issues/chart/tasks-panel`). Every change goes into `layouts/flat.json`, the default layout; `board` gets none. Foreclosed: panels inside akrogon; registering omarchy-customizations.


Excluded here: the Files, Changes, Needs-you and Tasks views themselves (their leaves); Spaces heights (`spaces-scroll`).

Standing design: `~/.akrogon/current/skills/chart-issues/assets/standing-design.md`. Applied here: no secrets or auth involved; proof is the smallest real boundary: a pure routine module under `bun test` for the decision table, and live throwaway-session runs for window behavior no smaller check shows (full width, focus, restart). No new test machinery: the live runs use `herdr-app` and `herdrapp` as they are.

## Leaf architecture

Shared literal interfaces (identical in every leaf that names them; owner in brackets):

- `setShared("panel.request", { op: "toggle" | "open", view: "tasks" | "needs-you" | "files" | "changes", seq: number })` [handled by herdr-setup leaf `panel-top-bar`]. `toggle`: the view showing closes the panel; otherwise it opens that view. `open`: shows that view, never closes. Opening from closed starts full width; switching views while open keeps the current size. `seq` increases per request so a repeated request is a new one.
- `setShared("worktree.pin", { [spaceId: string]: { machine: string | null, folder: string } })` [read and written by `files-panel` and `changes-panel`; written by akrogon leaf `tasks-mod`]. A space without an entry follows the focused pane. `machine: null` means this machine; otherwise a space's `machine` name (C). The `<slug>` in "<slug> worktree is gone" is the last path segment of `folder` (D).
- `workspace.panels` (shared, the shipped tabs mod's list of enabled panel ids) [seeded by `panel-top-bar`]: holds `tasks`, `needs-you`, `files`, `changes`.
- Layout block ids in `layouts/flat.json` `panel-body`: `tasks`, `needs-you`, `files`, `changes`. `panel-top-bar` adds the `tasks` block (mod `tasks`, linked by akrogon) and the `needs-you` block (mod `needs-you`, owned by `needs-you-panel`) (D); `files-panel` and `changes-panel` change only their block's `content.mod`. Every new mod's `mod.json` has `"place": "none"` so herdr-app does not dock a second copy (D).
- `akrogon status --json` envelope field `red`: the number of rows the Tasks board paints red, each red leaf counting once, plus one for a failed deploy and one per unreadable repo or leaf (D) [produced by akrogon leaf `status-json`; read by `tasks-mod` and `panel-top-bar`].
- Agent rows and counts (`panel-top-bar` count, `needs-you-panel` rows): `terminals()` gives `status`, `report.kind`, `status_ms`, `parent` and `turn`; `agents()` gives place and the live `program`, joined by `address`; `AgentInfo` has no kind, parent or turn (`~/.config/herdr-app/herdr.d.ts` `AgentInfo`, `terminals`) (B,C,D). Counted: `blocked` terminals (sub-agents included) and `done` terminals with no `parent`.

Owned: `mods/<tabs clone>/` (folder name chosen by the plan, never `tabs`, which is shipped; `mod.json` carries `cloned_from` from the shipped tabs mod), `layouts/flat.json` (`tabs` block's mod, `panel` without `max`, `panel-body` gains `{"id":"tasks","type":"block","content":{"mod":"tasks"}}` and `{"id":"needs-you","type":"block","content":{"mod":"needs-you"}}`) (D), `mods/prefix/main.js` (`ACTIONS` gain `t` and `y`, `f` goes through `panel.request` `open`), `bin/herdrapp` and `install` (seed `workspace.panels`).

- State this changes: `panel` hidden/size and `main` hidden, saved per layout in each session's `layouts/.state/flat.json` (proof P6). Consumers: herdr-app's layout engine on every window start; the shipped tabs memory `syncPanel` (per-space panel choice in the mod's `localStorage`, key `panels`). The clone keeps `syncPanel`'s per-space memory; `localStorage` is per mod copy (AGENTS.md "Other built-ins"), so a renamed clone starts empty and seeds its `panels` once from the shipped mod's store, `readTextFile(appHome() + "/data/tabs/store.json")` (`{"panels": "<json>"}`, seen in `~/.config/herdr-app/data/tabs/store.json`) (B,D).
- Window start (criterion 6): the clone's first render after load shows `main` and sets the panel to `{px: 368}` when `main` is hidden.
- Focus jumps (criterion 7): the clone compares `focused().terminal` across renders while `main` is hidden.
- Prefix keys reach the routine only through `panel.request`: mods cannot call each other, and `nextCommand()` serves only `keys.json` bindings (`~/.config/herdr-app/herdr.d.ts` `nextCommand`).
- Gating (criterion 4): a button shows when `workspace.panels` holds its id and the mod its `panel-body` block names (`content.mod`, read from `layout()`, not the block id) is shipped (`appHome() + "/installed.json"`) or present (`readTextFile(appHome() + "/mods/<mod>/mod.json")`); the `tasks` mod comes from akrogon (`akrogon install` links it), `needs-you` from `needs-you-panel` (D).
- Needs-you count (criterion 10): the agent rows rule in the interfaces above (B,C,D). Tasks red dot: a mod in a hidden panel does not run (probe4), so the bar itself runs `exec("akrogon", ["status", "--json"])` and reads `red`; a rejected exec (no akrogon) or an exit without a parsable envelope (an older release) means no dot (B,C). Rerun on changes in the envelope's `watch.folders` (`watchFolder` is recursive, so never `~/.akrogon` itself, whose `worktrees/` changes on every build) without overlapping runs. Open for the plan: how changes to the envelope's `watch.files` reach the dot without a recursive watch of `~/.akrogon` (B).
- Look: buttons use the shipped `panelButton` shape; ⤢/⤡ icon only; icon-only buttons carry their name as tooltip and accessible label (`gpui-kit.d.ts` tooltip/accessibility) (B); stage colors do not apply here.

Proofs: P6 (`readiness.yaml`).
