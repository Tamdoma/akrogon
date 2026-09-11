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

No configured test_changed. Targeted check: AKROGON_BASE=f281241901d0f1c8a2bfd5943be838fb14f5eb9c bun test tests/init.test.ts. B runs format, typecheck and full suite separately.

## 8. Done-when, evidence and report

C1–C5 observed, with scenario transcript and proposal evidence under implementation/. Return changed files/reasons, test output, limitations and unverified criteria. Keep scope and checks honest.

Changed files and reasons: Rewrote skills/init-issues/SKILL.md as the compact command-owned initialization flow and removed all 11 files in its retired payload/scripts trees. Added fresh reconcile-* proposal/result/transcript evidence, updated baseline, and labeled the previous verification report historical because it did not match actual starting HEAD.
Tests run: AKROGON_BASE=f281241901d0f1c8a2bfd5943be838fb14f5eb9c bun test tests/init.test.ts passed with 1 test, 12 assertions and no failures. Real isolated Bun/ESLint scenarios passed lint/full/changed checks, rejected deliberate failing tests and missing base, preserved manifests and existing indexes, repaired configured missing index through init, and recorded no-tests toolkit selection. See reconcile-verification.md and reconcile-scenario-transcript.txt. Fixtures and helper removed. B completed blocking checks: format and typecheck exited 0, full suite passed 34 tests / 364 assertions, and diff whitespace validation passed.
Known limitations: Plan R1–R3. Other runners were not exercised. Historical artifacts remain clearly marked as superseded by fresh evidence.
Unverified criteria: None of C1–C5 for worker verification. Independent checking remains the next lifecycle step.
