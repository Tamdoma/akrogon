# chart-door: merged notes (A,B,C,D,E)

Sources: fork-chart-door-A.md .. -E.md.

## Corrections (A, 2026-11-06)
- A's notes assumed hc's child notes cover an ordinary turn end. `hc --skill` says hc notifies a parent "when a child cannot report (blocked, error, exited)" (C,E); a consultant that ends its turn `done` without reporting produces no note. That is E's live silent stop, caught only by `hc wait --children all` (INTAKE 2026-11-06). B and D ask for a probe of exactly what reaches the parent.
- `notes = false` in `~/.config/herdr-core/config.toml` disables child notes and `<hc>` wrapping (D, `hc --help`).

## Q1. Consultants
- All five peer scripts go; `chart-usage.ts` (on transcript paths) and `direct-guards.ts` stay (all). Create and restart by the start command (`--parent <door>`, restart is `hc kill` then start); ask by plain `hc send` with the brief path; collect by the `<hc>` report from the seat's current address plus the exchange's return file; one nudge, then drop (all, delivery Q4).
- Safety net for a silent turn end:
  - One `hc wait --children all` after A finishes its own notes (C,E): hc's own child barrier; ends at once on any message (the report), on blocked/error/exit, or when every child stopped working, the only way a silent `done` becomes visible; a timeout is a check-in. Judged not a poll by C,E. Claude may move a foreground wait to the background when a message arrives; its later notice is the same signal (C).
  - Child notes plus reports, with one `hc wait --children any` only at hard collection points (before restart, handoff, handover) when A has nothing else to do (D).
  - Child notes and reports only; A ends its turn with the exchange open; a missing push for a silent end is an hc gap for herdr-setup to fill (B).
- Supplied consultant terminals (operator-named, not door-created): used as given, never moved; the door cannot kill-restart a terminal it does not own, so they are never restarted by the door (D); B asks how their restart recipe enters the seat record.

## Q2. A's reset at handover
- Two self-sends from A's own terminal as its last action: `hc send $HC_TERMINAL_ID "/clear"` (codex, pi `/new`), then the start prompt; A ends its turn; hc delivers both when input is quiet (C). Tested 10/10 for claude and pi (INTAKE). Loses today's guards: operator input after the queue point cancelling the reset, and proof of a new session before the start prompt (C names the loss).
- A detached helper ported to hc events: follows A's turn end, re-checks for operator input, sends the reset (keys or own-terminal send), waits for the session-id resolver to show a new transcript path, then sends the start prompt (D,E). Keeps every guard; one script survives (D) or an akrogon verb (E asks).
- B: no proven native reset-and-kickoff in hc; prove ordering and fresh context per kind before choosing; a gap goes to herdr-setup.
- Successor door: rejected by all (consultants are the door's children and die with it; pane, address and records move).
- Fresh A finds the latest unconsumed handover entry from its start prompt as today, comparing transcript paths (all).

## Q3. Gates and records
- Gate: `HC_TERMINAL_ID` set (A,B,C,E) and `hc get $HC_TERMINAL_ID` answering (D). "Outside herdr" becomes "outside hc" (all).
- Temp-path rule removed, chart folder and seats.yaml at Open (A,B,D,E, intake); C asks why and keeps it unless the folder exists before the map.
- seats.yaml: address plus name, launch recipe for restart (B), `session` = transcript path; append on address or path change; unknown path never the same conversation (all).
- Sweep: 65/35 geometry becomes start-and-pane's 50/50 with equal heights; drop and collection wording; Mode record session-id uses; direct-route reviewer B by `hc send` and report; installed skill copy follows releases (C,D,E).

## Corrections after rebuttals (2026-11-06)
- B: "keeps every guard" is unproven: hc events carry no conversation-path or operator-input events, a reset may not change hc status, a new transcript may appear only after the next prompt (today's codex "Reply OK" step exists for that); prove each stage's wake. Never restarting supplied consultants changes today's chart-entry restart rule, which restarts named consultants too. A surviving reset helper needs an explicit operator exception to signpost 1a.
- C: moves to the detached helper (its own cost line was a regression by the operator's standard); the helper must type the reset as keys (`hc keys <A> / c l e a r enter`), since a send from another terminal arrives wrapped and is chat (INTAKE); it can also press enter on an unsubmitted start prompt; started with `hc run --bg --no-notify --rm`, no herdr labels. Temp-path: answered, folder at Open.
- D: no disagreement.
- E: every exchange round is a collection barrier, so the wait belongs to each exchange, not only to restart and handover; ending A's turn mid-exchange breaks today's "A stays in its own turn". Two self-sends lose the cancel and new-session checks.
