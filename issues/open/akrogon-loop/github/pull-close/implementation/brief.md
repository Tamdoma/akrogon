## 1. Goal

Implement D1–D7 and A1–A7 from ../plan.md, completing GitHub pull, source closure, and startup integration.

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

Delegate brief-1 then brief-2 sequentially. Inspect each return. Run full format/typecheck/test checks, record results and commit the scoped diff.

## 7. Commands

No configured changed-test runner. Use targeted command: `AKROGON_BASE=ab36dd0e424b5b5041dd251c189639498c72b4a8 bun test tests/pull.test.ts tests/phase.test.ts tests/next.test.ts`. Workers run only this targeted check. B owns the full suite and other blocking checks.

## 8. Done-when, evidence and report

Fill the report with exact command outcomes and evidence paths from real fixture invocations. Report limitations and remaining criteria explicitly. Never substitute prose checks for functional outcomes.

Changed files and reasons: src/pull.ts implements complete origin-based mirror reconciliation and source close with one rechecking retry. src/akrogon.ts wires pull/--all. src/phase.ts and src/next.ts await source closure after owner rename under existing locks. plugin/pull.sh and plugin/herdr-plugin.toml add pull before next at startup. tests/fake-gh.ts and tests/helpers.ts provide the substituted external boundary. tests/pull.test.ts, tests/phase.test.ts, and tests/next.test.ts verify A1–A7 with real temp-repo CLI processes. No new dependency or adjacent feature.
Tests run: worker 1 targeted pull check progressed from 6 failing tests to 6 passing tests/61 assertions (pull-red.txt and pull-green.txt). Worker 2 targeted phase/next check progressed from 4 failing tests before implementation to 19 passing tests/181 assertions (close-red.txt and close-green.txt). B ran bun run format (exit 0, scoped formatting only), bun run typecheck (exit 0), bun test (40 pass, 0 fail, 436 assertions, exit 0), and git diff --check (exit 0). Combined command evidence is checks.txt. These tests invoke the actual CLI in temporary repositories and exercise both recovery paths with delayed gh lock/worktree probes. Fixtures clean up their temporary files.
Known limitations: plan R1–R3 remain. GitHub pagination is not transactional. A crash after owner rename or exhausted closure retries can leave a GitHub source open with no durable replay. GitHub calls hold existing locks and may delay dispatch. No live GitHub issue or operator pane was touched.
Unverified criteria: none within A1–A7. Real GitHub authentication and live herdr startup execution were not integration-tested. Startup declaration order and executed wrapper arguments were verified locally as required.
