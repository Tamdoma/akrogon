## 1. Goal

Resolve the rebase conflict identified in review-A.md, Merge attempt 1, without changing reviewed closure behavior (plan D1–D5). Reviewed head was 611d52b4caaa23a30c1276462e811e6f16ed6cfe. The paused rebase targets eed65fb70e72215d300d40c5187b77ec01d01bdc.

## 2. Numbered acceptance criteria

1. A5: tests/next.test.ts preserves all upstream session/seat tests and both leaf startup closure/cleanup tests, with no conflict markers or weakened assertions.
2. A6: the resolved changed-test command passes on the combined tree, preserving A1–A4 and upstream dispatch behavior.
3. A7: only the conflict is edited. B completes the paused rebase, checks the final diff, and runs remaining blocking checks.

## 3. Read-first list

Read ../review-A.md, ../plan.md, brief.md and /home/ivan/.codex/skills/implement-issue/ponytail.md plus worker-protocol.md. Inspect tests/next.test.ts conflict and its index stages. Inspect src/next.ts only to understand integration if tests fail. Existing tests on both sides are the patterns to preserve.

## 4. Change list and needed interfaces

Resolve tests/next.test.ts by retaining upstream's appended tests followed by the leaf's two appended tests. No interface changes. Other source/test files have already auto-merged. Do not stage or continue the rebase, B owns that final step.

## 5. Do-not, reasons and exceptions

Do not remove tests, weaken assertions, alter production code or resolve the conflict by choosing one whole side. Both sides encode accepted behavior. Do not edit docs or issue artifacts in the worktree. No new tests are needed for an append-only conflict. Return a mismatch with concrete evidence for changes beyond this scope. Only a revised brief from B authorizes an exception. These exclusions preserve both accepted implementations, with exceptions only by revised brief.

## 6. Ordered steps

1. Inspect index stages and preserve both appended blocks in tests/next.test.ts.
2. Run the resolved changed-test command below and save output under authoritative evidence/repair-1-changed.log. Repair only conflict-resolution errors. Existing conflict is the observed failure, no artificial failing test is needed.
3. Verify both blocks remain and fill section 8. About one file, one bounded conflict resolution.

## 7. Commands

```sh
AKROGON_BASE=eed65fb70e72215d300d40c5187b77ec01d01bdc bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
```

Preserve exit status when saving output. Only this test command belongs to the worker, B runs format, typecheck and full suite.

## 8. Done-when, evidence and report

Both test blocks retained and combined changed tests pass through real isolated CLI/Git fixtures with gh/herdr replaced only at process boundaries. Return changes/reasons, test results, limitations and unverified criteria. No real GitHub or pane mutations for tests.

Changed files and reasons: tests/next.test.ts conflict resolved by retaining stage 2's unchanged 164-line appended session/seat block, then stage 3's unchanged 67-line startup closure/cleanup block. Verified both blocks against their Git index stages. Conflict markers removed. No production file edited, no staging or rebase continuation performed.
Tests run: Supplied changed-test command with AKROGON_BASE=eed65fb70e72215d300d40c5187b77ec01d01bdc exited 1: 63 pass, 1 fail, 506 assertions across two files. Evidence: ../evidence/repair-1-changed.log, with pipefail preserving exit status. All preserved appended tests and phase closure tests pass. The failure is the upstream test “a closed tab hook from a merged leaf sweeps and starts the next leaf” at tests/next.test.ts:251. git diff --check passed.
Known limitations: original plan R1–R3 unchanged. Integration mismatch outside this brief: src/next.ts:501–513 still references missing allLeaves and invokes dispatchLeaf with a slug, four arguments and a boolean result assumption, while its current interface takes Leaf plus Invocation and returns DispatchOutcome. It also calls sweepAll without Invocation. The smallest brief correction permits aligning this tab_closed branch with the adjacent pane-hook discovery/dispatch interfaces, retaining its existing CLI test.
Unverified criteria: A5 satisfied. A6 remains failing due to the tab_closed integration mismatch, which this brief forbids editing. A7 worker scope satisfied, with rebase continuation and remaining checks assigned to B.
