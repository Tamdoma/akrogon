# Fork notes: finding-against, slot B, 2026-11-19

Read: forks/finding-against.md `## Question` and `### Carries`, forks/door-record.md `## Taken` (marker and seed-writer `## Taken` held), check-issue `## check.review` Fix bar. Held from the map exchange: chart-issues `## Take` and `## Handoff`, questions.md round paragraphs, autopilot.md, plan-issue `## Shared context`.

## Q1. What counts as a finding, and how is it raised in manual mode?
Pick: a finding is a fact with evidence and a concrete consequence if the decision is built as written. It comes only from work the door does anyway (map, research on open forks, Take's proofs, leaf writing). The door runs no research asking whether the decision is right.
- Two kinds. Blocking: the leaf cannot be written or proven as decided (a named surface is gone, a proof of the done-test fails, the shapes audit refuses the done-test, it clashes with a lock). Other: it can be built and proven, and something real still goes wrong.
- Not a finding: a simpler design, a preference, an untried alternative, doubt, or a consultant's taste. Those go nowhere.
- Blocking, manual: its own fork file, open, asked in the next round with the fact, the evidence, and options keep or change. The door may offer the smallest change that removes the fact, labelled as the door's. A change is a dated correction under the decision's `## Taken`.
- Other, manual: written in the decision fork's `## Findings` and shown once in the next round as a keep-or-change question. Silence keeps the decision, because the decision is already the answer. A "keep" is recorded and the finding is not raised again.
- Reason: the operator said a finding "is still fine" and the starting point "has to be" the decision. The bar and the no-research rule keep the first from undoing the second.
Rejected:
- An ordinary fork with a door recommendation, answered per mode. Under autopilot A would answer it, which signpost 2a excludes.
- Any doubt counts. That is the re-asking #144 reports, moved one step later.
- Recorded only, never asked. A blocking fact leaves the implementer guessing, which chart-issues `## Take` forbids at handoff.
Evidence:
- operator · signposts `## Taken`, the 2a correction, verbatim in the carries · it sets both halves of the pick.
- better-than-training · check-issue `## check.review`, read 2026-11-19 · a Fix is "wrong behavior, a broken contract or a maintainability defect with a concrete consequence today", and "Uncertainty alone is not a Fix" · the same bar, already used by the review seats.
- better-than-training · chart-issues `## Take` · every key part of a kept done-criterion gets one real observation before handoff · blocking findings surface from a step that already runs.
Pitfalls:
- A consultant restates a preference as a fact. Removed by the bar: no consequence named, no finding.

## Q2. What does autopilot do with a finding?
Pick: A never answers it and never edits the decision's `## Taken`, under autopilot and full autopilot alike. What happens depends on the kind.
- Blocking: the chart waits for the operator under the existing wait for an approval that is not a grant, with one `akrogon notice --attention`. Other handed charts go on. A cannot cut a locked done-test the way it cuts an unproven clause, since the cut would change the decision.
- Other: A charts around the decision as written. The finding goes in the decision fork's `## Findings`, into each affected leaf design as a held disagreement, and into the pass-end line. No wait.
- Reason: handing off a leaf that cannot be built as decided fails later in implement or check, at the price of a lifecycle run. Everything below that line must not stall, or autopilot loses its point.
Rejected:
- Any finding parks the chart. Stalls on things that do not stop the build.
- No finding ever parks. A hands off a contract it has shown cannot pass.
Evidence:
- better-than-training · chart-issues `## Take` · a cut that removes the useful outcome "parks the chart for the operator under the existing approval-that-is-not-a-grant wait, never answered by A" · the wait exists, no new kind.
- better-than-training · chart-issues `## Handoff`, leaf-writing paragraph · "carrying any held disagreement into the leaf design" · the carry exists.
- better-than-training · plan-issue `## Shared context` · on a disagreement "the design wins" and the conflict "is written into the plan as a note for review" · a carried finding does not let the planner redesign.
Pitfalls:
- A calls a finding "other" to avoid the wait. Removed by the test being Take's own: can each done-criterion's key part be observed. A failed proof cannot be relabelled.
Questions the fork does not ask:
- Does leaf-carry give the held disagreement a fixed place in the design? The planner and reviewer need to find it.

## Q3. Who settles conflicting decisions, and words that read two ways?
Pick: a conflict between two operator answers is the operator's alone, in every mode. Words that read two ways are an open question answered per mode.
- Two seed decisions, or a seed decision against a round reply: shown in one line and asked. Under autopilot and full autopilot the chart waits. A later date does not win by itself, since the two may come from different people (marker decision 2).
- A seed decision against a pick A made under autopilot: no conflict. A's pick is marked superseded, kept in the record, and that fork is answered again around the decision.
- An operator's round reply that contradicts a taken seed decision: the door shows the clash before recording, since the operator may not have meant it.
- Two readings: only when the text supports both and the leaf differs. Signpost 2a leaves what the decision does not state chartable, and a point with two readings is not stated. Manual: one question. Autopilot: A takes the reading the seed's own text and background support best, labels it A's with the other reading named, and it goes in the pass-end line. A reading never contradicts the plain words.
- I change my earlier position here. In the marker notes I picked "the operator settles ambiguity". Seed-writer decision 1 now has the agent infer the section with no display, so loose wording will be common, and a wait on each would stall most charts.
- Text to change: questions.md says an unresolved conflict about a fork "becomes a fork answered per mode". It needs one clause: a conflict between operator answers is asked of the operator in every mode.
Rejected:
- The later date wins. A colleague's later section would silently override the operator's.
- A resolves conflicts under full autopilot, as it does for signposts. A seed decision binds in every mode (signpost 1a).
- Ambiguity always waits for the operator. See above.
Evidence:
- better-than-training · questions.md, signposts paragraph, read 2026-11-18 · signposts conflicts are "shown in one line and asked", fork conflicts are "answered per mode" · the fork rule is the one that lets A pick between operator answers.
- better-than-training · door-record `## Taken`, decision 1 · the door's reading of a decision is "labelled the door's reading (A's under autopilot)" · the label for a chosen reading already exists.
Pitfalls:
- A treats a conflict as two readings to avoid the wait. Removed in part: a conflict is two plain statements, and the label and pass-end line show A's reading. Not fully removable.
Questions the fork does not ask:
- When the decider is a colleague and the door's operator disagrees, whose word stands? My pick: the person at the door, as a dated correction naming both.
