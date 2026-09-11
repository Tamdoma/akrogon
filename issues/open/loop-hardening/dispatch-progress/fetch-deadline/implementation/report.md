# Implementation report

Implemented D1–D5 in five code/test files. Recovery fetch supplies a 60000ms per-attempt deadline. Deadline expiry kills the direct child and throws CommandError immediately. Ordinary nonzero exits still warn and retry once, with the deadline also applied to that retry. Existing lock cleanup releases dispatch locks.

Verification:
- Fail-first changed-test run exited 1: sleeping commands resolved after three seconds instead of timing out; recovery did not supply a deadline. See red.txt. That run also exposed an unsupported test matcher, corrected before green.
- Final configured changed-tests command exited 0: 74 passed, 0 failed. See green.txt.
- `bun tests/fetch-deadline-harness.ts` exited 0: a 100ms injected deadline rejected after 138.6ms including dispatch setup/cleanup, direct child terminated, one attempt, four real locks reacquired by independent flock processes, merge state unchanged. See ../verification.txt.
- `bun run format` exited 0 with every file unchanged.
- `bun run typecheck` exited 0.
- `bun test` exited 0: 74 passed, 0 failed, 867 assertions, 17.61 seconds. See full-tests.txt.
- `git diff --check` exited 0. Reviewed production diff and both new test files. No unrelated files changed. Existing docs/index contain no statement requiring correction for this narrow change.

Known limitation: child.kill() targets the direct child only, without signal escalation or process-group cleanup. Other git operations have no new deadline. Timeout errors carry the deadline diagnostic rather than partial subprocess output.

Unverified criteria: none. Integration checks the production 60000 argument and injects 100ms at the test-only wrapper boundary; it does not wait a full minute.

Committed as 400dc3e (Bound merge recovery fetch with a deadline). Post-commit worktree is clean and the branch contains no issues/ changes.

## Repair round 1: merge conflict integration

Prior reviewed head: 400dc3eef8a7fcde5a2204a228f039c0df20cdd3.
Rebase/conflict baseline: f9e7ddd8c47297114490269ecc1fb7f16e775fd1.
Completed rebase and repair head: 9dc1055a0a1ba3682335622d81f41873de966f11.

Resolved tests/next.test.ts by retaining the complete upstream dispatch-isolation tests followed by the unchanged leaf deadline test. Upstream now catches leaf errors, reports structured stderr and sets exit code 1. Updated only the deadline harness to observe that outer contract while asserting the real CommandError at the retry wrapper boundary and rethrowing it. Production shell/recovery code is identical to the prior reviewed head. Range-diff confirms the only behavioral repair is in the test harness, plus relocation of the appended test.

Repair evidence:
- Configured changed tests against the new baseline initially failed: 91 pass / 1 fail (repair-red.txt), reproducing the old harness's expectation of nextCommand rejection.
- After repair, configured changed tests exited 0: 92 pass / 0 fail, 966 assertions (repair-green.txt).
- Real harness exited 0 while the inner dispatch exited 1 with structured deadline context: 135.0ms, one attempt, dead PID, four locks reacquired, unchanged merge state (repair-verification.txt).
- Rebase completed successfully. `bun run format` exited 0, all files unchanged. `bun run typecheck` exited 0.
- Final `bun test` exited 0: 92 pass / 0 fail, 966 assertions, 24.08s (repair-full-tests.txt).
- `git diff --check` against the new baseline passed. Worktree clean. No issue artifacts in branch changes. Existing doc/index pointers need no changes for this test integration repair.

No unverified repair criteria. Original direct-child signaling and output limitations remain unchanged.
