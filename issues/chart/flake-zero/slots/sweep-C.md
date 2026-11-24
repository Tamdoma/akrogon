**Recommendation: O2 (fix the two real test bugs and delete the dead `exit` handler; reject O1 and O3).**

1. **Why O2 beats O1 and O3:**
   - **Removes the cause with net-negative code:** O1 (`51a58e44`, +52 -16) adds a second preload (`tests/sweep-preload.ts`), a 10 s spin loop in `sweepSuite`, and a nested `bun test` regression test while leaving **both** actual bugs broken. Without `--parallel`, O1's preload `afterAll` runs only after the *last* file finishes, so all 60+ `flock`/`sleep 0.05` loops still spin through the rest of the suite (adding load and flake risk), and it relies on Bun running preload `afterAll` strictly *after* file `afterAll` hooks like `stopCoresAfterFile()`.
   - **O3 is insufficient:** direct `bun test` is still allowed, and leaving 60+ `sleep 0.05` loops spinning until a boxed run ends still degrades the run itself.
   - **Exact O2 fixes (~+6 lines, -8+ deleted):**
     1. **`killTree` (`tests/helpers.ts:141-150`):** snapshot descendants *before* killing `proc.pid` (otherwise the kernel reparents them to the subreaper before `descendantsOf` runs), and kill **top-down** (`[proc.pid, ...descendantsOf(proc.pid).reverse()]` — killing `sh` before `sleep` prevents `sh` from forking a replacement `sleep`). Fixes all 60 `run-permit` orphans plus every other `killTree` caller across 6 test files.
     2. **Nested `inner` teardowns (`tests/abandoned-capture.test.ts:363`, `tests/durable-capture.test.ts:205`):** both write `release-inner` and immediately call `f.clean()`, deleting `release-inner` before the `sleep 0.05` loop wakes up (and `innerPid` was already `SIGKILL`ed at `:351`, reparenting the payload). Write the payload PID into `ready-inner` and wait for it to exit (or `SIGKILL` it in `finally`) before `f.clean()` — or also check `[ -d "${f.home}" ]` in `blocking()`'s loop so a deleted fixture dir can never spin forever.
     3. **Delete dead code:** remove `process.on('exit')` in `tests/isolation.ts:135-142` (and if nothing else calls `sweepSuite`, remove `sweepSuite` + its test too).

2. **Simpler native option?**
   - For `killTree`, spawning test children with `detached: true` and killing the process group atomically (`process.kill(-proc.pid, 'SIGKILL')`) is a single fork-race-free kernel syscall for any tree that doesn't call `setsid()` (`flock`/`sh`/`fake-systemd-run` all stay in the pgrp), though fixing `killTree` to snapshot-then-kill top-down avoids touching spawn sites.
   - For anything orphaned by a *killed* runner, boxing (`bun run test` / `verify`'s transient `.service`) is already the native kernel solution.

**Main risk:** a *future* test bug that leaks a child during an unboxed direct `bun test` won't be silently hidden by a preload sweep (it stays contained only under boxed `bun run test` / `verify`), so leaking tests must still obey `tests/AREA.md:39`.
