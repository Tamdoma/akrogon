# Slot D review of lane-first, round 7

**Verdict `fix`**

Base `814a2387`  
Head `1b1e4b25e594ff0f03094aa3bd60bb5d37ceeba4`

## Finding

- **F14 · `src/stop.ts:90–98`, `src/admission.ts:89–113, :327–334`, `src/verify.ts:761–768`.** Stopping the verify pass can still release the repo line while its detached check is running. The pass invokes `checkedRun` directly, so a check record's PID is the verify-pass PID. Once the slice stop kills land and the next stop kills the pass, all three liveness checks fail even while the check's scope is draining. The guard can also remove the check record before the scope stop completes (`src/scope.ts:99–101`). I ran the actual land service, verify pass and check with real systemd and an unmodified `akrogon stop`. The check ignored TERM and continued writing heartbeats after the queued same-repo check started. The test at `tests/green-merge.test.ts:853–876` assigns the pass and check records different PIDs, so killing its pass leaves the check record live. Keep the hold until the detached scope has drained. Exercise the shared pass PID and the surviving scope in the regression.

## Re-check

- **F10 passes while the verify pass stays alive.** I delayed and then refused the pass stop after the land PID died. The queued check stayed in line. Retrying stopped the pass before the waiter started. F14 covers the gap after that pass exits.
- **F12 closed.** A refused slice stop left the land PID running and its admission record unmarked. It released the global lock after the gated claim resumed, and the normal retry succeeded.
- **F13 closed.** I let the land service exit and unload after `stop` began. That same stop finished and ended the other service in the leaf slice.

All 147 focused tests passed across `install`, `green-merge`, `pause-next`, `run-units`, `run-permit`, `command-reference` and `rollback` with `--timeout=120000 --max-concurrency=5`. Typecheck and `git diff --check` passed. The probes used private units and disposable worktrees.
