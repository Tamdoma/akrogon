# Review B: fix-red-base-tests

Date: 2026-10-10
Phase: check.review
Base: f3199df89b25b4f215df04f8703ef6d71880cd6a
Reviewed head: 82b79cce6d201376b28eeedab6cad73678b7d880
Verdict: ready

## Findings

No Fixes, Nits or operator actions.

Reviewed the complete diff against brief.md, plan.md, design.md, implementation/report.md and the revised implementation briefs. Debate artifacts are absent as expected for debate: no. No peer review was read.

The agent-list handler matches peer-wait's result.agents schema and the captured real response in skills/watch-issues/scripts/fixtures/herdr-agent-list.json. It omits null-agent panes and preserves optional session values. The extra agent-wait change is necessary for criterion 1: f3199df added a 10000 ms idle/done grace wait targeting working, so instant fixture success would suppress failure, and a 10-second total budget would truncate the grace period. The new timeout branch and 12-second budgets preserve the existing outcome expectations. Scripted wait overrides retain their existing precedence. Existing next-family calls without --until retain their previous behavior.

The dependents-first test keeps the prompt-order assertion, checks both waiting lines, and replaces the stale exit-1 expectation with the exit-0 contract documented in docs/guide/next.md, implemented by src/next.ts. No documented behavior changed. No AREA.md changed.

## Verification evidence

- Criterion 1: inspected tests/peer-wait.test.ts and the full-test.log results for all nine cases, including done, blocked, failure and budget. Both failure cases finish after approximately 10.09 seconds. Existing JSON outcome assertions are retained. peer-wait consumes fixture timeout stderr and emits only its outcome on successful runs.
- Criterion 2: inspected the real CLI fixture and assertions. full-test.log records all four dependents-first tests passing, including next --all dispatch order, waiting lines and exit 0.
- Criterion 3: git diff --name-only base...HEAD lists only tests/dependents-first.test.ts, tests/fake-herdr.ts and tests/peer-wait.test.ts.
- Blocking checks: report records bun run typecheck, bun run format, bun test --timeout=30000 and bun test --changed="$AKROGON_BASE" --timeout=30000 passing. Inspected implementation/full-test.log: 663 pass, 0 fail, 7139 assertions, 33 files, terminal exit=0. Report records 13 changed tests passing and removal of unrelated formatter drift.
- Fail-before evidence: plan records the targeted base run with nine failures. Revised brief and report explain the remaining two failure cases after agent-list support, tracing them to the f3199df grace path rather than changing their expected outcomes.
- Review checks: git diff --check base...HEAD succeeds. git status --porcelain is empty.

No checks rerun: the implementation provides passing evidence at the unchanged reviewed head, and inspection found no specific concern requiring a repeat.

## Test-Change trailers

All changed files match src/test-files.ts because they are under tests/. All existing-file changes have trailers with sources supported by the inspected base commit, current code or documented contract:

- 08698c5: Test-Change: tests/fake-herdr.ts stale fixture missing the agent list handler peer-wait.ts now calls (commit f3199df)
- eaca512: Test-Change: tests/fake-herdr.ts f3199df added agent wait --until and the idle/done grace path that this fixture now emulates
- eaca512: Test-Change: tests/peer-wait.test.ts budget bump reaches the failure outcome past the 10s grace wait
- 82b79cc: Test-Change: tests/dependents-first.test.ts stale exit-1 expectation replaced by the documented exit-0/waiting-line behavior from f3199df

No reusable Nit remains to record in learnings.

## Merge verification: 2026-10-10

Attempt: 94268815-0751-492c-a93c-3a4170a9930d
Base: f3199df89b25b4f215df04f8703ef6d71880cd6a
Tested top: 82b79cce6d201376b28eeedab6cad73678b7d880
Applied batch has no carried members. No fetch, rebase or commit performed.

All configured checks ran on the recorded top, with exit 0:

- bun run format: implementation/merge-format.log. Restored only the known unrelated formatter changes in skills/chart-issues/scripts/peer-wait.ts and src/status.ts to HEAD before the remaining checks.
- bun run typecheck: implementation/merge-typecheck.log.
- bun test --timeout=30000: implementation/merge-test.log. 663 pass, 0 fail, 7139 assertions, 33 files, 63.26 seconds.
- : "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000, with AKROGON_BASE as above: implementation/merge-test-changed.log. 13 pass, 0 fail, 53 assertions, 2 files, 10.67 seconds.

merge_covers, merge_checks and advisory are empty. Completion owner green-base-tests has one leaf. Gathered ISSUE.md and fix-red-base-tests/brief.md before completion.
