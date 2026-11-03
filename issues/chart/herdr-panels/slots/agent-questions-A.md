# Agent questions: seat A notes

## 1. What counts as "needs you", what a row shows

Pick: an agent whose status is `blocked` (any kind), or `done` (finished while nobody looked). Blocked first, then done, oldest first. A row: program icon, tab name, the kind ("permission", "question", "auth", or "finished"), how long it has waited, and the last lines of what it said. Cost: `done` includes agents that finished without asking anything; the operator has to read those anyway, and looking at one turns it `idle`, which removes it.
Rejected: blocked only. A chart door asking a round ends its turn `done`, so the operator's most common wait would be missing (intake: "Check the questions in deploy-combined tab"). Rejected: guessing "is this a question" from text. Brittle, and a finished agent's result is also something to read.
Evidence: better-than-training, `hc schema` Status (state, kind) and ReadResult (`why`: screen only while working/blocked), 2026-11-03.
Pitfalls: a blocked agent's text is only its screen (`complete: false`); the row says so instead of pretending it is the question. Reading every agent on every render is costly; read once per (terminal, turn), cache.
Would ask: should agents outside akrogon (a plain shell Claude) count? I think yes, all agents in this window.

## 2. How decision buttons find options

Pick: show buttons only when the agent's last turn ends with an explicit reply key (a line starting "Reply " that lists codes like `1a 2b`), and read the options from the coded bullet lines above it in that same turn. No reply key, no buttons. Cost: agents that offer options without a reply key get no buttons; fixed by the shared rule (chart-door rounds already end with one; the operator's CLAUDE.md "Reference Points" can add it).
Rejected: any coded line anywhere (false hits on diffs, timings, SHAs). Rejected for now: a structured record per harness (hooks or an hc doc written by each agent): four harness integrations for what one fixed line already gives.
Evidence: better-than-training, akrogon skills/chart-issues/assets/questions.md "Operator questions and peer exchange" (fixed reply-key line), 2026-11-03.
Probe before building: `hc read <t> --lines 200` on finished chart rounds from claude, codex, pi and agy. TUIs render markdown, so `**1a (recommended)**` may come out without the asterisks or wrapped; the parser's patterns come from these real screens, kept as test fixtures.

## 3. How a reply is delivered

Pick: idle or done: plain `hc send <t> "<text>"` from the mod, after re-reading the target's status and turn and confirming they match the row. Blocked: never type; the row's button focuses that agent (`agent.focus`) so the operator answers the native dialog. Cost: blocked dialogs take one more click.
Rejected: `--force` on blocked agents: typing into a permission dialog can approve something the operator never saw. Rejected: `--if idle`: it refuses `done`, the common case.
Evidence: better-than-training, `hc send --help`, `hc schema` terminal.send ("Refuses a blocked program unless force"), 2026-11-03; herdr-app intake finding that `--if idle` refused `done` seats.
Probe before building: does `hc send` run from a mod's `exec` arrive wrapped as `<hc from=...>`? The wrap comes from the sender being a terminal; a mod runs in herdr-app, not a terminal. Run it once against a claude, codex, pi and agy seat and look at what arrives.

## 4. Shortcuts, send or draft

Pick: clicks build a visible draft ("1a | 2b"), one pick per question, an optional note per question, then one Send. Shortcuts: "Recommended" fills every question's recommended option into the draft; "elid" sends "elid" at once (it is a whole reply on its own). Cost: two clicks for a one-question round.
Rejected: send on click: a multi-question round would be answered after the first click.
Evidence: operator, intake reply shapes ("1a | 2a | 3b", "a1 - note", "elid" 263 times).
