# Implementation report: test-isolation

## Result

`bun test` no longer writes into the real HOME or leaf-temp root and leaves no process it started. Base `0a80ab9`, head `3944b17` (rebased, verify green receipt on this head).

## Changed files and reasons

- `tests/isolation.ts` (new): `bun test` preload. Per-worker scratch via `mkdtempSync(tmpdir()/'akrogon-suite-')`; sets `process.env` and libc `setenv` for `HOME`, `AKROGON_LEAF_TEMP_ROOT`, `TMPDIR` (Bun's `process.env` writes do not reach libc `getenv`, so `os.homedir()`/`tmpdir()` needed the FFI `setenv` — this is also why `~/.akrogon/worktrees/repo` was leaking despite JS-side `process.env.HOME` overrides); `prctl(PR_SET_CHILD_SUBREAPER)` so orphaned grandchildren are adopted by the worker; `descendantsOf` (per-thread `/proc/<pid>/task/<tid>/children` BFS, deepest first); `sweepSuite` (two SIGKILL passes + `waitpid` reaping, throws on survivors); exit hook sweeps then removes the scratch. Exports `suiteRoot`, `sweepSuite`, `descendantsOf`.
- `bunfig.toml`: `preload = ["./tests/isolation.ts"]` under `[test]`.
- `tests/helpers.ts`: `killTree(proc)` — SIGKILL the proc then every `descendantsOf(proc.pid)` — shared teardown for the two hold-loop sites.
- `tests/run-permit.test.ts`: `stop(caps)` → `killTree` (16 live F4 orphans came from this bare `proc.kill`).
- `tests/pause-next.test.ts`: `procs` teardown → `killTree`, same orphan class through the herdr barrier loop.
- `tests/run-units.test.ts`: track every `testSlice()`/`shared` slice in `createdSlices`, `stopTestSlice` each in `afterAll`; `finally` stops `akrogon-run-stale0.scope` (systemd-owned, not a descendant).
- `tests/install.test.ts`: `selfUpdateFixture` sets `process.env.AKROGON_LEAF_TEMP_ROOT` under the fixture home, mirroring `tests/self-update.test.ts` — the missing override that created empty `/var/tmp/akr-1000/<hex>` repo dirs.
- `tests/config.test.ts`: `existsSync(path) === false` guard on the default-`leafTemp` test.
- `tests/isolation.test.ts` (new, frozen at plan): T1 env redirection, T2 orphan adopt-and-sweep; fixed `/proc/<pid>/task/<tid>/children` path and env-string narrowing since planning.
- `tests/AREA.md`: one `Key files` line naming the preload.

## Waves / workers

- W1 u1 `5ab6c34` (worker sa-1): preload + wiring. Platform corrections the brief did not foresee, verified and kept: per-thread `children` file, libc `setenv`, `waitpid` zombie reaping.
- W2 u2 `fffa4fd` (sa-2), u3 `4bf4cc6` (sa-3), u4 `bb73b54` (sa-4): tree-kill teardowns, slice teardown, env pinning — all disjoint paths, landed clean.
- W3 u5 `0bcc657` (sa-5): AREA.md line.
- A commits: `2dfdc2d` (test path correction, Test-Change trailer), `de531f8` (env narrowing), `3944b17` (prettier). All test-file changes carry `Test-Change:` trailers.

## Commands and results

- `akrogon run-check --name isolation -- sh -c 'bun test --timeout=30000 tests/isolation.test.ts'` → green (2 pass) on lane head `dc7cefc`; log `implementation/check-isolation-1792098476711-3657212.log`.
- `akrogon run-check --name isolation -- sh -c 'bun test --timeout=30000 tests/isolation.test.ts tests/run-permit.test.ts tests/pause-next.test.ts tests/run-units.test.ts tests/install.test.ts tests/config.test.ts'` → 92 pass; log `implementation/check-isolation-1792098738394-800946.log`.
- `bun test --timeout=30000` (lane, real namespace) → 852 pass, 0 fail, 205 s; log `/tmp/ti-watch/suite3.log`.
- `akrogon verify` on `3944b17` → green (format/test/typecheck 0); run `58c64867`.
- Refresh: fetched `origin/main`, rebased `f3557d8`→`0a80ab9` with all 7 commits replaying clean; `AKROGON_BASE=0a80ab9`.

## Done-criteria proof

C1 — no entry under `/var/tmp/akr-1000`, `/tmp/akr-1000`, `~/.akrogon/worktrees` from a full `bun test`: the suite ran inside `unshare -Urm` with tmpfs mounts over all three roots (proof worktree `/tmp/ti-proof-wt` outside the mask). Post-run `find -mindepth 1` on each mount produced 0 lines (`/tmp/ti-watch/roots-written.txt`, 0 bytes) across 200 s and 852 tests. Five userns-only failures (`user-0` cgroup paths from uid remap in `run-units`, two merge tests) were environmental, all green in the un-namespaced rerun.

C2 — no suite-started process survives exit: `ps` before/after with a 15 s settle shows zero new processes carrying suite signatures (`akrogon-suite-`, `ti-scratch`, `ti-proof-wt`, `/tmp/akrogon-*` fixture paths, `sleep` payloads); no loaded `akrogon-test-*` slice maps to a live pid from the run. Pre-existing orphans (16 `marks/` loops ≥30 h, ~124 `akrogon-test-*` units, one `git worktree add` orphan under `scratch-copy-removal`'s slice) belong to other leaves and were left untouched per scope.

## Known limitations

- A `bun test` worker killed by SIGKILL cannot run `process.on('exit')`; adopted descendants then reparent upward. Mitigated by the subreaper + per-test `killTree`, which is where today's leaks came from.
- `sweepSuite` cannot reach systemd-owned units with no descendant edge; covered by `tail --pid` guards and the run-units `afterAll` stop.
- The userns mount-namespace proof shows the suite's writes would have hit the real roots absent the preload — it proves C1 structurally; a second plain `bun test` in the real namespace stayed green and was scanned for leftovers manually (none).

## Unverified criteria

None.

## 2026-10-15 check.fix: F1 behavioral red proof

B's F1: the committed red proof (`check-isolation-1792097932394-965246.log`) exited on `Cannot find module './isolation'` — an import failure that never executed an assertion. Repaired by recording assertion-red runs of the existing `tests/isolation.test.ts` under deliberate breaks of `tests/isolation.ts` in the worktree (uncommitted, restored after each run; frozen expectations untouched):

- `check red-env: 1 implementation/check-red-env-1792100273361-512047.log` — `AKROGON_LEAF_TEMP_ROOT` redirected to a sibling `akrogon-wrong-leaf-*` scratch: T1 failed on `expect(AKROGON_LEAF_TEMP_ROOT).toStartWith(suiteRoot)` (0.22 ms, assertion), T2 still passed.
- `check red-subreaper: 1 implementation/check-red-subreaper-1792100279958-526410.log` — `prctl(PR_SET_CHILD_SUBREAPER)` disabled: T2 failed on `expect(adopted).toBe(true)` (`orphan 526888 adopted by this worker`, Expected: true, Received: false). Leaked `sleep 300` pid 526888 killed by PID after the run.
- `check red-sweep: 1 implementation/check-red-sweep-1792100290393-619317.log` — `sweepSuite` reduced to a no-op: T2 failed on `expect(existsSync(grandchild)).toBe(false)` (`grandchild 620623 still alive after sweep`). Leaked `sleep 300` pid 620623 killed by PID after the run.
- `check isolation-green: 0 implementation/check-isolation-green-1792100296120-678705.log` — restored tree, head `ef821bb`, `bun test --timeout=30000 tests/isolation.test.ts`: 2 pass, 0 fail.

Refresh: branch rebased `0a80ab9` → `fa0f4c2` (origin/main advanced; new base `fa0f4c261532b1b2ba32e9984f3f38d5897c6e07`, 10 commits replayed clean, same tree). Prior reviewed base `0a80ab91e9388e60ce148f500fa92eb9859e1aeb`, prior reviewed head `ef821bbfc8589ad046c6d8c47b8dedafcb53a9c9`; handed-off base `fa0f4c261532b1b2ba32e9984f3f38d5897c6e07`, handed-off head `dd0de7b9aa9673a2595c1102026b87606d55e77c`. `akrogon verify` on `dd0de7b` green (run `7d1de6d5-e066-4af7-9a2d-03b0ac6fda84`, 859 pass / 0 fail; format/test/typecheck 0). No code change beyond the recorded uncommitted breaks.
