# Slot D direct re-check

Verdict `ready`. F5 is resolved and the F2 regression proof still holds.

Base `fdc5acdd4ea42ca49fd5b5e3b8c04829cc6aeea8`. Prior head `91af3f0a67b8780dbcc26f6c0efd7c18d7fa684d`. Reviewed head `63ec3eae5b27f100c9f6a13ca1c803011a0b49c4`.

- **F5 resolved.** The fixture now uses `withLock`. Its `finally` releases the gate even if the test fails early. The helper then closes the lock process's stdin and waits for it to exit. `bun run typecheck` passed, and the `Test-Change` trailer accurately describes the fixture change.
- **F2 remains resolved.** The focused case passed on the reviewed head. It failed in a temporary copy with the old queue filter restored. The land check exited successfully while the leaf check was still held, so the test failed on the missing wait as expected.

## Evidence

- `bun run typecheck` exited 0. Log `direct/check-review-d4-typecheck-1795364298098-3988318.log`.
- `bun test --timeout=30000 --parallel=4 --no-isolate tests/run-permit.test.ts -t 'slice lock stays ahead'` passed on the reviewed head and failed with the old filter. Logs `direct/check-review-d4-f2-green-1795364297726-3988317.log` and `direct/check-review-d4-f2-red-1795364319484-3988319.log`.
- The exact-range `Test-Change` citation guard passed. Log `direct/check-review-d4-citations-1795364326202-4134368.log`.
- Ran the checks through `akrogon run-check --holder <chart>/direct` and read each log with `akrogon log`. `git diff --check` passed. Slot A reports 1,322 passing tests on this head and owns landing verification.
