# A notes: release-shape (written before reading B and C notes)
Q1 pick: state stays in the workspace root, release finds it through one fixed pointer. Reason: config.yaml, held.yaml, admission.lock, runs/last-start are tracked in git today; moving them changes what is committed and needs a migration on a live host. Cost: release code needs the pointer; tests already set AKROGON_HOME (tests/helpers.ts:88).
Reject ~/.akrogon move: migration of live locks while leaves run, tracked files leave git.
Q2 pick: keep previous release for rollback; delete older once no process runs inside (reconcile already detects processes inside scratch copies). Reject fixed N: deletes a release a live leaf still runs from, or keeps junk.
Q3 pick: current stays on old release, failure printed, retried next trigger (same as today's self-update failure line). Reject stop dispatch: one bad install halts all work.
Pitfall: deploy must not depend on moving the workspace checkout (src/self-update.ts:246); records sync stays separate.
