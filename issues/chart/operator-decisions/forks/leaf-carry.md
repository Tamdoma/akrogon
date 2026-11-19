# Leaf carry

## Question

Q1. How do a decision's `Done when:` and `Not in scope:` reach the leaf, and where does a held finding sit in the design?
Q2. Do the docs lines that the change makes false belong to this work? Signposts 5a says "rule text in existing skill files only". Lines: docs/use/report-an-observation.md (seed-issue "never proposes a fix", six sections), docs/use/plan-work.md and docs/use/autopilot.md ("In the default manual mode you answer the signposts and every fork").
Q3. How is the work split into leaves?

### Carries

- Signposts, marker, seed-writer, door-record, finding-against `## Taken` (forks/*.md).
- Live surfaces: shapes.md `## Leaf files` ("Binding decisions, verbatim"; done-criteria rules) and `## Preflight and validation` (audit refusals); chart-issues SKILL.md `## Handoff` (held disagreement carried into the leaf design); plan-issue `## Shared context` ("the design wins"); check-issue `## check.repair` (no repair changes a locked decision); learnings/LESSONS.md 2026-09-11 line (grep docs for a changed rule and own or report the hit); tests/docs-links.test.ts.
- Surfaces the change touches: skills/seed-issue/SKILL.md; skills/chart-issues/SKILL.md; skills/chart-issues/assets/questions.md, shapes.md, autopilot.md.

## Findings

Notes: slots/leaf-carry-A.md, slots/leaf-carry-B.md, merged slots/leaf-carry-merged.md (picks agree; held-finding placement resolved toward B). B rebuttal slots/leaf-carry-rebuttal-B.md accepted: R1 the taken test case is a made-up body in the marker shape, #144's public body is the not-taken case, and no text from a private seed (#714) enters the repo; R2 the charting grant is recorded in the leaf's `grants` with `expires` at charting and a stop line forbidding any covered operation by the leaf (A's reading of `## Take`; src/readiness.ts `grantSchema` has an optional `expires`), so it grants the implementer nothing; R3 `## Held disagreements` is added for findings against a decision only, with no rule text about consultants.
Observation (A, 2026-11-19): `grep -rln "Binding decisions\|Leaf architecture" src/ tests/` finds nothing, so no command validates design headings and an optional `## Held disagreements` heading parses.

## Taken

Operator, 2026-11-19, verbatim: "1a | 2a | 3a"

Binding decisions:
1. Carry (Q1 1a): the decision fork's `## Taken` is copied whole under the design's `## Binding decisions, verbatim`. The brief's done-criteria are the door's, each naming the `Done when:` clause it covers; a restatement keeps the same observable result; a clause the shapes audit refuses is a blocking finding (finding-against 1), never a silent rewrite; door criteria for what the decision leaves open are labelled the door's; a decision with no `Done when:` leaves criteria an ordinary open fork. `Not in scope:` items go to CHART.md Off route with the decision as the reason and into each affected design as exclusions; nothing is filed for them unless asked. A finding against a decision that the operator kept, or left unanswered, sits under a design heading `## Held disagreements` after the binding decisions, present only when needed, each entry naming what it is against, the fact, evidence, consequence, who raised it and its state (kept by the operator on a date, or unanswered), opening with "not a decision, the decision stands". No rule text about consultants' held disagreements is added.
2. Docs (Q2 2a): signposts 5a corrected to "rule text in existing files": the leaf fixes only the docs sentences the change makes false (docs/use/report-an-observation.md, docs/use/plan-work.md, docs/use/autopilot.md, and any other hit of the changed rules in docs/), adding no page.
3. Split (Q3 3a): one issue, one leaf, lifecycle route; direct not taken (changes the door's own rules for every consumer; B shaped every fork). Test cases: a made-up seed body in the marker shape (taken) and #144's public body (a mention, not taken); no text from a private seed enters the repo. The seed-writer charting grant is recorded in the leaf's `grants` with `expires` at charting and a stop line forbidding any covered operation by the leaf.
Foreclosed: `Done when:` as criteria verbatim; held findings inside binding decisions or as `Open for the plan:`; docs left false or seeded separately; two leaves; direct route.
