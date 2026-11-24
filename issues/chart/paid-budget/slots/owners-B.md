# Owners B: paid-budget

Read at worktree head cedcd2a2. (H) marks what I ran on this host on 2026-11-23 in a private throwaway hc session (`akr-probe-b6`, removed). Nothing in the repo changed.

1. F25, containment: the slice, for every owner. `startWatchTier` starts the core inside the session's slice: `systemd-run --user --scope --quiet --slice=<slice> -- hc server start` with `coreEnv` (`tests/e2e/watch-tier.ts:145`). No other file changes for containment.
2. Checked (H): started that way through `tests/core-bin/systemd-run`, the core and a program that ignores SIGTERM and SIGHUP both sat in the slice. One write to the slice's `cgroup.kill` emptied it in 2 ms. The wrapper also wrote the slice into the `slices` ledger.
3. Not the socket, `hc server stop` or a pid. Each can be refused, can hang or can start a new core. Rounds 7 and 8 were about exactly that.
4. F25, recovery: `slice`, `cgroup`, `killSlice` and `stopAndRemove` move from the judge (`tests/e2e/watch-consults.e2e.ts:44-48, :95-120`) into `watch-tier.ts`. `holdSession()` becomes lock, `killSlice`, `stopAndRemove`. The judge's own start cleanup goes (`:150-152`).
5. The same two calls replace the body of `stopWatchTier` (`tests/e2e/watch-tier.ts:205-218`): the list, kill and remove loop, the status read, the socket probe, `server stop` and the `tail --pid` wait. `listening` goes with them. Every owner then ends the way it recovers.
6. `coreEnv.AKROGON_RUN_SLICE` becomes the slice constant (`:143`), so seats' check scopes of watch-live and watch-stop sit in the slice as well.
7. F24: `watch-tier.ts` gets one function from a session name to its paths (runtime, socket, state, lock, slice). The module's constants are that function applied to `process.env.AKROGON_E2E_SESSION ?? 'akr-e2e-watch'`.
8. The deadline file passes a private name with its pid in the child judge's env (`tests/e2e/watch-consults-deadline.e2e.ts:20-32`) and calls the same function for the paths it seeds and checks (`:17, :233-239, :308-335`). The body inherits the name from the judge. Paid commands never set the variable.
9. F26: agree, cache the promise. It also keeps recovery to once per process.
10. Loss left, L1: watch-live and watch-stop run their own hc and akrogon calls from the test process, outside the slice. Kill such an owner without its run scope. A child `akrogon` call of it is still running. The next owner cleans and starts a new core at the same socket path. The old child's runtime link points at that path, so its call lands in the new run. Under `akrogon run-check` the run scope ends those children. Consults has no such child, because its body is in the slice.
11. Loss left, L2: a paid command that sets `AKROGON_E2E_SESSION` would run under a name the grant does not cover. Nothing stops that but the documented commands.
12. Loss left, L3: owners now end by SIGKILL. A harness in watch-stop may lose the last lines of a transcript it had not flushed. The tests read transcripts before the stop.
13. Deletes: about 20 lines in `stopWatchTier` and `listening`, the judge's private copies of the slice code, the hard-coded `akrogon-e2ewatch.slice` and shared-path cleanup in the deadline file, and the difference between owners that F25 is about.
