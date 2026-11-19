# Fork notes: leaf-carry, slot B, 2026-11-19

Read: forks/leaf-carry.md `## Question` and `### Carries`, forks/finding-against.md `## Taken` (the other four `## Taken` held), check-issue `## check.repair`. Held from earlier: shapes.md `## Leaf files` and `## Preflight and validation`, chart-issues `## Handoff` and `## Direct route`, plan-issue `## Shared context`. Read-only greps.

## Q1. How do `Done when:` and `Not in scope:` reach the leaf, and where does a held finding sit?
Pick: the decision fork's `## Taken` is copied whole under the design's `## Binding decisions, verbatim`, as the existing rule already does. That carries both lines untouched. Three door steps sit on top.
- `Done when:`: the brief's Done-criteria are the door's, each naming the clause it covers. The door may restate a clause as an observable result when the result is the same, since a criterion "locks only its observable result" (plan-issue `## plan.synthesis`). A clause that cannot be stated in a form the shapes audit accepts is a blocking finding (finding-against decision 1), never a silent rewrite. The door may add criteria for what the decision leaves open, labelled the door's.
- `Not in scope:`: each item goes to CHART.md `## Off route` with the decision as the reason, and into each affected design as an exclusion. The door files nothing for them unless asked.
- Held finding: one fixed heading in the design shape, `## Held disagreements`, after the binding decisions, present only when there is one. Each entry says what it is against, the fact, the evidence, the consequence, who raised it, and its state: kept by the operator on a date, or unanswered. It opens with a plain line: not a decision, the decision stands.
- Reason: no later seat's skill mentions a held disagreement today (grep of plan-issue, implement-issue, check-issue, 2026-11-19), and signpost 3a adds no rule there. So the entry has to explain itself where the planner and reviewer read.
- Cost: one heading added to the design shape in shapes.md. Consultants' held disagreements on drafts (chart-issues `## Handoff`) get the same home, which they lack today.
Rejected:
- `Done when:` becomes the Done-criteria as written. `## Preflight and validation` refuses a criterion naming a test file, count or guessed number, so a valid decision could fail the audit.
- The held finding as an `Open for the plan:` question. The plan answers those as plan decisions, which hands the planner the redesign.
- The held finding inside `## Binding decisions, verbatim`. A note that binds nothing sits among text that binds.
- The held finding in the brief's Why. The reviewer judges against the design's decisions and exclusions.
Evidence:
- better-than-training · shapes.md `## Leaf files` · "Copy every binding decision into each affected leaf, with explicit exclusions" · verbatim carry and exclusions exist.
- better-than-training · check-issue `## check.repair`, read 2026-11-19 · "B repairs every Fix except a change to a locked brief or design decision" · a reviewer who meets the held consequence cannot repair it, so the entry's state line tells them the operator already knows.
- operator · #714 body · `Done when:` names an outcome at three callers, and `Not in scope:` lists four items with "File those separately if wanted" · both lines map as picked.
Pitfalls:
- The door narrows the done-test while restating it. Removed by the verbatim copy beside it. The reviewer reads both.
- A kept finding is raised again as a Fix in review. Removed by the state line "kept by the operator".
Questions the fork does not ask:
- A decision with no `Done when:`. My pick: the criteria are an ordinary open fork.

## Q2. Do the false docs lines belong to this work?
Pick: yes, as a dated operator correction to signpost 5a. The leaf fixes only the sentences the change makes false and adds no page.
- The lines, confirmed 2026-11-19: docs/use/report-an-observation.md "It never proposes a fix" and its six-section list, docs/use/plan-work.md and docs/use/autopilot.md "you answer the signposts and every fork".
- Reason: the first line tells a reader the feature does not exist. learnings/LESSONS.md's 2026-09-11 line says to own or report such a hit, and reporting it means a second chart for about four sentences.
- 5a was asked about code and paid proofs. Docs were not in the question, so this needs the operator's word, not A's reading.
- Cost: three more files in the diff. tests/docs-links.test.ts checks their links and anchors, so an added link must resolve.
Rejected:
- Report the hit as a seed. The docs stay false until someone charts four sentences.
- Leave them. The lesson exists because that happened before.
Evidence:
- better-than-training · learnings/LESSONS.md, 2026-09-11 line, read 2026-11-18 · a skill rule changed while docs kept the old one · the same failure, already recorded once.
Pitfalls:
- Other docs lines turn false and are missed. Removed by a done-criterion: a grep of docs/ for the changed rules finds no line stating the old rule, read by the reviewing seat.

## Q3. How is the work split?
Pick: one leaf, lifecycle route.
- Reason for one: the writer side (seed-issue) and the reader side (chart-issues) share the heading literal, the `### ` rule and the not-a-grant rule. One diff lets the reviewer check both sides agree. Two leaves would each need the other's promise named and owned (shapes.md `## Leaf files`), and the agreement test on the literal would order them.
- Cost: one wide review across about eight files of dense rule text.
- Direct route: eligible on my reading, and I would not take it.
  - The refusal list in chart-issues `## Direct route` turns on what the draft needs. The seed-writer grant covered a charting probe that is finished: one of two cycles used, fixture deleted and absent. The implementation edits text and needs no `inputs`, `grants`, `produces` or `retained`. No done-criterion needs a live run or outside call, and "charting proofs do not count". One outcome, no pending human prerequisite, B named, manual mode.
  - Unsettled: Take says the door's charting probe "counts against the leaf grant it runs under", which reads as a `grants` record on the draft. If A reads the draft as needing `grants`, direct is refused by the first line. A should state which reading it uses.
  - Why lifecycle anyway: direct is for a small job and the door "may recommend lifecycle for a risky small job". This changes the door's own rules and seed-issue for every consumer, and it holds an account check that guards a public repo. On direct the door rewrites its own rulebook with one reviewer, and that reviewer helped shape every fork.
Rejected:
- Two parallel leaves, writer and reader. Independent in principle, but the shared literal and its agreement test tie them.
Evidence:
- better-than-training · chart-issues `## Direct route`, refusal list, read 2026-11-18 · quoted above.
- better-than-training · forks/seed-writer.md `## Taken` decision 5 · "one of two cycles used, fixture deleted and absent".
- better-than-training · chart-issues `## Handoff` · a chart that changes the door's own skill "reaches doors only at the next release link" · #714 waits for a release either way (signpost 6a).
Pitfalls:
- A done-criterion claims a door stops asking. Signpost 5a forbids it. Removed by criteria the reviewing seat reads against two fixed cases, #714's body (taken) and #144's body (a mention, not taken), plus `bun test`.
- The unobserved limits get lost: a write-level caller of the permission read, and the Moderate mapping. Removed by copying marker's recorded limits into the design.
Questions the fork does not ask:
- Who reviews, if direct is chosen? B wrote notes on every fork. A lifecycle check seat reads it fresh.
