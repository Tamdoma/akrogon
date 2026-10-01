# Review B: failed-stop-guard

Verdict: nits. No blocking findings.

Base: `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`.
Reviewed head: `4e9c31f5d65bfd38155829dba8470e119de5ac87`.
Initial review, debate disabled. No B position or rebuttal artifacts were produced.

## Verification

Read the brief, locked design, plan, implementation report, changed files, affected guide pages, reference index, relevant area docs, CLI parsing, state schema, transition callers and fixture helpers. Reviewed the complete four-file diff. No AREA.md changed.

The guard uses the explicit parsed slot immediately after the merged-terminal check, before legal-move validation, slot inference, state/log writes, worktree Git checks or Herdr calls. It also rejects failed-to-failed calls before the illegal-move check. Optional failure records are handled correctly. Active-phase stops and slot-less recovery retain their existing paths.

Reviewer ran `bun test --changed=2ad0acf70a85dacefa3a89c53a53233e2aae11ca`: exit 0, 39 pass, 0 fail, 352 assertions, 5.92s. This runs the real CLI through both new tests and all existing phase tests. C1-C4 pass, including the incident sequence, both failure causes, missing failure record, unchanged state/history, no Herdr calls on refusal, and existing recovery/stop scenarios.

C5: read both guide additions. Each describes the explicit-slot refusal and slot-less recovery, consistent with the live transition. No new paths or links.

C6: implementation report records format, typecheck, full suite (341 pass, 0 fail), and changed tests passing at the reviewed head. Accepted that evidence rather than repeating unrelated checks. Reviewer independently reran changed tests because this is a code change. Worktree was clean when review began.

## N1: explanatory wording coupled to tests

`tests/phase.test.ts` adds `seatRefusal` and asserts that stderr contains its complete explanatory sentence in both new tests. A wording-only edit with the same refusal, reason, state and side effects would fail those assertions. This is a non-blocking wording-coupling concern under the review rules and the operator's function-over-form instruction.

Deferred because the locked C1/D4 explicitly require this sentence, the current implementation satisfies that requirement, and all behavioral assertions pass. Promote to a Fix only with a real failing blocking check or evidence that refusal behavior, recorded reason or unchanged effects are incorrect. No extra test matrix or broader cleanup is requested.

## Merge verification

Rebased without conflicts onto origin/main `61e8a156dc872ffd1ec01cc48a1894903271e575`. Prior reviewed head: `4e9c31f5d65bfd38155829dba8470e119de5ac87`. Rebased head: `25f995fababee5f0bec323120b14e71c60b8e994`. Refreshed AKROGON_BASE from akrogon config to the rebase target.

`git range-diff 2ad0acf70a85dacefa3a89c53a53233e2aae11ca..4e9c31f5d65bfd38155829dba8470e119de5ac87 61e8a156dc872ffd1ec01cc48a1894903271e575..25f995fababee5f0bec323120b14e71c60b8e994` reports all three patches unchanged (`=`).

All configured blocking checks passed at the rebased head:
- `bun run format`: exit 0, all files unchanged.
- `bun run typecheck`: exit 0.
- `bun test`: exit 0, 341 pass, 0 fail, 3968 assertions, 75.20s.
- Resolved configured changed-tests command with AKROGON_BASE=61e8a156dc872ffd1ec01cc48a1894903271e575: exit 0, 39 pass, 0 fail, 352 assertions, 5.92s.

No advisory checks configured. Worktree clean. N1 preserved as a lesson in the registered checkout's learnings/LESSONS.md and history/2026-10-01-failed-stop-guard-wording.md, left for the operator to commit as required by merge-issue.

Push confirmed: `git push origin HEAD:main` exited 0, advancing main from 61e8a15 to 25f995f, fast-forward only.
