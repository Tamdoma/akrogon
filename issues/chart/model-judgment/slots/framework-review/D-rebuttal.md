# Rebuttal on X9 (slot D)

`PI` = /home/ivan/Work/infra/akrogon/skills/plan-issue/SKILL.md. `WL` = /home/ivan/Work/infra/tamdoma/framework/issues/open/serp-wireframing/wireframe-skill-revamp.

## 1. Why I wrote X9

- N1 Plan works "from the brief and design" (`PI:39`), and "A done-criterion locks only its observable result" (`PI:43`). I read that as: plan adds no decisions of its own, so a clean criterion gives a clean plan. I did not reread `PI:45-53` against my own X1 before writing X9. That was the gap.

## 2. Does the per-condition rule fire on a loose judgment criterion? Yes, the record shows it.

- N3 Rule: "Each condition a decision can reachably break gets a case that fails on that violation ... Each such case is shown red at planning by a temporary edit" (`PI:51`).
- N4 Record, after the loose-judgment amendment: "C3 "the brief records the call" (case `[wf-c3]` card without `call` refused, blank rationale refused; red by a temporary edit making `call` optional)" (`WL/plan.md:224`).
- N5 What it produced there was a function check only: "the key exists, `use` is one of the two, `rationale` is not blank" (`WL/plan.md:218`). It did not produce a wording or count test. But that plan had the rule in its own inputs: design L1 and brief criterion 13 (`WL/brief.md:41`). A leaf without those lines has nothing in `PI` that stops the planner from giving the choice itself an expected value.

## 3. Verdict: I change X9 for plan-issue. I keep it for implement-issue and merge-issue.

- N6 C's factual claim holds: the rule fires after charting (N3, N4).
- N7 My X1 cannot work without a plan-issue change. X1 says the proof of a model's choice is "one recorded real run read by the review seat" and "The deliberate-break line does not apply to it". Plan-issue says the opposite in three places:
  - "A plan proves the brief's done-criteria with the leaf's own tests and `checks` commands" (`PI:45`).
  - "a criterion whose proof needs new proof machinery ends the pass with `akrogon phase <slug> failed`" (`PI:45`). A reviewer-read proof could be read as new machinery and fail the pass.
  - "A writes a test for each done-criterion no existing test or `checks` command already proves ... each new test is shown red" (`PI:53`).
  The planner follows its own skill, so X1 would lose.

Where I still differ from B and C: "no case and no test" for a judgment criterion is too wide. The record of the choice is function, and the operator's own decision keeps function checks: "content exists, keys and states are valid, references resolve, nothing is blank" (`WL/design.md`, loose judgment L1). The `[wf-c3]` case in N4 is that kind of check and should stay. Without it a blank reason passes every script.

Implement-issue and merge-issue stay unchanged: "Implementation runs the planned tests rather than writing them" (`implement-issue/SKILL.md:56`).

## Exact text change

New paragraph in `PI`, placed before line 51 so it governs both 51 and 53:

"A criterion or condition that standing design marks as a model's choice is proven in two parts. The record of the choice takes the cases and tests this section requires: it exists, its keys and states are valid, its references resolve and its reason is not blank. The choice itself takes none: no test, case or deliberate break holds an expected value for what the model chose or wrote. For it, `plan.md` names the recorded run and the outputs the review seat reads, and this is not new proof machinery."

One matching clause is needed in `check-issue/SKILL.md:51`, or review reopens it. That line blocks "when a done-criterion has no test that would catch its failure". Add: "except the choice part of a model-choice criterion, which the review seat reads on the recorded run."

## Bottom line

X9 was wrong for plan-issue. Adopt the plan-issue change, but split each judgment criterion into the record (tested) and the choice (read by the reviewer), instead of B and C's "no test at all".
