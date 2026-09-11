# Plan: fetch-deadline

Synthesis by slot B from brief/design and the live checkout. Debate is disabled, so there are no position or rebuttal artifacts to integrate.

## Read first

- `REFERENCE.md` and `learnings/LESSONS.md`.
- This leaf's authoritative `brief.md` and `design.md` under `issues/open/loop-hardening/dispatch-progress/fetch-deadline/` in the registered repository.
- `docs/merge.html`, `docs/next.html`, `docs/limits.html` for the operator flow and existing limits.
- `src/shell.ts`: `run`, `CommandError`, `retryCommand`, `command`.
- `src/phase.ts`: `recoverMerge`; `src/next.ts`: `dispatchLeaf`, `nextCommand`.
- `src/state.ts`: `withLock`, `withRepoLock`, `withLeafLocks`.
- `tests/helpers.ts`, `tests/phase.test.ts`, `tests/next.test.ts`, `package.json`.

## Decisions and interfaces

- **D1. Scope.** Add optional third argument `deadlineMs?: number` to `run(argv, cwd, deadlineMs)` and `retryCommand(argv, cwd, deadlineMs)`. Keep their existing return types. `recoverMerge` supplies `60000` only to its fetch. No environment/config setting, new production injection interface, or other call-site change. `command` stays unchanged.
- **D2. Deadline behavior.** Start a timer for a supplied deadline after spawning. Race the existing output/exit collection against deadline expiry. On expiry call `child.kill()` and reject with `CommandError` containing argv, cwd, a nonzero result code, and stderr naming `deadline <ms>ms exceeded`. Do not wait indefinitely for exit or inherited stdout/stderr handles after expiry. Retain available diagnostic output where practical without adding a stream-processing abstraction. Clear the timer in `finally` on every completion path. Omitted deadlines retain existing behavior.
- **D3. Retry behavior.** Deadline exceptions propagate immediately. Ordinary nonzero exits retain one structured warning and exactly one retry. Use `run` with the same optional deadline for the second attempt, then explicitly throw `CommandError` for a second nonzero result. This avoids extending `command` or allowing a retry to hang. The deadline is per attempt, not a shared total budget. A fast initial failure followed by a hung retry can take the initial attempt's duration plus 60 seconds.
- **D4. Locks and recovery.** Existing lock `finally` blocks release locks on rejection. Do not change lock or dispatch machinery. A timed-out fetch must leave the merge leaf unchanged and never reach ancestry checks or transition.
- **D5. Verification seam.** Exercise real subprocesses and locks. For a short integration deadline, use a separate Bun test harness process with a test-only wrapper around the real `retryCommand`: assert the recovery call supplied `60000`, then delegate with the short numeric argument. Import the recovery/dispatch module after installing that wrapper. Keep module replacement isolated from the suite. Do not mock process spawning, lock acquisition, authentication, or the timeout implementation. Use a PID-recording fetch executable that sleeps itself, or writes its PID then `exec`s sleep, so killing the tested child has an unambiguous observable result.

## Acceptance criteria

- **A1. Hung fetch.** A real fetch substitute exceeds a short injected deadline and produces `CommandError` with the expected command, cwd, nonzero code and deadline diagnostic. Measure elapsed time with explicit scheduling tolerance, well below the fixture's sleep duration. “Within the deadline” means rejection at expiry plus scheduling/cleanup tolerance, not an impossible zero-overhead cutoff. Confirm the recorded child PID disappears within a bounded wait and only one attempt occurred.
- **A2. Lock release and state.** Exercise recovery through `nextCommand` in the isolated harness with real global, repo and leaf locks. After the timeout, a separate process can acquire the same locks using nonblocking `flock`; the leaf remains in merge and no recovery transition occurred.
- **A3. Successful and failed attempts.** Before-deadline success preserves stdout. An ordinary first failure followed by success warns once and returns the second output. Two ordinary failures throw the second result with command context. A first ordinary failure followed by a sleeping retry times out and kills that child. Calls without a deadline retain success/nonzero-result behavior.
- **A4. Timer cleanup.** A fast command with a long deadline lets a standalone Bun invocation exit promptly. Cover both normal completion and ordinary failure so an uncleared timer cannot keep the process alive.
- **A5. Gates and evidence.** Focused tests, format, typecheck and the full suite pass. Preserve an end-to-end invocation transcript that includes timeout reporting, PID termination, lock reacquisition and unchanged leaf state.

## Ordered implementation checklist

1. **C1 — `src/shell.ts` (D1–D3, A1/A3/A4).** Implement the optional deadline and deterministic timer cleanup. Propagate deadline errors without catching and retrying them. Keep existing structured retry diagnostics and final failure details.
2. **C2 — `src/phase.ts` (D1/D4, A1/A2).** Add `60000` to the existing recovery fetch call. No other production changes.
3. **C3 — `tests/phase.test.ts` or `tests/next.test.ts`, plus a narrowly scoped shell test file/harness if needed (D5, A1–A4).** Reuse existing fixture and fake Herdr patterns. Keep real-process cases isolated and clean fixtures in `finally`. Add only helpers required for these criteria. An outer test timeout must exceed the injected deadline but remain well below the hanging child's sleep duration.
4. **C4 — verification (A5).** Run `bun test tests/phase.test.ts` (or `tests/next.test.ts` if the integration case is there), plus any added shell tests. Run the isolated dispatch harness as a real Bun invocation and save its assertions/output to `verification.txt` in the authoritative leaf directory, outside the code branch. Then run `bun run format`, `bun run typecheck`, and `bun test`. Record exit codes and inspect the final diff for scope and formatting drift.

All work is agent-owned. No dependency on sibling leaves or operator action is needed. Checklist ordering follows the local interface, caller and verification dependency only.

## Open limitation

The locked design kills the directly spawned child with `child.kill()`. It does not specify process-group termination or escalation for a child that ignores the default signal. Do not claim descendant cleanup or universal forced termination. The deadline rejection must still release dispatch locks even if a descendant retains a pipe. Other git operations remain without deadlines and are outside this leaf.
