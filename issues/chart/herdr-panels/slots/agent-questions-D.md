# Fork Notes: Agent Questions (A5 Needs-You & A6 Decision Buttons) — Seat D

## 1. What should count as "an agent needs you" in the Needs-you list, and what text should a row show?

### (1) Pick, reason, and cost
- **Pick**:
  - **Who qualifies**:
    1. Every live agent or sub-agent whose status is `blocked` (or `error`, mapped to `blocked` as in `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:45-48`).
    2. Every **top-level** (`!t.parent` in `terminals()`) agent in `done` status—plus the currently focused top-level agent held from `done -> idle` (`/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:117-129`)—whose visible screen (`hc(["read", addr, "--lines", "0", "--json"])`, cached by `${addr}:${turn}`) ends with a question or coded-option prompt (`?` in the last non-chrome lines, `Reply \`1a`, or `- **1a`).
  - **Order**: `blocked` first, then question-bearing `done`, sorted oldest-waiting first (`t.status_ms` from `hc schema` `Terminal.status_ms`).
  - **What a row shows**:
    - *Top line*: Program icon (`icon(a.program, 14, t.foreground)` at `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:66-69`), `space_name · tab_name` label (`agents-by-tab/main.js:271-281`), kind badge (`t.report?.kind ?? "blocked"` in `t.blocked` for blocked; `"question"` in `t.done` for `done`), and waiting age (`duration(now - t.status_ms)`).
    - *Body (2–3 lines, click to focus pane)*: `t.report?.msg` if present and distinct, plus the last 2–3 non-chrome lines extracted from cached `hc read <addr> --lines 0 --json` (stripping TUI chrome lines `────`, `❯`, `CC │`, `⏵⏵ auto mode`).
    - *Controls*: Inline reply `Input` + `[Send]` for conversational `done` questions and `blocked` (`kind === "question"`), or `[Open pane]` (+ quick-key action) for `blocked` (`kind === "permission"` / `"auth"`).
  - **Placement**: Rendered at the top of `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:405` (above the `Agents` header) so it collapses to `0px` when empty without `layout.hide` state writes.
- **Reason**:
  - Sub-agents (`t.parent != null`, e.g., `slot-b`, `slot-c`, `slot-d` under `t15`) report to their parent terminal and are never waiting on the operator when `done` (`/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:43-48`). Excluding `done` sub-agents prevents consultant panes from flooding `Needs-you` whenever their notes mention `?` or `1a`/`1b`.
  - Filtering `done` top-level agents for a question/option cue avoids duplicating the existing `Done` section in `agents-by-tab/main.js:54` for agents that simply completed a build or command without asking anything.
- **Cost**: Requires one cached `hc read <addr> --lines 0 --json` call (measured at `1 ms`, `"how": "screen"`) each time a top-level agent enters `done`, and heuristic question matching on the last non-chrome lines can miss an unusual phrasal question without `?` or option codes (which still remains visible in the `Done` section immediately below).

### (2) Rejected options
- **Only `status === "blocked"`**: Rejected because chart doors (`t15`) and conversational agent turns finish their turn as `done` (turning `idle` when focused) when asking `1a`/`1b` or free-text questions (`INTAKE.md` `## Agent findings`).
- **Every `status === "done"` agent (including plain `done` and sub-agents)**: Rejected because (a) `agents-by-tab/main.js:54` already lists all `done` agents under `Done` right below, (b) showing a reply input box on agents that finished without asking a question is noise, and (c) including `done` sub-agents (`slot-b`, `slot-c`, `slot-d`) falsely flags peer consultants that report to `t15`.
- **Standalone `needs-you` layout block in `layouts/flat.json`**: Rejected because layout children in `sidebar-lists` (`/home/ivan/Work/infra/herdr-setup/layouts/flat.json:24-45`) reserve their `size`/`min` even when empty (`/home/ivan/.config/herdr-app/AGENTS.md` `## Layouts: layouts/<name>.json`), and toggling `layout.hide`/`layout.show` writes `layouts/.state/flat.json` on every status change.

### (3) Evidence
- `operator`: `INTAKE.md` (`## Agent findings`, A5) — Needs-you sits above Agents in the left sidebar only when an agent waits, showing question text and an inline reply box (2026-11-03).
- `better-than-training`: `/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:43-56,117-129,222-224` — priority sort already groups `4: "Needs you"` (`blocked`) and `3: "Done"`, holds a focused `done` agent in `Done` until unfocused, and treats `done` sub-agents (`parent != null`) as `idle` because they report to their parent (2026-11-03).
- `better-than-training`: `hc ls --json` and `hc schema` (`Status`, `Terminal`, `ReadResult`) — `t2s`/`t2t`/`t2v` carry `"parent": "t15"`; `time hc read t3 --lines 0 --json` completes in `0.001s` (`"how": "screen"`) while `hc read t15 --lines 60 --json` shows bottom TUI chrome lines (`────`, `❯`, `CC │ ...`, `⏵⏵ auto mode`) that must be stripped to expose the question tail (2026-11-03).

### (4) Pitfalls and what removes each
- **Consultant sub-agents (`slot-b`/`c`/`d`) popping into Needs-you when their turn ends**: Removed by the option choice excluding `t.parent != null` from `done` question detection (only `blocked`/`error` sub-agents surface).
- **Looking at a `done` agent turns its status to `idle` and makes its Needs-you card vanish while the operator is reading or typing into the reply box**: Removed by an option choice + done-criterion reusing `this.hold(list)` (`/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:117-129`) and pinning any row with non-empty draft text in `Input` until sent, dismissed, or its `turn` advances.
- **TUI status bars (`CC │ 41% ...`, `────`) shown instead of the question**: Removed by a done-criterion stripping trailing horizontal rule blocks and prompt/status footer lines when extracting the 2–3 preview lines from `hc read --lines 0`.

### (5) Unasked question
- When a top-level agent finishes (`status === "done"`) *without* a detected question mark or option code, should it stay only in the existing `Done` section of `agents-by-tab`, or should `Needs-you` also show a collapsed `"N finished"` pill?

---

## 2. How should the decision buttons (A6) find the current question's options reliably?

### (1) Pick, reason, and cost
- **Pick**: **Two-stage screen-first parser keyed on `${terminal}:${turn}` (1 ms `hc read --lines 0 --json` first; on-demand `hc read --lines 80 --json` only when screen shows a truncated multi-question round), rendered as a conditional bottom bar inside a cloned `mods/pane` wrapper.**
  - *Why two-stage `--lines 0` $\rightarrow$ `--lines 80` is critical*:
    - We measured `hc read` on an `idle` Claude Code terminal (`t3`) on 2026-11-03:
      - `hc read t3 --lines 0 --json` returned `"how": "screen"` in **1 ms (`0.001s`)** without touching the terminal.
      - `hc read t3 --lines 80 --json` returned `"how": "stitched"` in **2,489 ms (`2.49s`)** because `herdr-core` physically scrolls a full-screen TUI app to stitch history (`hc schema` `ReadResult.how`).
    - Running `--lines 120` unconditionally on every focus or turn change would freeze/scroll the operator's terminal for 2.5 seconds!
  - *Detection pipeline (run once per `${address}:${turn}` for live top-level agents in `done`/`idle`/`blocked`)*:
    1. **Stage 1 (`--lines 0`, 1 ms)**: Read visible screen via `hc(["read", addr, "--lines", "0", "--json"])`. Slice text after the last user input prompt (`❯` or `>`) and above the bottom TUI chrome (`────`).
    2. **Strict line-anchored grammar**: Match option lines matching `^\s*(?:[-*•]\s*)?(?:\*\*|`)?0?([1-9]\d?)([a-z])\b(?:\s*\((recommended)\))?(?:\*\*|`|\)|\.|:|\s+[—–-])\s*(.+)` (covering `- **1a (recommended)** ...`, `- **1b** ...`, `1a) ...`, `01a ...` per `/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md` `# Operator questions and peer exchange`). Group by question number `q`; keep groups with $\ge 2$ distinct letter options (`1a`, `1b`) OR `(recommended)` OR an explicit reply footer (`Reply \`1a`).
    3. **Stage 2 (`--lines 80`, only when truncated)**: If Stage 1 detects question group `2` or higher (or a `Reply \`1a 2b\`` footer) while group `1` is missing (scrolled above the viewport), run `hc(["read", addr, "--lines", "80", "--json"])` once for that `${address}:${turn}` (or expose a `[↑ Load Q1]` chip) and cache the full group list in memory.
  - *Placement*: Clone shipped `/home/ivan/.config/herdr-app/mods/pane/main.js:68-73` into `/home/ivan/Work/infra/herdr-setup/mods/pane/main.js` and render the strip as a conditional bottom child of `pane`'s `v_flex()` when `p.focused` has cached options.
- **Reason**: Zero TUI scroll disruption in the common case (1 ms screen read), captures scrolled multi-question rounds when needed, requires zero changes to agent harnesses outside `herdr-setup`, and docking inside `pane` shrinks `terminal(id).flex_1()` cleanly instead of covering the terminal's bottom input line.
- **Cost**: Requires cloning `pane` (`mods/pane`) and wiring `"pane": { "mod": "pane" }` in `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:93`; when a round is taller than the screen and triggers Stage 2, that one read takes ~2.5 s while stitching history.

### (2) Rejected options
- **Unconditional `hc read --lines 120` on every turn/focus**: Rejected because `--lines > 0` on an `idle`/`done` full-screen TUI triggers `"how": "stitched"`, scrolling the terminal and taking `2,489 ms` (measured on `t3`, 2026-11-03).
- **Require agents to write structured question records to `doc.set` or files (never parse prose)**: Rejected because `herdr-panels` lives in `/home/ivan/Work/infra/herdr-setup` (`INTAKE.md` `## Round 1`); ad-hoc Claude Code, Codex, Pi, and Antigravity sessions do not write `doc.set` records when asking `1a`/`1b` questions in prose.
- **Parse only 2+ contiguous coded lines after the last blank line**: Rejected because chart-door rounds (`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md` `# Operator questions and peer exchange`) put blank lines between `### 1`, `### 2`, `Pitfalls avoided:`, and `Reply \`1a 2b\``, so only-after-last-blank-line misses every question group.
- **Floating layout block (`floating` in `flat.json`)**: Rejected because floating blocks cover the bottom rows of the terminal (hiding the agent's prompt line) and do not resize with `main` when `sidebar` or `panel` resizes (`/home/ivan/.config/herdr-app/AGENTS.md` `### Floating blocks`).

### (3) Evidence
- `better-than-training`: Measured via `time hc read t3 --lines 0 --json` (`0.001s`, `"how": "screen"`) vs `time hc read t3 --lines 80 --json` (`2.489s`, `"how": "stitched"`) and `hc schema` (`ReadResult.how`: `"screen", "history", or "stitched" (a full-screen app, read by scrolling it)`) (2026-11-03).
- `better-than-training`: `/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md` (`# Operator questions and peer exchange`) — defines `- **1a (recommended)** ...`, `- **1b** ...`, multi-question sections `### 1 ·`, `### 2 ·`, and `Reply \`1a 2b\`, or a numbered free-text answer.` (2026-11-03).
- `better-than-training`: `/home/ivan/.config/herdr-app/mods/pane/main.js:68-73` and `/home/ivan/.config/herdr-app/AGENTS.md` (`### Pane frames`, `### Floating blocks`) — `pane` wraps `terminal(id).flex_1()` in a `v_flex().size_full()`, allowing a conditional footer bar without mutating `layouts/.state/flat.json` or occluding terminal text (2026-11-03).

### (4) Pitfalls and what removes each
- **`hc read --lines > 0` scrolling the live TUI for 2.5 s when focusing an idle pane**: Removed by the option choice to run `--lines 0` (`1 ms`, `"how": "screen"`) first and only invoke `--lines 80` once per `${address}:${turn}` when Stage 1 detects a truncated multi-question round (group $\ge 2$ or `Reply \`1a` footer without group `1`).
- **Stale options from an earlier round in scrollback**: Removed by slicing after the last user prompt line (`❯` / `>`) and keying cache on `${address}:${turn}` (`Terminal.turn` increments every time status leaves `working`, per `hc schema` `Terminal.turn`).
- **False positives on git SHAs (`8a4f1b`) or durations (`15m`, `2h`)**: Removed by requiring line-start option syntax and $\ge 2$ options in a question group or `(recommended)` / `Reply \`1a`.

### (5) Unasked question
- When a multi-question round is taller than the terminal viewport (so `1a`/`1b` scrolled off the top and only `2a`/`2b` + `Reply \`1a 2b\`` are on screen), should Stage 2 auto-run `hc read --lines 80` once (~2.5 s scroll stitch) or show a `[↑ Load Q1]` button so the terminal never scrolls unless clicked?

---

## 3. How should a reply be delivered, for an agent that is idle/done versus one that is blocked (permission, question, auth)?

### (1) Pick, reason, and cost
- **Pick**: **State-aware, turn-revalidated delivery:**
  1. **Capture at render, revalidate at click**: Record `{ address, turn, status, kind }` from `terminals()` when rendering the row or decision strip. On submit, re-read `terminals().find(t => t.address === address)`. Abort and display an inline error if `!t || t.state !== "live" || t.turn !== capturedTurn || t.status === "working"`.
  2. **When `status` is `done` or `idle` (conversational/chart-door reply in A5 or A6)**:
     - If `t.status === "idle"`, run `hc(["send", "--json", "--if", "idle", address, text])`.
     - If `t.status === "done"` (e.g., replying from the A5 sidebar to an unfocused pane that hasn't turned `idle` yet), run `hc(["send", "--json", address, text])` **without** `--if idle` (because `hc send --if idle` refuses `done` with `status_mismatch`!), relying on the JS `t.turn === capturedTurn && t.status === "done"` check immediately before the call.
  3. **When `status` is `blocked` (`t.status === "blocked"`), branch by `t.report?.kind`**:
     - **`kind === "auth"`**: Do not show a text box; render `[Open terminal]` (`run("pane.focus", { pane: a.pane })` or `run("terminal.peek", { terminal: a.address })`).
     - **`kind === "permission"` (or numbered TUI menu on screen)**: Primary button `[Open terminal]`, plus optional quick-key buttons (`[1 · Yes]`, `[Esc]`) using `hc(["keys", "--json", address, key])` (`hc schema` `terminal.keys`) rather than `hc send`, because TUI permission selectors expect raw keystrokes (`1`, `Enter`, `Esc`), not pasted lines.
     - **`kind === "question"` (or free-text prompt while blocked)**: Send via `hc(["send", "--json", "--force", address, text])` after confirming `t.turn === capturedTurn && t.status === "blocked"`.
- **Reason**: Prevents `status_mismatch` failures on unfocused `done` agents, respects `terminal.send`'s `blocked` guard (`hc schema` `terminal.send`), avoids pasting text into `auth`/`permission` TUI dialogs, and blocks stale sends if a turn changed.
- **Cost**: Slightly more branching in the send helper (~25 lines of JS) to inspect `t.status`, `t.turn`, and `t.report?.kind`.

### (2) Rejected options
- **Always `hc send --if idle` for non-blocked agents**: Rejected because unfocused agents that finished a turn have `status === "done"` until viewed (`/home/ivan/.config/herdr-app/herdr.d.ts:163`), and `hc send --if idle` refuses `done` (`agent-questions-brief.md` `## Context`).
- **Always `hc send --force` on every send**: Rejected because if an agent transitioned from `done` to `blocked` (e.g. a background permission dialog popped up) between render and click, `--force` would type a conversational reply (`"1a | 2b"`) straight into a permission dialog.
- **Free-text `hc send --force` into `permission` or `auth` dialogs**: Rejected because OAuth flows and arrow-key TUI permission menus cannot be answered reliably by pasting a line + Enter.

### (3) Evidence
- `better-than-training`: `agent-questions-brief.md` (`## Context`), `hc send --help`, and `hc schema` (`terminal.send`, `terminal.keys`, `Status.kind`) — `--if` only accepts `idle` or `working` and refuses `done`; `terminal.send` refuses `blocked` unless `force: true`; `Status.kind` distinguishes `"permission"`, `"question"`, and `"auth"` (2026-11-03).
- `better-than-training`: `hc schema` (`terminal.send` parameter `caller`) — `caller` defaults to `HC_TERMINAL_ID` else the calling process's parent; when `HC_TERMINAL_ID` is unset in the GUI process, `hc send` sends plain user text without `<hc from="...">` tags (2026-11-03).

### (4) Pitfalls and what removes each
- **`herdr-app` inheriting `HC_TERMINAL_ID` if launched from inside a Herdr terminal, causing `hc send` to wrap operator replies in `<hc from="...">` tags**: Removed by a probe before handoff + option choice to strip `HC_TERMINAL_ID` (`exec("env", ["-u", "HC_TERMINAL_ID", "hc", "send", ...])`) if present.
- **`terminal.send` waiting ~3 s if the operator just typed in the terminal (`hc schema` `terminal.send`)**: Removed by a done-criterion showing a `"Sending…"` spinner state on the `[Send]` button until the `hc(["send", ...])` promise resolves and surfacing any non-zero exit / JSON error inline.
- **Wrong-turn send after focus or turn change**: Removed by capturing `turn` at render and revalidating `t.turn === capturedTurn` immediately before invoking `hc`.

### (5) Unasked question
- For `blocked` agents with `kind === "permission"`, does the operator want `[1 · Approve]` / `[Esc]` quick-key buttons (`hc keys`) in the Needs-you row, or strictly `[Open terminal]` so permission prompts are always approved in the terminal?

---

## 4. Should the decision strip have shortcut buttons beyond the options (for example "all recommended", "elid"), and should a click send at once or build an editable draft?

### (1) Pick, reason, and cost
- **Pick**: **Build an editable draft by default (never blind single-click send), with `[★ Recommended]`, `[elid]`, per-question option chips (`[1a ★]`, `[1b]`, `[2a ★]`, `[2b]`), an inline draft/note `Input`, and an explicit `[Send ↵]` button (plus `Ctrl+Click` on any chip to send immediately).**
  - *How the composer works*:
    - Clicking `[1a ★]` sets Q1's choice to `1a` in the draft (replacing `1b` if Q1 was already picked) and formats the draft `Input` as `1a` or `1a | 2b`.
    - Clicking `[★ Recommended]` fills the `(recommended)` option for every detected question group at once (`1a | 2a | 3b`).
    - Clicking `[elid]` inserts `elid` (if draft is empty) or appends ` | elid` (if options are selected).
    - Because the draft sits in a live `Input` (`gpui-base` `InputState`), the operator can also type or edit notes directly inside it (e.g. changing `1a | 2b` to `1a - keep flat only | 2b`) and press `Enter` or click `[Send ↵]` to submit.
    - Holding `Ctrl` while clicking `[★ Recommended]`, `[elid]`, or a single-question `[1a]` chip sends immediately in one click.
- **Reason**:
  - Chart-door rounds normally contain 2–4 questions in one turn (`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md` `# Operator questions and peer exchange`). Immediate send on single click would make it impossible to answer Q1 and Q2 together (`1a | 2b`)!
  - In two weeks of logs (`INTAKE.md` `## Agent findings`), the operator typed `"elid"` **263 times** and multi-option/annotated replies (`"1a | 2a | 3b"`, `"a1 - ... | a3 - ..."`) **~220 times**. `[★ Recommended]` + `[elid]` + editable draft directly serves the operator's top two reply patterns.
- **Cost**: Answering a 1-question round with normal click takes 2 clicks (`[1a]` then `[Send ↵]`) instead of 1 unless `Ctrl+Click` is used.

### (2) Rejected options
- **Single click sends immediately**: Rejected because clicking `1a` in a 3-question round (`1`, `2`, `3`) immediately submits the turn before the operator can pick `2b` and `3a` or add a note.
- **Option chips only (no `[★ Recommended]` or `[elid]` shortcuts)**: Rejected because it ignores 263 recorded `"elid"` prompts (`INTAKE.md` `## Agent findings`) and forces N separate clicks when the operator agrees with all `(recommended)` options in a round.
- **Separate per-question note inputs instead of one editable draft `Input`**: Rejected because a single editable draft `Input` (populated by chip clicks as `1a | 2b`, editable as plain text before `Enter` / `[Send ↵]`) is both narrower in a 36px strip and lets the operator write any format (`"1a - note | 2b"`, `"go 1a"`, `"elid"`).

### (3) Evidence
- `operator`: `INTAKE.md` (`## Agent findings`, A6) — ~220 prompts are decision-code replies (`"1a | 2a | 3b"`, `"a1 - ... | a3 - ..."`, `"go 01b"`); 263 prompts are `"elid"`; A6 clicks build `"1a | 2a"` and send it (2026-11-03).
- `better-than-training`: `/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md` (`# Operator questions and peer exchange`) — rounds number questions `1`, `2`, ... with one `(recommended)` option per question and end with `Reply \`1a 2b\`, or a numbered free-text answer.` (2026-11-03).

### (4) Pitfalls and what removes each
- **Draft input stealing keyboard focus from the terminal while the operator is typing in the terminal**: Removed by a done-criterion: clicking option chips updates `InputState` without calling `.focus()` on the draft input unless the operator clicks inside the text input itself; terminal focus stays untouched until the operator clicks the note field.
- **Draft retaining stale `1a | 2b` after the operator answers directly in the terminal**: Removed by keying the draft state on `${address}:${turn}` so advancing `turn` or switching panes clears or switches the draft automatically.

### (5) Unasked question
- Should `[elid]` be visible on the strip only when coded options (`1a`/`1b`) are detected, or whenever a chart-door/agent turn ends with a question?

---

## Required Probes Before Building

1. **Probe 1 — Does `hc(["send", ...])` from inside a running `herdr-app` mod ever inherit `HC_TERMINAL_ID` (wrapping text in `<hc from="...">`)?**
   - *What to run*: From a temporary test action or `herdr-app` mod in the `infra` session, call `exec("sh", ["-c", "printf '%s' \"$HC_TERMINAL_ID\""])` (or inspect `hc send --json` to a scratch shell terminal `t1`).
   - *What settles it*: If `HC_TERMINAL_ID` is empty and `t1` receives bare text without `<hc from=...>`, `hc(["send", "--json", ...])` can be called directly; if `HC_TERMINAL_ID` is set, call `exec("env", ["-u", "HC_TERMINAL_ID", "hc", "send", "--json", ...])`.
2. **Probe 2 — What exact `report` (`kind`, `msg`) do `claude-code`, `codex`, `pi`, and `antigravity` emit in `terminals()` when paused on a permission prompt vs. finished with a question?**
   - *What to run*: Inspect `terminals()` (or `hc ls --json` + `hc schema` `Terminal.status`) when a pane is in `blocked` vs `done`.
   - *What settles it*: Confirms which harnesses populate `status.kind` (`"permission"`, `"question"`, `"auth"`) and `status.msg` vs leaving `kind: null`, settling whether `blocked` with `kind === null` should default to `[Open terminal]` + optional reply box.
