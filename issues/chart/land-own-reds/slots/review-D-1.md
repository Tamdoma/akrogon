# Slot D review

Verdict `fix`

Base `9c6ae0db739efcde19edff0d1b173da0ab7b234d`  
Head `6570679be305bd07de34a9a7ab99f286a18c622c`

- **F1 · `src/verify.ts:259`.** The linked-base gate compares the rerun log's names and can accept an uncovered red. In a fresh `verify --holder --known-red`, the head's first command failed `alpha`, its rerun failed with only `beta` in the log, and the base failed `beta`. The writer correctly kept `alpha` as the head's final failure under the Correction. Both the CLI and `requireGreenReceipt(..., 'merge')` accepted it because they compared `beta` with `beta`. This can also reject a properly covered result when the rerun log is nameless and the retained first-run names are covered.
- **F4 · `docs/reference/config.md:75` at `73a26624`.** The separately deployable schema release promises an active rerun. In that release a configured rerun of `exit 0` was accepted, but a fresh merge verify still exited `1` on the first red. Operators following the deployed docs can enable the key and still send an otherwise recoverable land to repair. The schema release parses old and new receipt rows as intended.
- **F5 · `src/scope.ts:10`, `src/reconcile.ts:1309`.** With `AKROGON_HOME` unset, two invocations launched under different `HOME` values both take the default-name branch because Bun's `homedir()` follows `HOME`. The same repo key and leaf slug therefore still share a slice. I reproduced two different home paths deriving the same slice, then ran `reconcileHost` with one home's finished leaf and the other home's loaded unit in the fake manager. It issued `systemctl --user stop` on that unit. A finished leaf in one home can still kill a seat in the other.
- **F6 · `tests/store-sweep-safety.test.ts:46` and `:119`.** Two existing assertions still require Q4 to delete unknown entries at the host temp root. The first expects a dangling root-level symlink to disappear. The second expects the unregistered temp parent to disappear after its owner dies. Q4 keeps both by design. Both tests failed again in a targeted rerun, so they block the configured suite. Their assertions for the owned stores, retired root, verify checkout and batch need to stay covered.
- **F7 · `src/flaky.ts:154` and `:170`.** One successful rerun can count twice. I ran two verifies on the same tree with the same check: `alpha` failed both original runs, the first rerun stayed red, and the second rerun passed. `akrogon flaky` printed count `2` for `alpha` even though there was one red-to-green transition. The in-row save and the ordinary same-tree pair both count the second rerun's one recovery, inflating the intake figure.

## Other checks

- **F2.** The host's skipped-slice report was removed as designed. The selected repo's `discover` still reports unreadable records and foreign keys at `src/next.ts:108`. Foreign and unreadable leaves are excluded from the stop map. The read-only `akrogon-l*.slice` listing still exists at `src/reconcile.ts:154` for the pane check and repo/host reconciliation. No host-wide failed-run reset remains. `src/AREA.md:23` still describes the removed stop and reset behavior.
- **F3.** The second timing pair has its own run ID and records actual work. Reusing the name retains the configured admission policy. A `full` rerun for the actual land attempt keeps that attempt's priority over other waiters. This follows the same checked-run path in the design.
- **Q2–Q4.** The writer runs the repo's rerun once and supplies at most three original names through `AKROGON_RERUN_NAMES`. Leaf and linked base passes skip it. The writer's final failure list follows the Correction. `slowEligible` excludes rerun rows, and `resolvedOnMain` preserves a main red named by the first run. The host keeps unknown worktree-store and leaf-temp entries, with the specified dead-PID tmp exception. An isolated land launch emitted both temp-root override arguments.

## Verification

- Ran `bun test --timeout=45000 --max-concurrency=4` on all 18 touched test files. 312 passed and the two assertions in F6 failed. Both reproduced in isolation.
- In temporary copies, all 13 feature assertions or cases failed with their corresponding source restored to the preceding commit and passed on the reviewed head. This covered the slice isolation and reset changes, schema, rerun writer, slow and main-red readers, flaky save output, temp preservation and land launch. The assertion removals and fixture adaptations match the `Test-Change` trailers.
- Ran the schema-only release independently. It accepted the config key, parsed one old receipt and one writer-format receipt in the same ledger, and did not execute the configured rerun.
