# Slot D review of paid-budget, round 11

**Verdict `fix`** for `aefec9d6` on `079d4447`.

- **F21 · `tests/e2e/watch-consults.e2e.ts:121–128`.** Publishing merges the private report into the previous one. I reused the same output directory after a failed send. The second run correctly reported a deadline stop at `watcher idle` and counted one session, but its published `red.txt` still said `Received: 11` from the first run. Replace the prior report as a set so the published evidence matches the current outcome.
- **F22 · `tests/e2e/watch-consults.e2e.ts:137–175`.** Startup failures after the claim can strand the runtime. With a searchable but unwritable leaf temp directory, the judge claimed the runtime and then failed at `mkdtempSync` with `EACCES`. After restoring permissions, a retry refused the runtime left by the first judge. Protect the successful claim immediately, including paths where no launcher exists yet.
- **F23 · `tests/e2e/watch-consults.e2e.ts:120–129`.** The absence check can report a successor's resources as leftovers. I paused the first judge just after it removed its runtime and state, then let a second judge claim the same session and start its watcher. The first appended a teardown failure and listed the second runtime in its report. Keep exclusive ownership through the absence check, or verify absence by invocation identity.

The original F18–F20 replays passed. The failed seat, successful seat and direct launch were accounted for separately, for four sessions including the watcher. The refused concurrent judge left the first run's state and evidence intact. The deadline cleaned a runtime even when the body had written nothing. The accepted double count when a seat dies before reporting its address remains as specified.

Typecheck, `git diff --check`, and 117 focused tests passed. Five targeted deadline replays used shorter budgets in private sessions with stand-ins. The supplied logs report 11 deadline cases, 1,403 suite tests, and 485 repeat tests passing.
