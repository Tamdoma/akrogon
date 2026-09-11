# 1. Goal
Implement plan D1–D5 for isolated-dispatch-errors. One cohesive worker unit owns discovery, dispatch boundaries and regression tests in the current leaf worktree.

# 2. Numbered acceptance criteria
A1–A8 in ../plan.md apply in full. Derive tests before code and capture failing baseline, then passing changed tests. Broken registrations/states/dependencies/cleanup must produce structured errors without stopping healthy eligible work. Preserve conservative capacity and fatal lock failures.

# 3. Read-first list
Read ../plan.md, ../brief.md, ../design.md, docs/next.html, src/next.ts, src/state.ts, src/config.ts, src/phase.ts, tests/next.test.ts, tests/helpers.ts, tests/fake-herdr.ts and /home/ivan/.codex/skills/implement-issue/ponytail.md. Copy existing subprocess fixture patterns in tests/next.test.ts. Paths other than ../ references are worktree-relative.

# 4. Change list and needed interfaces
Only src/next.ts and tests/next.test.ts code changes. Introduce private typed discovery and per-invocation skip reporting as needed by plan. Keep shared state/config/phase APIs unchanged. Save CLI evidence to implementation/cli-artifact.log alongside this brief, outside the worktree. Existing real subprocess tests can supply that evidence through a temporary runner, removed afterwards.

When an explicit slug cannot be resolved from an incomplete inventory, retain the existing discovery errors and aggregate nonzero exit. Only a fully readable inventory can establish a nonexistent target. B approved this clarification during integration review.

# 5. Do-not, reasons and exceptions
Do not catch lock helpers, silently ignore errors, introduce notifications/retries/deadlines, alter completion ordering, edit docs or change shared command semantics. These preserve locked scope and fatal lock behavior. Return a mismatch with concrete evidence and the smallest correction if the plan requires a scope/interface change. Only a revised brief from B authorizes that exception. Do not commit or invoke lifecycle commands. Use isolated temp fixtures, fake herdr/gh only, and no real external panes or services. Exclusions protect scope and operator state, with exceptions only by revised brief.

# 6. Ordered steps
1. Add meaningful failing tests in tests/next.test.ts for the acceptance criteria and capture baseline output.
2. Implement discovery and capacity in src/next.ts, then integrate scoped work boundaries and all entry modes. Preserve lock failure propagation and state refresh after owner moves.
3. Run changed tests, repair within scope, and save real CLI evidence and remove temporary runners.
4. Fill section 8 with results before returning. Advisory scope is two code files and one coherent implementation unit. Return mismatch if meaningful new surfaces are required.

# 7. Commands
Run only this test command (B owns full suite and blocking format/typecheck):
`AKROGON_BASE=8eebd88033301dfd7dbe943641d3028bf4b3a041 bun test --changed=8eebd88033301dfd7dbe943641d3028bf4b3a041`
Capture fail-first and final changed-test output in this implementation directory. Real CLI invocation for A8 is also required.

# 8. Done-when, evidence and report
A1–A8 implementation outcomes are met, changed tests pass, real CLI artifact records stderr, expected nonzero exit and healthy prompt evidence. B performs full suite, format and typecheck separately. Report any unverified edge case explicitly.

Changed files and reasons: src/next.ts adds invocation-local structured skip reporting, tolerant local discovery and lookup, conservative occupancy, recoverable work inside lock callbacks, and consistent startup/hook/cwd selection. tests/next.test.ts adds subprocess regressions for broken registrations, dependencies, states, cleanup, directory occupancy, identity ambiguity, explicit selection, disappearing state, lock acquisition/finalization and non-Error throws. No shared APIs or docs changed.
Tests run: the section 7 changed-test command captured a failing baseline in fail-first.log, then passed 34 tests with 245 assertions and zero failures in changed-tests.log. A separate actual CLI invocation asserted exit code 1 and the healthy prompt, saved stderr/exit/prompt evidence in cli-artifact.log, and removed its runner and temporary fixture.
Known limitations: plan D5 remains. Corrupt members can prevent completeOwner from closing their owner, unknown population can delay new tabs, and lock failures deliberately stop the invocation.
Unverified criteria: none of A1–A8 remain. B verified format, typecheck and the full suite (77 passing tests, 909 assertions). Permission-denied traversal was handled by the same scoped filesystem boundary as the tested ENOTDIR case but was not separately exercised under an unprivileged user. A failing remote fetch was not separately exercised, while existing merge recovery tests and the shared dispatch work boundary cover that code path structurally. All other requested outcomes have subprocess regression evidence.
