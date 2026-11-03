# Brief U5: mods/needs-you (agents waiting on the operator, with replies and option buttons)

## 1. Goal

Build the new mod `mods/needs-you/`. Plan decisions D1, D2, D14, D15 in `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/plan.md`. Leaf contract: `/home/ivan/Work/infra/herdr-setup/issues/open/right-panel/needs-you-panel/{brief,design}.md` (read both; the design's "Leaf architecture" bullets are binding).

## 2. Acceptance criteria

1. `bun test tests/needs-you.test.js` passes (planned test, not edited by you). It fixes `mods/needs-you/rows.js` exports and shapes: `agentRows(terminals, agents)`, `parseRound(screen)`, `draft(round, picks)`, `recommendedPicks(round)`, `sendAction({status, kind, program})`, `stale(rendered, current)`. The parser rule (D15): an option line matches `^\s*(?:[-•*]\s+)?(\d+)([a-z])[.):]?\s+(\S.*)$`; options group by number in screen order into questions; a round needs every question to hold at least two options; the last round on screen counts only if no reply-start line (`●`, `⏺` or `•` at column 0) follows its last option line; `(recommended)` (case-insensitive) marks a recommended option, and the label keeps the text as written. The fixtures are in `tests/fixtures/needs-you/` (real `hc read --lines 0` screens; read their README).
2. `herdr-app check mods/needs-you` passes.
3. Rows: `agentRows(terminals(), agents())`: `blocked` terminals (sub-agents included) and `done` terminals with no `parent`, joined with `agents()` by `address`; each row shows the logo (the agent's live `program` drawn with the Agents list's `icon()` helper, copied from `mods/agents-by-tab/main.js`), space/tab place, kind (`report.kind` for blocked) or state, waiting time from `status_ms`, the last lines of its screen without terminal chrome, and a reply box.
4. Screen text: `hc(["read", <address>, "--lines", "0", "--json"])` per row (fast, screen only); history (`--lines N`) only when the operator clicks "load the rest" for a round whose first question scrolled off (read once).
5. Option buttons from `parseRound(screen)`; clicking fills an editable draft (`draft(round, picks)`, e.g. "1a | 2b"); "Recommended" fills `recommendedPicks(round)`; Send submits; "elid" sends "elid" at once.
6. Send by `sendAction(row)`: `send` → `hc(["send", address, text])`; `force` → `hc(["send", "--force", address, text])` (only Claude Code questions); `open` → the row's action opens the agent instead of typing.
7. Before any send, re-read the row (`terminals()` now) and refuse with a visible message, typing nothing, when `stale(renderedRow, currentRow)` (terminal gone, status or turn changed).
8. Drafts and picks are keyed by (terminal, turn) and dropped when the turn advances; a row with a half-written draft stays until sent or its turn advances.
9. Clicking a row's name jumps to the agent the way the Agents list does: `pane.focus {pane}` for an agent in a pane, `terminal.peek {terminal}` for a pane-less sub-agent (see `mods/agents-by-tab/main.js`).
10. A reply box that wants to close the panel uses `setShared("panel.request", {op: "toggle", view: "needs-you", seq: Date.now()})`; the top bar owns closing and returning focus.
11. Look: straight outer edges (no outer radius or border), rows inside keep small rounding; colors only from `theme()` tokens; blocked uses the theme's red (`ansi1` per the design's 7a).

## 3. Read first

- `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js` (icon helper lines ~65-68, rows, jump, spinner).
- `~/.config/herdr-app/herdr.d.ts` (terminals, agents, hc, run, shared/setShared, theme, focused), `~/.config/herdr-app/AGENTS.md` mods sections and text input in `~/.config/herdr-app/gpui-kit.d.ts`.
- Proof record of sends per harness: `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/forks/needs-you.md`.
- `/home/ivan/Work/infra/akrogon/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- New `mods/needs-you/mod.json` `{"place": "none", "title": "Needs you"}`, `main.js` (host calls), `rows.js` (pure, no `herdr`/`gpui` imports).
- Owned: `mods/needs-you/**` only. The layout already has `{"id": "needs-you", "type": "block", "content": {"mod": "needs-you"}}` in `panel-body`.

## 5. Do-not, reasons and exceptions

- Do not edit `layouts/`, other mods or `tests/`: A owns them and tests are locked; a wrong or red planned test is a mismatch returned with evidence.
- Do not open herdr-app windows, sessions, `herdrapp`, `herdr-app do|shot`, and do not run `hc send`/`hc run` or launch any agent: live checks (paid agent launches under a grant) run serially by A.
- Never create, rename, move or delete anything under `~/.config/herdr-app/`; read only.
- Reasons: locked tests, one display, paid launches under A's grant, the operator's live config. Exception: a revised brief from A.

## 6. Ordered steps

1. `rows.js` until `bun test tests/needs-you.test.js` is green.
2. `main.js` for criteria 3-11.
3. `herdr-app check mods/needs-you`.
4. Commit your paths only.
Advisory size: about 3 files, under 30 turns.

## 7. Commands

From `/home/ivan/Work/infra/akrogon`:

- `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct --name u5-test -- sh -c "cd /home/ivan/.akrogon/worktrees/herdr-setup/right-panel-u5 && bun test tests/needs-you.test.js"`
- `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct --name u5-check -- sh -c "cd /home/ivan/.akrogon/worktrees/herdr-setup/right-panel-u5 && herdr-app check mods/needs-you"`

## 8. Report

Return the commit id(s) and cite the `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
