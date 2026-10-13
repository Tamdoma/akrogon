Misquote, Disagreement 3 (B): “strictly one” turns an unresolved requirement into my position. `permit-release-B.md` Q5 explicitly asks whether the first implementation must support a configurable count greater than one.

Agreed line rejected: “Leftovers … stay in the pane box and are ended by the leaf stop” needs a dispatched-seat qualifier. Standalone `run-check --holder` is accepted without creating a pane scope (`src/run-check.ts:136-173`), so that cleanup promise does not cover every admitted caller.

D1: Accept C's holder record plus verified process ancestry, without an env marker. Verify the live owner's PID, kernel start time and boot ID. The existing `.owner` stores a wall-clock timestamp (`src/run-check.ts:150-157`), which cannot substitute for `/proc` process identity. Shared pane membership must never authorize reuse.

D2: Keep one per-UID `/run/user/<uid>/akrogon-runs.lock`. `globalHome()` varies with AKROGON_HOME or the installation root (`src/config.ts:195-198`), so putting admission there creates independent pools and breaks the taken host-wide boundary.

D3: Use one exclusive flock for the settled initial capacity of 1 (`forks/limit-boundary.md`, final Taken). Require slot files only if configurable capacity above 1 is part of the initial contract. Do not add a semaphore solely for a possible future requirement.

D4: Reject routine process-group killing in this contract. `spawnFiles` creates no separate process group (`src/shell.ts:24-46`), so safe group cleanup requires an additional launch/lifetime mechanism and still misses setsid descendants. Keep the accepted process-exit release and dispatched-leaf stop behavior.
