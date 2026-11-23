# Slot D review of lane-first, round 12

**Verdict `fix`** for `1eaed62f` on `1001cf8b`.

- **F23 · `src/admission.ts:95–103,307–314`.** The sweep can miss a scope that starts as its guard exits. I held the launch client until the real guard's stop of the unloaded scope returned. The manager refused the sweep's manual stop of that guard. At the sweep's final liveness check, I paused after it read the scope as absent, released the pending launch, then let the guard exit. The second read found the empty guard, so the sweep deleted the record and admitted a same-repo full check. That check read `populated 1` from the old scope's real cgroup. In the same interleaving, a guard-first read retained the record and the next sweep drained the old scope before admission.
- **F24 · `src/scope.ts:26–33,113–119`, `src/stop.ts:68`.** With a cut bus and `XDG_RUNTIME_DIR=""`, the real leaf-slice stop still failed to connect and left its service running. Retrying with the variable unset stopped the same slice. The helper computes the fallback bus for a blank path but still passes the blank runtime variable to systemctl. Remove the blank value from the child environment or supply the runtime directory used for the fallback.

## Re-check

- **F20 closed.** A real `-.slice` run's cgroup was directly under the user manager. The helper reported it populated after the wrapper died.
- **F21's original unset-variable probe passes.** The pinned bus stopped a populated leaf slice. The refused-slice regression kept the error loud and verified that the lock was free for retry.
- **F22's original delayed-launch probe passes.** A dead wrapper's populated guard held the queue through a stop refusal. Once the guard stopped, the queued check ran, and releasing the old launch client ran no payload. F23 covers the handoff while the guard can still authorize that launch.
- **The delivery test's wait is correct.** With the wrapper killed and its real guard frozen, the cgroup stayed populated, `liveRecords` still saw the hold, and a real wake left attempts and prompts unchanged. After thaw and drain, the original assertions saw one counted attempt and one redelivery. The wait is bounded, so a guard that keeps running fails the test.

Typecheck, `git diff --check`, and 175 focused tests across eight files passed. The supplied Verify log `direct/check-test-1795451776146-3205687.log` reports 1,411 passes and zero failures. The replay probes used disposable worktrees and private units.
