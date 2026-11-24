# Slot D holder-relative review, round 2

**Verdict: ready** for `d9b30c67` on `3916c3a2`.

- **F1 closed.** The absolute-path check runs before the leaf and worker returns. From a registered leaf, both `verify` and `run-check` rejected a relative holder by name before launching. Absolute holders still published logs in the focused tests.
- **F2 closed.** The service reads the config inside the try, tees the error, and writes status once in `finally`. With a fresh tree and a config made invalid immediately before systemd launch, the caller printed the config error and returned 2. The existing real-unit join test also passed.

The range-diff shows only the F1 and F2 changes. Seven focused tests passed, including both replay probes in a disposable worktree. Full verify was queued when the review was requested. I did not rerun it.
