# Agent questions: merged notes (A, B, C, D)

## Agreed

- Needs-you includes more than `blocked`: a door asking a round ends its turn `done` (A,B,C,D).
- `blocked` rows show the reported `kind` (permission, question, auth); permission and auth never get pasted text (A,B,C,D).
- `hc send --if idle` refuses `done`, the common case, so it cannot be the only path (A,B,C,D). `hc send` has no `--raw` (A,B,C; D's map claimed it, its notes dropped it).
- Every send is bound to the terminal and turn captured at render and re-checked at click; a changed turn or state aborts visibly; never retry blind (A,B,C,D).
- A6 clicks build an editable draft ("1a | 2b", notes allowed) and only an explicit Send submits (A,B,C,D).
- Options and drafts are keyed to (terminal, turn) and dropped when the turn advances (A,B,C,D).
- `status.msg` is a short hint, not the question (B,C,D).
- Rows: Program icon, space/tab, kind or state, waiting time from `status_ms` (A,C,D).
- A window sees only its own session's agents (C, carried from round 1).

## Measured facts (D, 2026-11-03)

- `hc read <t> --lines 0 --json` on an idle Claude terminal: 1 ms, `how: "screen"`, touches nothing.
- `hc read <t> --lines 80 --json` on the same terminal: 2,489 ms, `how: "stitched"`: the core scrolls the full-screen app to collect history. Reading history on every focus or turn change would scroll the operator's terminal.
- Claude's screen ends with chrome lines (rules, prompt, `CC │ ...` status bar) that a preview must strip.

## Where seats differ

1. Which `done` agents count.
   - Every `done` agent (A, C). Cost: finished-without-asking agents appear too.
   - Only top-level agents (no `parent`) whose screen ends with a question mark or coded options; sub-agents (consultants) never, unless blocked (D). Cost: a heuristic on screen text; a missed question still shows under Done in Agents.
   - Only questions a producer has published (B). Cost: agents without a producer never appear unless blocked.
   Row text: last lines of the screen, chrome stripped (A, D) vs `msg` only, no screen text (C) vs producer text, else `msg` labelled as status plus an expandable screen excerpt (B).
   Placement: inside `agents-by-tab`, above its Agents header, so it takes 0 px when empty (D).
2. How A6 finds options.
   - Screen parsing anchored on an explicit reply-key line ("Reply `1a 2b`") and coded option lines; no reply key, no buttons (A).
   - Strict line-anchored grammar on the 1 ms screen read, history read only when the round is taller than the screen (D).
   - Agents publish a structured record; primary is an hc `doc.set` per terminal (C) or atomic JSON files in a per-core folder the mod watches (B); C keeps a screen fallback, B narrows A6 to manual entry without a producer.
3. Reply to a `blocked` agent with `kind: question`.
   - Never type; open the terminal (A, and B until a probe proves text+Enter works per harness).
   - `hc send --force` after the draft, only for `kind: question` (C, D).
   Permission: open the terminal only (A,B,C) vs open plus quick-key buttons via `hc keys` (D, asks the operator).
   Reply to `done`: plain `hc send` after re-checking turn (A,C,D) vs focus the agent first, then `--if idle` (B).
4. Shortcuts.
   - "Recommended" button: yes (A,C,D) vs not yet (B).
   - "elid" button: yes (A,B,D) vs no, elid is a rewrite alias, not an answer (C).
   - Ctrl+click on a chip sends at once (D).
   Strip placement: inside a cloned `pane` mod as a bottom bar, so the terminal shrinks instead of being covered (D) vs reply box in the Needs-you row instead of under the terminal (C).

## Probes named

- Does `hc send` from a mod's `exec` arrive wrapped `<hc from=...>`? Does herdr-app's process carry `HC_TERMINAL_ID`? (A, D)
- Does rendering a mod that reads `agents()` turn `done` into `idle` without the operator looking? (C, B)
- Which harnesses report `kind` on blocked prompts: claude, codex, pi, agy (B, D).
- Real finished-round screens from all four harnesses as parser fixtures; zero false positives on code-bearing screens (A, C, D).
- If a producer is chosen: can a mod consume hc doc events through `exec`? (C, B says not proven)
