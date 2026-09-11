# Implementation brief

## 1. Goal

Implement plan D1–D6: replace init-issues with a compact command-driven setup skill and remove its obsolete distribution trees.

## 2. Numbered acceptance criteria

1. C1: The skill covers the complete proposal, inspection, missing-choice questions, command ownership, compaction, and terminal footer within its prose budget.
2. C2: Follow the skill in a real temporary Bun/ESLint git repo with isolated AKROGON_HOME. Capture proposal, init invocation and resulting config, run proposed checks, and confirm manifest preservation.
3. C3: Verify absent, existing and configured-missing index handling and distinguish direct index writes from init-owned writes.
4. C4: Verify toolkit selection without tests, no existing-suite migration, failing test rejection and missing-base rejection.
5. C5: Remove both old trees and scoped stale references, preserving unrelated files.

## 3. Read-first list

Read ../plan.md, ../brief.md and ../design.md, skills/init-issues/SKILL.md, src/akrogon.ts, src/init.ts, src/config.ts, tests/init.test.ts and tests/helpers.ts. Existing compact skill pattern: skills/plan-issue/SKILL.md. Read /home/ivan/.codex/skills/implement-issue/ponytail.md. No configured grounding index. Do not read LESSONS.md during implementation.

## 4. Change list and needed interfaces

Only rewrite skills/init-issues/SKILL.md and delete skills/init-issues/payload and skills/init-issues/scripts. Use existing akrogon config and init --from <file> [--toolkit <lang>=<runner>]. Store verification evidence beside this brief. No command implementation changes.

## 5. Do-not, reasons and exceptions

Do not expand to other skills, command code or repo documentation because ownership is limited to init-issues. Return a mismatch with evidence rather than changing scope or interfaces, unless B revises this brief. No persistent helper/test harness because this is prose and deletion. Temporary scenario helpers are permitted and removed after evidence capture. No real panes, install roots, GitHub or socket because fixtures must be isolated. Preserve these ownership and isolation boundaries unless a revised brief explicitly changes them.

## 6. Ordered steps

1. Derive and record baseline failures against C1/C5 before editing. Use functional inspection, not exact wording tests.
2. Rewrite the skill and delete retired trees for C1/C5.
3. Follow the resulting skill in disposable fixtures for C2–C4, recording real process results, proposals and file changes. Declare any fixture dependencies in its manifest. Capture deliberate red checks then restore green checks.
4. Run the targeted test, inspect scope, delete temporary fixture/helpers, and fill this report.

One bounded unit, 12 tracked files before deletion, approximately 15 turns. Return substantive mismatch if needed rather than treating this as a hard limit.

## 7. Commands

No configured test_changed. Targeted check: AKROGON_BASE=ab36dd0e424b5b5041dd251c189639498c72b4a8 bun test tests/init.test.ts. B runs format, typecheck and full suite separately.

## 8. Done-when, evidence and report

C1–C5 observed, with scenario transcript and proposal evidence under implementation/. Return changed files/reasons, test output, limitations and unverified criteria. Keep scope and checks honest.

Changed files and reasons: Rewrote skills/init-issues/SKILL.md for D1–D6 and deleted 11 retired distribution files under payload/ and scripts/. Evidence is in baseline.md, verification.md, scenario-transcript.txt, initial-run-failure.txt and proposal/result YAML files beside this brief.
Tests run: Real isolated Bun/ESLint setup scenarios passed, including index reuse, configured-missing repair, no-tests toolkit selection, deliberate failing tests and missing-base rejection followed by restored green tests. Targeted tests/init.test.ts passed, 1 test / 12 assertions. See verification.md for exit codes and evidence.
Known limitations: Plan R1–R3. Other installed runners were not exercised. B reviewed the final skill and evidence. Formatting, all 30 tests (337 assertions), typecheck and diff whitespace checks passed.
Unverified criteria: None within this bounded unit. C1–C5 observed as recorded in verification.md, pending independent checker review.
