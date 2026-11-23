# Slot D review of lane-first, round 5

**Verdict `fix`**

Base `814a2387`  
Head `714e851573d8619919d4d279d5224f7d9d5fa28b`

## Finding

- **F11 · `src/stop.ts:91–112`, `src/admission.ts:170–197, :223–230`.** A stop can freeze the land process while it holds the same repo line lock that stop needs to cancel its record. Admission publishes `state: live` inside the lock. If stop reads the record before the lock is released, it sends SIGSTOP, then blocks in `cancelRun` before it can stop the leaf slice. I reproduced this with the actual land and stop commands and a private systemd service. A test-only gate held land just after the live write. I opened it after SIGSTOP, but the land process stayed suspended, the line lock stayed held, and stop only finished after I killed the fixture service. Coordinate freezing with admission so the holder is classified and any needed lock is acquired before the signal can suspend its owner.

## Re-check

- **F10 closed in the original teardown scenario.** With real private services and fixture records, I delayed the verify-pass stop and confirmed the land PID was suspended and the queued same-repo check stayed waiting. I refused the first pass stop and got a nonzero result. An ordinary retry kept the line held until the pass and land units stopped, then the check finished.
- **Failed stop without retry.** The probe confirmed the suspended land and blocked waiter persisted after the CLI returned. Without a retry or external intervention the process can hold the line indefinitely, even if the pass later exits. Preserving the hold after a refused stop is defensible on its own. The supported recovery is repeating `stop`, and the failure diagnostic should say that the land was left suspended and give the retry command. F11 is separate because reaching the retry path may itself require killing the holder.
- **Import cycle.** `stop → land → next → stop` uses the imported functions after module initialization. The stop and land paths loaded in the probes, and the focused suite passed. I found no runtime failure from the cycle.

All 121 focused tests passed across `install`, `green-merge`, `pause-next`, `run-units`, `command-reference` and `rollback` with `--timeout=120000 --max-concurrency=5`. Both probes used disposable worktrees and private systemd units. Typecheck and `git diff --check` passed.
