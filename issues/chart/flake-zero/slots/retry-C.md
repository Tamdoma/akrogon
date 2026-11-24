**Recommendation: O1 (keep ledger-first + underscore fix; accept F1 as bounded and known).**

1. **Why O1 beats O2 and O3:**
   - **O1 vs O2 asymmetry:** O2 (create-then-record) can leak **even under boxed `.service` runs** (`verify` and `bdc34423`) — a kill between `systemd-run` returning and `writeFileSync(core/slices)` kills the service cleanly yet leaves an active slice with no ledger entry. O1 (record-then-create) has **zero leak under boxed `.service` runs**, because systemd's `KillMode=control-group` kills the worker and any pending `systemd-run` launcher together before the next sweep runs. O1 also matches `tests/core-bin/systemd-run:8-12`, which already writes `slices` before `exec systemd-run`.
   - **Why not O3 (`/proc` scan):** Scanning `/proc` for `systemd-run` argv in `sweepAbandoned` (`tests/hc-fixture.ts:46-55`) is brittle and still misses a wrapper process before `exec systemd-run` (which is how D reproduced F1). If closing even unboxed worker-`SIGKILL` is ever required, the clean version of O3 is a lock on `core/slices` (launcher holds `flock -s`, `sweepAbandoned` tries non-blocking `flock -n -x` and skips removing `runtime` while locked) — not `/proc` scanning — but that adds cross-file plumbing for a race that boxed runs already prevent.

2. **Is there an O4 (native systemd option)? No.**
   - Empty `.slice` units stay `active` until explicitly stopped; `CollectMode=inactive-or-failed` applies to the transient `.scope`, not its parent `.slice`.
   - `ConditionPathExists=` is ignored on `.scope` units, and even on a transient `.service` systemd activates the `--slice=` before evaluating unit conditions.
   - `BindsTo=`/`Requisite=` bind only to other systemd units, not a ledger file. The native systemd containment that actually closes F1 is already in place: running the test in a transient `.service` (`src/verify.ts:928`, `bdc34423`).

**Main risk:** an unboxed `bun test` run whose worker is `SIGKILL`ed while its child `systemd-run` survives *and* another worker's `sweepAbandoned` runs in the few milliseconds before `systemd-run` registers can still leave one `akrogon-retry-<session>.slice` active with no runtime ledger behind it.
