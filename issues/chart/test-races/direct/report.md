# Direct report: test-races

Commits on 436b5179: c4e13fa9, 79d4bfd5, c691dde2.

1. verify notice ("two simultaneous base runs produce one notice file", exit [0,1]). Cause: git worktree add/remove read .git/worktrees while a concurrent remove deletes an entry ("Invalid path", "failed to read commondir"). Reproduced with plain git (5 fatals in 301 add/remove rounds; 0 under one flock). The test itself never failed in 150 local runs, so linking it to that failure is inferred: it is the only exit-1 path found that leaves records and notice written. Fix: every git worktree add/remove/prune akrogon runs holds withLock on `git rev-parse --git-path akrogon-worktree.lock` (worktreeLock in src/state.ts, beside withLock). tests/next.test.ts "lock finalization failures remain fatal" faked every flock; its fake now passes the worktree lock to the real flock.
2. hc-identity stale socket (listening true after SIGKILL). Cause: SIGKILL is asynchronous. Fix: wait until the pid is gone or a zombie (the subreaper keeps it as a zombie) before probing. 4/20 red under 32 busy loops before, 20/20 green after.
3. seat cgroup ENOENT ("a wake after tab loss re-dispatches seats into the same slice"). Cause: tests/leaf-slices.test.ts runs real next passes; their host step (src/reconcile.ts:1363) stops every empty akrogon-l*.slice not matching its own home's leaves, including other tests' slices; journal shows the lost-tab slice stopped 3 ms after the wake seat started. Fix: a systemctl wrapper limits that case's slice listing to its own leaves. Reproduced 3/10 by stopping the slice when empty during the wake.
4. door-reset agy stages: not fixed. The helper was killed by a signal after logging `started` (reproduced exactly with SIGKILL); the sender was not found in 60+ loaded runs. Plausibly the same slice sweep as 3 or R1, unproven.

Known flake seen during local runs, untouched: "dispatch never adopts another session terminal after the repo core changes" (akrogon flaky lists 4).

## Round 1 repair (review F-1), head f74fce7ab4d54a3c53a953b6534570740bbde5d6

F1: worktreeLock resolves `git rev-parse --git-common-dir`; a main and a linked checkout of one scratch repo both return `<main>/.git/akrogon-worktree.lock`. F2: the wrapper re-raises the child's signal; a delegate that kills itself with SIGKILL after printing JSON now makes the wrapper exit 137. Focused: leaf-slices, verify, next, self-update, batch, reconcile 363 pass.
