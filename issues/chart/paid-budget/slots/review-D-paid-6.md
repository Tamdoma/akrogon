# Slot D review of paid-budget, round 6

**Verdict `fix`** for `49b32bcf` on `814a2387`.

## Re-check

**F7 is closed under the updated rule.** In a private Herdr session, I ended the fake watcher and made the real `hc send` return 11 about 1.3 s before the cutoff. The shim delivered the error about 2.7 s after the cutoff. The test reported a deadline stop at `watcher idle`, as the result was pending when the timer fired. Both checked-in controls passed locally. An immediate send failure and a failure observed before the cutoff whose diagnostics crossed it each kept the original assertion.

## Findings

- **F8 · `tests/e2e/watch-consults.e2e.ts:201–205, 252–279, 445–450`**. The watchdog misses a watcher whose launch reply is still pending. I let the real `hc run` start a fake watcher and buffered its successful reply for four seconds under a 2.4 s budget. The watcher kept writing heartbeats until 1.85 s past the cutoff. The first kill was 1.90 s late, during teardown. The timer had reported a deadline stop at `leaf staged`, with `watcherAddress` still null. Give the watchdog a launch identity it can use while the reply is pending, and cancel or stop a launch that crosses the cutoff before waiting for the abandoned body.
- **F9 · `tests/e2e/watch-consults.e2e.ts:203–205, 435–462`**. A stop of an already-removed watcher can overwrite the deadline winner. I removed the fake watcher in the real core and held the send result past the cutoff. The watchdog's `hc kill` returned 3 (`not_found`). Teardown left no fixture state, but the final assertion replaced the deadline message with `Expected: 0, Received: 3`. Confirm absence after a missing-terminal response and preserve the deadline outcome when teardown succeeds.

## Verification

Typecheck, `git diff --check 18372c50..49b32bcf` and all 175 focused tests passed. The supplied logs record six deadline cases and 1,358 full Verify tests passing. The direct probes used fake harnesses and private Herdr sessions.
