---
name: check-issue
description: Review a leaf implementation with concrete-defect verdicts, repair most Fixes as slot B in check.repair, or re-check A's repair diff as slot B.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt.

# Check issue

The prompt is `check-issue <slug> slot=<A|B> phase=check.review leaf=<folder>` or `check-issue <slug> slot=B phase=check.repair leaf=<folder>`, where `phase=check.repair` belongs only to B; initial review has both slots, while a review after repair belongs only to B.

## Shared context

Read `akrogon config` once, locate the unique slug under the registered repo's authoritative `issues/open/`, then read its `plan.md` including any implementation notes, `design.md`, `implementation/report.md` and this skill's [ponytail.md](ponytail.md) before inspecting the worktree diff.

Pass artifacts are written under the `leaf=` folder while code is read and edited only in the worktree, and a manual prompt naming a slug without `leaf=` falls back to locating the slug under the registered repo's `issues/open/`.

Temp files, logs, and base copies go under `$TMPDIR`, never a fixed `/tmp/<name>`; anything needed later goes in the leaf folder.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

The command owns state, verdict aggregation, repair counts and dispatch; an existing review and unchanged diff are evidence to resume from, not a reason to repeat completed work.

Each review seat reaches its verdict from the artifacts and the diff, posing no questions and leaving the pass unheld while undecided. When a step physically requires the operator (a permission the seat cannot grant, an env value it cannot obtain), the seat writes the blocker and the exact operator action into `review-<slot>.md` under the `leaf=` folder, runs `akrogon phase <slug> failed --reason "<blocker; see review-<slot>.md>" --slot <A|B>`, and ends the pass. A finding whose fix needs operator access follows the operator-only rule below instead.

An operator-only item is a finding whose fix needs something only the operator can grant (a permission, a token scope, a live-mutation authorization). The review seat records it under an `Operator actions` heading in `review-<slot>.md` under the `leaf=` folder, never as a Fix for the repair seat, with the exact operator command or action, what the seat tried, which credential or identity it used, and the observed error. An operator action that gates a done-criterion holds merge until it is resolved, so the seat's verdict is `fix`; one that gates none leaves the verdict to the other findings. The review seat never stops on an operator action, because one seat's `failed` ends the leaf before the peer's Fixes are repaired. The repair seat finishes every doable Fix first, then makes one stop naming every open operator action, the action first: `akrogon phase <slug> failed --reason "<operator action first; see review-<slot>.md>" --slot <A|B>`; with no doable Fix it stops at once.

Each review seat never opens, prints, appends to, or writes `.env` or `.env.*` with any tool, instead running any script that needs values as `bun --env-file=<file> <script>` to print only results, never values, and checking presence by name with such a script printing `present`/`absent` per name, ending the pass with the stop above when a required value is absent.

## check.review

During initial review, both A and B work blind: do not contact or wait for the peer, or read the peer's current review. Record unresolved questions as findings in your own `review-<slot>.md` under the `leaf=` folder and account for them in your verdict under the Fix/Nit rules below. Uncertainty alone is not a Fix.

As B, read your own `positions-B.md` and `rebuttal-B.md` first when debate produced them, then judge the whole initial diff against the plan's decisions, criteria, change list and checklist, the design's exclusions, the report and live contracts, following affected docs and index pointers and checking any lesson claim against its evidence.

For each `AREA.md` in the reviewed diff, use one shell command to list the paths it names and whether they exist from the repository root. Record a missing path as a Fix only with its realistic source, its consequence today, and the criterion or gap it hits, citing the live listing as the trace and the dead-pointer consequence today. For a deleted area file, review the deletion and affected index pointers against the plan without opening the removed file.

Start from the changed behavior and open the doc page describing it even when the page is unchanged. A wrong claim or a path that does not exist is a Fix only with its realistic source, its consequence today, and the criterion or gap it hits, citing the live listing as the trace for a dead pointer. Otherwise write one line that no documented behavior changed.

B's earlier arguments focus attention but are not additional acceptance criteria; missing debate artifacts on a `debate: no` leaf are expected, and `learnings/LESSONS.md` is not review input.

Write your findings to `review-<slot>.md` under the `leaf=` folder, recording the base and reviewed head, verification evidence and a verdict of `ready`, `nits` or `fix`, with each Fix naming its actual realistic source, its consequence today, and the criterion, check or gap it hits, and each Nit stating the reproduction or concern, why it is deferred, and what evidence would promote it to a Fix.

A Fix is wrong behavior, a broken contract or a maintainability defect with a concrete consequence today, naming its actual realistic source (which build, which user action or content, which integration, or which attacker-reachable entry point), its consequence today, and the criterion, check or gap it hits; a realistic source is a real build, a real user action or content, a real integration, or untrusted input an attacker can send, shown by tracing the input from that source to the defect or by representative real output of an input from that source, with no production incident needed, while pointers to the defect location alone and real test machinery running a handcrafted input establish no source, so a handcrafted reproduction alone is a Nit with the missing evidence stated, and rarity never downgrades a reachable security, data-loss or concurrency defect, including a ponytail concern when it is also a defect; an argument grounded only in B's position is a Nit and cannot open repair.

Compare tests with acceptance criteria: a missing or bad test blocks only when a done-criterion has no test that would catch its failure, a realistic Fix has no test, or a test mocks the unit under test; assertion style, wording coupling that does not fail today, extra cases and coverage gaps are Nits, and reject akrogon tests of prose/output wording except commands, numbers or fixed references that run literally as written.

A missing-test Fix names the scenario and what existing tests miss, with its realistic source, its consequence today, and the criterion or gap it hits. Look-alike code alone is not a Fix, and these triggers add no review rerun beyond the rerun rule below.

Failed `checks` commands always block and scenarios a done-criterion names always block by citing that check or criterion instead of a realistic source, optional `advisory` failures are Nits, and a report gap blocks only when material to correctness or verification.

Rerun checks only for a code change, missing evidence or a specific concern, leaving doc/index authorship with A and recording any reusable lesson found here as one active mechanism/date/history line plus a history file with case, evidence and learning, written under the registered checkout's `learnings/` and left for the operator to commit.

During check.review, a red test or check with no cause in the leaf's diff (failing output plus `git diff "$AKROGON_BASE"...HEAD` shows no touched file or plausible cause; a judgment gate, never automatic) is the existing specific concern rerun case, not a new trigger, and runs that same command once, same command, args, and whole-folder or single-file scope, in the corresponding working directory inside the detached base checkout at `AKROGON_BASE`, allocated with `base_worktree=$(mktemp -d)` then `git worktree add --detach "$base_worktree" "$AKROGON_BASE"` (`mktemp` uses exported leaf `TMPDIR`, otherwise system temp; no fixed path), installing dependencies there with the leaf's installation method, redirecting logs to files outside the worktree, capturing exit result, both log paths, and failing names and tails from both runs, then `git worktree remove --force "$base_worktree"` before either outcome. Red on base ends with `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot <A|B>` for the reviewing slot and `review-<slot>.md` records base SHA, both log paths, and failing names and tails from both runs, a stop, never a handoff, creating no path to check.fix or merge, while green on base takes the existing repair path.

On re-check after `check.fix`, inspect only the repair diff from the prior reviewed head (or the rebased head B recorded at merge), append B's results to `review-B.md` under the `leaf=` folder, confirm earlier findings, apply the same fix-bar with its realistic source, consequence today, and criterion, check or gap, and add a blocking finding only for a defect introduced by the repair.

Finish with `akrogon phase <slug> <next> --slot <A|B> --verdict <ready|nits|fix>`, requesting `check.repair` for fix or `merge` for ready/nits, then print the footer and stop.

A `recorded` result waits for the other initial verdict; the command derives the aggregate result, including a fix from the peer, so the requested destination is not proof of movement.

## check.repair

B reads every Fix in the review files for the latest reviewed head, meaning both initial reviews or B's latest re-check entry in `review-B.md`.

B repairs every Fix except plan or design changes, missing planned units, required live runs, and work B judges too large for its pass. Each of those goes under a `Handed to A` heading in `review-B.md`, one line each with the Fix and the reason, and B never edits `plan.md` or `design.md`.

Operator-only items follow the operator-only rule in Shared context and are never handed to A. When only operator actions remain after B's repairs, B makes that rule's one `failed` stop. When `Handed to A` items also remain, B moves to `check.fix`, and A's check.fix makes the stop after its repairs.

Each behavior Fix gets its own commits, never shared with another Fix. First comes a commit adding a test that reproduces the recorded source, run and shown failing, then the fix commit, with the failing and passing output in `review-B.md`.

Each docs or command Fix is its own commit, with before and after evidence (quoted text or command output) in `review-B.md`.

A red test or check with no cause in the leaf's diff takes the same base-run disposition as the check.review paragraph beginning "During check.review, a red test or check".

After repairs, B runs proof for every done-criterion in `plan.md` and every `checks` command, and does not run `merge_checks`, because merge runs them.

B appends a dated `check.repair` entry to `review-B.md` naming each Fix repaired, its commits and its evidence, plus any `Handed to A` list.

Finish with `akrogon phase <slug> merge --slot B` when nothing is handed to A and no operator action is open, or `akrogon phase <slug> check.fix --slot B` when any `Handed to A` item remains; the command counts that handoff and answers `moved failed` at the repair cap. Then print the footer and stop.

## Printed footer

```text
Last operation: <review findings and actual phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase> leaf=<folder>
```

`check.repair` routes to check-issue B, `check.fix` to implement-issue A, `merge` to merge-issue B, an outstanding initial review to check-issue in the remaining slot, and `Next: none <reason>` covers failed or waiting outcomes.
