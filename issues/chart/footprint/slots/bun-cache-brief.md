# Brief: Bun code cache (independent view, no edits)

Repo /home/ivan/Work/infra/akrogon (main b9fe5027). Footprint chart: issues/chart/footprint/CHART.md, forks/map.md (M2: bound bytes by owner; M8: bun caches, never auto-clear during runs).

Facts (A):
- ~/.cache/bun/@t@ is Bun's runtime transpiler cache: 7.0 GB, 223,542 files, 188,744 older than 2 days, no eviction. ~/.bun/install/cache (packages) is 2.0 GB.
- Checks run with constructedEnv (src/run-check.ts:62-78): TMPDIR=runRoot, NODE_DISABLE_COMPILE_CACHE=1 (Node cache was hundreds of MB per run, never reused). runRoot is removed at run end (:471). Seats, land and verify units also set NODE_DISABLE_COMPILE_CACHE (src/seat.ts:299, src/land.ts:44, src/verify.ts:940).

Proposal from A:
- A1. Set BUN_RUNTIME_TRANSPILER_CACHE_PATH to a folder inside runRoot in constructedEnv, so the cache lives and dies with the run.
- A2. One-time delete of ~/.cache/bun/@t@.
- A3. Remove the dead worktree /var/tmp/akr-1000/5d20/1f23ef6e/eoh-base (Nov 7 debug leftover, no process cwd in it) and that folder.

Answer:
1. Who actually fills @t@ (checks, seats, land/verify units, operator CLI, release runs)? Measure or reason from Bun docs/source (node_modules/bun-types or Bun docs for BUN_RUNTIME_TRANSPILER_CACHE_PATH; '0' disables it).
2. Best option: per-run folder (A1), disable ('0'), a shared bounded location, or leave as is. Does the cache help a test run at all (one run spawns many bun processes on the same src)? Measure if cheap: one test file with cache in a fresh dir vs '0'.
3. What A1 could break (tests asserting env, pass_env, seats outside checks still growing the shared cache).
4. A2/A3 safe as stated? Anything that would be lost.
Short. Write to slots/bun-cache-<your slot>.md in /home/ivan/Work/infra/akrogon/issues/chart/footprint/slots/, then hc send t126 "done <slot>: <path>".
