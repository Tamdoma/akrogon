---
name: implement-issue
description: Implement a leaf plan or repair its review findings, using an eight-section brief and sequential workers or configured inline execution; without a leaf, implement the prompt task standalone.
---

After compaction, re-read this file, the slug's brief or plan, and this phase's references; standalone re-reads its task brief instead of a leaf.

# Implement issue

Leaf prompts are `implement-issue <slug> slot=B phase=implement` or `phase=check.fix`; a prompt without a leaf is a standalone task in the current checkout with this session as B.

## Shared context

Read [ponytail.md](ponytail.md) before editing, [brief-template.md](brief-template.md) when writing a brief, and [worker-protocol.md](worker-protocol.md) when delegating or validating a worker return.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

For leaf work, read `akrogon config` once, locate the unique slug in the registered repo's authoritative `issues/open/`, and use its `plan.md`, `implementation/brief.md` and current review findings while editing only the leaf worktree.

Effective settings supply `implement`, `checks`, optional `advisory`, `AKROGON_BASE` and the repair cap; the command owns state/counters and dispatch, while a repeated pass finishes remaining work from the diff and artifacts, rerunning checks for changed code, missing evidence or a specific concern.

For a necessary peer question, wait for idle, ask once through herdr in Question/Option form requesting `<leaf>/questions/<id>.md`, run `herdr agent wait` without a timeout, read the file and decide by simplicity, clarity, elegance, cost, speed and quality.

The plan's read-first list supplies worker context; the index is opened only on a gap, and implement updates affected docs and area index entries before review.

A reusable lesson found during leaf work gets an active line naming mechanism/date/history path and a history file with case, evidence and learning; `learnings/LESSONS.md` is not pass input, and applying a lesson removes its active line and dates its history file without rewriting the historical case.

## implement

Write `<leaf>/implementation/brief.md` from the template, then implement it in order yourself when config says `inline`, otherwise delegate each bounded sub-brief to a subagent sequentially in this worktree using the worker protocol.

Inline has no worker, sub-briefs or mismatch returns; both modes run the resolved changed-tests command as work lands with `AKROGON_BASE` from config, and workers receive only that command, not the full suite.

Derive meaningful tests from acceptance criteria before code, demonstrate red then green and a fail-first test for a bug, with no test needed for a trivial one-liner.

After the last implementation unit, run the full suite once as B and every other blocking check, repair any failure by the protocol (yourself in inline mode), then fill the report with command evidence before handoff.

Every command under `checks` blocks; `advisory` failures are reported as Nits, and a full-suite rerun follows a repair rather than an unchanged successful run.

Finish with `akrogon phase <slug> check.review --slot B`, then print the footer and stop.

## check.fix

Read the recorded findings and reviewed commit in the existing review files, revise the brief around those defects without weakening criteria or failing tests, and use workers before the last allowed repair round in delegated mode or repair yourself in inline mode and on the final allowed round.

Merge-conflict findings use the same worktree and repair path; integration resolution keeps both true same-line index entries and rechecks their pointers, with any pending rebase completed before recording the repair head.

Run the affected changed tests and required checks, update affected docs/index lines and report with the repair's before/after commits, then finish with `akrogon phase <slug> check.review --slot B`, print the footer and stop.

## Standalone

Use the prompt as the task, plan briefly in `implementation/brief.md`, derive changed-test commands from the checkout, delegate through the same template/protocol, check the report and changed-test evidence, and repair yourself before returning.

Standalone has no config or leaf reads, lifecycle state/log writes, phase call or checker; its template and protocol are entirely skill-local, and its footer reports completion or the concrete unresolved task limitation.

## Printed footer

```text
Last operation: <changes, verification and observed phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase>
```

After leaf implementation the next pass is check-issue in A and B at `check.review` (one prompt per slot); after repair it is A only, while `Next: none <reason>` covers standalone, waiting or terminal outcomes.

The lines are printed only, with actual command results rather than assumed progress; for scrambled context, the first 50–100 words of the other pane can confirm what happened but cannot establish slot, phase, readiness, completion or a peer answer, and missing text does not block.
