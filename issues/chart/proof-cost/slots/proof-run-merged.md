# proof-run merged notes (A)
Q1
- (b) at the existing handoff review, one line per leaf with required live runs: session count, side-by-side or serial (naming the shared resource that forces serial), and an elapsed figure. Information only; operator approves or narrows scope. No clock, gate, new state or plan change. (A,B,C)
  - Figure basis: `count x per-session ceiling / parallelism` from the named timeout, with typical vs worst case; a measured case replaces the ceiling when recorded (C). Range with stated basis; "unknown" allowed with reason; shared runs counted once; elapsed separate from session work (B). A: use C's arithmetic as default basis, B's "unknown with reason" when no ceiling exists.
  - Brief's live-run criterion names the parallelism and its independence (own root, own log per case) so parallel is the default and serial needs a named shared resource (C Q-b; A agrees). Audit refuses a live-run criterion lacking count and parallelism (C P2).
- (a) close: rejected; live-run leaves are 25% of framework closed leaves, implement median 103 vs 26 min (C, 85/343); conservative 23/446 confirmed, median 110 min (B). (A,B,C)
- (c) plan numbers: rejected; plan written after handoff, operator never reads it (A,B,C).
- Mandatory pilot measurement: rejected; optional under questions.md Optional measurement (B,C).
Pitfalls: timeout sold as typical (both shown); padded guess (formula); disclosure turns into gate (stated: never times out or waives).
Open: B Q2 drift after handoff: if planning finds much more proof work than shown, return to door or notify? A: no new step (operator note: no new mental model); the seat proceeds; recorded as accepted cost.
C Q-a: framework SESSION_TIMEOUT_MS 30 min: consumer-side seed, off route here.
Differences: basis formula (C) vs flexible range (B); B Q2 drift.
