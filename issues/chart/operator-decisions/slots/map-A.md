# Opening map, slot A, operator-decisions, 2026-11-18

Surfaces read at main 5efc625d: seed-issue SKILL.md `## Report` and body template; chart-issues SKILL.md `## Open` import, `## Take`; questions.md round rules paragraph; shapes.md intake and fork shapes; autopilot.md opening; check-issue SKILL.md repair limits; docs/use/report-an-observation.md; #714 via gh (open, author ivanjuras, created 21:53Z, updated 22:32Z); framework mirror has no #714 file yet (not pulled since filing).

## Forks
1. Marker shape. A fixed heading `## Operator decision (<name>, <date>)` with a free body (as #714), vs fixed heading plus required parts (design, Not in scope, Done when). Pick: fixed heading, body free but its parts read as written. Required parts invite refusing a real decision for a missing line.
2. seed-issue writing rule. The Report rule's "adding no recommended fixes" stays for agent text; a sanctioned section holds only a decision the operator stated or approved in that conversation, attributed to the operator with date. Sub-question: also an edit route that appends the section to an already filed issue (how #714 got it), vs filing time only. Pick: both, since #714's real path was an edit. Risk: agent writes its own recommendation under the heading; removed by the rule naming who may author it and by the door showing it at the map.
3. Door import. The section, copied verbatim under the source, also becomes one taken fork `forks/operator-decision.md` whose Taken is the section verbatim plus provenance (identity, heading); listed under Forks taken and shown as already decided in the opening map. Remaining forks are only what it leaves open. Alternative: keep it in INTAKE only and add a rule "do not ask". Pick: taken fork, because shapes.md counts taken by `## Taken`, leaf designs copy taken forks verbatim, and check-issue already refuses to repair a locked design decision (check-issue SKILL.md `B repairs every Fix except a change to a locked brief or design decision`).
4. Finding against the decision (operator 2a correction). Manual: shown as a finding with evidence in a fork round; only the operator's answer changes it, appended as a dated correction. Autopilot: A keeps the decision, records the finding, never picks against it; options are proceed-and-record vs park the chart for the operator. Pick: park only when the decision cannot hand off as stated (a proof fails), else proceed and record.
5. Exceptions to "Recommendations and silence cannot supply an operator answer" (questions.md) and autopilot's evidence picks: one named exception for the recorded decision, stated once and linked, not copied.

## Pitfalls
- Stale intake copy after a later edit: signposts 4a reads the seed as pulled at door open; the door already pulls at open.
- Decision names an external operation: still needs its Take proof; the decision never waives proof.
- Two seeds with conflicting decisions in one chart: conflict shown and asked (existing conflict rule).
- docs/use/report-an-observation.md says seed-issue "never proposes a fix": the seed leaf owns that doc line (lesson 2026-09-11 stale rule in docs).
- Change reaches doors only at the next release link.

## Split
Two leaves of one issue, side by side, no dependency: (a) seed-issue writes the section; (b) chart-issues reads it as taken. Both follow the marker shape fixed in this chart, so neither waits on the other. Alternative one leaf.

## Proofs
All free. Rule-text criteria: review seat reading against #714 as the case. Key parts existing today: pull rewrites mirrors from the current body (src/pull.ts pullRepo); check-issue locked-decision limit; shapes.md leaf design "Binding decisions, verbatim".
