---
name: implement-issue
description: Implement a leaf plan or repair its review findings, using eight-section worker sub-briefs and sequential workers or configured inline execution; without a leaf, implement the prompt task standalone.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt. After compaction, standalone re-reads its task brief instead of a leaf.

# Implement issue

Leaf prompts are `implement-issue <slug> slot=B phase=implement leaf=<folder>` or `phase=check.fix` with the same `leaf=`; a prompt without a leaf is a standalone task in the current checkout with this session as B.

## Shared context

Read [ponytail.md](ponytail.md) before editing, [brief-template.md](brief-template.md) when writing a brief, and [worker-protocol.md](worker-protocol.md) when delegating or validating a worker return.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

For leaf work, read `akrogon config` once, locate the unique slug in the registered repo's authoritative `issues/open/`, and use its `plan.md`, `design.md` and current review findings while editing only the leaf worktree.

Pass artifacts are written under the `leaf=` folder while code is read and edited only in the worktree, and a manual prompt naming a slug without `leaf=` falls back to locating the slug under the registered repo's `issues/open/`. Standalone keeps its no-config, local-artifact behavior.

Effective settings supply `implement`, `checks`, optional `advisory`, `AKROGON_BASE` and the repair cap; the command owns state/counters and dispatch, while a repeated pass finishes remaining work from the diff and artifacts, rerunning checks for changed code, missing evidence or a specific concern.

The plan's read-first list supplies worker context; the index is opened only on a gap, and implement updates affected docs and area index entries before review, keeping affected `AREA.md` files at most 40 lines with exactly Commands, Key files, Non-obvious patterns and See also as second-level sections.

A reusable lesson found during leaf work gets an active line naming mechanism/date/history path and a history file with case, evidence and learning; `learnings/LESSONS.md` is not pass input, and applying a lesson removes its active line and dates its history file without rewriting the historical case.

The B seat proceeds without posing questions or holding the pass open, deciding from the plan, the design, and the worktree alone. When a step physically requires the operator (a permission B cannot grant, an env value B cannot obtain), B writes the blocker and the exact operator action into its current pass artifact, runs `akrogon phase <slug> failed --reason "<blocker plus artifact>" --slot B`, and ends the pass.

## implement

Before coding, when an implementation-only constraint is missing from `plan.md` under the `leaf=` folder, append one dated `## Implementation notes` section naming each constraint and the decision it refines; a locked decision is never changed there, and a conflict with one is a mismatch recorded for review. Then implement the plan's checklist in order yourself when config says `inline`, otherwise write one sub-brief per unit from the template, one unit included, and delegate each to a subagent sequentially in this worktree using the worker protocol.

Inline has no worker, sub-briefs or mismatch returns; both modes run the resolved changed-tests command as work lands with `AKROGON_BASE` from config, and workers receive only that command, not the full suite.

Derive meaningful tests from acceptance criteria before code, demonstrate red then green and a fail-first test for a bug, with no test needed for a trivial one-liner.

A credential still absent from `.env` at implement is never requested as a pasted value: B records the missing variable in `<leaf>/implementation/report.md` as a human-only blocker with the `add <VAR> to .env` action, what the value is, and where the operator obtains it, then runs `akrogon phase <slug> failed --reason "<missing <VAR> blocks <criterion>; see implementation/report.md>" --slot B` and ends the pass.

After the last implementation unit, run the full suite once as B and every other blocking check, repair any failure by the protocol (yourself in inline mode), then commit the code on the leaf branch and write `<leaf>/implementation/report.md` with changed files and reasons, commands run with pasted results and artifact paths, the base and committed head, known limitations and unverified criteria, folding worker returns into it, before handoff; `akrogon phase` refuses a dirty worktree and refuses any file under `issues/` on the branch, because every issue artifact is written only in the registered checkout.

Every command under `checks` blocks; `advisory` failures are reported as Nits, and a full-suite rerun follows a repair rather than an unchanged successful run.

Finish with `akrogon phase <slug> check.review --slot B`, then print the footer and stop.

## check.fix

Read the recorded findings and reviewed commit in the existing review files, revise the plan notes and affected sub-briefs around those defects without weakening criteria or failing tests, and use workers before the last allowed repair round in delegated mode or repair yourself in inline mode and on the final allowed round.

A repair requested from merge starts at the rebased head recorded in `review-A.md` and treats the failing output as the finding.

Run the affected changed tests and required checks, update affected docs/index lines and append the repair's before and after commits to `report.md` under the `leaf=` folder, then finish with `akrogon phase <slug> check.review --slot B`, print the footer and stop.

## Standalone

Use the prompt as the task, plan briefly in `implementation/brief.md`, derive changed-test commands from the checkout, delegate through the same template/protocol, check the report and changed-test evidence, and repair yourself before returning.

Standalone has no config or leaf reads, lifecycle state/log writes, phase call or checker; its template and protocol are entirely skill-local, and its footer reports completion or the concrete unresolved task limitation. Standalone takes the prompt and the checkout as its full input and sends no questions back.

## Printed footer

```text
Last operation: <changes, verification and observed phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase> leaf=<folder>
```

After leaf implementation the next pass is check-issue in A and B at `check.review` (one prompt per slot); after repair it is A only, while `Next: none <reason>` covers standalone, waiting or terminal outcomes.

The lines are printed only, with actual command results rather than assumed progress.
