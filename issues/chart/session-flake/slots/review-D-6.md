# Slot D review of session-flake follow-up, round 6

**Verdict `fix`** for `82fdd4cc` on `1001cf8b`.

- **F13 · `tests/hc-fixture.ts:98–109,116–132`.** The scan treats an ordinary terminal program with `argv[1] = serve` as an hc daemon. I used a real fixture terminal to launch a detached `python3 serve` process, which inherited the fixture's `HC_SESSION`. The real stop replied `{"stopped":true}` and its daemon exited. `core.stop(500)` still threw, listed the Python PID among the daemons, and retained the runtime. Distinguish actual core daemons from terminal programs while preserving discovery of renamed binaries and daemons whose worker never recorded a PID.

## Re-check

- **F10's renamed-binary probe passes.** The sweep found the daemon launched from the copied `bin/hc`, stopped it, and removed the private runtime.
- **F11 closed.** The real stop client reached the suspended state. It was gone when the 2,000 ms stop rejected at 2,002 ms. The runtime stayed available, and retry after resuming the daemon completed cleanup.
- **F12 closed.** I started a separate test worker and let its default startup sweep run while the abandoned daemon was live. The private runtime and daemon survived. The sweep explicitly given that private root then cleaned both up.

Typecheck, `git diff --check`, and 88 focused tests across seven files passed, including slow-merge and the fixture retry tests. The supplied full Verify log `direct/check-test-1795452035221-1180907.log` reports 1,390 passes and zero failures.
