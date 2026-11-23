# Slot D review of flake-zero, round 2

**Verdict `fix`** for `87f4419e` on `9f2cfc05`.

## Findings

- **F4 remains open after scope drain · `tests/run-units.test.ts:707–715`**. Freezing the guard makes the live-holder assertion deterministic. The refusal assertion still races a capture FD held outside the scope. I suspended the check's outer `flock` process after verifying that its stdout was the capture file and its cgroup was outside the run scope. The wrapper died, the guard thawed and the scope's cgroup disappeared. The phase probe still exited 0, so the test failed at the refusal assertion. Wait for the capture lock to be released before asserting the abandoned-pair refusal.
- **F6 · `src/stop-run.ts:44`, `src/scope.ts:109–113`**. The new per-unit stop reports success when real active units refuse it. I injected access-denied responses for the scope and guard of a private run. Both stop calls ran and the scope stayed active, but `akrogon stop-run` exited 0. Preserve stop failures unless a state query confirms the unit is absent or inactive.
- **F7 · `src/stop-run.ts:37–44`, `src/run-check.ts:436–450`, `src/scope.ts:49–52`**. The known early-stop window can launch an unguarded scope after a successful stop. I held a real run between guard startup and scope launch. `stop-run` returned 0 and stopped the guard. Releasing the gate started the payload, and SIGKILL of its wrapper left the scope active. Coordinate the stop with scope startup so a successful stop prevents the pending launch. The seeded guard-only test exercises stopping the guard without a real pending scope.

## Re-check

- **F1 and F2 pass.** I ran the exact `direct/test-line.txt` through the host's `sh`. A whitespace filename and nested test ran once in the suite and five more times in repeat. An unrelated test ran once, an empty diff skipped repeat, an invalid base exited 128, a red suite skipped repeat and a failing repeat stayed red. The current file streams its NUL list directly to xargs, so there is no temporary list to clean up.
- **F3 passes.** Delaying backdate by 6.5 s left the pass open until the locked rewrite released it.
- **F4's pre-drain and caller-death cases pass.** I delayed the observer by 6.5 s while the guard was frozen and separately delayed the caller's kill by 6.5 s while its check held on the release file. Both passed.
- **F5 passes.** With the pin-death timer's first poll delayed four seconds, the test waited for the accepted-watcher line and verified the actual pin death.

All 268 tests across the four changed test files passed. Typecheck and `git diff --check 9f2cfc05..87f4419e` passed. The supplied full Verify passed 1,382 tests. The post-landing parallel suite trials are still pending.
