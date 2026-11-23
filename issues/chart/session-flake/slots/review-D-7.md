# Slot D review of session-flake follow-up, round 7

**Verdict `fix`** for `647c246c`, rebased as `b5c4565e` on `0349c523`.

- **F14 · `tests/hc-fixture.ts:104–115`.** A workload can still be mistaken for an hc daemon after clearing its terminal variables. I replayed the detached `python3 serve` case with `HC_TERMINAL_ID`, `HC_TERMINAL_SOCKET`, and `HC_SCOPE` removed and `HC_SESSION` preserved. The production helper in `src/hc.ts:85–88` uses that same environment pattern. The real daemon exited, but teardown listed the workload as a daemon and kept the runtime. A local control required `HC_RUNTIME=1`, which the real daemon carried and both workloads lacked. It passed both workload probes and all six fixture retry tests, including renamed-daemon discovery.
- **F15 · `tests/hc-fixture-retry.test.ts:232–238`.** The regression test can stop the core before `cat serve` actually starts. The parent publishes the background PID immediately. With the old matcher, the test failed when `cat` was already running, but passed when I gated the child between `setsid` and `exec cat serve`. Wait for the PID's command line to show the intended `serve` workload before calling `core.stop`.

The original F13 workload with its inherited terminal variables passed the replay. The rebased head matched the local merge tree. Typecheck, `git diff --check`, and 90 focused tests across seven files passed. The supplied Verify log `direct/check-test-1795452857109-4114056.log` shows 1,391 suite passes and another 30 passes from repeating the changed test file.
