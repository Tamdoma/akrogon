# Fork notes A: chart-door

## Q1 consultants
- Pick: all five peer scripts go. Create and restart are the start command (consultant role, `--parent <door>`); ask is plain `hc send <name> "You are slot X. Read and follow <brief>"`; collect is the consultant's `hc send <door> "done X: <path>"`, counted only with its return file (delivery Q4). Safety net: hc's own child notes. Consultants run with `parent t15, notify true` (`hc get ak-slot-b`, 2026-11-06), so hc types a note into the door when a child's turn ends, blocks or exits ("Its parent gets notes about it", `hc schema` Terminal.notify). A turn that ends without a report then reaches the door as a message, which triggers delivery Q4's nudge; no `hc wait`. Reason: no waiting, `<hc>` only, fewest parts. Cost: I have not seen a child note in this session while the reports arrived; probe exactly when hc types notes (turn end, blocked, exit; whether a parent busy in its own turn gets them queued).
- Rejected: keeping `hc wait --children all` (a wait standing in for a signal hc already sends); keeping scripts as wrappers (code beyond the start step, signpost 1a).
- Evidence: this chart's live exchanges (every report arrived as `<hc from=...>`; E's silent stop on 2026-11-06 was only seen because `hc wait` returned) · `hc run --help` (`--no-notify`) · 2026-11-06.

## Q2 A's reset
- Pick: the door sends itself `/clear` (claude) or `/new` (codex, pi) by `hc send $HC_TERMINAL_ID`; hc holds the paste until the door's turn ends and submits it then, so the reset happens after the handover entry is written. Fresh A reads the next chart's Mode record handover entry as today. Reason: same reset as today (same session terminal, same tab, same consultants), one command instead of `door-reset.ts`. Cost: probe that a self-send waits for the turn end and is not dropped (delivery: `started` false while the sender is working).
- Rejected: a successor door started by the start command (new terminal and tab, consultants' parent changes, more parts).

## Q3 gates and records
- Pick: `HERDR_ENV=1` becomes "has `HC_TERMINAL_ID`"; temp-path rule removed (intake); seats.yaml `pane` becomes the hc address with the name beside it, `session` the transcript path from the session-id resolver; `herdr agent list` reads become `hc get`. Any other herdr wording in the chart skill is swept in the same leaf.
