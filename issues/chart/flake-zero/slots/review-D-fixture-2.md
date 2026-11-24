# Slot D fixture-zombie review, round 2

Verdict **fix** for `372e9b92` on `abdb3cee`.

- **F2. Discovery can still miss a daemon when its selected thread exits.** `processFile()` selects one live thread and reads its file. If that thread exits between selection and read, discovery treats the missing file as absence even while a second thread lives. In a private abandoned-runtime replay, I let a zombie leader's first worker exit after selection. I forced that ordering separately for `cmdline` and `environ`. In both cases the sweep returned and deleted the runtime while the socket-serving thread remained live. Try the remaining live threads when a fallback read returns empty or disappears. See `tests/hc-fixture.ts:103–123,135–161`.

The original F1 replay now preserves the runtime. With the leader already a zombie and the selected worker held live, the sweep recognized the daemon and timed out without deleting state.

All 41 focused tests, typecheck, and diff check passed. The thread-exit replays used a native stand-in in a disposable checkout. I relied on the supplied full verify and guard results.
