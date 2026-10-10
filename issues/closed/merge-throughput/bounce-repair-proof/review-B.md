# Review B: bounce-repair-proof

Date: 2026-10-10
Phase: check.review (initial review, slot B)
Base: 2e78945849eed87c42abd56f224909f4d2050b36
Reviewed head: 12da5ceeaec55583346ce372c11ac6d9e3d2767c
Verdict: fix

## Findings

### F1: Setup skill still promises merge-only blocking

Fix. `skills/init-akrogon/SKILL.md:20` instructs the setup seat to propose slow full-suite commands in `merge_checks`, “which block only at merge”. The realistic source is an operator invoking init-akrogon to configure repository checks: that seat reads this statement when proposing the configuration. The new `skills/implement-issue/SKILL.md:78` requires a rejected merge_checks command to pass in check.fix before re-review, so the setup contract now gives the operator an incorrect account of when those commands block. This contradicts done-criterion 3's requirement that no wording contradict the bounce exception, and the plan's surface-sweep goal.

Trace: `rg -n 'merge_checks|merge-only|only at merge' skills docs README.md` finds the unqualified claim at init-akrogon:20 alongside the new exception at implement-issue:63/78/84 and docs/guide/setup.md:54. Reading init-akrogon:12-40 confirms this is the active setup instruction, not an example or historical record.

Repair: qualify the setup skill's merge-only statement with the same check.fix replay exception. No command or configuration change is needed.

## Verification

- Read brief, design, plan, implementation report and ponytail guidance before reviewing the full base-to-head diff. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read.
- Criterion 1 passes: merge-issue:65 records each rejected command and arguments, output, rebase target and tested head.
- Criterion 2 passes: implement-issue:78 requires normal repair proof, fetch/rebase onto the current configured default branch, replay of every rejected command with identical arguments and scope in the leaf worktree, both runs' base/head and result in implementation/report.md, and repair/replay in the same pass rather than a red handoff. The solo conflict rule is referenced. The existing base-run rule is unchanged.
- Criterion 3 fails for F1. The planned exception sites themselves are present. AREA:26 and phases:80 describe plan proof selection, not the repair replay, and do not prohibit it. docs/guide/merge.md describes merge-time behavior and remains accurate.
- Criterion 4 passes: check-issue:63 treats missing per-command replay evidence in implementation/report.md after a red merge ending as a Fix.
- Criterion 5: reused the unchanged-head implementation report's passing evidence: format green, 603 tests pass / 0 fail across 29 files, typecheck clean, changed tests green with no affected test files. No code/test changes, missing correctness evidence, or specific check concern warranted rerunning those checks. Report notes the unrelated formatter rewrite was reverted. Worktree is clean.
- `git diff --check 2e78945849eed87c42abd56f224909f4d2050b36...HEAD` passed.
- Reviewed changed behavior against docs/guide/phases.md, docs/guide/setup.md, docs/guide/merge.md and docs/reference-index.md. F1 is the remaining stale agent-facing statement.
- No added or modified tests. The diff is confined to seven skill/doc files. No exact prose assertions were added.

## AREA path listing

One shell invocation from the repository root extracted and checked every path named in skills/AREA.md, resolving watch-issues' local script references under that skill. All exist:

```text
docs/reference-index.md: exists
skills/check-issue/SKILL.md: exists
skills/implement-issue/SKILL.md: exists
skills/implement-issue/brief-template.md: exists
skills/implement-issue/worker-protocol.md: exists
skills/init-akrogon/SKILL.md: exists
skills/learn-issues/SKILL.md: exists
skills/watch-issues/SKILL.md: exists
src/akrogon.ts: exists
src/routing.ts: exists
tests/install.test.ts: exists
tests/phase.test.ts: exists
skills/watch-issues/scripts/observe.ts: exists
skills/watch-issues/scripts/log-tail.ts: exists
```

## Test-Change trailers

`git log 2e78945849eed87c42abd56f224909f4d2050b36..HEAD --format='%H%n%B'` contains no Test-Change trailers. None is required: no changed path matches src/test-files.ts. Reviewed all four commit messages and the changed-file list.

## Operator actions

None.

## 2026-10-10 check.repair

Prior reviewed head: 12da5ceeaec55583346ce372c11ac6d9e3d2767c
Repaired head: f08e2a955e3f4d8c4f9163bbbfaeac79f1b6ad2f

F1 repaired in commit f08e2a9 (`init-akrogon: include merge bounce replay exception`). A's initial review has no Fixes. No operator actions, Nits or Handed to A items remain.

Before, init-akrogon:20 said: “slow full-suite commands in `merge_checks`, which block only at merge”.
After, it says: “slow full-suite commands in `merge_checks`, which block only at merge, except a `check.fix` pass after a red merge ending replays the exact rejected command”.

Verification at the repaired head:

- Criterion 1: inspected base-to-head merge-issue diff. Each rejected invocation, arguments, output, rebase target and tested head remain required.
- Criterion 2: inspected base-to-head implement-issue diff. Fetch/rebase, identical command/arguments/scope in the leaf worktree, both runs' base/head and result, and repair of a red replay before re-review remain required.
- Criterion 3: repeated the merge_checks sweep over skills and operator docs. The new init-akrogon exception now agrees with the planned exception sites. Planning proof-selection statements remain unchanged and do not prohibit repair replay.
- Criterion 4: inspected base-to-head check-issue diff. Missing replay evidence remains a Fix.
- Criterion 5: reran all blocking checks. `bun run format` exited 0 in 0.84s. Its unrelated src/status.ts formatting rewrite was inspected and restored because the worktree was clean before the command. `bun run typecheck` exited 0. Changed tests against base 2e78945849eed87c42abd56f224909f4d2050b36 exited 0: eight changed files, no affected test files, 0 pass / 0 fail (14ms). `bun test --timeout=30000` exited 0: 603 pass, 0 fail, 6323 expectations across 29 files, 52.15s. Full output: implementation/check-repair-tests.log.
- `git diff --check 2e78945849eed87c42abd56f224909f4d2050b36...HEAD` passed. The repair changes only init-akrogon skill prose. No test changes or Test-Change trailer are required. No prose test was added for this documentation repair.
- Worktree clean after verification. No merge_checks were run.

All five criteria pass. F1 is closed. Ready for merge.

## 2026-10-10 merge verification

Attempt: fad32e04-451f-4d18-a229-86608c589cb1
Rebase target / refreshed AKROGON_BASE: 0f507dafd9b8b4e4c4cf853074cad7bd996b03d6
Tested stack top: d7dd5a14b638736546a4c6defc13b19cf32c2f94
Prior reviewed repair head: f08e2a955e3f4d8c4f9163bbbfaeac79f1b6ad2f

The command applied the stack. HEAD matches the supplied top and the batch has no carried members. B committed nothing and did not fetch or rebase. Read the existing plan, report and reviews during the preceding review/repair passes and used the refreshed merge config here. No merge_covers, merge_checks or advisory commands are configured.

- `bun run format`: exit 0, 1.02s. Inspected and restored its unrelated src/status.ts formatting rewrite, with the worktree clean beforehand, preserving the recorded stack top.
- `bun test --timeout=30000`: exit 0, 603 pass, 0 fail, 6323 expectations, 29 files, 40.59s. Output: implementation/merge-tests.log.
- `bun run typecheck`: exit 0, clean.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`, with AKROGON_BASE set to the refreshed target above: exit 0, eight changed files, no affected test files, 0 pass / 0 fail, 11ms.

Worktree clean after checks. Completion-owner inventory: only bounce-repair-proof lands, while seven sibling leaves under merge-throughput remain in implement or plan.synthesis. This batch cannot complete that issue, so no completion-owner broadcast is expected.
