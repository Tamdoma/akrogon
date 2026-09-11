# 1. Goal

Implement fetch-deadline plan D1–D5 in the leaf worktree. A hung recovery fetch must reject at 60 seconds and release dispatch locks. One bounded implementation unit covers the shell helper, its caller and verification.

# 2. Numbered acceptance criteria

1. A1: A real PID-recording sleeping fetch exceeds a short parameter-injected deadline, throws CommandError with command/cwd/nonzero result/deadline stderr within scheduling tolerance, terminates the direct child, and is not retried.
2. A2: Real nextCommand recovery releases global/repo/leaf locks on timeout, independently verified with nonblocking flock; merge state stays unchanged.
3. A3: Fast success, ordinary failure then success with one structured warning, two failures returning the second error, and a hung second attempt all preserve planned semantics. Omitted deadlines retain behavior.
4. A4: Standalone fast successful and failed commands with a long deadline exit promptly, proving timer cleanup.
5. A5: Changed tests pass, red then green evidence exists, and a real harness invocation records timeout, dead PID, reacquired locks and unchanged state in the authoritative leaf verification.txt.

# 3. Read-first list

Read this leaf's ../plan.md and ../design.md, docs/merge.html, docs/next.html, docs/limits.html, src/shell.ts, recoverMerge in src/phase.ts, nextCommand/dispatchLeaf in src/next.ts, lock helpers in src/state.ts, tests/helpers.ts and tests/next.test.ts (copy isolated fixture and fake Herdr patterns), tests/phase.test.ts, package.json, and /home/ivan/.codex/skills/implement-issue/ponytail.md.

# 4. Change list and needed interfaces

src/shell.ts: optional third deadlineMs?: number on run and retryCommand. Preserve Result and return types. Timer races collection, kills direct child and rejects CommandError, always cleared. Retry ordinary failures once with the same deadline, never retry a thrown timeout. command unchanged.
src/phase.ts: recovery fetch passes 60000.
tests/phase.test.ts or tests/next.test.ts plus narrow shell tests/isolated harness as needed. Test-only wrapper asserts 60000 then passes a short number into the real retryCommand; isolated module mock must not pollute the suite. Use real subprocesses and locks.

# 5. Do-not, reasons and exceptions

Do not change other production callers, locks, dispatch, configuration, or add dependencies: these are outside locked scope. Do not mock timeout implementation, spawn, locks, or authentication: evidence must prove real behavior. Do not run full suite or commit: B owns final gates and commit. Return a mismatch with concrete evidence instead of changing scope or interfaces; only a revised brief from B permits that change. These exclusions keep scope narrow and evidence meaningful; a revised brief is the only scope/interface exception.

# 6. Ordered steps

Derive tests for criteria 1–4 before production code and capture a fail-first result. Implement shell helper and recovery caller. Run changed tests red then green as applicable. Run real isolated harness and save authoritative verification.txt. Inspect scope and fill report below. Expected about five files, under 20 turns; materially larger work returns evidence and proposed brief correction rather than silently expanding.

# 7. Commands

AKROGON_BASE=67c82bad809cb2144405ed2ff3ba49d3af1686a6 bun test --changed=67c82bad809cb2144405ed2ff3ba49d3af1686a6

# 8. Done-when, evidence and report

Report changed files/reasons, changed-test results including fail-first evidence, end-to-end artifact, known limitations and unverified criteria. The locked child.kill() design does not promise descendant termination or signal escalation. Preserve that limitation. Issue artifacts belong only in /home/ivan/Work/infra/akrogon/issues/open/loop-hardening/dispatch-progress/fetch-deadline, never the worktree issues directory. Clean temporary fixtures/helpers. Do not use real Herdr panes, socket, GitHub or installation state in tests.

Changed files and reasons: pending
Tests run: pending
Known limitations: direct-child kill only, no signal escalation or deadlines for other git commands.
Unverified criteria: pending implementation
