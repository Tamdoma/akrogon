# Review brief: flaky-two (slot D)

Worktree /home/ivan/.akrogon/worktrees/akrogon/flaky-two, branch flaky-two, base origin/main 1f3f0622. Four commits:
- df69e372 test: self-update runs keep their leaf temp under the fixture. Cause: selfUpdateCli used the worker env, so concurrent tests shared one leaf-temp root, and one next's host reconcile deleted another's leaf temp (src/reconcile.ts:1458-1474).
- cce8b2cd test: stop leftover hc cores after every file, not only the first. A module-level afterAll in hc-fixture ran only after a worker's first file under --no-isolate; the preload afterAll runs per file.
- 76e3cd54 test: the reset helper's exit wait uses WAIT_MS (was hc wait --timeout 15).
- 815a1d92 test: door-reset reads A's inputs after A's turn on the start prompt. Cause: the stand-in A logs a line after a sync hc get, so the helper can exit before A logged the start prompt.

Check: causes real (file:line), fixes remove the race rather than hide it, the per-file hook really runs for every file and never stops a core another file still uses, any new flake. Verdict ready or fix with concrete defects.
