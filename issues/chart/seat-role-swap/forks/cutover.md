# Cutover

## Question
Q1. When does the letter swap go live relative to leaves already in flight, and what must the operator do at that moment?

### Carries
- forks/what-moves.md Taken: letter swap (1a), config values swap on main as an operator step (2a).
- Operator 2026-09-29 verbatim: "1a | 2a"

## Findings
- (A,B) Installed akrogon is a symlink into the local main checkout. The change goes live when the operator fast-forwards local main.
- (A,B) No migration code for existing state.yaml files.
- Rounds: slots/cutover-A.md, slots/cutover-B.md, slots/cutover-merged.md, slots/cutover-rebuttal-B.md.
- (A,B) Gate: zero unfinished leaves in all registered repos and no merger still running its post-merge broadcast. A closed leaf tab is the visible sign the merger finished (src/next.ts:745-753). (B) R2: a leftover tab of a finished merged leaf alone need not block.
- (A,B) Then in one sitting: `git pull --ff-only` on akrogon local main and swap slots.a/b values in config.yaml (a = pi/muse-spark/max, b = codex/gpt-6.1-sol/high). No new handoffs until both are done.
- (A,B) No plugin disable or watch stop: with zero unfinished leaves, hooks, resume and watch have nothing to act on (src/next.ts:520-524,707-718,735-738). B withdrew this barrier in rebuttal R1.
- (A,B) Rejected: converting in-flight leaves. No role-version field (src/state.ts:35-58).
- (A) Leaf constraint: the swap leaf must not change config.yaml, since the operator's uncommitted edit would make ff-only refuse.
- Live 2026-09-29: only framework update-replay is unfinished (implement, B working). All other repos have none.

## Taken
Operator 2026-09-29: "1b - let's swap it immediately. I'll make sure nothing's running except for this until we're done with the update"
- Reading: no drain wait. The operator keeps every other leaf idle (including framework update-replay) from now until the swap is live. Only the swap leaf runs. Under that guarantee no conversion code is needed, so none is written; the "1b" label's migration code is not adopted because the free text removes its need.
- Reason: the operator prefers going now and owns the quiet window. Foreclosed: waiting for a natural drain.
