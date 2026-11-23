# Slot D review of lane-first, round 14

**Verdict `fix`** for `b6f7d1ef` on `dd61e865`.

- **F25 remains open for the run-check scope launcher · `src/run-check.ts:436–448`, `src/scope.ts:46–70`.** A repo that forwards `XDG_RUNTIME_DIR` still passes its empty value to the outer `systemd-run --user --scope`. The guard started, but the real scope launch returned a bus connection error before the payload ran. The default configuration worked with the same caller environment. In a disposable worktree I normalized the launcher's runtime, then restored the payload's original runtime value or omission inside the scope. Both cases ran, and the payload kept its cut bus.
- **F26 · `tests/hc-delivery.test.ts:244,261–271`.** The delivery test waits for the live record before killing its writer. The guard's launch can still be pending. I held the real guard client before registration and forced it to be reparented before `killTree` enumerated descendants. The unchanged `liveRecords` loop returned empty. I released the client before the final `next`, and its guard made the old record live again. `next` left attempts at A=0, reproducing the logged assertion failure. Once the guard drained, a subsequent wake counted and redelivered once. Wait for the held check's real scope to start before killing it, then wait for its writer and units to drain.

The rest of F25 passed real-unit replays. Both `stop-run` branches ended their targets, verify and land launched with the normalized runtime in their service environments, `landAlive` and listener status reported active units, and reconcile stopped the finished leaf's slice. The new stop-run regression failed with the former inline environment restored.

Typecheck, `git diff --check`, and 179 focused tests across eight files passed. The supplied Verify log `direct/check-test-1795454706409-1097203.log` reports 1,415 suite passes and 825 repeat passes. The injected probes used disposable worktrees and private units.
