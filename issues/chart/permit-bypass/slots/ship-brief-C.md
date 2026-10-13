# Brief for slot C: ship plan (blind, write before reading other slots)
Write /home/ivan/Work/infra/akrogon/issues/chart/permit-bypass/slots/ship-C.md, under 60 lines, file:line per claim.

## Operator, verbatim, 2026-10-13
"This is crazy, everything is waiting because of these stops. We cannot have that happen anymore."
"Consult with both slots, come up with a solution, give me the questions and answers and let's hand it off and build it right away."
Watch tab numbers (operator screenshot, framework timings 12:15-15:08Z): permit held ~123 of 173 min; 34 runs, median wait ~13 min, 10 over 40 min, max 115; ~16 h total seat waiting; cheap (15 s) waited 26-64 min; ~10 red runs re-queued.

## Taken (read the fork files): guarantee (no line), load-guard 1b+2a (start check near slice memory limit; sweep done: slots/sweep-results.md, 2 runs 45 GB, 4 runs 58.6 GB partial), cross-leaf-kill 1a (per-run unit, scoped stop-run, rule; rule committed 873db4e). Framework test-cost chart is separate (not this handoff).

## Your job
1. For each remaining open fork (forks/worker-duty, dispatch-wip, long-run-path, evidence, ceiling-trigger): your proposed answer in one line, or "fold/close" with reason. Keep only what this handoff needs; push the rest Off route.
2. Proposed leaves for akrogon, smallest set that ends the waiting fastest, in dependency order. For each: scope, files, done-criteria, proofs needed (real calls), and estimated size. Say whether removing the permit can ship first, alone, before the memory start check and per-run unit, given the sweep numbers and max_active 20 (and what max_active should be meanwhile).
3. Anything the operator must decide that you cannot answer.
