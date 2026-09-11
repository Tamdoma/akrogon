## 1. Goal

Current repair round 2 supersedes round 1's execution instructions: follow repair-3.md to resolve the equivalent tab_closed dispatch hunk by taking upstream. Current AKROGON_BASE is 352fe91da011147a51561ddbfc295d7d29e00c54. Preserve original A1–A4, finish the paused rebase and verify against this base.

Current repair round 1: resolve the append-only tests/next.test.ts conflict from review-A.md's Merge attempt 1. The bounded execution brief is repair-1.md. Preserve all original A1–A4 criteria and both upstream and leaf tests. Current AKROGON_BASE is eed65fb70e72215d300d40c5187b77ec01d01bdc, superseding the original section 7 base for this repair. B completes the paused rebase after the worker resolves and verifies the conflict.

Integration follow-up repair-2.md authorizes updating only the upstream tab_closed branch to the current discovery/dispatch interfaces. Combined changed tests failed 1 case and typecheck exited 2 on removed allLeaves and old dispatchLeaf/sweepAll calls. Existing tests and scope exclusions otherwise remain unchanged.

Implement plan.md D1–D5: resumable source closure before reporting/moving and cleanup only after completion. One integrated unit owns the shared closure/probe interface and its CLI regressions.

## 2. Numbered acceptance criteria

1. A1: failed closure exits nonzero without issue complete, leaves merged state and chart under open, and next <slug> successfully retries and moves them. Successful earlier sources are skipped as CLOSED.
2. A2: private sources are the all-leaf intersection minus sibling union. First issue closes private sources only. Final issue closes its private and remaining epic sources. Empty/asymmetric leaf sources defer correctly. Worktree HEAD supplies comments.
3. A3: preserve existing completion, retry, malformed response, lock, host, standalone, collision and missing-worktree behavior except the explicitly changed ordering. Final epic failure after private success remains resumable.
4. A4: next --all completes before cleanup, rediscovering paths. Failed closure and unfinished sibling retain open leaves' worktrees, branches and tabs. Closed cleanup and existing error isolation continue working.

## 3. Read-first list

Read ../plan.md, ../brief.md and ../design.md. Read src/phase.ts, src/pull.ts, src/next.ts, src/state.ts, tests/phase.test.ts, tests/next.test.ts, tests/fake-gh.ts and tests/helpers.ts in the worktree. Copy existing isolated CLI fixture patterns. Read skills/chart-issues/assets/shapes.md source ownership paragraph and /home/ivan/.codex/skills/implement-issue/ponytail.md. docs/merge.html and docs/next.html provide current user flow context.

## 4. Change list and needed interfaces

Change completeOwner in src/phase.ts as plan D1–D2. closeSources(repo: Repo, sources: ReadonlySet<string>, leaf: Leaf): Promise<void> in src/pull.ts accepts explicit sources and reads the leaf worktree. Change --all ordering and cleanupMerged's open-path skip in src/next.ts. Update the shared fake-gh probe and all callers in phase/next tests to prove pre-rename closure under locks. No other production interfaces change.

## 5. Do-not, reasons and exceptions

Do not alter closeSource retry/comment semantics, persisted schemas, broadcast behavior, dispatch error isolation, documentation or unrelated code. These are outside the locked leaf scope. User scope instructions and the plan's explicit docs exclusion override the skill's general docs-update guidance. Return a mismatch with evidence instead of changing scope/interfaces. Only a revised brief from B authorizes an exception. Keep issue artifacts in this authoritative leaf, not in the worktree, and do not commit. These exclusions preserve scope and reviewability, with exceptions only through B's revised brief.

## 6. Ordered steps

1. Derive phase/next CLI regression assertions from A1–A4 before production changes and capture fail-first output.
2. Implement phase/pull closure behavior and fake-gh probe updates, including every existing probe caller.
3. Implement next sweep/cleanup ordering and remaining A4 tests.
4. Run the changed-test command, repair in-scope failures, and fill the report below with evidence. About six files in one integrated unit. Return a mismatch if materially beyond this scope.

## 7. Commands

Run this resolved command for red and green verification, preserving exit status when teeing logs:

```sh
AKROGON_BASE=35a20886b65463c0c7c6b0a30047f56a680d5e63 bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'
```

Save red output to ../evidence/cli-red.log and green output to ../evidence/cli-verification.log relative to this brief. B owns formatting, typecheck and final full suite.

## 8. Done-when, evidence and report

All A1–A4 outcomes verified with isolated real CLI invocations and real Git repositories, fake gh/herdr only at their process boundaries. No production GitHub or real panes. Include changed-test exit status and evidence paths. Read /home/ivan/.codex/skills/implement-issue/worker-protocol.md before returning.

Changed files and reasons: src/phase.ts derives private sources from the all-leaf intersection minus sibling union and completes external closure before reporting or moving. src/pull.ts accepts explicit source sets and reports missing worktree context with slug and sources. src/next.ts sweeps before rediscovery and cleanup and retains open-owner resources. tests/fake-gh.ts probes open owners, absent destinations, held open locks and live worktrees. tests/phase.test.ts covers private ownership, asymmetric and empty sets, standalone source union, resumable partial and final-epic failures, chart moves and terminal reporting. tests/next.test.ts covers startup closure recovery before cleanup and worktree/branch/tab retention while closure or siblings remain unfinished.
Tests run: Resolved changed-tests command from section 7 only, using AKROGON_BASE=35a20886b65463c0c7c6b0a30047f56a680d5e63. Fail-first exit 1 with 40 pass / 11 fail, captured in ../evidence/cli-red.log before production edits. Final verification exit 0 with 52 pass / 0 fail / 423 assertions across phase.test.ts and next.test.ts, captured in ../evidence/cli-verification.log. Both logs are in the authoritative leaf, and pipefail preserved command exit status. An intermediate test-only union fixture ordering mismatch was repaired by separating union coverage into its own CLI scenario.
Known limitations: plan R1–R3, including no broadcast replay on successful sweeps and stale ordering descriptions in docs.
Unverified criteria: A1–A4 covered by changed CLI tests. Formatting, typecheck and final full-suite verification remain assigned to B. No production GitHub or real pane operations were used. No commit made.
