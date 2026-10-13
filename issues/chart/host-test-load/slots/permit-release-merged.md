# Merged notes: permit-release (A, B, C)

## Agreed
- Release at run-check/base-run process exit (A,B,C). Workload-empty is rejected: the pane scope never empties while the seat lives, and a run's processes are an unlabelled subset of it. Making it work needs per-run units plus a recovery protocol, which reopens seat-scope (A,B,C).
- Permit = exclusive flock(2) taken in the Bun run-check/base-run process itself through bun:ffi on libc, on a close-on-exec fd never passed to children. The kernel frees it on any death, SIGKILL included, so there is no stale-lock code (A,B,C). bun:ffi feasibility is inspected, not proven (B: node_modules/bun-types/ffi.d.ts:453-589).
- Not the existing withLock flock child (src/state.ts:205-224), not flock(1) in printed text, not PID files or leases (A,B,C).
- One helper wraps the spawnLogged call at both sites, src/run-check.ts:173 and src/base-run.ts:164 (B,C). check_start moves inside the permit so run duration excludes queue time. base-run worktree setup and removal stay outside (C).
- Leftovers: no per-run tracking. They stay in the pane box and are ended by the leaf stop (A,B,C). Accepted residual: a killed runner frees the permit while its browsers may live (A,B,C). Measurement 2's clean pass left none (A,C).
- Proof: a run leaving a setsid sleeper, then a second run acquires at once. Plus two worktrees serialize, holder SIGKILL releases, nested runs do not deadlock (B,C).
- Wait behavior, fairness and cancellation go to queue-order (B,C).

## Disagreements
1. Nested detection. A: an inherited env marker from constructedEnv. B: carried context plus verification of the live owner's PID, start time and boot id, and an env flag alone is not enough because sibling workers in one pane could bypass. C: sidecar holder record (pid, start time, boot id, like .owner at src/run-check.ts:150-161) and an ancestry walk in /proc, no env marker.
2. Lock path. A,C: under akrogon home (src/config.ts:195-206), a second AKROGON_HOME doubles permits, same as other state. B: per-UID `/run/user/<uid>/akrogon-runs.lock`, independent of install.
3. Count. B: strictly one, no semaphore. C: slot-file loop with a global config count key, starting at 1.
4. Process-group kill at run exit. A: optional, near-zero code, catches ordinary leftovers. B,C: not proposed.

## New questions
- QR1 Suites that deliberately leave a server running across separate run-check calls (C).
- QR2 Trace for a SIGKILLed holder, since check_end never fires (C).
- QR3 run-check --holder outside a boxed pane shares admission but the leaf stop cannot reach its leftovers (B).
