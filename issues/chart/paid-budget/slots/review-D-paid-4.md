# Slot D review of paid-budget, round 4

**Verdict `fix`**

Base `814a2387`  
Head `cef7f77eb7d58bb35da5cbd43c0562d580bc3cd4`

## Finding

- **F6 · `tests/e2e/watch-consults.e2e.ts:64–66, :275–293, :435–442`.** A watcher send that is pending at the cutoff can still report a deadline stop as a red. The pre-send check passes, then the send helper asserts its exit code without recognizing a watchdog kill. I gated only `hc send` in the idle fake-watcher probe. The subprocess started about 7.2 seconds before the deadline. The watchdog's real kill returned zero, and the real send then returned 11. The test reported `expect(sent.code).toBe(0)` after that kill. Treat a send interrupted by the watchdog as a minute stop at `watcher idle` and preserve independent send failures.

## Re-check

- **F5 closed for the delayed readiness screen.** The original 7.5-second probe sent the task with exit zero, never hit the delayed `read --lines 80` shim, and reported the deadline at `watcher idle`.
- **F4 still closed.** In a short consultant health-wait replay, `no consultant started` survived a catch-block screen read that crossed the deadline.
- **Deadline regressions.** The new one-minute idle-watcher case and the nonresponsive-watcher case both passed. The supplied logs also show all three deadline tests passing together.

All 175 focused tests passed across `run-check`, `config`, `state-home`, `command-reference` and `verify`. Typecheck and `git diff --check` passed. The deadline probes used fake harnesses and private Herdr sessions. The supplied full Verify run reported base flakes. I did not rerun full Verify.
