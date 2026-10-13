# Review B: serial-plan-solo

Date: 2026-10-13
Phase: check.review (initial, blind)
Base: `9bc0346619815947983df36c13329f695c371c6b`
Reviewed head: `df8868911100bf863224f71a51e70bb489d3b5d9`
Verdict: ready

## Findings

No Fixes, Nits or operator actions.

## Scope and contract review

Read the brief, design, plan including implementation notes, implementation report and check-issue ponytail guidance before the diff. Debate is disabled; no positions-B or rebuttal-B exists or is required. Reviewed all five changed files, the unchanged brief-template, the phase guide and reference index. No peer review was read.

Criterion 1 passes: implement-issue defines the subagents-config exception for every final-plan wave holding exactly one unit, preserves wave order and removes sub-briefs and worker worktrees. Its nondelegating paragraph includes serial-solo. Worker protocol, skills AREA and operator phase guide agree. A multi-unit wave still selects delegation for the implementation run. The repair carve-out and check.fix paragraph preserve delegated-config repair waves even after serial-solo implementation. The check.fix insertion clarifies this existing contract rather than changing repair behavior.

Traced representative outcomes against the instructions: one unit in one wave and a chain of single-unit waves both run directly in A, regardless of dependency, shared path or shared resource. A plan containing a two-unit wave still delegates its waves. Configured inline work remains direct. A later check.fix on a serial-solo leaf remains delegated under subagents configuration. Standalone delegation is unchanged. The brief-template's delegated-leaf sentence applies when delegation actually occurs, not to serial-solo.

Criterion 2 passes: the plan-issue diff adds exactly one cross-reference sentence to the existing wave-rules paragraph. Existing prerequisite, owned-path, shared-resource and wave-size rules are unchanged. The sentence preserves the reasons for serial ordering.

`rg -n 'delegate them to subagents|write one sub-brief per unit' skills/ docs/` finds only the conditional implementation paragraph, not a separate unconditional instruction. Reviewed the remaining worker/delegation text in the affected files in context. No executable code, tests, runner configuration or lessons changed.

## AREA paths

Ran one repository-root shell command extracting the backtick paths in skills/AREA.md and listing existence. These exist: skills/init-akrogon/SKILL.md, skills/implement-issue/SKILL.md, skills/implement-issue/worker-protocol.md, skills/check-issue/SKILL.md, skills/learn-issues/SKILL.md, skills/lesson-rule.md, skills/watch-issues/SKILL.md, skills/implement-issue/brief-template.md, src/routing.ts and docs/reference-index.md.

The listing reports no repository-root scripts/observe.ts or scripts/log-tail.ts. These unchanged references are scoped by their sentence to watch-issues; confirmed both actual files at skills/watch-issues/scripts/{observe.ts,log-tail.ts} and the watch skill's `<skill-folder>/scripts/...` invocation. They resolve in their stated context and are not dead pointers.

## Verification evidence

Reused current-head implementation evidence, with no code or proof changes after those runs. Head commit time is 2026-10-13T00:19:48+02:00; final implementation logs follow that commit. No planned test was skipped, filtered or disabled. No new or changed tests require a deliberate-break or red-first proof under the binding skill-text design.

- `implementation/check-format-1791843617797-2658670.log`: configured format check, exit 0 per report, prettier completes with all checked files unchanged.
- `implementation/check-test-1791843723414-2667033.log`: configured full `bun test --timeout=30000` check, terminal result 843 pass, 0 fail, 44 files, 105.47 seconds.
- `implementation/check-typecheck-1791843725184-2972986.log`: configured typecheck, exit 0 per report, `tsc --noEmit` completes cleanly.
- `implementation/check-test_changed-1791843608857-2643809.log`: configured changed-test check, five changed files and no affected test files, 0 failures. This supplements rather than replaces the full test run.

Independently inspected the criterion text matches, unconditional-delegation search and base-to-head plan-issue diff. All five changed paths match the owned scope. Worktree is clean. No missing evidence or specific correctness concern requires rerunning checks.

## Test-Change trailers

`git log 9bc0346619815947983df36c13329f695c371c6b..HEAD --format='%H%n%B'` contains one implementation commit and no Test-Change trailers. Inspected src/test-files.ts: none of the five changed Markdown paths matches its test-file rule. No existing test assertions, fixtures or expectations changed, so no trailer is required.

## Merge attempt 808411c1-8e2d-4150-908e-1c42c0c31cfe

Date: 2026-10-13. Applied stack, no carried members.
Batch base: `9bc0346619815947983df36c13329f695c371c6b`.
Tested top: `df8868911100bf863224f71a51e70bb489d3b5d9` (matches prompt).
No fetch, rebase or commit performed. Both seat reviews read. Plan and implementation report remain the reviewed artifacts.

Configured format, typecheck and test_changed checks passed with exit 0. Logs: implementation/check-format-1791843907473-3274816.log, implementation/check-typecheck-1791843937559-3323582.log and implementation/check-test_changed-1791843929958-3354348.log. No merge_covers, merge_checks or advisory commands are configured.

Full configured test command, exactly invoked:

```sh
akrogon run-check --name test -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun test --timeout=30000'\'''
```

First run: exit 1, 840 pass / 3 fail, 843 tests in 44 files, 328.25 seconds. Log: implementation/check-test-1791844236191-3290551.log. Failing units:

- tests/batch-dispatch.test.ts: a member conflict excludes it from the attempt, rewrites the record without it and leaves its branch untouched. Timeout after 20000 ms.
- tests/next.test.ts: a leaf re-entering merge queues behind the two leaves stamped earlier. Timeout after 15000 ms.
- tests/next.test.ts: named target equivalence: owner name matches folder path from root, subfolder and worktree. Timeout after 60000 ms.

Cause judgment: the complete base-to-top diff changes only five skill/guide Markdown files, no runner or CLI implementation. None of these timeout mechanisms has a plausible cause in this diff. These scenarios do not belong to this leaf's criteria. Recorded the first run in merge-test-comparison.json before starting the one same-command, same-worktree, whole-suite retry. No code or configuration was changed between runs.

Completion ownership: batch has no carried members. issues/open/leaf-speed/ISSUE.md lists three leaves, with timing-events and timing-readout still in plan.synthesis. This batch cannot complete leaf-speed, so it has no completion owner requiring a broadcast.

Retry: exit 0, 843 pass / 0 fail, 44 files, 103.29 seconds. Log: implementation/check-test-1791844365747-32171.log. Every initially timed-out unit passes in the complete retry. Final comparison state is inconsistent; no base run is required or performed. Completed merge-test-comparison.json records command, arguments, cwd, scope, material conditions, attempt, revision, both logs and each failing unit.

All required merge checks now pass; no code changed, and the worktree remains clean.

First check-only call refused the inconsistent record because unit verdicts were unverified and the command admits only known-red unit entries, even for an inconsistent record. No phase changed. All three first-run failures passed on the retry; no known-red claim is made. Preserved per-unit evidence here and submitted the inconsistent record with no unresolved unit entries:

- tests/batch-dispatch.test.ts: a member conflict excludes it from the attempt, rewrites the record without it and leaves its branch untouched. First run fail/timeout at /home/ivan/Work/infra/akrogon/issues/open/leaf-speed/serial-plan-solo/implementation/check-test-1791844236191-3290551.log; retry pass at /home/ivan/Work/infra/akrogon/issues/open/leaf-speed/serial-plan-solo/implementation/check-test-1791844365747-32171.log.
- tests/next.test.ts: a leaf re-entering merge queues behind the two leaves stamped earlier. First run fail/timeout at /home/ivan/Work/infra/akrogon/issues/open/leaf-speed/serial-plan-solo/implementation/check-test-1791844236191-3290551.log; retry pass at /home/ivan/Work/infra/akrogon/issues/open/leaf-speed/serial-plan-solo/implementation/check-test-1791844365747-32171.log.
- tests/next.test.ts: named target equivalence: owner name matches folder path from root, subfolder and worktree. First run fail/timeout at /home/ivan/Work/infra/akrogon/issues/open/leaf-speed/serial-plan-solo/implementation/check-test-1791844236191-3290551.log; retry pass at /home/ivan/Work/infra/akrogon/issues/open/leaf-speed/serial-plan-solo/implementation/check-test-1791844365747-32171.log.

Check-only retry accepted: `ok`, recording tested top df8868911100bf863224f71a51e70bb489d3b5d9 for attempt 808411c1-8e2d-4150-908e-1c42c0c31cfe. No known-red units were submitted or opened. No completion owner can close in this batch, as confirmed against ISSUE.md and the two remaining open leaf states.

Final merged call: exit 0, `moved merged`, `deployed 9bc034661981..df8868911100`. The command pushed the tested head and moved this leaf to merged. It reported that green red-entry resolution was skipped because the record is inconsistent, as expected; no known-red entries were claimed. No issue/epic completion line was emitted, so no broadcast was required.
