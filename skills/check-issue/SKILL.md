---
name: check-issue
description: Review a leaf implementation with concrete-defect verdicts, or re-check only its repair diff as slot A after check.fix.
---

After compaction, re-read this file, the slug's brief or plan, and this phase's references.

# Check issue

The prompt is `check-issue <slug> slot=<A|B> phase=check.review`; initial review has both slots, while a review after repair belongs only to A.

## Shared context

Read `akrogon config` once, locate the unique slug under the registered repo's authoritative `issues/open/`, then read its `plan.md`, `implementation/brief.md` and this skill's [ponytail.md](ponytail.md) before inspecting the worktree diff.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

For a necessary peer question, wait for idle, ask once through herdr in Question/Option form requesting `<leaf>/questions/<id>.md`, run `herdr agent wait` without a timeout, read the file and decide by simplicity, clarity, elegance, cost, speed and quality.

The command owns state, verdict aggregation, repair counts and dispatch; an existing review and unchanged diff are evidence to resume from, not a reason to repeat completed work.

## check.review

As A, read your own `positions-A.md` and `rebuttal-A.md` first when debate produced them, then judge the whole initial diff against the plan, brief criteria/change list/exclusions/done/report and live contracts, following affected docs and index pointers and checking any lesson claim against its evidence.

A's earlier arguments focus attention but are not additional acceptance criteria; missing debate artifacts on a `debate: no` leaf are expected, and `learnings/LESSONS.md` is not review input.

Write your findings to `review-<slot>.md`, recording the base and reviewed head, verification evidence and a verdict of `ready`, `nits` or `fix`, with each Fix citing a done criterion, failed blocking check or reproducible defect, and each Nit explaining its reason.

A Fix is wrong behavior, a broken contract or concrete maintainability defect, including a ponytail concern when it is also a defect; an argument grounded only in A's position is a Nit and cannot open repair.

Compare tests with acceptance criteria and reject mocks of the unit under test and akrogon tests of prose/output wording, except commands, numbers or fixed references that run literally as written.

All `checks` commands block, optional `advisory` failures are Nits, and a report gap blocks only when material to correctness or verification.

Rerun checks only for a code change, missing evidence or a specific concern, leaving doc/index authorship with B and recording any reusable lesson found here as one active mechanism/date/history line plus a history file with case, evidence and learning.

On re-check after `check.fix`, inspect only the repair diff from the prior reviewed head (or recorded rebase/conflict baseline), append A's results to `review-A.md`, confirm earlier findings and add a blocking finding only for a defect introduced by the repair.

Finish with `akrogon phase <slug> <next> --slot <A|B> --verdict <ready|nits|fix>`, requesting `check.fix` for fix or `merge` for ready/nits, and if it prints `moved failed` append A's diagnosis paragraph to `plan.md` explaining what kept failing and why before printing the footer and stopping.

A `recorded` result waits for the other initial verdict; the command derives the aggregate result, including a fix from the peer, so the requested destination is not proof of movement.

## Printed footer

```text
Last operation: <review findings and actual phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase>
```

`check.fix` routes to implement-issue B, `merge` to merge-issue A, an outstanding initial review to check-issue in the remaining slot, and `Next: none <reason>` covers failed or waiting outcomes.

The lines are printed only; for scrambled context, the first 50–100 words of the other pane can confirm what happened but cannot establish slot, phase, readiness, completion or a peer answer, and missing text does not block.
