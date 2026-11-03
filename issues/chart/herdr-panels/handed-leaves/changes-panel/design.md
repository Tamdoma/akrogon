# Design: changes-panel

## Binding decisions, verbatim

### Files and Changes (A1-A3) (`issues/chart/herdr-panels/forks/files-changes.md`)

Operator, verbatim: "1a | 2a | 3a | 4a | 5a | 6a"

- 1a: Files and Changes are cloned into herdr-setup (ids `files`, `changes`). Each opens in today's view; additions are one header control row.
- 2a: the Commit message and button are removed from Changes.
- 3a: Changes views Working (default) | Branch (merge base with the default branch: `origin/HEAD`, else `main`, else `master`, shown) | Commits (last 20; click shows that commit's files and diff; merges against the first parent, root against the empty tree). Empty Working on a branch offers "view Branch diff (N files)"; an empty Branch says "nothing on this branch beyond <base>".
- 4a: Files gets a Recent button beside the filter: uncommitted files first, then files from the last 20 commits that still exist.
- 5a: no open-as-pane button.
- Defaults agreed by all seats: formatted markdown with Raw; repo-wide name filter (`git ls-files -co --exclude-standard`, hidden outside git); one worktree pin per space shared by both panels, {machine, folder}, label with repo (branch), list from `git worktree list --porcelain`, × follows the focused pane again; a vanished pin shows "<slug> worktree is gone" until × or another pick; an open file re-reads when it changes on disk; git reads keep the no-lock flags.

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


Excluded here: Files views (`files-panel`); full width (`panel-top-bar`); Tasks' Changes button (akrogon `tasks-mod`).

Standing design: `~/.akrogon/current/skills/chart-issues/assets/standing-design.md`. Applied here: real git in temporary repos inside tests; no machinery; live checks only for rendering.

## Leaf architecture

Shared literal interfaces (identical in every leaf that names them; owner in brackets):

- `setShared("panel.request", { op: "toggle" | "open", view: "tasks" | "needs-you" | "files" | "changes", seq: number })` [handled by herdr-setup leaf `panel-top-bar`]. `toggle`: the view showing closes the panel; otherwise it opens that view. `open`: shows that view, never closes. Opening from closed starts full width; switching views while open keeps the current size. `seq` increases per request so a repeated request is a new one.
- `setShared("worktree.pin", { [spaceId: string]: { machine: string | null, folder: string } })` [read and written by `files-panel` and `changes-panel`; written by akrogon leaf `tasks-mod`]. A space without an entry follows the focused pane. `machine: null` means this machine; otherwise a space's `machine` name (C). The `<slug>` in "<slug> worktree is gone" is the last path segment of `folder` (D).
- `workspace.panels` (shared, the shipped tabs mod's list of enabled panel ids) [seeded by `panel-top-bar`]: holds `tasks`, `needs-you`, `files`, `changes`.
- Layout block ids in `layouts/flat.json` `panel-body`: `tasks`, `needs-you`, `files`, `changes`. `panel-top-bar` adds the `tasks` block (mod `tasks`, linked by akrogon) and the `needs-you` block (mod `needs-you`, owned by `needs-you-panel`) (D); `files-panel` and `changes-panel` change only their block's `content.mod`. Every new mod's `mod.json` has `"place": "none"` so herdr-app does not dock a second copy (D).
- `akrogon status --json` envelope field `red`: the number of rows the Tasks board paints red, each red leaf counting once, plus one for a failed deploy and one per unreadable repo or leaf (D) [produced by akrogon leaf `status-json`; read by `tasks-mod` and `panel-top-bar`].
- Agent rows and counts (`panel-top-bar` count, `needs-you-panel` rows): `terminals()` gives `status`, `report.kind`, `status_ms`, `parent` and `turn`; `agents()` gives place and the live `program`, joined by `address`; `AgentInfo` has no kind, parent or turn (`~/.config/herdr-app/herdr.d.ts` `AgentInfo`, `terminals`) (B,C,D). Counted: `blocked` terminals (sub-agents included) and `done` terminals with no `parent`.

Owned: `mods/<changes clone>/` (never `changes`; `cloned_from`), flat.json `changes` block content. Block id stays `changes`.

- Shipped source: `~/.config/herdr-app/mods/changes/main.js`; `commit()` (`git add -A`, `git commit -m`) and its row are removed; `READ` no-lock flags kept for every git read.
- List and diff share captured endpoints (base SHA and HEAD SHA read once per refresh) so a moving HEAD never mixes two states.
- Pin: same `worktree.pin` contract as `files-panel`; Open for the plan: cross-mod `setShared` re-render, as in `files-panel`.
