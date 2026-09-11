## 1. Goal

Resolve review A's Merge attempt 1 rebase conflict and preserve the already-reviewed pull/close behavior plus upstream changes. Repair round 2 of 3. Prior reviewed head: 65b67f46d854ea73569fe73d9af149d02b5e7c40. Rebase target and supplied base: 7af5184669bc43d6e9f47f30e0bd8fb24c282a7d.

## 2. Numbered acceptance criteria

1. Complete the existing rebase without skipping/aborting any leaf commit. Resolve tests/phase.test.ts imports as the union of upstream command and leaf fakeGh/GhFixture/GhStep/zod requirements.
2. Retain upstream prompted-session tracking, dirty-worktree guards, non-force worktree removal, and the leaf's awaited close path and partial-comment-success repair.
3. Targeted pull, phase and next tests pass after integration. Repair a newly demonstrated compatibility failure only within this scope, preserving both sets of criteria.

## 3. Read-first list

../review-A.md Merge attempt 1 and round-1 recheck, ../plan.md, ../implementation/brief.md, /home/ivan/.codex/skills/implement-issue/ponytail.md and worker-protocol.md. Inspect git status, rebase todo, tests/phase.test.ts conflict, src/phase.ts, src/next.ts, src/state.ts, tests/next.test.ts and tests/fake-herdr.ts. Existing temp-repo CLI tests are the pattern.

## 4. Change list and needed interfaces

Resolve only the conflicting import block initially, stage that file, and run GIT_EDITOR=true git rebase --continue until the pending rebase finishes. This explicitly permits rebase-created commits as an exception to ordinary worker no-commit policy. Do not create additional commits for new repairs. Existing closeSources and completion interfaces stay unchanged. If tests expose a compatibility defect from upstream integration, fix only that defect and report it to B.

## 5. Do-not, reasons and exceptions

Do not drop upstream changes, skip commits, reset, abort, force-remove worktrees, change remote refs, push, or touch unrelated features because this is an integration repair. Do not address old N1–N3 nits. Do not run full checks or advance phase because B owns final integration. Required rebase --continue commits are authorized. Return mismatch evidence if the conflict extends beyond this scope, with revision by B as the exception.

## 6. Ordered steps

Record the initial conflict evidence. Resolve imports and continue the existing rebase, handling only further direct conflicts if encountered. Record final rebased head and base. Run targeted tests and fix any demonstrated relevant compatibility issue, retaining failure/green evidence. Fill section 8. Advisory about one conflict file and under ten turns, not a hard cap.

## 7. Commands

Targeted command: `AKROGON_BASE=7af5184669bc43d6e9f47f30e0bd8fb24c282a7d bun test tests/pull.test.ts tests/phase.test.ts tests/next.test.ts`. No configured changed-test runner. Do not invoke akrogon config again. B owns full suite, typecheck and format. Fixture commands use temp repos with substituted gh/herdr only.

## 8. Done-when, evidence and report

Record exact rebase result, before/after heads, targeted results and evidence paths. No new tests are needed for an import-only conflict when existing behavioral tests prove both branches survived. Any code defect requires fail-first evidence.

Changed files and reasons: tests/phase.test.ts import conflict resolved with the union of command, fakeGh, GhFixture, GhStep and zod imports. No additional compatibility repair or new test was needed. All three existing leaf commits replayed successfully with GIT_EDITOR=true git rebase --continue (exit 0), without skipping or aborting. Prior reviewed head: 65b67f46d854ea73569fe73d9af149d02b5e7c40. Initial paused HEAD and supplied base: 7af5184669bc43d6e9f47f30e0bd8fb24c282a7d. Final rebased head: f96330c692aa86d1043027fdb73445254bf8a533. Replayed commits: fe30c7e, e1b305b, f96330c. Initial conflict and final status evidence: implementation/repair-2-rebase.txt. Working tree was clean after rebase.
Tests run: AKROGON_BASE=7af5184669bc43d6e9f47f30e0bd8fb24c282a7d bun test tests/pull.test.ts tests/phase.test.ts tests/next.test.ts passed 31 tests, 0 failed, 293 assertions, exit 0 in 12.11 seconds. Output: implementation/repair-2-targeted.txt. Existing tests prove upstream prompted-session tracking, dirty-worktree guards and cleanup plus leaf awaited sourced recovery and partial-comment retry behavior.
Known limitations: existing plan R1–R3 unchanged.
Unverified criteria: no worker acceptance criterion remains. B owns full-suite, typecheck and formatting verification and final integration evidence. No full checks, push or phase command ran in this worker. No live GitHub or herdr calls were made.
