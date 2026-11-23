# Slot D review of flake-zero, round 4

**Verdict `ready`** for `a840bf96` on `1001cf8b`.

- **F8 closed.** The new missing-capture test passed and confirmed the file stayed absent. Swapping in the former pathname-based helper made the test fail because its promise resolved. Removing the output capture after the real cgroup drained now fails the killed-pair test with `ENOENT` at the read-only open.
- **F4 still passes.** I parked the real out-of-scope lock holder for 15 seconds and confirmed the lock was busy after the cgroup drained. The new descriptor probe waited for release, then the refusal and clear-marker assertions passed.

All 28 run-unit tests, typecheck, and `git diff --check` passed. The supplied `r6-verify.log` reports 1,389 passes and zero failures. In `r5-verify.log`, the named failure and repeated teardown errors came from the shared-root abandoned-core sweep fixture covered by session-flake-2 F12.
