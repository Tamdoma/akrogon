# Autopilot night notes, 2026-10-16

Input for a possible future chart: autopilot mode for a fully hands-off charting experience.

## Operator instructions, verbatim
- "I want to go on autopilot mode for the night. I want you to do the charting yourself with slots just like what we've been doing so far, only you decide for me and start the charts when they're handed off, ok?"
- "ok, just make sure you're not skipping any steps. Decide at the moment when I would actually decide, and then let's get it going. In the morning, if I like what I see with the merges and the quality, we might have to chart out the autopilot mode for complete hands-off experience, ok? Take these notes as you're working."

## How A runs it
- Every step stays the same: research, blind B and C notes, merge, rebuttals, the full written round, final-shape check, leaf drafts, B and C leaf review, preflight, presence check, status.
- At each point where the operator would answer, A writes the round, picks, and records the pick in the fork as `A on operator autopilot delegation` with the reason.
- After a valid handoff A runs `akrogon next` so the leaves start.

## Log

## Operator record, 2026-09-16 to 2026-10-16 (scan of A session transcripts, akrogon, framework, blepsis, lens, portal, website)
- 270 answered rounds, 582 answered questions.
- Recommended option taken: 518 questions (89%). All-recommended rounds: 216 (80%).
- Another listed option: 14 questions (2%). Own free-text answer: 50 questions (9%).
- Clarification requests before answering: 260 messages, 210 of them `elid`/`eli`. Roughly one per round: rounds were written too complex the first time.
- Where the operator chose differently, the free text pushed toward: doing it now instead of later ("fix it now immediately"), the user-facing optimum right away, tighter time targets ("target 10 minutes or less"), a stronger model floor ("Sonnet 5.5 high, nothing below"), and moving work to the repo that owns it.
- Values A applies when deciding: simplicity, function over form, delete rather than stack, speed, cost. Recommendation is taken unless it conflicts with those.
- 2026-10-16 ~01:20 local: peer-wait-harness (#91) handed off before autopilot; `akrogon next` started peer-wait-signal.
- 2026-10-16 ~02:30 local: temp-release. Operator lifted the 20-leaf pause ("o1"). Refresh by A, B, C; rebuttals found three gaps after store-sweep merged. A decided `1a | 2a | 3a` (keep failed tabs: 116/117 failures resumed in the same tab; one stop rule for every phase; keep temp on disk). Final-shape check: B F1 (dispatch lock race), F2 (empty pane list read as "tab gone") applied; C none. Leaf release-any-phase, leaf review B and C none. Handed off, then `akrogon next`.
- Friction seen: B read main before store-sweep merged and C after, so their first notes disagreed on what was delivered. A brief should name the commit to read.
