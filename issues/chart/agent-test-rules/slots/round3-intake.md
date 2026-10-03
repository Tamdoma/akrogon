# Round 3 intake (blind; do not read round3-A*)

## Operator answer (verbatim)
4 - I don't want anything to come back manually. At what phase would that happen? | 5a | 6a | 7a |

Taken: 5a (real boundary by default, units only for tricky logic, E2E only when smaller misses), 6a (delete false/outdated checks with reason, duplicates only naming the survivor, batch checked, keep real-regression tests), 7a (fail-before/pass-after for fixes, one deliberate break for new behavior, no mutation score).

## Current Question (Q4 reshaped)
Q4 4a said a seat that finds a bad locked criterion sends it back to the chart owner. Operator rejects any manual return. Questions:
1. In today's lifecycle, at which phase would such a return happen and what would it cost (cite plan-issue, implement-issue, check-issue lines; e.g. plan:29,65, check:55, `akrogon phase failed`)?
2. Propose fully automatic handling of a criterion that fails the bar (names outcome, realistic break path, source of expected result), with no human step after handoff. Consider: bar applied at the chart door when criteria are written; plan.synthesis may drop/narrow with recorded reason and B checks at review; check.review treats a failing criterion's test as a Nit; others. Who decides, at which phase, what stops an agent from shrinking its own target.
Write round3-B.md: answer to 1, options with recommendation and pitfalls, under 60 lines.
