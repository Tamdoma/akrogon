---
name: check-issue
description: Review a leaf implementation with concrete-defect verdicts, or re-check only its repair diff as slot B after check.fix.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt.

# Check issue

The prompt is `check-issue <slug> slot=<A|B> phase=check.review leaf=<folder>`; initial review has both slots, while a review after repair belongs only to B.

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

As B, read your own `positions-B.md` and `rebuttal-B.md` first when debate produced them, then judge the whole initial diff against the plan's decisions, criteria, change list and checklist, the design's exclusions, the report and live contracts, following affected docs and index pointers and checking any lesson claim against its evidence.

For each `AREA.md` in the reviewed diff, use one shell command to list the paths it names and whether they exist from the repository root. Record a missing path as a Fix only with its realistic source, its consequence today, and the criterion or gap it hits, citing the live listing as the trace and the dead-pointer consequence today. For a deleted area file, review the deletion and affected index pointers against the plan without opening the removed file.

Start from the changed behavior and open the doc page describing it even when the page is unchanged. A wrong claim or a path that does not exist is a Fix only with its realistic source, its consequence today, and the criterion or gap it hits, citing the live listing as the trace for a dead pointer. Otherwise write one line that no documented behavior changed.

B's earlier arguments focus attention but are not additional acceptance criteria; missing debate artifacts on a `debate: no` leaf are expected, and `learnings/LESSONS.md` is not review input.

Write your findings to `review-<slot>.md` under the `leaf=` folder, recording the base and reviewed head, verification evidence and a verdict of `ready`, `nits` or `fix`, with each Fix naming its realistic source, its consequence today, and the criterion, check or gap it hits, and each Nit stating the reproduction or concern, why it is deferred, and what evidence would promote it to a Fix.

A Fix is wrong behavior, a broken contract or a maintainability defect with a concrete consequence today, naming its realistic source, its consequence today, and the criterion, check or gap it hits; a realistic source is a real build, a real user action or content, a real integration, or untrusted input an attacker can send, shown by a code trace or representative real output with no production incident needed, while a handcrafted reproduction alone is a Nit with the missing evidence stated, and rarity never downgrades a reachable security, data-loss or concurrency defect, including a ponytail concern when it is also a defect; an argument grounded only in B's position is a Nit and cannot open repair.

Compare tests with acceptance criteria: a missing or bad test blocks only when a done-criterion has no test that would catch its failure, a realistic Fix has no test, or a test mocks the unit under test; assertion style, wording coupling that does not fail today, extra cases and coverage gaps are Nits, and reject akrogon tests of prose/output wording except commands, numbers or fixed references that run literally as written.

A missing-test Fix names the scenario and what existing tests miss, with its realistic source, its consequence today, and the criterion or gap it hits. Look-alike code alone is not a Fix, and these triggers add no review rerun beyond the rerun rule below.

Failed `checks` commands always block and scenarios a done-criterion names always block by citing that check or criterion instead of a realistic source, optional `advisory` failures are Nits, and a report gap blocks only when material to correctness or verification.

Rerun checks only for a code change, missing evidence or a specific concern, leaving doc/index authorship with A and recording any reusable lesson found here as one active mechanism/date/history line plus a history file with case, evidence and learning, written under the registered checkout's `learnings/` and left for the operator to commit.

On re-check after `check.fix`, inspect only the repair diff from the prior reviewed head (or the rebased head B recorded at merge), append B's results to `review-B.md` under the `leaf=` folder, confirm earlier findings, apply the same fix-bar with its realistic source, consequence today, and criterion, check or gap, and add a blocking finding only for a defect introduced by the repair.

Finish with `akrogon phase <slug> <next> --slot <A|B> --verdict <ready|nits|fix>`, requesting `check.fix` for fix or `merge` for ready/nits, then print the footer and stop.

A `recorded` result waits for the other initial verdict; the command derives the aggregate result, including a fix from the peer, so the requested destination is not proof of movement.

## Printed footer

```text
Last operation: <review findings and actual phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase> leaf=<folder>
```

`check.fix` routes to implement-issue A, `merge` to merge-issue B, an outstanding initial review to check-issue in the remaining slot, and `Next: none <reason>` covers failed or waiting outcomes.
