# Slot B final-shape check

**F13. The proposed wrapper-to-child lock handoff has an unlocked startup interval.** `src/flock.ts` `flockHold` puts the wrapper's lock in a separate helper that exits after wrapper death. `src/run-check.ts` `spawnLogged` spawns the execution chain independently, and `checkedRun` launches nested execution without its own run guard. Adding `flock -s <capture-out>` to that chain does not make it inherit the helper's already-held lock.

Concrete schedule: the nested wrapper holds the capture lock and spawns its child; that child is paused before acquiring its own capture lock; the wrapper dies; its helper exits. An exclusive probe now succeeds even though the spawned chain can resume, acquire the lock and execute the test. The gate can therefore declare abandonment and permit cleanup before that test starts mutating resources.

Reproduced on 2026-10-28 with an anonymous in-memory lock file, the helper lifetime used by `flockHold`, and an execution chain paused before its independent flock acquisition. After killing only the owned wrapper, the exclusive probe succeeded. Resuming the chain then printed `execution_started`. No repository files were changed for the reproduction.

Require inheritance of an already-held capture lock into the spawned execution, or an equivalent startup protocol that prevents execution after abandoned classification. The final shape's inherited-fd measurement does not prove the separately acquired helper/chain arrangement it prescribes.
