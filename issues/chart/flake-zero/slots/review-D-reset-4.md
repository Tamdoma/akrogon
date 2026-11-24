# Slot D reset-flake review, round 4

Verdict **fix** for `354c8c80` on `92321c1e`.

- **F9. The suspended-read test sends SIGKILL to a stale PID even when it passes.** After the child reports `alive: false`, the parent's `finally` invokes `kill -KILL` using the saved PID. I intercepted the external command on a passing run and confirmed that it received a PID already absent from `/proc`. If the PID is reused before cleanup, that command can kill the new process. Skip the fallback after confirmed exit and target only the test's lookup if failure cleanup is needed. See `tests/hc-identity.test.ts:557–579`.

**F7 is closed in the product.** The suspended lookup was reaped both when idle arrived and when the wait deadline won. I also shortened the CLI timeout in a disposable checkout and confirmed that a direct `terminal()` call without a cancellation signal reaped its suspended client and returned `signal SIGKILL`. The kill signal is specific to terminal lookups.

**F8 is closed.** The test throws on the fresh reply's turn 4242. Reverting only the fresh-read catch made it fail with both ordinary scheduling and delayed snapshot processing. The shipped test passed.

All 50 focused tests, typecheck, and diff check passed. I relied on the supplied full verify, stress, and guard results.
