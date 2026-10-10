# Intake: red-base-fixtures

## Scope
One test-only leaf that makes base f3199df green again so leaf merge-clean-worktree can resume.

## Provenance
- Operator: 2026-10-10 "yes fix it, make it move again", then "make the new test targeted for only that so it can continue moving fast"

## Source: operator 2026-10-10
Base f3199df89b25b4f215df04f8703ef6d71880cd6a is red: `bun test --timeout=30000` has 9 identical failures, 1 in tests/dependents-first.test.ts (Expected: 1, Received: 0 at line 103) and 8 in tests/peer-wait.test.ts (`herdr agent list` unexpected invocation, missing from the fake herdr fixture). This blocks leaf merge-clean-worktree (failed at check.fix). After the fix merges, merge-clean-worktree resumes with `akrogon phase merge-clean-worktree check.fix`.
make the new test targeted for only that so it can continue moving fast.

## Agent findings
Both failures were introduced by commit f3199df ("add issues"), which carried source changes with no matching test updates:
- skills/chart-issues/scripts/peer-wait.ts now calls `herdr agent list` (readPeerAgent, line 87) and, for Claude peers, reads a session transcript. tests/fake-herdr.ts has no `agent list` handler and throws `Unexpected fixture invocation: ["agent","list"]` (end of file). Reproduced locally: 8 peer-wait failures, same shape as the leaf's base run.
- src/next.ts (dispatchLeaf, ~line 684) now prints `waiting: <slug> on <deps>` and keeps exit 0 when a picked leaf waits only on open in-progress dependencies; docs/guide/next.md documents it. tests/dependents-first.test.ts:103 still expects exit 1. Reproduced locally.
Neither failure involves merge-clean-worktree's diff.
