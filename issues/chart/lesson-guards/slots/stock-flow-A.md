# Stock-flow notes, slot A

## Map
- Stock: active lines in learnings/LESSONS.md (framework 144, akrogon 20).
- Inflows: four writers, plan-issue:39, implement-issue:31, check-issue:59,89, chart-issues:31. Each writes a line plus a history file. Nothing checks for an existing line on the same mechanism.
- Outflows today: /learn-issues (operator, rare) and implement-issue:31 "applying a lesson removes its active line" (rare). After Taken 4a: guard leaves remove their line, but only after seed -> chart -> leaf -> merge, a long delay, and only for checkable lessons.
- No outflow for judgment lessons, for lines already guarded but still listed (src/phase.ts:320 vs LESSONS.md:10), or for lines whose owner is another repo. So the stock grows roughly with inflow.

## Pick: put the balancing loop on the write itself
The write is the only event that grows the stock, so an outflow attached to it scales with inflow automatically. No new pass, command or state.
1. Match before adding: the writer searches the list for the same mechanism. On a match it appends the new case to that lesson's history file and adds no line. Balancing: the bigger the stock, the more writes become matches, so inflow slows.
2. Recurrence promotes: a matched lesson has now happened twice, which is the evidence it deserves a guard. If it is checkable, the 1a seed is filed for it, even if it is old backlog. Reinforcing loop on the outflow: repeats drain into seeds, seeds into guards, guards remove lines (4a).
Cost: one search per lesson write, inside a step the seat already does. Lessons are written a few times a day.

## Rejected
- Stock cap with eviction: forces the writer to judge which old lesson to drop; quality risk.
- Planner prunes on every plan: adds work to every leaf (slowdown).
- Timer sweep or learn-issues: new pass, operator declined.

## Evidence
- better-than-training: skill lines above, read 2026-10-10.
- practitioner: Donella Meadows, "Leverage Points: Places to Intervene in a System" (1999, https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/), changing the rules of a flow beats adjusting numbers; a stock with no outflow grows. Led to fixing the inflow rule, not adding a sweep.

## Pitfalls
- Bad match merges two different mechanisms: match on mechanism, not wording; when unsure, add a new line.
- Backlog lessons never repeated stay forever: open question below.

## Open question
What drains lessons that never recur? Options: leave them (harmless but planners read noise), or age out after a fixed time with the history file kept.
