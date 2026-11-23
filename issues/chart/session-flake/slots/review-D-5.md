# Slot D review of session-flake, round 5

**Verdict `fix`** for `9eca6fd2` on `9f2cfc05`.

## Findings

- **F10 · `tests/hc-fixture.ts:77–101, 416–420`**. Discovery misses a daemon whose executable is named `hc`. I copied the same installed Herdr binary to a private `bin/hc` and ran the fixture through it. The daemon's arguments were `…/hc serve`. `core.stop()` returned normally and deleted the runtime while the original PID stayed alive. Discover the daemon using its serve arguments and session without depending on the executable basename.
- **F11 · `tests/hc-fixture.ts:98–111`**. Suspending the stop client can still hold teardown past its deadline. I suspended a private daemon and its real `hc server stop` client. A `core.stop(1500)` call was still pending at 2.7 s. It rejected after I resumed the client. Set a timeout signal that can end a suspended client and keep the runtime available for retry.
- **F12 · `tests/hc-fixture-retry.test.ts:93–135`, `tests/hc-fixture.ts:44–51, 250–251`**. The unrecorded-daemon test publishes its fixture in the shared sweep root under a dead worker's name. Serial execution within the file leaves it visible to sweeps from other workers. In a private copy of that root, I let a second test worker start a core between the abandoned daemon's launch and the first assertion. Its startup sweep removed the runtime and stopped the daemon, so the original test failed its live-daemon assertion. Give the sweep regressions a private runtime root.

## Re-check

The original F8 startup-interruption replay passed. I held a successful real start reply, killed the worker and confirmed the sweep stopped the daemon and removed its runtime. The checked-in missing-socket, refused-sweep, slice-stop retry and suspended-daemon tests also passed. The client-side bound and alternate daemon launch path are covered by the findings above.

All 73 focused tests passed across eight files. Typecheck and `git diff --check 9f2cfc05..9eca6fd2` passed. The supplied full Verify log records 1,383 passes. Probes used private cores and disposable worktrees.
