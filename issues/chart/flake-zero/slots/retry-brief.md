# Brief: retry-slice pending launcher (retry-slices, D round 1 F1)

Context: tests/hc-fixture-retry.test.ts "a refused slice stop keeps the core queued and a later stop finishes it" makes a real slice with `systemd-run --user --scope --slice=<slice> -- true`, records it in the core ledger `core/slices`, and expects core.stop() to stop it. The abandoned sweep (tests/hc-fixture.ts:45-54, stopLedgerSlices :176-184) stops ledger slices of a dead worker's runtime, then deletes the runtime.

Commit 54566384 (worktree /home/ivan/.akrogon/worktrees/akrogon/retry-slices):
1. The main leak, every passing run: the session's dash made a per-run parent slice that was never stopped. Fixed by using `_` in the name. D accepts this.
2. The rare path: the slice was created before the ledger write, so a kill in between left it unrecorded. The fix writes the ledger first.

D F1 (review-D-retry-1.md): with ledger-first, if the worker dies while its systemd-run launcher is pending, the sweep stops a slice that doesn't exist yet and deletes the runtime. A launcher that outlives the worker then registers the slice, with no ledger left. D reproduced it by freezing the launcher.

Facts:
- Ad-hoc runs are now boxed in a transient service (bdc34423), and verify runs in its own service. A killed runner takes its launcher with it in both.
- The window needs a worker to die while the runner lives, and the sweep to run during the launcher's few milliseconds.
- tests/isolation.ts makes the runner a subreaper and sweeps descendants.

Options:
- O1: keep ledger-first and accept F1 as bounded and known, because the launcher dies with any killed run.
- O2: revert to create-then-record and keep only the underscore fix. The rare kill-before-record window comes back, which is also bounded the same way.
- O3: coordinate. The sweep waits until no launcher for that session is alive, for example by scanning for a systemd-run whose argv names the slice before deleting the runtime.
- O4: a native systemd option so the slice cannot outlive its record, if one exists.

Questions:
1. Which option, given "the simplest, native solution" and no flaky or leaking tests?
2. Is there an O4?

Answer briefly with a recommendation and its main risk in slots/retry-B.md or retry-C.md.
