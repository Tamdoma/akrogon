# Task delivery and report proof

## Question

How is a first and a later task proven delivered without session-file offsets, which old guards survive, and how is a silent stop caught and recovered?

1. First task at start: hc template runs (akrogon install writes `~/.config/herdr-core/templates/<kind>.md` from `harnesses:`, so hc reports `first_message` sent/started/turn and retries until the agent is ready) or direct `hc run <argv> "<task>"` proven by one `hc get` after start (`turn >= 1` or `working`)?
2. Later tasks (engine prompts to leaf seats, door prompts to consultants) by `hc send`: what counts as delivered (`started`, turn), what happens when `started` is false or the seat is blocked, and which old guards survive (busy refusal `src/next.ts:765`, session-file proof `src/session-file.ts`, `observeBusy` 60-minute notice, prompt `--wait --until working`)?
3. Silent stop (operator 2026-11-06, INTAKE.md): a seat's turn ends without doing its task or sending its report, as agy slot E did. How is it caught and recovered for leaf seats under the engine (today: the watcher judges a turn end without `phase`) and for consultants under the door (today: nothing), and what keeps it from recurring?

### Carries

- Signposts: forks/signposts.md `## Taken`.
- Engine-shape, identity, start-and-pane: `## Taken` in each fork file (binding).
- Map: slots/map-merged.md fork "delivery".
- Engine-shape Q3 pitfall: a turn end without `phase` is judged by the watcher today.
- INTAKE.md agent finding 2026-11-06 (silent stop on `ak-slot-e`).

## Findings

- Merged notes: slots/fork-delivery-merged.md (A,B,C,D,E with rebuttal corrections).
- Q1: direct run with the task in argv (A,C,D,E) vs templates keyed by the resolved command (B); start proof by following hc events for the terminal up to 60 s (B's no-polling point); blocked/timeout kill (C,E) vs leave running and report (D).
- Q2: plain `hc send`, status-read busy guard, `started: true` plus turn recorded (all); after `started: false`, a moved turn resettles as delivered (all); unchanged turn: no automatic resend (B,E, hc docs "do not blindly resend") vs one send per pass with today's attempts bound (C,D).
- Q3: leaf auto re-prompt as today, bounded (A,C,D,E after rebuttal) vs watcher-only (B); at the bound fail the leaf (C) or stop prompting (D). Engine-shape wording correction: one prompt per seat per turn (C). Consultants: return file for the current exchange plus report, one nudge, then drop for the session (D, chart skill rule) or restart once (C,E).
- Verified: `hc send --help` (`--if` idle|working only), `src/next.ts:221,765-771` (2-minute re-prompt today), `hc schema` SendResult/FirstMessage · 2026-11-06.

## Taken

Operator 2026-11-06, door t15, verbatim: "1a 1c | 2a | 3a | 3c | 4a |"

Read as:
- Q1 1a: the first task goes in the start argv (`hc run --bg ... -- <argv> "<task>"`); start follows hc events for that terminal (`hc events --terminal <t>`, no repeated reads) for up to 60 s until the seat reports `working` or `turn >= 1`, and records that turn as `prompted`. No repeated `hc get` loop, no templates.
- Q1 1c: no `working` within 60 s (popup, slow start, `blocked`): the seat stays running, start reports "started, not confirmed" with the address and the screen, and the state records it for the watcher or operator; only an exited or `error` seat fails the start. Never a blind resend of the first task.
- Q2 2a: later tasks by plain `hc send --json` (no `--if`, `--force`); sent only to a seat whose status is `idle` or `done` (`working`, `blocked`, `error`, null mean hands off). Delivered = `started: true`, its turn recorded as `prompted` with the address. `started: false`: record `delivery_error` with the send turn and the screen; a later pass that sees the turn moved past it resettles as delivered; while the turn is unchanged no automatic resend, the watcher inspects first. Session-file proof and `--wait --until working` are deleted; the 60-minute busy notice stays (channel in the notices fork).
- Q3 3a 3c: the engine keeps today's re-prompt of an idle or done seat whose phase did not move, keyed on hc turn (the seat's turn is past the recorded `prompted` turn and the seat is not in `done`); prompts the engine sends per seat per phase are counted in state and reset on any phase move; the third prompt without `phase` moves the leaf to `failed` with reason "seat <x> ended <n> turns without reporting", handled by the watcher's existing failed rules and shown by status.
- Q4 4a: the door counts a consultant done only when its return file for the current exchange exists and its report came from its current address; a missing one gets one nudge naming what is missing; a second silent stop drops the seat for the rest of the session (chart skill rule), recorded with harness kind and model.
- Recurrence: silent stops are recorded per harness kind and model so the config fork can swap a kind that repeats them.
- Engine-shape wording correction (C, recommended in round 4, not objected): "one prompt per seat per phase" reads "one prompt per seat per turn".
