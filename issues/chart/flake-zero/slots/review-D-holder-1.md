# Slot D holder-relative review, round 1

**Verdict: fix** for `b206210c` on `bdc34423`.

- **F1. A leaf or worker can still accept a relative holder.** The worktree matches return before the check at `src/run-check.ts:209`. In a registered leaf with a green check, `verify --holder relative-holder` ran the check and exited 0. `run-check` uses the same resolver. Move the validation to the start of `leafTarget` and use `resolve(holder)` once the path is known to be absolute.
- **F2. A pass startup error can still reach the caller without a message.** `readRepo` is outside the try at `src/verify.ts:1097`. I changed `issues/config.yaml` to an invalid value immediately before the real systemd launch. The caller printed only `run <id>` and exited 1 because the service left no status. Joiners use the same replay path. Move `readRepo` into the try, default the status to 2, and write it once in `finally`. Keep the stderr write and rethrow so the waiter gets the diagnosis and the service still fails.

Both new tests, the absolute-holder case, the existing real-unit join case, and typecheck passed on the reviewed head. Both probes reproduced with real units and passed with the suggested changes in a disposable worktree. I did not rerun full verify or the guards.
