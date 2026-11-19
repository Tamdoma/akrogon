# Fork notes, slot A: leaf-carry, 2026-11-19

## Q1 Done when / Not in scope / held finding
- Pick: the decision fork's `## Taken` is copied whole under the design's `## Binding decisions, verbatim`, so `Done when:` and `Not in scope:` arrive verbatim. The brief's done-criteria are the door's, each naming the decision line it serves and passing the shapes audit; a `Done when:` the audit refuses is a blocking finding (finding-against 1), never a silent rewrite. `Not in scope:` items go to CHART.md Off route with the decision as the reason and into each design as exclusions. A held finding sits directly under the decision it concerns, labelled `Held finding:` with its evidence, inside `## Binding decisions, verbatim`. Reason: plan-issue already says the design wins and check-issue refuses to repair a locked decision; one fixed place lets both find it.
- Rejected: `Done when:` as the done-criteria word for word (breaks when the audit refuses its form); a separate held-findings section (separates the finding from the decision it qualifies).

## Q2 Docs
- Pick: in scope, as a signposts correction: "existing files" covers the three docs lines; no new file. Reason: LESSONS 2026-09-11 (stale rule in docs); leaving them false misleads the next reader. Cost: the operator corrects a signpost.
- Rejected: skills only plus a seed for docs (a known false line ships).

## Q3 Split
- Pick: one issue, one leaf. One outcome; the writer (seed-issue) and reader (chart-issues) share the marker literal and must land together for an agreement test on that literal. Cost: one larger diff of about a dozen sentences across six files.
- Alternative: two parallel leaves (writer, reader), no dependency; each would need its half of the literal agreement.
- Direct route: refused, since the leaf's readiness carries the charting grant (chart-issues `## Direct route`: "the draft needs `inputs`, `grants`, `produces` or `retained`").
