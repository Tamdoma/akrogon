# Stock and flow

## Question
Q1. Without relying on the operator running /learn-issues, what feedback loop keeps the active lesson stock (framework 144, akrogon 20) from growing, including judgment lessons that never become guards, lessons already guarded but still listed, cross-repo lessons, and the existing backlog, while adding no new component, pass, command, state or file format, no slowdown, and no loss of quality or cost?

### Carries
- forks/promotion-trigger.md Taken: 1a writing seat files a seed at write time for checkable lessons after a duplicate search; 2a filing only.
- forks/lesson-lifecycle.md Taken: 1a route by owner; 2a link in history file; 3a applied = running mechanical guard only; 4a guard leaf removes its line in the same diff; operator will not rely on /learn-issues.
- Operator 2026-10-10 verbatim: "Can you look at it from a systemic point of view? Is there a way to automate this stock and flow part of the process? re there any reinforcing loops or and balancing feedback loops that can help with automating this while not increasing the complexity of the system at all? We need a simple and elegant solution, so think about it. ... But only if it doesn't increase the complexity of the system and doesn't slow it down or sacrifice quality or cost."

## Findings
- Full exchange: slots/stock-flow-A.md, -B.md, -C.md, -merged.md, -rebuttal-B.md, -rebuttal-C.md.
- Stock akrogon 20, framework 145; inflow about 4 lines a day on framework (67 in 17 days); outflow 3 Applied of 146. (A,B,C; rate C)
- No option drains judgment lessons under lifecycle 3a. (A,B,C)
- P1 match before adding, appending the case to the existing history (A,C). B: match on failure mechanism and scope, not keywords; adds judgment work.
- P2 write akrogon-owned lessons into akrogon (C). B: source delivery does not prove the consumer runs the guard. A check 2026-10-10: ~/.claude/skills/{chart,check,implement,merge,plan,seed,watch}-issue are symlinks into /home/ivan/Work/infra/akrogon/skills, and the akrogon command resolves to the akrogon checkout, so a merged akrogon guard runs for every consumer on the same machine.
- P3 charting links lessons to guard criteria (B). C: bounded by topic overlap, not a drain.
- Backlog: one-time /learn-issues per repo (C); opportunistic only (B).
- Count-based seed ranking dropped: case count is not impact (B).
- Practitioners: Meadows, Leverage Points (1999) https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/ (A,B,C): change the rule at the flow, not add a buffer. Senge, shifting the burden https://thesystemsthinker.com/the-shifting-the-burden-archetype/ (C): a symptomatic operator pass weakens the seats' own loop.

## Taken
Operator 2026-10-10: "1a | 2a | 3a | My note: We need an automatic systemic process to fix this without bloating or increasing the mental model for how it works. Is there current machinery in the current system based on your stock and flow analysis and based on reinforcing and balancing loops that can do this without any additional cost to speed, quality, and elegance?"

- 1a: before writing a lesson the seat checks the list for the same failure cause (not shared keywords); on a match it appends the case to that lesson's history file and adds no line; a matched checkable lesson without a seed gets one (promotion 1a). Unsure means a new line. Foreclosed: always a new line.
- 2a: a lesson about an akrogon skill or command is written into akrogon's learnings/, left for the operator to commit; akrogon not found means visible notice and a local write. Foreclosed: keep in the consumer repo.
- 3a: one-time /learn-issues run per repo for the existing backlog. Foreclosed: leave the backlog. The operator note asks whether existing machinery can replace even this; see focused check in slots/stock-flow-final-check-*.md.
- Operator note answered 2026-10-10 after focused checks (slots/stock-flow-final-check-B.md, -C.md): A proposed "relevance is recurrence" (planner files seeds for relevant unseeded lessons). B and C rejected it: relevance is not a repeat failure, it adds gh calls to the plan pass on every leaf's critical path, needs plan-issue:27 widened and one filer in debate mode, turns guarded lines into seeds instead of deletions, and leaves reader cost unchanged. A withdrew it. No existing machinery drains the backlog for free; the chosen rules (write-time match and seed, guard-leaf removal) are the automatic loop, and 3a stays a required one-time operator step.
