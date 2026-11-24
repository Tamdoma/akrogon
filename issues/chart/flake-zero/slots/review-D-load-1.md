# Slot D load-flakes review

Verdict **fix** for `e43a8fcc` on `3574ca33`. F3 is in the shell change. F4–F6 are existing cases found in the requested marker scan.

- **F3 · fails in normal use.** The shell opens `attempts` before `echo $$` writes the PID. While the file is empty, `trim().split('\n').length` returns one, so the no-failures case fires its held deadline and then fails the parent’s attempt-count assertion. I held the gap open for 500 ms. The no-failures case failed with zero recorded attempts. Filtering out empty rows made both deadline cases pass under the same delay. Wait for the actual PID row before firing. See `tests/shell.test.ts:43`, `:77`, and `:95`.

The private shell child closes F1 and the shared timer collision in F2 from the prior review. The driver has its own watchdog and the parent cleans up recorded attempts. Reconcile’s success checks still accept exit 0 and now show stderr on failure, including the previously unreproduced case at `tests/reconcile.test.ts:921`. The scratch test passed with a 500 ms hold before rename. The same hold with direct publication failed at `:590` after the reader picked up an empty path.

## Other marker races

- **F4 · fails in normal use.** Both RAM scratch tests wait for a path published by `printf` and read it while the writer is live. With the empty marker held for three seconds, both failed because `dirname('')` is `'.'`. See `tests/run-units.test.ts:679,685–695` and `:725,731–736`.
- **F5 · fails in normal use.** The leaf-slice sleeper publishes its PID via `echo > pidFile`. The test reads on existence, so an empty file becomes PID 0. A real user-service probe confirmed that `pidAlive(0)` passes. It checks the test’s process group, and callers that wait for the sleeper to disappear can time out. See `tests/leaf-slices.test.ts:297–304,330–335,368,427`.
- **F6 · fails in normal use.** The watcher fixture publishes its session JSON via `printf`. The transcript-flip test uses existence to select the watcher PID, then reads and parses the record. A five-second gap between create and write reproduced `JSON Parse error: Unexpected EOF`. See `tests/fixtures/watch-agent.sh:17` and `tests/watch-timer.test.ts:965,1001–1004`.

I found no other direct `printf` or `echo` marker in `reconcile.test.ts`. Shell and reconcile passed 53 tests in the unmodified checkout. Typecheck and diff check passed. The injected replays used disposable worktrees. I relied on the supplied results for the full verify and stress runs.
