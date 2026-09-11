# Review A: fetch-deadline

Base: 67c82bad809cb2144405ed2ff3ba49d3af1686a6
Reviewed head: 400dc3e (Bound merge recovery fetch with a deadline)
Debate: no, so no positions/rebuttal artifacts exist.

## Diff against plan and brief

- D1: `run` and `retryCommand` gain optional `deadlineMs`; `command` unchanged; only `recoverMerge` passes 60000. No other production caller changed. `pull.ts` still calls `retryCommand` without a deadline and keeps its prior semantics.
- D2: timer starts after spawn, races collection, kills the direct child, rejects `CommandError` with argv, cwd, code 1 and `deadline <ms>ms exceeded`; timer cleared in `finally` on both paths. Omitted deadline awaits the original collection promise.
- D3: timeout rejection propagates from the first `run`; ordinary nonzero exit warns once and retries via `run` with the same deadline, then throws `CommandError` for a second nonzero result. Behavior for existing callers is equivalent to the previous `command` retry.
- D4: no lock or dispatch changes; rejection flows through existing `finally` releases.
- D5: harness wraps the real `retryCommand` in a child process, asserts 60000, injects 100ms, uses a PID-recording fake git that execs sleep, real locks reacquired by independent `flock -n`. `mock.module` is isolated to the harness child.
- Tests map to A1–A4; no mocks of the unit under test; no prose assertions beyond fixed error text and the literal `deadline 100ms exceeded` reference.
- Docs: grep of REFERENCE.md and docs/{merge,next,limits}.html shows no statement contradicted by this change; doc/index authorship left to B.

## Verification (rerun here)

- `bun run format`: exit 0, worktree clean afterwards.
- `bun run typecheck`: exit 0.
- `AKROGON_BASE=67c82ba… bun test --changed=67c82ba…`: 74 pass, 0 fail, 10 files.
- `verification.txt` shows the real harness run: 100ms deadline rejected at 138.6ms, dead PID, one attempt, four locks reacquired, state unchanged.
- red.txt shows the fail-first run (4 failures: two sleeping cases resolved instead of rejecting, recovery lacked deadline, one unsupported matcher later corrected).

## Findings

None blocking.

Observation (not a fix): the timeout error carries `stdout: ''` and only the deadline text, dropping any partial subprocess output. Plan D2 permits this ("where practical without adding a stream-processing abstraction") and the report states the limitation.

## Verdict

ready

## Merge attempt 1 (slot A)

Rebase of 400dc3e onto origin/main target f9e7ddd8c47297114490269ecc1fb7f16e775fd1 (Isolate next dispatch errors by repo and leaf) stopped with a conflict. Rebase left in progress in the worktree for B.

Conflicting files:
- tests/next.test.ts (lines 571–845): upstream appended new dispatch-isolation tests (`skips`, `configure`, `resetPrompts` helpers and their tests) at the end of the file; this leaf appended the `recovery fetch deadline releases dispatch locks without transitioning` test at the same spot. Both blocks are true and should both be kept, upstream block first, then the leaf test.

Checks not run on this attempt. AKROGON_BASE after fetch: f9e7ddd8c47297114490269ecc1fb7f16e775fd1.

## Re-check after check.fix (slot A)

Baseline: f9e7ddd8c47297114490269ecc1fb7f16e775fd1 (rebase target). Prior reviewed head: 400dc3e. Repair head: 9dc1055 (f9e7ddd is an ancestor; rebase complete, no conflict markers, worktree clean).

Repair diff (range-diff 67c82ba..400dc3e vs f9e7ddd..9dc1055):
- tests/next.test.ts: conflict resolved by keeping the full upstream dispatch-isolation block followed by the unchanged leaf deadline test. Only the append location moved.
- tests/fetch-deadline-harness.ts: adapted to the upstream contract where `nextCommand` now catches leaf errors, prints a structured skip line and sets exit code 1 instead of rejecting. The CommandError assertions moved into the test-only retry wrapper and the error is rethrown, so the real deadline rejection is still asserted at the boundary. The outer harness parses the structured stderr with zod and asserts repo/path/slug and the deadline text. PID, lock and state assertions are unchanged.
- src/shell.ts and src/phase.ts: identical to the prior reviewed head.

Earlier findings confirmed: none blocking, observation on discarded partial output unchanged. No defect introduced by the repair.

Checks rerun on 9dc1055:
- `bun run format`: exit 0, worktree clean.
- `bun run typecheck`: exit 0.
- `AKROGON_BASE=f9e7ddd… bun test --changed=f9e7ddd…`: 92 pass, 0 fail.
- `bun test`: 92 pass, 0 fail, 966 assertions.
- repair-verification.txt: real harness with dispatch exit 1, 135.0ms, one attempt, dead PID, four locks reacquired, merge state unchanged.

Verdict: ready

## Merge attempt 2 (slot A)

Head 9dc1055 unchanged since re-check, origin/main still f9e7ddd, checks reused. Pushed 9dc1055 to origin main (f9e7ddd..9dc1055), confirmed ancestor of origin/main after fetch.
