# Agent questions — seat C notes

All command/schema facts re-verified 2026-11-03 (hc 0.1.17, herdr-app 0.1.12) unless dated otherwise.

## Q1 — What counts as "needs you" and what a row shows

**Pick.** Row = any agent in `agents()` whose `status` is `blocked`, `done`, or `error`; `blocked` rows carry `kind` when the program reports it (`permission`/`question`/`auth`). Row content: Program icon (existing helper), space/tab name + agent `title`, `status.msg` truncated to one line, elapsed time since `status_ms` (from `terminals()`; `agents()` doesn't expose it), and a small kind word for blocked rows (permission/question/auth). Click = `agent.focus`. No reply text in the row.
Reason: `kind` exists precisely to split "answer a question" from "approve a permission" — ignoring it makes the reply box lie about what it can do. `done` must be in: a door that asks and ends its turn sits at `done` until looked at, and the operator's real prompts ("Check the questions in deploy-combined tab") hit exactly that state.
Cost: `msg` is whatever the agent reported; for `done` rows it can lag the actual question (t15 shows `msg: "Waiting for the three round 2 notes"` while working). Msg is a hint, not the question.

**Rejected.**
- R1 Only `blocked` (shipped board's Needs-you column does this, `mods/board/main.js:8`): misses the done-with-question case, the commonest one here.
- R2 Question text scraped from `hc read` into the row: blocked reads return screen only (`ReadResult.why`), wrapped at pane width, three+ harness shapes; that's a v2 probe, not a row.
- R3 "Unread" tracking beyond `done`→`idle` semantics: the core already owns seen/unseen; duplicating it in mod state rots.

**Pitfalls.**
- `done` semantics: `done` becomes `idle` when the operator looks (AGENTS.md/herdr.d.ts `AgentInfo.status` comment). If a Needs-you row itself counts as "looking," rows vanish as they render. **Probe P1 (must run):** run an agent to `done`, render a mod reading `agents()`, check whether status flips to idle without the operator focusing its pane. Settles: whether `done` rows are stable in a sidebar list or need `status_ms`-based "recently done" memory.
- Agents that never report status (`reported: false`, seen today: t1, t4-t9 are plain shells) can't appear; the empty state must say so ("agents show when they report status" — agents-by-tab already handles this, `main.js:429`).
- Sub-agents reporting to a parent: agents-by-tab already solved this (sub-agent shown under parent, parent's `done` is the news, `main.js:43-44`); Needs-you should reuse that grouping, not list raw `agents()`.

## Q2 — How the strip finds the current question's options

**Pick.** Two layers, primary first:
- Primary: `doc.get`/`doc.set` convention. One doc per terminal (`ask-<address>`), value `{turn, question, options:[{code,label,recommended}]}`, written by the agent that asks. Detected by doc event on `events.subscribe`, keyed to `turn` so it clears when the turn advances. Cost: asking agents must write the doc — this is one convention line added to `skills/chart-issues/assets/questions.md` (the round format we own) plus one line in the shared agent rules; akrogon's own doors are the heavy users already.
- Fallback: trailing-block scrape for agents that don't write docs. Read `hc read <addr>` (screen only when blocked/done is fine — the question is the last thing on screen); options = a block of 2+ lines matching `^- \*\*(\d+[a-z])\b` or the literal reply-key line `Reply `…``, taken only after the last blank line. Cache parsed options per `(address, turn)`; drop them when `turn` advances. This matches the door format verbatim (`- **1a (recommended)**`, `Reply \`1a 2b\``).
Reason: a written doc removes the whole false-positive class; the trailing-block rule degrades gracefully for agents outside the convention and needs no per-harness parser.

**Rejected.**
- R1 Full grammar over `hc read --lines 120`: history is stitched/wrapped; code blocks and diffs false-positive; more parser for the same input.
- R2 Transcript files per harness (claude sessions, codex logs): precise text, but nothing maps `address` → transcript path, and three formats to maintain.
- R3 `status.msg` as option source: it's a one-line summary, no options.
- R4 Parse every idle/done agent continuously: wasted reads; the strip is bound to the focused pane, parse on focus/status change only.

**Pitfalls.**
- Stale options re-sent to a new turn: removed by keying options to `turn` (Terminal.turn increments when status leaves working — schema today) and re-validating `turn` at click.
- Doc convention adoption: done-criterion = one chart-door round whose options the strip reads via doc.get before the fallback is exercised.
- **Probe P2 (must run):** `hc doc get`/`doc.set` round-trip from a shell (`hc connect` JSON-RPC) and confirm `events.subscribe` emits a `doc` event a mod could consume via `exec hc events` or a polling `doc.get`. If mods can't subscribe cheaply, fallback becomes primary and P3 grows in importance.
- **Probe P3:** capture 15+ real blocked/done screens across claude/codex/pi/agy (`hc read` of live asks, or transcripts of past chart rounds) and verify the trailing-block rule finds the option block with zero false positives on code-bearing screens.

## Q3 — How a reply is delivered

**Pick.** The reply box exists only for states where text is the answer:
- `idle`/`done`/`error` or unblocked working-with-question → `hc send <addr> <text>` plain (no `--if idle`: a `done` agent refuses `--if idle` since possible values are `idle|working` only — `hc send --help`, verified). Re-check `state` at click time; send targets the `address` captured at render.
- `blocked` + `kind=question` → `hc send --force` is the right tool: the program asked a text question, the paste answers it (schema: send "refuses a blocked program unless force; it may answer its dialog"). Allowed only after the editable draft.
- `blocked` + `kind=permission`/`auth` or kind absent → no reply box; the row's click focuses the pane. A menu wants keys, not paragraphs; `hc keys` is the mechanism if ever needed, not text+force.
Reason: each state gets the one transport that can't do harm; `--force` never fires against a permission dialog.

**Rejected.**
- R1 `hc send --if idle` for everything: done agents refuse it silently (status_mismatch), and `done` is the main case.
- R2 Always `--force` (one transport): a force into a permission dialog answers it by accident — the exact thing hc's own help warns about.
- R3 `hc keys` menus from the panel: a menu navigator in a 368px strip is a second TUI inside the TUI; jump-to-pane is cheaper and complete.

**Pitfalls.**
- Wrong terminal after restart: bind to `address`, re-fetch `status` at click (hc get), abort visibly if the terminal is gone (`not_found` is a stable error kind, schema).
- Mid-send state change (done→working before the send lands): core checks state at send time and returns `blocked`/`status_mismatch` errors — show the error in the strip, never retry blind.
- `turn` guard: if `turn` advanced between render and click, the options are stale; discard and re-parse rather than send.

## Q4 — Extra buttons, send-on-click vs draft

**Pick.**
- One extra button: "all recommended", composing the recommended codes in question order (`1a 2b`). It's the operator's modal reply shape and the door template names the recommended option per question.
- No "elid" button: elid is a rewrite alias for the operator's next free-text prompt, not an answer to a coded question; the draft box stays free-text so it can still be typed.
- Editable draft, then explicit Send. Clicks fill a text field; Send fires Q3's transport. No send-on-click.
Reason/cost: a wrong auto-send to a working agent injects text mid-turn and is unrecoverable; one extra click is the whole cost of the draft, and real replies carry free-text suffixes (`a1 - use the other name`) that only a draft supports.

**Rejected.**
- R1 Send-on-click: detection errors become sends.
- R2 Checkboxes per option then "send selected": `|` and space separators both appear in real replies; the draft already covers multi-select by appending codes.
- R3 More shortcut buttons ("yes", "no", "skip"): the strip composes from detected options; hardcoded answers bypass detection entirely.

**Pitfalls.**
- Draft that survives after the question is answered: clear the draft when `turn` changes or the agent leaves idle/done.
- Draft editing inside a tiny strip vs just typing in the pane: keep the draft one line; long answers belong to `agent.focus`.

## Probes that must run before build

- P1 `done` visibility: does rendering a mod that reads `agents()` flip `done`→`idle` without the operator looking at that pane? Run: `hc wait` an agent to done, open the mod, `hc get` it. Result settles whether `done` rows need remembered state.
- P2 `doc.set`/`doc.get` + `events.subscribe` doc events from a mod via `exec hc ...`: confirms the structured-record path is reachable without a socket client. If not reachable, fallback scrape becomes the only mechanism.
- P3 Fixture screens: 15+ real `hc read` outputs of agents ending a turn with coded options (claude, codex, pi, agy), stored as fixtures; the trailing-block rule must hit 100% with zero false positives on a code-bearing screen before the fallback ships.

## Question this fork doesn't ask

- Where the reply draft lives relative to the terminal: a layout strip under the terminal resizes every agent's screen each appearance (reflow risk); a floating block covers the input row; a sidebar reply box (attached to the Needs-you row, not the terminal) avoids both and reuses A5's own real estate. Worth one `herdr-app shot` probe: floating vs layout block over a live pane, checking terminal row count (`hc get` rows/cols) before and after it appears.
- Multi-machine: `doc.get`/`doc.set`/`send` take `on:`/`machine/t` — all fine — but `agents()`/`terminals()` cover this window's session only. Rows from other sessions have no target; say "this session" in the mod contract.
