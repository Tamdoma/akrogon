# Round 4, slot C, re-check of 3cfaef1a

- B F1 (`src/listen.ts:44-52`): the pass runs in its own process group (`detached: true`, so `pid` is the group id) and the deadline sends `SIGKILL` to `-pid`, which takes the pass and every command it started, the flock holder included, so the lock is released with it. The timer and `clearTimeout` cannot interleave with the exit continuation (timer is a macrotask, the continuation a microtask of the exit event), and a group whose leader is still a zombie exists for `kill`, so no `ESRCH` path shows. The test proves the background `sleep` is gone or a zombie after the kill. Fine.
- B F2 (`src/listen.ts:19-21,111,131-152`): a subscription with no snapshot by `SNAPSHOT_MS` is stopped, counted as late, resolves `ready` through the ended handler, and goes to the retry instead of an immediate rescan, so it cannot spin; the snapshot branch clears the timer. `onLine` reads `overdue` before its `const` line in source order, but it is only ever called from `follow`'s `for await` loop, after the declaration ran; no temporal dead zone in practice. Startup can still wait up to `SNAPSHOT_MS` for one silent session once, which is the stated bound. Fine.
- My D1 and D2 remain as fixed in 4c9f2688.

No further defects.

Re-check: ready
