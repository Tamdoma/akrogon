# Slot D direct re-check

Verdict `fix`. F2 is resolved. The new test breaks the configured typecheck.

Base `fdc5acdd4ea42ca49fd5b5e3b8c04829cc6aeea8`. Prior head `66e98364c0d655eebe303beeebb80e758aa1eb34`. Reviewed head `91af3f0a67b8780dbcc26f6c0efd7c18d7fa684d`.

- **F2 resolved.** The committed case starts a listed leaf check while land waits for its slice lock, then checks that land's listed check waits for the leaf. It passed on the reviewed head. Restoring the old queue filter in a temporary copy made it fail because the land check completed while the leaf check was still held. The `Test-Change` trailer cites the actual regression and matches the diff.
- **F5 open.** The new test at `tests/run-permit.test.ts:917` assigns a subprocess with ignored stdout and stderr to `Proc`, which requires pipes. The configured `bun run typecheck` exits 2 with TS2322, blocking direct landing. Fix the lock fixture and rerun typecheck and the focused red/green proof. The fixture's lock subprocess also sits outside `stop(caps)`, so an early failure before line 930 leaves its shell polling a deleted fixture path until worker cleanup. A lock scoped with the existing `withLock` helper would address both issues.

## Evidence

- `bun test --timeout=30000 --parallel=4 --no-isolate tests/run-permit.test.ts -t 'slice lock stays ahead'` passed on the reviewed head. Log `direct/check-review-d3-f2-green-1795363926755-3396229.log`.
- The same command failed in a temporary copy with `entry.full && held(entry) === undefined` restored. The output shows the land's check exited 0 and the expected wait never appeared. Log `direct/check-review-d3-f2-red-1795363946044-3396245.log`.
- `bun run typecheck` exited 2. Log `direct/check-review-d3-typecheck-1795363927853-3396230.log`.
- All three ran through `akrogon run-check --holder <chart>/direct`. Read the logs back with `akrogon log`. `git diff --check` passed.
