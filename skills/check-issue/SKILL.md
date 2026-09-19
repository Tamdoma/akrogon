---
name: check-issue
description: Review a leaf implementation with concrete-defect verdicts, or re-check only its repair diff as slot A after check.fix.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt.

# Check issue

The prompt is `check-issue <slug> slot=<A|B> phase=check.review leaf=<folder>`; initial review has both slots, while a review after repair belongs only to A.

## Shared context

Read `akrogon config` once, locate the unique slug under the registered repo's authoritative `issues/open/`, then read its `plan.md` including any implementation notes, `design.md`, `implementation/report.md` and this skill's [ponytail.md](ponytail.md) before inspecting the worktree diff.

Pass artifacts are written under the `leaf=` folder while code is read and edited only in the worktree, and a manual prompt naming a slug without `leaf=` falls back to locating the slug under the registered repo's `issues/open/`.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

The command owns state, verdict aggregation, repair counts and dispatch; an existing review and unchanged diff are evidence to resume from, not a reason to repeat completed work.

Each review seat reaches its verdict from the artifacts and the diff, posing no questions and leaving the pass unheld while undecided. When a step physically requires the operator (a permission the seat cannot grant, an env value it cannot obtain), the seat writes the blocker and the exact operator action into `review-<slot>.md` under the `leaf=` folder, runs `akrogon phase <slug> failed --reason "<blocker; see review-<slot>.md>" --slot <A|B>`, and ends the pass.

Each review seat never opens, prints, appends to, or writes `.env` or `.env.*` with any tool, instead running any script that needs values as `bun --env-file=<file> <script>` to print only results, never values, and checking presence by name with such a script printing `present`/`absent` per name, ending the pass with the stop above when a required value is absent.

## check.review

During initial review, both A and B work blind: do not contact or wait for the peer, or read the peer's current review. Record unresolved questions as findings in your own `review-<slot>.md` under the `leaf=` folder and account for them in your verdict under the Fix/Nit rules below. Uncertainty alone is not a Fix.

As A, read your own `positions-A.md` and `rebuttal-A.md` first when debate produced them, then judge the whole initial diff against the plan's decisions, criteria, change list and checklist, the design's exclusions, the report and live contracts, following affected docs and index pointers and checking any lesson claim against its evidence.

For each `AREA.md` in the reviewed diff, use one shell command to list the paths it names and whether they exist from the repository root. Record missing paths as a Fix with done-criterion evidence. For a deleted area file, review the deletion and affected index pointers against the plan without opening the removed file.

Start from the changed behavior and open the doc page describing it even when the page is unchanged. A wrong claim or a path that does not exist is a Fix. Otherwise write one line that no documented behavior changed.

A's earlier arguments focus attention but are not additional acceptance criteria; missing debate artifacts on a `debate: no` leaf are expected, and `learnings/LESSONS.md` is not review input.

Write your findings to `review-<slot>.md` under the `leaf=` folder, recording the base and reviewed head, verification evidence and a verdict of `ready`, `nits` or `fix`, with each Fix citing a done criterion, failed blocking check or reproducible defect, and each Nit explaining its reason.

A Fix is wrong behavior, a broken contract or concrete maintainability defect, including a ponytail concern when it is also a defect; an argument grounded only in A's position is a Nit and cannot open repair.

Compare tests with acceptance criteria and reject mocks of the unit under test and akrogon tests of prose/output wording, except commands, numbers or fixed references that run literally as written.

All `checks` commands block, optional `advisory` failures are Nits, and a report gap blocks only when material to correctness or verification.

Rerun checks only for a code change, missing evidence or a specific concern, leaving doc/index authorship with B and recording any reusable lesson found here as one active mechanism/date/history line plus a history file with case, evidence and learning, written under the registered checkout's `learnings/` and left for the operator to commit.

On re-check after `check.fix`, inspect only the repair diff from the prior reviewed head (or the rebased head A recorded at merge), append A's results to `review-A.md` under the `leaf=` folder, confirm earlier findings and add a blocking finding only for a defect introduced by the repair.

Finish with `akrogon phase <slug> <next> --slot <A|B> --verdict <ready|nits|fix>`, requesting `check.fix` for fix or `merge` for ready/nits, then print the footer and stop.

A `recorded` result waits for the other initial verdict; the command derives the aggregate result, including a fix from the peer, so the requested destination is not proof of movement.

## Printed footer

```text
Last operation: <review findings and actual phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase> leaf=<folder>
```

`check.fix` routes to implement-issue B, `merge` to merge-issue A, an outstanding initial review to check-issue in the remaining slot, and `Next: none <reason>` covers failed or waiting outcomes.
