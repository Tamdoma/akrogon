# Final-shape check, slot B

Read: final-shape.md and the seven fork files. Live sections are ones I hold from the map round, plus one search for restated lines. W2: no problem. I accept "no named default" in W1.

## W1 standing-design

1. Too wide. "A number with no named source decides nothing" and "a bound whose source is named" are not limited to model output. A timeout, retry count, wave size or repair-round bound picked in a design has no operator source, and under autopilot the door's pick "never supplies that source". The rule-core fork says this trap is removed by listing such bounds as mechanical in the same line, and W1 lists only spend. Fix: scope both phrases to a number that stands in for a model's choice, and name process bounds (rounds, waves, retries, timeouts) as mechanical.
2. Record for every choice. "The model ... makes it and records the choice, its reason and the evidence" has no limit. The merged notes (K2) had "only for a choice a criterion or next step depends on". Without it every sentence a model writes needs a record and a "record exists" check. Fix: restore that limit.
3. Two sibling lines left unedited. "Each done-criterion is proven by the cheapest sufficient test" still covers the choice part and says "a real model or outside call can be cheapest", against "a choice never buys a paid call". The slow-run line lets a leaf fix in-branch only when "no acceptance rule changes", which W7's removal does. The serp case was a slow-run leaf. Fix: add both to the scoping edits.
4. "Advances on product state or the record's presence" should also allow the recorded choice's key value. Otherwise a driver cannot follow the model's decision.

## W3 shapes.md

5. Two places list the allowed proof forms as "the own-test, end-to-end, real-outside-call and live-run forms": the Leaf files brief template and the audit sentence before the refusal list. Neither includes the record-and-reading form. A strict door can refuse a model-choice criterion for having no allowed proof. Fix: add that form at both places.

## W4 autopilot.md

6. "The door never answers a fork with a count ... on model output" is absolute. W1 and W3 allow a count when the operator's words for this outcome or an outside standard supply it. Fix: add that exception to the first clause.
7. W4 changes autopilot's own limits. `autopilot.md` holds a step on main or a lesson write that does so for the operator. A leaf is neither. Fix: name this at the handoff review.

## W5 plan-issue and W6 check-issue

8. Design lines are missing. W3 refuses "a criterion or design line". W5 and the W6 scenarios sentence read only a criterion. In serp-wireframing the proxies were fork picks, so they sit in the design's binding decisions. The planner must build that gate, W6 calls it a Fix, and the repair needs a locked decision changed, which ends the pass `failed` (`implement-issue`, Shared context). Fix: "criterion or design line" in W5 and W6.
9. A leaf already past planning has no recorded reading. W6 says the proxy "blocks as the plan's recorded reading", and only the planner writes one. `implement-issue`, check.fix still says repairs happen "without weakening criteria or failing tests". Fix: the earliest seat records the reading, A under the existing `## Implementation notes` in `plan.md` when planning is over, and one clause in check.fix says this reading and dropping its case is not weakening a criterion.
10. `check-issue`, check.review, "Compare tests with acceptance criteria" keeps two unedited phrases. "Wording coupling that does not fail today" is a Nit there, and a new test matching model-written text is a Fix on sight in W6. The restated "new behavior shows one deliberate break" is scoped in standing-design (W1) and implement-issue (W7) and not here. Fix: except model-written text from the Nit phrase, and scope the restatement.
11. "B names", "B reads", "judged by B": check.review has A and B both reviewing blind. As written A's review is not held to the bar. Fix: "the reviewing seat".

## W7 implement-issue

12. A removed product gate carries no `Test-Change:` trailer, so B's trailer list misses it. Fix: the report lists every removal with the refused output it cites.

## W8 lessons

13. The four Sort outcomes are restated in three places W8 does not name: the learn-issues frontmatter description, `skills/AREA.md` and `docs/reference/skills.md`. check.review calls a wrong doc claim a Fix. Fix: add them to the W9 site table.

## W9 leaf and proof

14. Criterion (2), "the repo's existing checks pass", is a repo-health claim. The audit refuses a criterion "claiming repo health outside leaf ownership" and allows a repo-wide `checks` command only when the chart names the property (`shapes.md`, Preflight and validation). `akrogon verify` runs `checks` anyway. Fix: drop it, or name the leaf-owned results: links in the changed files resolve and the readiness example parses.
