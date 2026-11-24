# Slot D flock-orphans review, round 2

**Verdict: ready** for `768ae7e5` on `e9158fe0`.

- **F1 closed.** Both blocking helpers exit when fixture cleanup removes the directory, even if the payload misses the release file. I held the first durable payload and both nested payloads until cleanup. All nine replays passed, and no gated `flock` or shell remained after Bun exited and before the enclosing service stopped.
- **N1 closed.** Cleanup no longer reads `pid-inner`. When either inner payload exited before publishing readiness, the test reported its original readiness timeout.

The round-two diff is confined to the two capture tests, and the commit message and trailers match the code. The probes ran in a disposable worktree. Full verify was in progress when the review was requested.
