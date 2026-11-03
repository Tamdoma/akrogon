# Design: needs-you-panel

## Binding decisions, verbatim

### Needs you: agents waiting on the operator (A5, A6) (`issues/chart/herdr-panels/forks/needs-you.md`)

Operator, verbatim: "1a | 2a | 3a | 4a | 5 - draw it so I can see it. I like the way the terminal area is done here. I don't want to change that main part. I want it all to be under the new pane like what Files and Changes are today." Then, after the drawing: "I don't want to be complicating the existing interfaces. I like what they are today."

- 1a: Needs you lists agents stuck on a prompt (`blocked`, with hc's `kind`) and every top-level agent that finished (`done`), each with its last lines and a reply box. Sub-agents appear only when blocked. A row with a half-written reply stays until sent or its turn advances.
- 2a: options come from the agent's visible screen (`hc read --lines 0`); buttons only when the last reply has 2+ options sharing a number, a "(recommended)" mark, or a "Reply `1a 2b`" line; a "load the rest" button reads history once when question 1 scrolled off. Done-criterion: real saved screens from claude, codex, pi and agy as fixtures, zero false buttons.
- 3a: finished agents get plain `hc send`; `blocked` with `kind: question` gets `hc send --force` only where a per-harness probe proved it (Claude Code), otherwise the button opens the agent (Antigravity); permission and auth always open the agent. Re-check terminal, state and turn right before sending; refuse on change.
- 4a: option buttons fill an editable draft, Send submits; "Recommended" fills every recommended pick; "elid" sends "elid" at once.
- Q5: Needs you is a right-panel view beside Files and Changes; the terminal area and the left Agents list stay as they are.
- Q6, operator, verbatim: "ok, do a | push". herdr-core should report a Codex question as `blocked`; Needs you adds no title parsing. Until then a Codex question shows only in its terminal. Reported through `herdr-app feedback`. Foreclosed: reading Codex's "Action Required" title.

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


Excluded here: the top-bar button, count and `ctrl-b y` (`panel-top-bar`); Codex question detection (herdr-core, reported); the left Agents list (unchanged).

Standing design: `~/.akrogon/current/skills/chart-issues/assets/standing-design.md`. Applied here: the parser is proven over real recorded screens committed as fixtures (re-recorded, never hand-patched); sends are real `hc` calls in a throwaway session; no new machinery.

## Leaf architecture

Shared literal interfaces (identical in every leaf that names them; owner in brackets):

- `setShared("panel.request", { op: "toggle" | "open", view: "tasks" | "needs-you" | "files" | "changes", seq: number })` [handled by herdr-setup leaf `panel-top-bar`]. `toggle`: the view showing closes the panel; otherwise it opens that view. `open`: shows that view, never closes. Opening from closed starts full width; switching views while open keeps the current size. `seq` increases per request so a repeated request is a new one.
- `setShared("worktree.pin", { [spaceId: string]: { machine: string | null, folder: string } })` [read and written by `files-panel` and `changes-panel`; written by akrogon leaf `tasks-mod`]. A space without an entry follows the focused pane. `machine: null` means this machine; otherwise a space's `machine` name (C). The `<slug>` in "<slug> worktree is gone" is the last path segment of `folder` (D).
- `workspace.panels` (shared, the shipped tabs mod's list of enabled panel ids) [seeded by `panel-top-bar`]: holds `tasks`, `needs-you`, `files`, `changes`.
- Layout block ids in `layouts/flat.json` `panel-body`: `tasks`, `needs-you`, `files`, `changes`. `panel-top-bar` adds the `tasks` block (mod `tasks`, linked by akrogon) and the `needs-you` block (mod `needs-you`, owned by `needs-you-panel`) (D); `files-panel` and `changes-panel` change only their block's `content.mod`. Every new mod's `mod.json` has `"place": "none"` so herdr-app does not dock a second copy (D).
- `akrogon status --json` envelope field `red`: the number of rows the Tasks board paints red, each red leaf counting once, plus one for a failed deploy and one per unreadable repo or leaf (D) [produced by akrogon leaf `status-json`; read by `tasks-mod` and `panel-top-bar`].
- Agent rows and counts (`panel-top-bar` count, `needs-you-panel` rows): `terminals()` gives `status`, `report.kind`, `status_ms`, `parent` and `turn`; `agents()` gives place and the live `program`, joined by `address`; `AgentInfo` has no kind, parent or turn (`~/.config/herdr-app/herdr.d.ts` `AgentInfo`, `terminals`) (B,C,D). Counted: `blocked` terminals (sub-agents included) and `done` terminals with no `parent`.

Owned: `mods/needs-you/` and flat.json's `panel-body` block `{"id":"needs-you","type":"block","content":{"mod":"needs-you"}}`.

- Data: the agent rows rule in the interfaces above (`terminals()` joined with `agents()`) (B,C,D); screen text from `hc(["read", <t>, "--lines", "0", "--json"])` (1 ms, screen only); history (`--lines N`) only on "load the rest", since it scrolls a full-screen app (2.5 s, round 2 measured fact).
- Sends (proof in `readiness.yaml`): `hc(["send", <t>, <text>])` from the mod types into this session's terminal; plain send to a blocked agent is refused by hc ("is blocked (question)"); `--force` answered Claude Code correctly and picked the wrong option in Antigravity; Pi asks by printing and ending `done`; Codex shows a question while hc says `working`, so it does not appear here (herdr-core's change).
- Harness identity for send rules: the live `program.key` (claude, codex, pi, antigravity); logos from the live `program`, not `knownAgents()` (B).
- Jump: the command the Agents list uses for the same agent (`pane.focus {pane}` for a pane agent, `terminal.peek {terminal}` for a pane-less sub-agent, `~/.config/herdr-app/mods/agents-by-tab/main.js`) (D); a pane focus while full shrinks the panel (`panel-top-bar`); a peek opens over it.
- Draft and options keyed by (terminal, turn), dropped when the turn advances.
