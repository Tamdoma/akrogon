# Intake: watch-live-speed

## Scope

Why the watch-timer leaf (issues/open/watch-any-harness/watch-timer) ran slow and overran its paid grant, what to do with it now, and how to make leaves like it much faster and better.

## Provenance

- operator, door t126, 2026-11-20 (verbatim, below)
- relayed by the watch-issues watcher akrogon-ab (cross-session message, 2026-11-20), verbatim below; relayed text is not operator words in this door

## Source: operator 2026-11-20 door t126

"Discuss with consultants about this. Also spawned slot E consultant Claude Fable 5.2 high effort."

"And then discuss how to make these much faster and better."

## Source: watcher akrogon-ab relay 2026-11-20

Question (first message): "why is the watch-timer leaf so slow, and how do we make leaves like it fast?" Facts: plan.synthesis ~40m (13:46-14:23); implement from 14:23, still running at 18:20; 2 workers, Pippin (watch-timer-u1, 7 scripts) ~1h40m with an opaque pi subagent transcript (`exec #- -> unknown`); A then ~2h on criterion-11 live e2e (tests/e2e/watch-live.e2e.ts); early runs "0 pass" (ZodError in the run-check config, pi skill discovery, tsc errors in the test file), each followed by a fix and full rerun; pi-root green after 347s; the other 7 live tests one after another (timeout 5400s); watch-live-pi-shell 0 pass 1 fail.

Second message: "Operator go-ahead: apply your watch-timer speed and cost fixes through the chart door. Relayed by the watcher akrogon-ab; the operator chose "c-akrogon charts it"." Scope relayed: F1 fast-fail order; F2 rerun only the failed run; F3 parallel tiers via a session name passed into startWatchTier, as a prerequisite leaf; F4 split product leaf from live-proof leaf; F5 label live-heavy estimates and a stop rule for test-code bugs found in a paid run. State: grant overrun (readiness allows 8 paid sessions; 19 runs reached a harness launch per implementation/check-watch-live-*.log from 17:25; 16 more at 17:23-17:24 died before launch: ZodError, then socket link path too long); shell shape fails every time with "receipt due=1 missing" (timer t2 aw-watch live, parent t1, turn 0, no receipt label; claude-shell x2, codex-shell x2, pi-shell x1); root shape passed on pi-root and agy-root, claude-root and codex-root failed on other asserts; seat A (t2p5) interrupted once, restarted the implement prompt; agy-skill-link merged.

## Agent findings

- A's earlier reply to the watcher (F1-F5) is A's view, not a decision.
- Prior charts on the same theme exist: issues/chart/leaf-speed, system-speed, proof-cost, paid-proof-bounds, cross-leaf-proof, changed-test-proof, proof-limits-handoff.

## Source: operator 2026-11-20T18:05:30Z door t126

"do it on autopilot. Consult with all slot conusltants that are active here in this tab in the panes next to yours. Most elegant solution. Look at my initial intent."

Earlier in this door, same session: operator ran `akrogon stop watch-timer` (printed "stopped: akrogon/watch-timer"), restored the two skill links and killed the leftover tier processes 136342 136821 136188.
