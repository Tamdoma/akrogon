# Territory map, slot D: test-temp-leftovers

Date: 2026-11-25. Bun 1.4.5. All file refs are to the akrogon checkout at map time.

## F1. What already isolates the suite, and where its edge is

- `bunfig.toml` `[test]` preloads `tests/isolation.ts` in every worker. It makes a per-worker `akrogon-suite-<pid>-*` root under `tmpdir()`, sets (JS env and libc, via FFI setenv) `HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_RETIRED_TEMP_ROOT`, `TMPDIR`, `XDG_RUNTIME_DIR`, `GIT_TEMPLATE_DIR`, and at worker start removes suite roots of dead workers (bun test never runs process exit handlers, per its own comment). It does not set `AKROGON_HOME`; `homePath()` (`src/config.ts:253`) falls back to `homedir()/.akrogon`, which is inside the suite root only because `HOME` was redirected.
- `tests/helpers.ts` `cli()` sets `AKROGON_HOME`, `HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_RETIRED_TEMP_ROOT` to the fixture home for every CLI child. `fakeAkrogon()` and `printedChecks()` do the same. Direct CLI children of the test process are covered.
- Service launches forward the vars: `launchPass` `passForwarded` (`src/verify.ts`, ~1000) and `launchLand` (`src/land.ts:29-70`) both `--setenv` HOME, AKROGON_HOME, AKROGON_LEAF_TEMP_ROOT, AKROGON_RETIRED_TEMP_ROOT. Scopes (`runUnitArgv`, `src/scope.ts:48`) fork from systemd-run and keep env. The run guard service runs only `sh`/`find`/`rm`.
- The edge: isolation is env-var based. Any akrogon process that does not receive those vars resolves `leafTempRoot()` to `/var/tmp/akr-<uid>` (`src/config.ts:407-413`) and `worktreeStore()` to `homedir()/.akrogon/worktrees/<repo>` (`src/config.ts:393-394`). `ensureLeafTemp` (config.ts:428) then creates `<root>/<sha256(repo.root)[:4]>/<sha256(root+slug)[:8]>` on the host. Nothing in that process knows a test is running.

## F2. Proven source of the `/var/tmp/akr-1000/*` dirs: nested akrogon inside a run-check checked command

`constructedEnv` (`src/run-check.ts:77-92`) builds the checked command's env from a fixed `copied` list (lines 55-64): HOME, PATH, XDG_CACHE_HOME, FAKE_SYSTEMD_RUN_LOG, AKROGON_HOME, display vars. It does not copy `AKROGON_LEAF_TEMP_ROOT` or `AKROGON_RETIRED_TEMP_ROOT`. A nested `akrogon run-check` in the checked command therefore runs `ensureLeafTemp(repo, slug)` (`src/run-check.ts:339`) under the default host root. The inner run root is removed at run end; the empty hash dir stays. That matches the observed leftovers: empty, one hash8 per hash4, in bursts at suite-run times.

Suite tests that exercise this path without forwarding the var through repo config `env:`: `tests/run-units.test.ts` (lines 273, 538, 917, 943), `tests/run-permit.test.ts` (259, 473, 507, 519, 1036), `tests/close-pack.test.ts:133`. Two tests in `tests/run-check.test.ts` (lines 639, 666) avoid it only because they list `AKROGON_LEAF_TEMP_ROOT` under the fixture repo's `env:` config, which `constructedEnv` also copies. The difference between leaking and non-leaking nested tests is that config line, nothing else.

In production this path is harmless: the outer run already uses the default root, so the nested call resolves the same leaf temp dir and the leaf lifecycle removes it. The leak exists only when the outer root is non-default, which is exactly the test setup, and would also hit any production use of a non-default `AKROGON_LEAF_TEMP_ROOT`.

### Observations (free, self-attributing)

Attribution method: compute the expected default-root path from the fixture's own `realpath(f.root)` hash inside the probe, so other activity on the host cannot contaminate the result. (An earlier before/after host listing diff around `bun test tests/config.test.ts` was discarded: another slot was bisecting test files concurrently, seen in `ps`.)

1. Probe 1, negative. Command: `TMPDIR=<obs>/scratch bun run <obs>/probe.ts`, which replicated `tests/config.test.ts` "config printed check installs..." using `tests/helpers.ts` `fixture`/`cli`/`printedChecks`. Printed check ran a run-check whose command was install + `akrogon guard own-modules` + `bun -e`. Result: exit 0, no dir at the expected default-root path for slugs `check` or `checkout`. `src/guard.ts` creates nothing. Limit: covers only that printed-check shape.
2. Probe 2, positive. Command: `TMPDIR=<obs>/scratch bun run <obs>/probe2.ts`, same harness, printed command `akrogon run-check --name outer -- sh -c 'akrogon run-check --name inner -- true'` in a leaf worktree. Result: exit 0, and `/var/tmp/akr-1000/<hash4>/<hash8 for slug check>` existed after, empty, mode 0700. Cleanup: removed that exact probe-created dir and the obs scratch after recording. Limit: proves the mechanism and one exercising shape, not that every one of the ~59 host dirs came from it.
3. Host state read (no writes): 59 hash4 dirs at 12:05Z 2026-11-25, each with one empty hash8, timestamps in bursts (06:39, 07:34 local). One hash4 (`5d20`) is this repo's own root hash and was a live seat temp, not a leftover.

## F3. The `~/.akrogon/worktrees/akrogon-XXXXXX` dirs: not reproduced, one structural suspect

`akrogon-XXXXXX` is a fixture repo name (`fixture()` mkdtemps `akrogon-` as the home; repo name is its basename). An empty store dir of that name under the real home means an akrogon process resolved a fixture repo while `worktreeStore()` used the real `homedir()`. I found no current path that does this and intake's recheck found 0 new ones while leaf-temp dirs returned within hours, so this half may already be fixed or much rarer.

The structural suspect, grounded in code: `worktreeStore()` (`src/config.ts:393`) is the only store path that reads `homedir()` directly instead of `homePath()`. Everywhere else state follows `AKROGON_HOME`. Any spawn that sets `AKROGON_HOME=<fixture>` but leaves HOME real (a systemd service that misses `--setenv=HOME`, a pane, a hand-built env) splits the two: state in the fixture, worktrees in the real home, and the store dir itself survives worktree removal (`src/verify.ts:785`, `src/next.ts:332`, `src/batch.ts:89` create under it). Current land and verify-pass launches do forward HOME (F1), so if this was the source it predates or bypasses those launches. Model knowledge, not verified: with HOME unset or empty, `os.homedir()` falls back to the passwd entry. I did not fetch a primary doc for this; searches were code-only (`homedir()` uses in tests/src, spawn env blocks in tests).

## F4. Second unproven escape: shared `process.env` mutation under concurrent in-process tests

`bunfig.toml` sets `concurrentTestGlob = "**/*.test.ts"` and the `test` check adds `--parallel=4 --no-isolate`, so tests share one worker process and run concurrently (Bun docs: files matching `concurrentTestGlob` behave as if `--concurrent` was passed, every test in those files runs concurrently; https://bun.sh/docs/test/configuration, read 2026-11-25). Several files mutate `process.env.AKROGON_LEAF_TEMP_ROOT` / `HOME` / `AKROGON_HOME` with save-restore: `tests/config.test.ts` (deletes the leaf root at line 1042), `tests/batch.test.ts:72-80`, `batch-merge`, `hold-retired`, `merge-attempts`, `install`, `self-update`, `chart-shapes`, `state-home`, `seat`. A concurrent in-process `ensureLeafTemp`/`runCheck` during a delete window, or a restore that resurrects a stale captured value, would create host dirs with no subprocess involved. I did not prove a leak from this. Whether synchronous tests can interleave mid-body under Bun concurrent mode is model knowledge; the docs fetch above does not settle it. Precedent exists for containing it: `tests/isolation.test.ts` marks its env assertions `test.serial`, and `tests/next.test.ts` (~2730) does its delete-env check in a child process.

## F5. What the earlier charts left uncovered

- `test-hygiene`: test-unit slices stop with their test. Units, not dirs.
- `run-scratch`: run roots removed at every run end, guard removes a killed run's root. This explains why leaked dirs are empty; it only removes `run-*` inside whatever root the process resolved.
- `test-time-and-temp`, `leaf-temp` (chart dir gone), `temp-release` (closed leaf `release-any-phase`): leaf temp lives in one owned folder on `/var/tmp`, deleted once the leaf's tab is gone and processes stopped. All assume a real leaf lifecycle in the real store. A fixture repo has no tab, slice, or leaf record in the real home, so nothing ever releases its temp.
- `framework-temp-owners`: framework repo's browser temp, handed to that repo's chart. Not akrogon's suite.
- Lessons (`learnings/LESSONS.md` run-check TMPDIR lines, 2026-10-22, 2026-11-15, 2026-11-20): run-check's TMPDIR is removed at exit and is cross-device from worktrees. Same root fact as F2 from the other side: the checked command's world is disposable and env-filtered, so anything a nested akrogon resolves outside it escapes both cleanup and fixture isolation.

None of these covered: an akrogon process spawned by the suite resolving default roots, or any end-of-run check that the host is unchanged.

## Forks

### D1. Where the nested-call fix belongs

- O1. Product: add `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT` to `copied` in `src/run-check.ts`, next to `AKROGON_HOME`, whose comment already argues a nested akrogon must share the caller's state home. Fixes the proven path for every repo and every future nested test, and fixes the same bug for any production non-default root. Could break: tests that assert the exact checked-command env. Invites: checked commands can now see and use two akrogon-internal vars; they already receive `AKROGON_HOME` and a TMPDIR inside the leaf temp, so this adds no new reach in practice.
- O2. Tests only: add `env: ['AKROGON_LEAF_TEMP_ROOT', ...]` to the fixture configs of the leaking nested tests, as the two run-check tests already do. No product change. Could break: nothing now. Invites: every future nested test releaks by default, and the production non-default-root case stays broken. The failure stays silent.
- O3. Product refusal: make akrogon refuse the default root when it detects a test. There is no reliable test signal; inventing one is a new mechanism that can misfire in production and be bypassed in tests. Reject.
- O4. Preload completeness: also set `AKROGON_HOME` in `tests/isolation.ts` instead of relying on the HOME redirect. Cheap, removes one implicit dependency, fixes nothing in F2 by itself (`AKROGON_HOME` is already copied by run-check). Worth bundling only if the leaf touches isolation anyway.

### D2. How a leftover is detected so the class cannot return

- O1. One free regression test at the real boundary (shape in the recommendation): nested run-check through `cli()`, assert the inner run happened under the fixture leaf-temp root and the fixture's default-root hash path does not exist. Deterministic, attributed, runs in the normal suite. Covers F2 only.
- O2. Suite-wide host guard in the preload. Placement problem: bun test runs no exit handlers, and the preload's existing trick (next worker sweeps dead predecessors) cannot fail the run that leaked, only a later one. Worse, when the suite itself runs inside a real leaf via run-check, `/var/tmp/akr-<uid>` legitimately holds that leaf's own live seat temp, so a naive snapshot-diff false-positives on production-shaped runs. A correct version must distinguish fixture-repo hash dirs from registered-repo dirs of the real home, which is the reconcile host pass's job (D3) and it deliberately only reports. High complexity for the value; skip unless F4 is proven real.
- O3. Nothing. The class returns silently through the next escape (F3/F4 shapes remain).

### D3. Whether the product host sweep should play a part

No. The reconcile host pass (`src/reconcile.ts`, ~1377-1410) already sees both leftover kinds and deliberately keeps them with a reason: a hash dir or store dir of an unregistered repo "may belong to another home sharing this store, so it is reported, never deleted." Fixture leftovers are exactly unregistered-repo dirs. Widening the sweep to delete them would let one akrogon home delete another home's live leaf temp and worktrees on a shared machine. The sweep's report is the correct product behavior; test leftovers must be prevented, not swept. Existing host leftovers are a one-time operator removal, as the door already does.

### D4. The worktree-store split (F3)

- O1. Make `worktreeStore()` resolve under `homePath()` (AKROGON_HOME-aware) instead of `homedir()`. Removes the split as a class; F3 cannot recur through any env combination. Could break: any production home that sets `AKROGON_HOME` to a non-default path currently has its store under `~/.akrogon/worktrees`; the change moves the store and orphans existing worktrees until moved by hand. That is a migration-shaped change and needs a deliberate call, possibly its own leaf.
- O2. Leave `worktreeStore` as is. `tests/isolation.test.ts` already asserts the store resolves under the suite root (line 22), so a preload-level regression is caught; only a split-env spawn escapes, and none was found live.

### D5. In-process env mutation (F4)

- O1. Do nothing until proven. No observed leak is attributed to it.
- O2. Mark env-mutating tests `test.serial`, or move delete-env assertions into child processes (existing patterns in `isolation.test.ts` and `next.test.ts`). Small, mechanical, but touches many files for an unproven path. Only worth it if the regression test in D2-O1 plus the fix still leaves host growth after a full suite run.

## Practitioner pitfalls over the work's lifetime

- `src/config.ts:41` prints `leafTempRoot()` in config output and `tests/next.test.ts:2604` asserts seat TMPDIR is under it; an env-policy change in run-check can ripple into printed-config and env-listing assertions in `run-check.test.ts` and `verify.test.ts`. Expect to update exact-env assertions, and check they were asserting policy, not incidentally freezing the leak.
- The `test` check (`issues/config.yaml:9`) reruns changed test files with `--rerun-each=5`, so one leaking test multiplies five-fold per leaf run and again at merge. That is how ~2,900 dirs accumulate in two days without any single test looking wrong.
- Empty hash dirs are also created legitimately in production (F2) and released by leaf lifecycle. Any future detector must key on fixture repo roots, not on "dir exists", or it will fight the production design.
- `leafTempRoot()` is fixed to `/var/tmp` on purpose (socket path length and disk-backed, comments at config.ts:404-406). Do not route test temp through `tmpdir()`/tmpfs to solve this; suite roots already live under TMPDIR, which inside run-check is the leaf's disk-backed run root.
- Old records keep parsing (taken lock): nothing in D1-O1 changes any record shape. D4-O1 changes a live path, not a record, but verify-run records store absolute worktree `path` values; a store move mid-flight would strand in-progress verifies. Another reason D4-O1 is its own decision.

## Recommendation

One leaf. Contents: D1-O1 (two names added to `copied` in `src/run-check.ts`, with the same comment treatment as `AKROGON_HOME`), exact-env test updates that the change forces, and D2-O1 as the proof. Explicitly out: D3 sweep changes, D4-O1 store move, D5 serial-marking, cleanup of existing host dirs (operator step).

Proof, free and at the real boundary: a test in `tests/run-check.test.ts` style that builds a fixture leaf worktree, runs via `cli()` an outer `run-check` whose checked command is `akrogon run-check --name inner -- true` through the `fakeAkrogon` shim (no `env:` forwarding in the fixture config), and asserts (a) both outer and inner check logs exist, so the nested run really ran, and (b) `/var/tmp/akr-<uid>/<sha256(realpath(f.root))[:4]>/<hash8 of the slug>` does not exist, while the inner run root sat under `leafTempRoot(f)`. This is probe 2 turned into a test; it fails on current code and passes with O1. Acceptance at the suite level: run the full `bun test` once and diff `find /var/tmp/akr-<uid> -maxdepth 2` before and after, excluding the live seat's own repo hash dir; expect no new fixture hash dirs.

Cost: small. One production line group, forced test-assertion updates, one new test.

## Q. What the intake does not settle

- Q1. Is widening the checked-command env (D1-O1) acceptable as env policy, or is the env list itself a contract that should only grow through repo config `env:` (which would flip the recommendation to D1-O2 plus a detector)?
- Q2. Should `worktreeStore()` follow `AKROGON_HOME` (D4-O1) despite the store-move consequence, now or as a separate leaf? Without a live reproduction of F3, is F3 in this chart's outcome at all, or does "no dir under the real worktree store" get accepted on the strength of the existing isolation test plus intake's 0-new recheck?
- Q3. If a full-suite run after D1-O1 still grows the host root, is D5-O2 (serial-marking env mutators) in scope for the same leaf, or a follow-up chart?
- Q4. Who removes the current host leftovers, and is a count of zero after a full suite run the acceptance bar, or only "no new dirs from a clean snapshot"?
