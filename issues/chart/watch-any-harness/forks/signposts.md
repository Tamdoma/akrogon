# Signposts: watch-any-harness

Original, held in this chart. Session: door t126, 2026-11-20, autopilot (operator answers signposts, A answers forks).

## Question

Missed angles came from B (slots/signposts-b.md) and C (slots/signposts-c.md). Changes from A's draft: Q1 re-optioned to "native scheduler where present" (C); Q2 split into what can be guaranteed from outside (stop, exit, replaced program) versus an in-conversation reset, which pi does not expose (C, B Q2); draft Q3 (survive reboot) replaced by the expiry question (B Q3, C 4); one-watch-per-repo added (B Q7, C 2); hc-only folded into Q5 (C 1); live-proof options widened to cover stop and exit (B Q5, C). Dedicated watcher versus the invoking conversation (B Q6), tick queueing while busy (C 3) and agy skill linking (C) are fork questions for the map.

1. One delivery path or native schedulers? (a) one shared script and one way of delivering ticks for every harness, Claude included, so Claude's cron path is removed, (b) use a harness's own scheduler where it has one (Claude cron, agy schedule), the shared script elsewhere. Rec a. Steers: how many code paths, whether Claude cron text is deleted, proof count.
2. How strict is "no stray ticks"? (a) a tick never reaches a terminal after its watch was stopped, its agent exited or another program replaced it; an in-conversation reset (/clear, /new) is caught on the next tick where the harness shows it and is a stated limit where it does not, (b) also guarantee no tick after any in-conversation reset, even if that needs harness or herdr changes. Rec a. Steers: timer lifetime design, scope of changes, proofs.
3. Does a watch expire on its own? (a) no, it runs until stopped or its terminal ends, (b) yes, after 7 days, as Claude cron does today. Rec a. Steers: whether deadline state and expiry reporting exist.
4. One watch per repo or per terminal? (a) one per repo: a second start reports the running one and starts nothing, (b) each terminal runs its own. Rec a. Steers: duplicate check, identity of the timer, double steering of one seat.
5. Where may the change live? (a) the watch-issues skill folder plus small reuse of akrogon's own src helpers; inside hc only; no listener, herdr or harness changes, (b) the engine (listener or a new akrogon command) may host the timer, (c) herdr or harness changes allowed too. Rec a. Steers: leaf count, repos touched, review size.
6. How much live proof before it ships? (a) short real sessions on claude, codex, pi and agy showing start, one tick runs one check, and stop and exit leave no stray tick, (b) free stand-in programs only, harness behavior taken from docs. Rec a. Steers: grant size and needs sheet row N1.

## Taken

Operator, 2026-11-20, door t126, verbatim: "1a | 2a | 3a | 4a | 5a - the script goes into the skills scripts folder or whatever the akrogon convention is | 6a - Do testing, do all functions testing E2E to make sure it works. I don't want any regressions compared to the Claude only functionality that we have right now. Come up with tests for different use cases so we don't miss anything. | Yes, you have the permission N1"

Account: the session prioritizes one shared timer script under `skills/watch-issues/scripts/` used by every harness, Claude's cron path removed, stopping on stop, agent exit or terminal reuse, no expiry, one watch per repo, no listener/herdr/harness change; proven end to end on real claude, codex, pi and agy sessions with use cases covering every function today's Claude-only watch has, so nothing regresses. It gives up a guarantee against a tick after an in-conversation reset the harness does not show (pi /new), recorded as a limit. Chart order: one chart, nothing dropped.

Correction, operator 2026-11-20, door t126 (asked as S1 and S2 after the timer-design final-shape check found two picks against 2a and 5a), verbatim: "s1 - it needs to be symlinked to agy, like what you're doing for the other 3. Same pattern | s2a |"

Read as: 5a widened to one install change: akrogon's install links every skill into agy's global skill folder `~/.gemini/config/skills`, the same pattern as the other roots. 2a keeps its guarantee except one stated limit: a tick hc holds behind the operator's unfinished draft (up to the draft wait) may land in the shell left behind when the operator exits a shell-hosted agent in that window.

Correction, operator 2026-11-20T13:10:16Z, door t126 (asked as S3 after final-shape check 4 found a program the operator starts in the left-behind shell during the draft hold can receive the tick), verbatim: "s3a |"

Read as: the S2a stated limit widens to "a tick hc holds behind the operator's unfinished draft may land in the shell left behind, or in a program the operator starts there within that hold, when the operator exits a shell-hosted agent in that window"; a replacement agent running the skill refuses it by the tick's pid.

## Needs

- N1 (supplied 2026-11-20, operator: "Yes, you have the permission N1"): grant for paid model launches: short real sessions in claude, codex, pi and agy in a throwaway hc session, at charting (to prove a tick prompt runs the skill in each harness) and for the leaf's live done-criterion; bound proposed: at most 8 sessions at charting (2 per harness) and 8 for the leaf, each ending within 10 minutes, on the existing logged-in accounts; no outside writes.
- N2 (supplied 2026-11-20T13:36:50Z, operator: "n2a |"; was late, notice sent): free probes of the watcher pin in three launch shapes (claude as root, codex from a shell, agy from a shell); claude and codex through their own `!` shell command (no model call), agy through one short paid session (neon high) since agy shows no `!` command; for watch-timer criteria 1 and 11; record forks/timer-design.md P12.
