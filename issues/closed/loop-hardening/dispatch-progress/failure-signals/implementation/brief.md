# Repair brief: tab_closed integration

## 1. Goal
Fix review A's recorded compilation and closed-tab regression failures on base eed65fb70e72215d300d40c5187b77ec01d01bdc. Before-repair head is 389c0b4. Preserve plan D1–D6 and upstream closed-tab behavior.

## 2. Numbered acceptance criteria
1. Existing test "a closed tab hook from a merged leaf sweeps and starts the next leaf" passes unchanged, including workspace placement and attempt assertions.
2. tab_closed uses registeredRepos/discover, passes Leaf and Invocation to dispatchLeaf, and only sweeps all repos on outcome completed. Unknown owners remain ignored and ambiguous owners remain errors.
3. Changed tests pass without weakening existing assertions. Root verifies the six reported type errors are gone and runs full checks.

## 3. Read-first list
../plan.md and ../review-A.md latest merge section, docs/next.html, src/next.ts nextCommand/discover/registeredRepos/dispatchLeaf/sweepAll, tests/next.test.ts closed-tab and pane-hook tests, tests/helpers.ts, and /home/ivan/.codex/skills/implement-issue/ponytail.md. Copy the adjacent existing pane-hook owner-discovery and outcome handling pattern. Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/failure-signals.

## 4. Change list and needed interfaces
Modify only tab_closed in src/next.ts to use registeredRepos(global, invocation).repos, discover(repo, invocation).leaves, dispatchLeaf(global, repo, leaf, false, invocation): Promise<DispatchOutcome>, and sweepAll(global, invocation). Add tests in tests/next.test.ts only if needed to cover a concrete uncovered branch introduced by this repair. Root owns artifact and full checks.

## 5. Do-not, reasons and exceptions
Do not change notification/seat behavior, plugin configuration, unrelated code, docs, or existing test assertions because the recorded repair is interface integration only. Do not add abstractions, push, commit or advance lifecycle. Use isolated real CLI fixtures with fake herdr only. Return a mismatch with evidence before expanding scope, unless root revises the brief. Only a revised brief permits scope changes, preserving existing behavior and review boundaries.

## 6. Ordered steps
Run changed tests first to reproduce the existing failing closed-tab test. Fix src/next.ts by following the adjacent pane-hook branch. Run changed tests again. Record exact red/green results and the changed files. Advisory scope one source file and about six turns.

## 7. Commands
`AKROGON_BASE=eed65fb70e72215d300d40c5187b77ec01d01bdc bun test --changed=eed65fb70e72215d300d40c5187b77ec01d01bdc`
Worker runs only this test command. Root runs formatting, typecheck, full suite and CLI evidence.

## 8. Done-when, evidence and report
The existing closed-tab CLI test and changed suite pass, and the repaired branch follows the real current interfaces. Fill report before returning.

Changed files and reasons: src/next.ts only. The tab_closed branch now discovers owners through registeredRepos/discover, passes Leaf and Invocation to dispatchLeaf, and sweeps with Invocation only when DispatchOutcome is completed. Unknown and ambiguous owner handling is unchanged. Existing tests and assertions are unchanged. This brief records the worker report.
Tests run: `AKROGON_BASE=eed65fb70e72215d300d40c5187b77ec01d01bdc bun test --changed=eed65fb70e72215d300d40c5187b77ec01d01bdc` before repair exited 1 with 65 pass, 1 fail, 611 assertions (29.59s). The existing closed-tab test failed at tests/next.test.ts:364 with expected exit 0, received 1. The same command after repair exited 0 with 66 pass, 0 fail, 614 assertions (29.84s), including the unchanged closed-tab workspace and attempt assertions.
Known limitations: existing plan R1/R2 unchanged.
Unverified criteria: root owns full checks and CLI evidence.
