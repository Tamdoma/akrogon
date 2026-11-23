# Slot D review of lane-first, round 4

**Verdict `fix`**

Base `814a2387`  
Head `073b9db73d22d9be3ea97387938572c3de52c23d`

## Finding

- **F10 · `src/stop.ts:87–99`, `src/admission.ts:136–149`.** Stopping a land leaf releases the repo line while its verify pass is still active. The first slice stop kills the land service that owns the admission record (`src/land.ts:28–45, :184–197`). Admission drops the record when that PID exits. The detached verify pass is then stopped by a separate command (`src/verify.ts:925–949`, `src/stop.ts:99`). I reproduced this with two private real systemd services and records matching the land and pass launch paths. I delayed the pass stop, confirmed the land service was down, and watched a queued ordinary check from the same repo run to completion while the verify service was still active. The new fixture at `tests/green-merge.test.ts:794` gives the holder the test process's PID, which survives the fake slice stop. Keep the repo line held through teardown of the detached pass and checks, including when a stop must be retried. Exercise the holder's exit in the regression.

## Re-check

- **F7 closed for the original full-check probe.** During the delayed stop, the holder stayed live with `cancel: true`. The queued full check remained waiting across two admission polls and started after the holder stopped.
- **F8 closed.** I refused the first scope and guard stops with `Access denied`. The CLI returned nonzero, and an unmodified retry found and stopped the still-active scope.
- **F9 closed.** I held the line lock after guard registration. The readiness wait stayed pending until the lock was released and the scope became active. Same-caller `stop-run` then returned zero. The checked-in caller-scope test passed too.

All 120 focused tests passed across `install`, `green-merge`, `pause-next`, `run-units`, `command-reference` and `rollback` with `--timeout=120000 --max-concurrency=5`. The three real-systemd probes used private units and disposable worktrees. Typecheck and `git diff --check` passed.
