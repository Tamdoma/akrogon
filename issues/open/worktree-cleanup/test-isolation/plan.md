# Plan: test-isolation

## Scope (from brief + locked design)

`bun test` must add no entry under the real `/var/tmp/akr-<uid>`, `/tmp/akr-<uid>` or `~/.akrogon/worktrees`, and leave no process it started running. Owned surface: test files and shared test helpers under `tests/` plus `bunfig.toml`. Excluded: product code, removing the leftovers already on the host (store-sweep leaf).

## Decisions

D1. Isolation is a `bun test` preload, not per-test discipline. New `tests/isolation.ts` is wired via `preload` in `bunfig.toml` and runs before any test file in every `bun test` worker. It:
- Creates a per-worker scratch dir `mkdtempSync(join(tmpdir(), 'akrogon-suite-'))`.
- Sets `process.env.HOME`, `process.env.AKROGON_LEAF_TEMP_ROOT` and `process.env.TMPDIR` to scratch paths. This covers every subprocess that inherits `process.env` (all `spawnCaptured`/`Bun.spawn` sites) and every in-process caller of `homedir()`/`leafTemp`/`worktreeStore`, including call sites that set no override at all (install.test.ts) and windows between `afterEach` restores in shared workers.
- Registers `process.on('exit')` to `sweepSuite()` (descendant kill) then `rmSync(scratch)`.
- Makes the worker a child subreaper via `prctl(PR_SET_CHILD_SUBREAPER, 1)` through `bun:ffi` on `libc.so.6` (verified working on this host, bun 1.4.3). Orphaned grandchildren (the `sh -c 'while [ ! -e release ]'` loops orphaned when their `bun akrogon` parent is SIGKILLed, and scope payloads of killed `systemd-run --scope` children) then reparent to this worker instead of PID 1, so the descendant sweep can end them.
- Exports `suiteRoot` (scratch path) and `sweepSuite()` so tests can prove the mechanism.

D2. `sweepSuite()` kills by `/proc` ancestry, deepest first. Read `/proc/<pid>/children` for every pid owned by this user, BFS from `process.pid`, SIGKILL bottom-up, then a second pass to catch stragglers adopted between passes. It throws if any descendant survives, so the exit path reports rather than hides a leak. Systemd-owned units are not descendants: transient scopes disappear when their member processes die; test slices (`akrogon-test-*.slice`, run-units.test.ts only) are stopped by run-units' existing `afterAll` (extended per D4), and guard services (`akrogon-run-*-guard.service`) self-terminate via `tail --pid=<wpid>` when the wrapper dies — the proof command allows a short settle delay.

D3. No test is allowed to unset the isolation to reach a real root. The one test exercising `/var/tmp/akr-<uid>` by contract (config.test.ts `leafTemp` default) only computes the path string and asserts on it; it must not call `ensureLeafTemp` or create the dir. Tests that mutate `process.env.HOME`/`AKROGON_LEAF_TEMP_ROOT` for in-process product calls (batch.test.ts, batch-merge.test.ts, hold-retired.test.ts, merge-attempts.test.ts, config.test.ts, chart-shapes.test.ts, harness-template.test.ts, install.test.ts, self-update.test.ts, next.test.ts) keep their save/restore pattern; the preload makes the restore target the suite scratch instead of the operator home, which is the race-fix. install.test.ts `selfUpdateFixture` additionally sets `process.env.AKROGON_LEAF_TEMP_ROOT = leafTempRoot(...)` in its `withHome`, matching self-update.test.ts, so the fixture's intent is explicit rather than ambient.

D4. Per-file spawn-site repairs, only where a child can outlive its kill:
- `tests/run-permit.test.ts`: `stop(caps)` kills each `cap.proc` then sweeps that proc's `/proc` descendants (its `sh -c` hold loops). Same helper used in every `finally` that holds `Cap[]`.
- `tests/pause-next.test.ts`: the `procs` array teardown kills each proc's tree the same way (the herdr barrier wrapper's `while` loop is a grandchild of the `next --resume` child).
- `tests/run-units.test.ts`: the `stale` `systemd-run --scope sleep 300` spawn gets its `akrogon-run-stale0.scope` stopped in `finally` via `systemctl --user stop` (it is not a descendant); the `sleep 60`/`sleep 60`-record sleepers are direct children — covered by descendant kill; `afterAll` also `systemctl --user stop` every `akrogon-test-*.slice` it created (shared slice plus any `testSlice()`), so no stale slice accumulates.
- `tests/reconcile.test.ts`: the `verify` `while` hold (line ~456) is under a `cli()` child killed by test end — covered by the preload sweep; no file change needed beyond the shared mechanism.
- `tests/fake-busctl.ts`: its `Bun.spawn(sh -c 'sleep 0.5 && ...')` children are one-shot grandchildren — covered by the descendant sweep; no change needed.

D5. Leaking-test list (the design's open item), evidence from the watched suite run 2026-10-15 and `ps`/`stat` inspection:
- `tests/install.test.ts` `describe('self-update')`: `withHome`/`captured` set `AKROGON_HOME`+`PATH` but never `AKROGON_LEAF_TEMP_ROOT`; `selfUpdate` → `ensureLeafTemp(repo,'self-update')` mkdirs `/var/tmp/akr-1000/<hex(repo)>/<hex(leaf)>` and removes only the leaf → empty repo dirs (observed `eeb9`, `7d63` created+emptied inside the run window; matches F1's 35-45).
- `tests/run-permit.test.ts` `hold()` + `stop(caps)`: `Bun.spawn(bun akrogon run-check …)` killed by SIGKILL; fake systemd-run `exec`ed the `sh` loop as its child; `sh` reparents to PID 1 → 16 orphans on host since 2026-10-13 (F4), plus `sleep 30` orphan observed in this run (pid 2656478, ppid 2395).
- `tests/run-units.test.ts`: `Bun.spawn(systemd-run --scope … sleep 300)`'s scope members are systemd-owned (not descendants); stale `akrogon-test-<pid>[-<n>].slice` units accumulate (10 loaded on host now).
- `tests/pause-next.test.ts` `procs` teardown, `tests/reconcile.test.ts` verify-hold, `tests/fake-busctl.ts` spawn: same orphan class as run-permit.
- `~/.akrogon/worktrees/repo` (mtime bumped inside the run window): cross-file `process.env.HOME` races in shared workers — a file that doesn't set HOME runs `worktreeStore`-touching product code while a sibling file's `HOME=f.home` is torn down or not yet installed. The preload removes the real-home fallback; no single file is the whole cause.
- `tests/next.test.ts` line ~383 `nextAt` and `tests/config.test.ts` `leafTemp`/`ensureLeafTemp` blocks: already pass explicit env or only compute paths; kept green by contract, no change.

D6. Proof form (per design): one real full-suite invocation with listings of the three roots and the user's processes before and after. To attribute on a busy host (other seats write the same roots concurrently), the run is wrapped in `unshare --user --map-root-user --mount` (userns works on this host; `systemd-run --user` needs no root) with fresh tmpfs/bind mounts over `/var/tmp/akr-$UID`, `/tmp/akr-$UID` and `$HOME/.akrogon/worktrees`: suite writes land in the namespace view, post-run `find` on each mount shows exactly what the suite added, and outside seats cannot pollute the result. Process check is a `ps` after `bun test` exits filtered to suite signature (`$AKROGON_SUITE_MARK` env, `akrogon-suite-` scratch paths, `marks/release` hold loops, `akrogon-test-` slices) after a 15 s settle.

## Interfaces

- `tests/isolation.ts` exports: `suiteRoot: string`, `sweepSuite(): void`, `descendantsOf(root?: number): number[]` (internal helper exported for tests).
- `bunfig.toml`: `[test] preload = ["./tests/isolation.ts"]` added; `root`/`concurrentTestGlob` unchanged.
- `tests/isolation.test.ts` (new): the two criterion proofs below.
- `tests/helpers.ts`: add `killTree(proc: Bun.Subprocess): void` (kill proc, then SIGKILL its live descendants via `descendantsOf`) so run-permit/pause-next share one teardown; import from `tests/isolation.ts`.

## Waves

### Wave 1
- `tests/isolation.ts` (owns file): preload scratch, env vars, subreaper, exit sweep, exports.
- `tests/isolation.test.ts` (owns file): criterion proofs T1/T2 below.
- `bunfig.toml` (owns file): preload key.

### Wave 2 (depends on Wave 1's exports)
- `tests/helpers.ts`: `killTree` helper using `descendantsOf` from isolation.ts.
- `tests/run-permit.test.ts`, `tests/pause-next.test.ts`: tree-kill teardown via `killTree`.
- `tests/run-units.test.ts`: stop `akrogon-run-stale0.scope` + all `testSlice()` slices in `afterAll`.
- `tests/install.test.ts`: set `AKROGON_LEAF_TEMP_ROOT` in `selfUpdateFixture`/`withHome`.
- `tests/config.test.ts`: guard the `leafTemp`-default test so it never creates the real path.

### Wave 3
- `tests/AREA.md`: one line describing `tests/isolation.ts` + the preload, and that suite processes must not reach real HOME/leaf-temp.

(Other test files listed in D4/D5: no change.)

## Planned tests

- `tests/isolation.test.ts` (committed `27923aa` before any product-side test code): proves C1 and C2.
  Recorded red run: `akrogon run-check --name isolation -- sh -c 'bun test --timeout=30000 tests/isolation.test.ts'` → `error: Cannot find module './isolation' from 'tests/isolation.test.ts'`, 0 pass / 1 fail / 1 error.

## Done-criteria → proof mapping

C1 ("a full `bun test` run adds no entry under the real roots"):
- **Test**: `tests/isolation.test.ts` T1 — `process.env.HOME`, `process.env.AKROGON_LEAF_TEMP_ROOT`, `process.env.TMPDIR` all resolve under `suiteRoot`; `homedir()` ≠ `/home/ivan`; `leafTemp(repo,'x')` and `worktreeStore(repo)` resolve under `suiteRoot`; a child `bun -e` inherits the scratch env. Product failure it catches: any path still resolving to the operator home or `/var/tmp/akr-<uid>` inside the suite process model. Red without the preload: all assertions fail (env is the operator env).
- **Command**: `bun test --timeout=30000 tests/isolation.test.ts` via `akrogon run-check`.
- **Whole-suite proof**: `unshare -Urm sh -c 'mount tmpfs over the three roots; bun test --timeout=30000; find each root -mindepth 1'` — exit of `find` with empty output; minutes; rerun on any change under `tests/` or `bunfig.toml`.

C2 ("after a full `bun test` exits, no process the suite started is still running"):
- **Test**: `tests/isolation.test.ts` T2 — spawn `sh -c 'sh -c "exec sleep 300" & exec sleep 300'`, kill the child, wait until the grandchild's `/proc/<pid>/stat` ppid is `process.pid` (subreaper adoption), then `sweepSuite()` and assert `/proc/<gpid>` is gone. Product failure it catches: orphaned grandchildren escaping teardown (the F4 fake seats). Red without preload: grandchild reparents to PID 1 and survives → ppid assertion fails.
- **Command**: `bun test --timeout=30000 tests/isolation.test.ts` via `akrogon run-check`.
- **Whole-suite proof**: `ps` after `bun test` exits (15 s settle) filtered for suite markers; zero rows; seconds; rerun on any change under `tests/` or `bunfig.toml`.

## Known limitations

- A `bun test` worker killed by SIGKILL cannot run `process.on('exit')`; adopted descendants then reparent to the next subreaper/PID 1. Accepted: no in-process mechanism survives SIGKILL; the sweep covers SIGTERM/timeout/normal-exit paths, which is where today's leaks come from.
- `sweepSuite` cannot stop `systemd-run`-owned units that have no descendant relationship (guard services rely on `tail --pid` self-stop; stale scopes/slices get the run-units `afterAll` stops in D4).
- The `unshare` wrapper is proof machinery exercised in the report, not a `checks` command: the suite itself stays invocable as plain `bun test`.

## Doc surface

- `tests/AREA.md` gains one line (D5/Wave 3). No other agent or human doc is affected.
