# watcher: merged notes (A,B,C,D,E)

Sources: fork-watcher-A.md .. -E.md.

## Shared ground (all)
- Judgment stays in the watcher agent with today's rules (Waiting, Failed with the two-cycle bound, Busy loop evidence, Never list); the listener never judges or repairs (signpost 4a, engine-shape 1a).
- A wake is a request to run one full check, never evidence; the watcher re-reads state (B,C,D,E). Several queued wakes run one check (C,D,E).
- The watch terminal is found by a label the skill sets on its own terminal at start (`akrogon.watch=<repo>` (C,D) or `akrogon.role=watcher` plus `akrogon.repo` (E), B "role label"), removed at stop; only live terminals running an agent count; two live matches are reported, not chosen (B,C,D,E).
- The listener sends the wake (the job prompt `/watch-issues tick <root>`, C,E) for: seat lost or exited, seat replaced by hc's keep shell, seat blocked, leaf moved to failed including delivery's silent-stop bound (all); busy 60-minute deadline (B,D,C); merge or land completing while a leaf sits failed (D). Coalesced to one in flight per repo (B,C,D,E).

## Q1. Timer
- Keep the 20-minute cron beside the wakes (A,C,E): a seat looping inside one long turn emits no hc event (status and turn do not change), a codex seat waiting on its question stays `working`, and a dead listener must not silence the watch. Practitioners keep a timed check beside events (C: claude-code-supervisor 15-minute cron because an OOM-killed process fires no hook; E unsourced). Cost: occasional double checks; a timer is polling by the operator's word.
- Drop the cron (B,D): the operator's direction names timed checks. B replaces loop coverage with a one-shot busy deadline plus native transcript file-change notifications on the resolver's path, coalesced, and keeps the 7-day expiry as a registration deadline; screen-only seats need a probe, and a gap is a herdr-setup substrate gap. D wakes on edges only, a check that judges "working normally" may arm a one-shot recheck, no standing tick; removes the 7-day expiry.
- Cost of dropping (B): more paid watcher checks when transcripts change constantly; coalescing limits duplicates, not total cost.

## Q2. Observe and act
- `observe.ts` keeps its line format; reads `hc ls --json` filtered by akrogon labels for the repo in the resolved session, cross-checked against recorded addresses (all); null status prints `unknown` = hands off (D,E); keep shell or exited = absent (E); transcript path from the session-id resolver, `log-tail.ts` unchanged (all).
- Read by `hc read --lines 0` for working seats, `--lines 80` otherwise (C,D,E).
- Stop: `hc interrupt` then one read to confirm idle with empty input at the same address, then one corrective `hc send` (A,C,D,E) vs exactly one `hc keys esc` (B: interrupt may pick ctrl+c for an unreported program and has its own timeout; today's allowed stop is one esc). Probe per harness (all).
- No `--force`, no kill, no park; notices through the notices verb (all). The skill's Claude-only gate is kept, rewritten to need an hc terminal (C,D).

## Q3. Where it runs
- Operator-started Claude terminal in the repo's session, as today; refuses outside hc (no `HC_TERMINAL_ID`) (all). After reboot nothing restarts it; the listener's own startup resumes leaf work; `akrogon status` shows whether a live watch terminal exists (B,C,D). The listener never starts a watcher (all).
- D asks: one watcher per repo (today) or one per hc session.

## Corrections after rebuttals (2026-11-06)
- B: wakes must also come from committed phase moves (a leaf moved to failed by any caller, including `phase` run outside an hc terminal), not only hc seat facts. B's esc path spends the one-stop budget before the esc and, if the seat has not stopped, ends the check and resumes on the seat's next status event. The corrective-send guard confirms the same current conversation (session-id transcript path), not only the same address; unknown means notify.
- C: the 20-minute check does not stand in for a signal: a loop inside one turn changes neither status nor turn, so hc has none; B's transcript wakes fire on every tool call of every seat (paid checks), still need a timer for screen-only seats, and D's armed recheck is a timer by another name. Signpost 4a binds the watcher to "pretty much the same". On the stop key: `hc interrupt` by default; a per-harness probe that shows ctrl+c names `hc keys esc` for that kind. One watcher per repo, as today.
- D: no disagreement.
- E: transcript writes invert the signal (healthy work writes constantly, a stall writes nothing); D's edge wakes leave mid-turn stalls to the 60-minute deadline. One watcher per repo. E's named practitioner sources (OpenHands StuckDetector, SWE-agent, LangGraph) appear in its rebuttal, not in its notes.
