# 1. Goal

Resolve merge-attempt-1 conflict from review-A.md while preserving plan D1–D5 and all existing acceptance criteria. Reviewed head is 400dc3eef8a7fcde5a2204a228f039c0df20cdd3. Rebase target is f9e7ddd8c47297114490269ecc1fb7f16e775fd1. Repair round 1 of 3.

# 2. Numbered acceptance criteria

1. R1: tests/next.test.ts preserves upstream dispatch-isolation helpers/tests followed by the leaf recovery-deadline test, with no conflict markers.
2. R2: Existing deadline tests still prove CommandError context, 60000 production argument, bounded short timeout, child termination, one attempt, timer cleanup, retry semantics, real lock reacquisition and unchanged merge state.
3. R3: Integration honors upstream nextCommand error reporting without weakening the underlying CommandError assertion or modifying production dispatch behavior. If upstream changed propagation, observe the real error at the wrapper boundary and rethrow it, then verify the new outer failure contract and structured deadline diagnostic.
4. R4: Configured changed tests pass and real harness evidence is refreshed. Capture a failing run if integration changes are required, before fixing that test.

# 3. Read-first list

Read ../plan.md, ../review-A.md, ../review-B.md, docs/next.html and docs/merge.html, src/next.ts error boundaries/reporting, src/shell.ts and src/phase.ts recovery, tests/next.test.ts conflict, tests/fetch-deadline-harness.ts, tests/shell.test.ts, tests/helpers.ts. Copy existing upstream test patterns for structured dispatch errors. Read /home/ivan/.codex/skills/implement-issue/ponytail.md.

# 4. Change list and needed interfaces

Resolve tests/next.test.ts by preserving both appended blocks. The pending rebase already contains the original leaf production and shell-test changes. Only adjust tests/fetch-deadline-harness.ts or its invocation as necessary for the integrated error contract. Existing production optional deadline interfaces and 60000 remain unchanged.

# 5. Do-not, reasons and exceptions

Do not remove or weaken upstream or leaf tests, change production behavior, modify docs unrelated to this conflict, or add dependencies. Preserve both siblings' contracts. Do not complete rebase, commit or run full suite: B owns those steps. Return a mismatch with evidence for scope/interface expansion, except an updated brief from B may authorize it. These exclusions preserve reviewed behavior and integration evidence; the only scope/interface exception is a revised brief.

# 6. Ordered steps

Resolve the single textual conflict, run changed tests and capture failures, repair only any resulting test integration mismatch, rerun changed tests and real harness. Leave conflict file resolved in working tree for B to inspect/stage. Fill section 8. Expected 1–2 edited test files and under 12 turns, with evidence-based mismatch if materially larger.

# 7. Commands

AKROGON_BASE=f9e7ddd8c47297114490269ecc1fb7f16e775fd1 bun test --changed=f9e7ddd8c47297114490269ecc1fb7f16e775fd1

# 8. Done-when, evidence and report

Save repair-red.txt (if applicable), repair-green.txt and repair-verification.txt in this authoritative implementation directory. Use real temporary files/processes and fake external executable boundaries only. Do not touch real Herdr or GitHub. All prior acceptance criteria remain required. Report files/reasons, commands/results, limitations and unverified criteria. B completes rebase, runs final gates, records before/after heads and hands off.

Changed files and reasons: tests/next.test.ts resolves the append conflict by retaining the exact upstream file followed by the original leaf deadline test. tests/fetch-deadline-harness.ts checks the real CommandError at the retry wrapper boundary, rethrows it, then verifies nextCommand sets exitCode 1 and emits the structured repo/path/slug/deadline diagnostic. Production files remain unchanged from the reviewed implementation.
Tests run: AKROGON_BASE=f9e7ddd8c47297114490269ecc1fb7f16e775fd1 bun test --changed=f9e7ddd8c47297114490269ecc1fb7f16e775fd1 initially exited 1 (91 pass, 1 integration mismatch) in repair-red.txt, then exited 0 (92 pass, 0 fail, 966 assertions) in repair-green.txt. timeout 5 bun tests/fetch-deadline-harness.ts exited 0 in repair-verification.txt: 135.0ms total, 100ms injected deadline, one attempt, dead child PID, four locks reacquired, unchanged merge state and no transition. Exact block-preservation assertion passed.
Known limitations: direct-child signaling only, no escalation or descendant cleanup, partial child output omitted on timeout.
Unverified criteria: R1–R4 verified. Final format, typecheck, full-suite gates and rebase completion belong to B and were not run here. Files remain unstaged as instructed.
