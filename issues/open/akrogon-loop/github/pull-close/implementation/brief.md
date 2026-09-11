## 1. Goal

Repair review-B F1/F2 from reviewed head e58c2445cb38c74a5d5abe253dae555b5754035c, preserving D1–D7 and A1–A7. The concrete repair scope and corrected D6 retry behavior are in repair-1.md.

## 2. Numbered acceptance criteria

1. All plan A1–A7 hold with command-level evidence. Full checks pass before commit.
2. Tests exercise real CLI processes in temporary repos with substituted gh/herdr. No real external mutation.

## 3. Read-first list

Read ../plan.md and ../brief.md, src/config.ts, src/shell.ts, src/state.ts, src/akrogon.ts, src/phase.ts, src/next.ts, tests/helpers.ts, tests/fake-herdr.ts, relevant command tests, and /home/ivan/.codex/skills/implement-issue/ponytail.md. Copy existing temp-repo/CLI fixture conventions. Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/pull-close.

## 4. Change list and needed interfaces

src/pull.ts, src/akrogon.ts, src/phase.ts, src/next.ts, plugin/pull.sh, plugin/herdr-plugin.toml, tests/fake-gh.ts, tests/pull.test.ts, tests/phase.test.ts, tests/next.test.ts and narrowly needed fixture support.

## 5. Do-not, reasons and exceptions

Do not edit seed-issue, chart, broadcast, init, unrelated docs or dispatch logic because scope is locked. Do not contact real GitHub or herdr because tests must substitute that boundary. Do not add dependencies or generic frameworks because existing helpers suffice. Do not commit or advance phase as worker because B owns integration. Return a mismatch with concrete evidence instead of changing scope/interfaces. Exception: a revised brief from B can authorize the correction. These exclusions preserve scope, isolated verification, and one integration owner.

## 6. Ordered steps

Delegate repair-1.md, inspect its return, run all blocking checks, update evidence and commit the repair. Initial implementation evidence remains below. Repair completion evidence will record before and after heads.

## 7. Commands

No configured changed-test runner. Use targeted command: `AKROGON_BASE=ab36dd0e424b5b5041dd251c189639498c72b4a8 bun test tests/pull.test.ts tests/phase.test.ts tests/next.test.ts`. Workers run only this targeted check. B owns the full suite and other blocking checks.

## 8. Done-when, evidence and report

Fill the report with exact command outcomes and evidence paths from real fixture invocations. Report limitations and remaining criteria explicitly. Never substitute prose checks for functional outcomes.

Repair round 1 complete. Before: e58c2445cb38c74a5d5abe253dae555b5754035c. After (code and corrected plan): 2b626628c355937408a799b09d01865692e4bf5a. A following evidence-only commit records this report and review artifacts without changing tested code.

Repair changed files and reasons: src/pull.ts checks complete validated comment history before retrying an OPEN issue and omits an already-posted exact merged comment. tests/fake-gh.ts models comment success before close failure. tests/phase.test.ts proves the partial-success repair, later-page matches, comment-query failures and continued processing, and parses warning fields independently of serialization order. tests/pull.test.ts checks invalid-origin context instead of prose. Plan D6/A5 now account for partial gh side effects. The applied lesson history is dated without changing its original case. Review A's N1–N3 remain accepted limitations, with no adjacent refactor.

Repair tests: fail-first actual CLI regression recorded duplicate comments in repair-1-red.txt. Targeted green and the isolated reordered/whitespace warning variant each passed 27 tests and 266 assertions (repair-1-green.txt and repair-1-warning-order.txt). B's bun run format and bun run typecheck exited 0. Full bun test passed 42 tests, 460 assertions, exit 0. git diff --check passed. Evidence: repair-1-checks.txt. No unverified repair criterion remains. R1–R3 external-race, replay, and lock-duration limitations remain. All fixtures were temporary and no live GitHub/herdr operation was performed for this repair.

Initial implementation evidence:

Changed files and reasons: src/pull.ts implements complete origin-based mirror reconciliation and source close with one rechecking retry. src/akrogon.ts wires pull/--all. src/phase.ts and src/next.ts await source closure after owner rename under existing locks. plugin/pull.sh and plugin/herdr-plugin.toml add pull before next at startup. tests/fake-gh.ts and tests/helpers.ts provide the substituted external boundary. tests/pull.test.ts, tests/phase.test.ts, and tests/next.test.ts verify A1–A7 with real temp-repo CLI processes. No new dependency or adjacent feature.
Tests run: worker 1 targeted pull check progressed from 6 failing tests to 6 passing tests/61 assertions (pull-red.txt and pull-green.txt). Worker 2 targeted phase/next check progressed from 4 failing tests before implementation to 19 passing tests/181 assertions (close-red.txt and close-green.txt). B ran bun run format (exit 0, scoped formatting only), bun run typecheck (exit 0), bun test (40 pass, 0 fail, 436 assertions, exit 0), and git diff --check (exit 0). Combined command evidence is checks.txt. These tests invoke the actual CLI in temporary repositories and exercise both recovery paths with delayed gh lock/worktree probes. Fixtures clean up their temporary files.
Known limitations: plan R1–R3 remain. GitHub pagination is not transactional. A crash after owner rename or exhausted closure retries can leave a GitHub source open with no durable replay. GitHub calls hold existing locks and may delay dispatch. No live GitHub issue or operator pane was touched.
Unverified criteria: none within A1–A7. Real GitHub authentication and live herdr startup execution were not integration-tested. Startup declaration order and executed wrapper arguments were verified locally as required.
