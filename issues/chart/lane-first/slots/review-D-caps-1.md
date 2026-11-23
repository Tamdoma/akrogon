# Slot D review, one test cap

Verdict `fix`

Base `0383d6008b79a38dfebed59d671ab09dbd22b205`  
Head `46b55bb268db271b5db0e1518534fae9dbd08fbd`

- **F1 · `tests/budget.test.ts:45` and `:435`.** The test timeout does not cancel the marker wait or enter the test's `finally` blocks. I suppressed only the budget-lock shim's marker while it still called the real `flock`, then ran the test in a shared Bun worker (`--parallel=1 --no-isolate`). After the head timed out at 30 seconds, `afterEach` observed both the lock holder and the waiting CLI still asleep and counted six further polls in 120 ms. On base, the wait rejected, both children were gone, and polling stopped before `afterEach`. The head leaves a lock, subprocesses and an active poll past the test boundary while the worker can run other tests.
- **F2 · `tests/notices.test.ts:21` and `:31`.** A missed final rename notification leaves the file watcher registered and skips the temp-dir teardown. I withheld the final notice event in the callback while the actual write still succeeded. Head hit the 30-second timeout with the watched directory still present in `afterEach` and no watcher close. Base rejected the wait and removed the directory before `afterEach`. This also affects removed watcher cleanup timers in helpers such as `tests/door-reset.test.ts:65`.

## Verification

- `bun test --timeout=30000 --max-concurrency=5` on the 30 changed test files ran 722 tests. 721 passed. The sole failure was `tests/watch-timer.test.ts:1056`, which received due `5` where it expects at least `6`. The exact same assertion failed on both base and head in a targeted rerun, so it is outside this diff's findings.
- The 138 removed per-test overrides were all below 30 seconds. Checked the removed explicit caps against their call sites and found no removed product timeout input or negative-check observation window. `git diff --check` passed.
