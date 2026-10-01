---
name: implement-issue
description: Implement a leaf plan or repair its review findings, using eight-section worker sub-briefs and waves of up to 3 independent workers or configured inline execution; without a leaf, implement the prompt task standalone.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt. After compaction, standalone re-reads its task brief instead of a leaf.

# Implement issue

Leaf prompts are `implement-issue <slug> slot=A phase=implement leaf=<folder>` or `phase=check.fix` with the same `leaf=`; a prompt without a leaf is a standalone task in the current checkout with this session as A.

## Shared context

Read [ponytail.md](ponytail.md) before editing, [brief-template.md](brief-template.md) when writing a brief, and [worker-protocol.md](worker-protocol.md) when delegating or validating a worker return.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

For leaf work, read `akrogon config` once, locate the unique slug in the registered repo's authoritative `issues/open/`, and use its `plan.md`, `design.md` and current review findings while editing only the leaf worktree and its worker worktrees.

Pass artifacts are written under the `leaf=` folder while code is read and edited only in the leaf worktree and its worker worktrees, and a manual prompt naming a slug without `leaf=` falls back to locating the slug under the registered repo's `issues/open/`. Standalone keeps its no-config, local-artifact behavior.

Effective settings supply `implement`, `checks`, optional `advisory`, `AKROGON_BASE` and the repair cap; the command owns state/counters and dispatch, while a repeated pass finishes remaining work from the diff and artifacts, rerunning checks for changed code, missing evidence or a specific concern.

The plan's read-first list supplies worker context and the index is opened only on a gap. Implement updates every doc the plan names plus any doc the diff makes stale before review, keeping affected `AREA.md` files at most 40 lines with exactly Commands, Key files, Non-obvious patterns and See also as second-level sections.

A reusable lesson found during leaf work gets an active line naming mechanism/date/history path and a history file with case, evidence and learning; `learnings/LESSONS.md` is not pass input, and applying a lesson removes its active line and dates its history file without rewriting the historical case.

The A seat proceeds without posing questions or holding the pass open, deciding from the plan, the design, and the worktree alone. When a step physically requires the operator (a permission A cannot grant, an env value A cannot obtain), A writes the blocker and the exact operator action into its current pass artifact, runs `akrogon phase <slug> failed --reason "<blocker plus artifact>" --slot A`, and ends the pass.
A fix that needs a locked decision changed ends the pass the same way, with `akrogon phase <slug> failed --reason` naming that decision.

A done-criterion still failing during implement or check.fix after the repairs the protocol permits (a red criterion-proof or checks sub-brief, a slow-run leaf's in-branch fix) and unable to pass within the leaf's owned surfaces ends the pass the same way, with `akrogon phase <slug> failed --reason "<criterion> red: <cause>" --slot A`; it is never handed off as pre-existing, base red or modulo anything.

During implement end and check.fix, a red test or check with no cause in the leaf's diff (failing output plus `git diff "$AKROGON_BASE"...HEAD` shows no touched file or plausible cause; a judgment gate, never automatic) runs that same command once, same command, args, and whole-folder or single-file scope, in the corresponding working directory inside the detached base checkout at `AKROGON_BASE`, allocated with `base_worktree=$(mktemp -d)` then `git worktree add --detach "$base_worktree" "$AKROGON_BASE"` (`mktemp` uses exported leaf `TMPDIR`, otherwise system temp; no fixed path), installing dependencies there with the leaf's installation method, redirecting logs to files outside the worktree, capturing exit result, both log paths, and failing names and tails from both runs, then `git worktree remove --force "$base_worktree"` before either outcome. Red on base ends with `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot A` and `implementation/report.md` records base SHA, both log paths, and failing names and tails from both runs, a stop, never a handoff, creating no path to check.review or merge, while green on base takes the existing repair path.

A never opens, prints, appends to, or writes `.env` or `.env.*` with any tool, instead running any script that needs values as `bun --env-file=<file> <script>` to print only results, never values, and checking presence by name with such a script printing `present`/`absent` per name, ending the pass with the stop above when a required value is absent.

## implement

Before coding, when an implementation-only constraint is missing from `plan.md` under the `leaf=` folder, append one dated `## Implementation notes` section naming each constraint and the decision it refines; a locked decision is never changed there, and a conflict with one is a mismatch recorded for review. Then implement the plan's checklist in order yourself when config says `inline`, otherwise write one sub-brief per unit from the template, one unit included, and delegate them to subagents in waves of up to 3 units with landed prerequisites and independent edits and verification, one at a time when unsure, each in its own worktree, using the worker protocol.

Inline has no worker, sub-briefs or mismatch returns; both modes run the resolved changed-tests command as work lands with `AKROGON_BASE` from config, and workers receive only that command, not A's criterion proof and every `checks` command run.

Write the smallest test set proving every done-criterion before code, one test may prove several criteria, with one before and after proof per real bug fixed; extra negative or edge cases need a named concrete consequence on a realistic path (a broken required outcome, a security boundary, data loss or an unsafe mutation); extend existing tests before adding files; the report links each done-criterion and each real bug fix to its test or evidence; trivial one-liners need no test.

A credential still absent from `.env` at implement is never requested as a pasted value: A records the missing variable in `<leaf>/implementation/report.md` as a human-only blocker with the `add <VAR> to .env` action, what the value is, and where the operator obtains it, then runs `akrogon phase <slug> failed --reason "<missing <VAR> blocks <criterion>; see implementation/report.md>" --slot A` and ends the pass.

A red test or check with no cause in the leaf's diff takes the Shared context base-run rule before any repair.

After the last implementation unit, with every worker worktree removed, supply passing proof for every done-criterion, run changed tests including affected consumers and every `checks` command, reuse unchanged evidence, run `merge_checks` only at merge unless a done-criterion needs a whole run, repair any failure by the protocol (yourself in inline mode), then commit any remaining edits on top of the wave commits on the leaf branch, making no empty commit, and write `<leaf>/implementation/report.md` with changed files and reasons, commands run with pasted results and artifact paths, the base and committed head, known limitations and unverified criteria, folding worker returns into it, before handoff; `akrogon phase` refuses a dirty worktree and refuses any file under `issues/` on the branch, because every issue artifact is written only in the registered checkout.
The report records wall time for every command sized minutes, hours or unknown.
For a slow run it also records the in-branch fixes made, the reused stages with their source commit, what changed and which stages it feeds, and the blocked checks.

Every command under `checks` blocks; `advisory` failures are reported as Nits.

Finish with `akrogon phase <slug> check.review --slot A`, then print the footer and stop.

## check.fix

A red test or check with no cause in the leaf's diff takes the Shared context base-run rule before any repair.

Read the recorded findings and reviewed commit in the existing review files, revise the plan notes and affected sub-briefs around those defects without weakening criteria or failing tests, and use worker waves before the last allowed repair round in delegated mode or repair yourself in inline mode and on the final allowed round. A criterion still red after those repair rounds takes the failed exit under Shared context.

A repair requested from merge starts at the rebased head recorded in `review-B.md` and treats the failing output as the finding.

Do required work for Fixes only; Nits get no separate work or test and may only disappear incidentally through Fix repair. After every repair, supply passing proof for every done-criterion, run changed tests including affected consumers and every `checks` command, reuse unchanged evidence, run `merge_checks` only at merge unless a done-criterion needs a whole run, update affected docs/index lines and append the repair's before and after commits to `report.md` under the `leaf=` folder, then finish with `akrogon phase <slug> check.review --slot A`, print the footer and stop.

## Standalone

Use the prompt as the task, plan briefly in `implementation/brief.md`, derive changed-test commands from the checkout, delegate through the same template/protocol, check the report and changed-test evidence, and repair yourself before returning.

Standalone has no config or leaf reads, lifecycle state/log writes, phase call or checker; its template and protocol are entirely skill-local, and its footer reports completion or the concrete unresolved task limitation. Standalone takes the prompt and the checkout as its full input and sends no questions back.

## Printed footer

```text
Last operation: <changes, verification and observed phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase> leaf=<folder>
```

After leaf implementation the next pass is check-issue in A and B at `check.review` (one prompt per slot); after repair it is B only, while `Next: none <reason>` covers standalone, waiting or terminal outcomes.

The lines are printed only, with actual command results rather than assumed progress.
