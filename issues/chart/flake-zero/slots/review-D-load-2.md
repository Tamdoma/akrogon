# Slot D load-flakes review

Verdict **fix** for `bf2c141b` on `34742d42`.

- **F7 · fails in normal use.** The SIGKILLed land-check test treats `worker.pid` as a signal at startup, then reads it during cleanup while the writer can still be alive. If `echo $$` has opened the file and hasn't written, `Number('')` becomes 0. Cleanup would send SIGKILL to the test's process group. I held the writer after creating the file and intercepted the signal. Cleanup selected PID 0. Publishing by rename, reading and validating the PID before killing the wrapper, and reusing that PID in cleanup passed with a four-second hold before publication. See `tests/green-merge.test.ts:1068,1087–1092,1108–1111`.
- **F8 · fails in normal use.** The hung-pass listener test reads its PID marker after the first pass is killed and the retry finishes. Its 500 ms deadline can kill the writer between create and write, leaving the marker empty even after exit. Holding that gap reproduced a `TypeError` when the reader opened `/proc/stat` instead of the worker's stat file. The test needs the PID published before its deadline can fire. See `tests/hc-listener.test.ts:247–251,261,264–274`.

F3–F6 are closed. Both shell deadline cases passed the 500 ms empty-file replay. The two RAM scratch cases, the leaf-slice sleeper, and the watcher transcript flip passed with publication delayed. The reconcile marker and the door-reset session record passed the same replay. The range-diff shows that only the shell's empty-row filter changed in the first three commits. The reconcile stderr diagnostics and marker publication changes carried over.

The leaf-slice exit-code markers are read after the awaited `systemd-run --scope` command exits. The sync test uses its markers as existence signals. The abandoned-capture test waits for a separate ready signal written after the PID. The door-exchange test waits for the shell to exec `cat` after writing the inbox. See `tests/leaf-slices.test.ts:552–558,591–597`, `tests/sync.test.ts:267–304`, `tests/abandoned-capture.test.ts:70–76,189–195`, and `tests/door-exchange.test.ts:54,198–201`.

The unmodified checkout passed 131 tests across the six changed test files, plus the two F7/F8 cases without injected delays. All eight delayed replays of the changed cases passed. Typecheck and diff check passed. I relied on the supplied results for the full verify and stress runs.
