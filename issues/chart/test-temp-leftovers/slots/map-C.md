# Territory map, slot C: test-temp-leftovers

Date: 2026-11-25  
Repo: `/home/ivan/Work/infra/akrogon` (HEAD `64681915`, Bun `1.4.5`)

---

## 1. Actual sources and why existing isolation misses them

### 1.1 Earlier temp charts and why the pileup appeared now

Reading the `Destination` and `Off route` sections of the six earlier charts plus `issues/closed/temp-release/release-any-phase/brief.md` shows why none of them covered this class:

- `test-hygiene` (landed `14774a0e`, 2026-11-23): fixed `watch-live` stand-in waits and `akrogon-test-*.slice` nesting; did not touch `run-check` env propagation or `worktreeStore` isolation.
- `run-scratch` (landed `814a2387`, 2026-11-23): moved a held run's `TMPDIR` and `BUN_RUNTIME_TRANSPILER_CACHE_PATH` into `run_root` (removed by the guard unit's `ExecStopPost`), leaving `runRoot` and `leafTempDir` (`ensureLeafTemp`) on disk under `leafTempRoot()`. `checkedRun` (`src/run-check.ts:501`) deletes `runRoot` (`run-XXXXXX`) in `finally`, never its parent `leafTempDir` (`<hash4>/<hash8>`).
- `test-time-and-temp` (handed off 2026-10-01), `temp-release` (handed off 2026-10-16; closed leaf `issues/closed/temp-release/release-any-phase`), `leaf-temp` (closed; no `CHART.md`), `framework-temp-owners` (closed; handed to `framework`): all dealt with *leaf* temp lifecycle (disk-backed `/var/tmp/akr-<uid>/<hash4>/<hash8>`, socket path budget, releasing temp on tab/slice end in any phase, framework browser sockets), not akrogon's own test-suite isolation.
- **Why 2,900 `/var/tmp/akr-1000` dirs and 35 `~/.akrogon/worktrees/akrogon-XXXXXX` dirs suddenly piled up in the last ~2 days:** commit `dc426cd7` (2026-11-22, refs `#151`) changed `reconcileHost` (`src/reconcile.ts:1380-1409`) to stop deleting unregistered directories under `~/.akrogon/worktrees` and `/var/tmp/akr-<uid>` (reporting them in `reconcile-host.json` instead) after a test home's host sweep deleted the live home's dirs. Before `dc426cd7`, live `akrogon next` passes were silently sweeping test leftovers off the host every few minutes; once `dc426cd7` made `reconcileHost` safe across homes, the existing test-suite leaks became visible and accumulated.

### 1.2 Confirmed live source of `/var/tmp/akr-<uid>/<hash4>/<hash8>` (4 empty dirs per `bun test` run)

**Primary mechanism (`src/run-check.ts:55-64`, `copied` in `constructedEnv`):**

`tests/isolation.ts` (preloaded via `bunfig.toml`) already redirects `HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_RETIRED_TEMP_ROOT`, and `TMPDIR` to a per-worker scratch root (`suiteRoot`), and `tests/helpers.ts:112-135` (`cli()`) sets `AKROGON_LEAF_TEMP_ROOT: leafTempRoot(f)` for CLI subprocesses.

That isolation breaks at the `akrogon run-check` boundary:
- `src/run-check.ts:55-64` (`copied`) forwards `AKROGON_HOME` ("An akrogon invocation inside a checked command shares the caller's state home; without it a nested call resolves HOME/.akrogon and can re-cutover"), **but omits `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT`**.
- By contrast, both `src/verify.ts:997-1014` (`passForwarded`) and `src/land.ts:47-55` (`launchLand`) already forward both `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT`.
- Whenever a checked command invokes a nested `akrogon run-check` (or any nested `akrogon` call reaching `ensureLeafTemp`) and the fixture repo's `issues/config.yaml` does not explicitly list `AKROGON_LEAF_TEMP_ROOT` in `env` or `pass_env`, the nested `akrogon` runs with `AKROGON_LEAF_TEMP_ROOT === undefined`.
- `ensureLeafTemp` (`src/config.ts:407-412, 428-433`) then creates `/var/tmp/akr-<uid>/<hash4>/<hash8>`. At exit, `checkedRun` (`src/run-check.ts:501`) removes only `runRoot` (`run-XXXXXX`), leaving an **empty** `/var/tmp/akr-<uid>/<hash4>/<hash8>` dir behind on the host.

**Exact leaking tests reproduced on HEAD (2026-11-25):**
1. **`tests/state-home.test.ts:265-316`** (1 empty dir per run): fixture `issues/config.yaml` declares `env: ["AKROGON_HOME"]` only (line 265); outer `run-check` invokes nested `akrogon run-check --holder ... -- sleep 1` (line 291). Observation 1 confirmed it creates 1 empty `/var/tmp/akr-1000/<hash4>/<hash8>` dir.
2. **`tests/run-permit.test.ts:471-490`, `497-538`, `1024-1046`** (3 empty dirs per run): all three tests write `FULL_CONFIG` (no `env`/`pass_env` for `AKROGON_LEAF_TEMP_ROOT`) and run nested `akrogon run-check --name test ...` inside an outer `run-check` (lines 473, 507, 519, 1036; lines 507 and 519 share one repo+slug, yielding 1 dir). Observation 1 confirmed `tests/run-permit.test.ts` creates 3 empty `/var/tmp/akr-1000/<hash4>/<hash8>` dirs.

This 1 + 3 = 4 signature matches the live mtime clusters observed in `/var/tmp/akr-1000` on 2026-11-25 (14 runs between 05:39Z and 12:05Z = 56 empty dirs, each run producing 1 dir followed ~12-20 s later by 2 dirs ~1-25 ms apart and 1 dir ~1.2-1.7 s later). Seven other test files (`tests/abandoned-capture.test.ts:299`, `tests/close-pack.test.ts:114,168`, `tests/durable-capture.test.ts:133`, `tests/run-check.test.ts:639,666`, `tests/run-permit.test.ts:250`, `tests/run-units.test.ts:117,304,1147`, `tests/timing.test.ts:170`) already carry manual `env`/`pass_env: ['AKROGON_LEAF_TEMP_ROOT']` workarounds for the same product gap.

**Additional latent `/var/tmp/akr-<uid>` leak paths found in code audit:**
3. **Concurrent `process.env.AKROGON_LEAF_TEMP_ROOT` deletion/mutation under `concurrentTestGlob = "**/*.test.ts"` + `--parallel=4 --no-isolate`:**
   - `tests/config.test.ts:1020, 1038, 1128, 1167` are all concurrent `test(...)` (not `test.serial`). Line 1042 runs `delete process.env.AKROGON_LEAF_TEMP_ROOT` and restores `previous` in `finally`. If a sibling concurrent test reads `const previous = process.env.AKROGON_LEAF_TEMP_ROOT` while line 1042 has deleted it, `previous` is `undefined`, and its `finally` permanently deletes `AKROGON_LEAF_TEMP_ROOT` for all remaining files in that `--no-isolate` worker.
   - `tests/install.test.ts:434-446` (`selfUpdateFixture`, used by 9 concurrent `test(...)`, 0 `test.serial`) mutates and restores `process.env.AKROGON_LEAF_TEMP_ROOT` (and `withHome` mutates `AKROGON_HOME` and `PATH`) concurrently.
   - `tests/hold-retired.test.ts:13-20` captures `originalTempRoot` and `originalHome` at module load time and restores them in `afterEach` across 3 concurrent + 1 serial test; in `--no-isolate`, if an earlier file corrupted `process.env`, the module snapshot propagates it.
4. **`tests/hc-fixture.ts:285-301` (`cleanEnv`):** starts test `hc` cores without `AKROGON_LEAF_TEMP_ROOT` or `AKROGON_RETIRED_TEMP_ROOT`, so any `akrogon` call launched from inside a test core without explicit env vars falls back to `/var/tmp/akr-<uid>`.
5. **`tests/isolation.ts:54` (`suiteRoot` inside caller `TMPDIR`):** when `bun test` is run directly inside a live seat (whose `TMPDIR` is `/var/tmp/akr-<uid>/<hash4>/<hash8>`), `suiteRoot` is created inside that leaf temp dir and is not deleted at exit because `bun test` never runs `process.on('exit')` (observed live: `/var/tmp/akr-1000/5d20/0a8d16be/akrogon-suite-4046665-76c9xi`). It persists until a later `bun test` worker sweeps dead `akrogon-suite-<pid>-*` dirs.
6. **`tests/isolation.ts` omits `AKROGON_HOME`:** if the caller environment sets `AKROGON_HOME`, `tests/isolation.ts` leaves it pointing at the caller's real state home for any in-process test calling `homePath()`/`globalHome()`.

### 1.3 Sources of empty `~/.akrogon/worktrees/akrogon-XXXXXX`

**Empirical status on HEAD:** Neither our isolated runs (Observation 1) nor our single full-suite run (`bun test --timeout=120000 --parallel=4 --max-concurrency=5 --no-isolate`, Observation 2) created any entry under `/home/ivan/.akrogon/worktrees` (matching INTAKE.md's finding that 0 `akrogon-??????` dirs had reappeared by 12:01Z after the morning cleanup).

**Code paths and proven mechanisms that produce empty `akrogon-XXXXXX` dirs:**
- The name `akrogon-XXXXXX` comes from `tests/helpers.ts:44-53, 79` (`fixture()` creates `mkdtempSync(resolve(tmpdir(), 'akrogon-'))` and `fixtureRepo()` sets `repo = basename(home)`).
- `src/config.ts:393-394` (`worktreeStore(repo)`) resolves `resolve(homedir(), '.akrogon/worktrees', repo.name)` whenever `worktree_root` is unset. It **ignores `AKROGON_HOME` (`homePath()`)** and relies solely on `os.homedir()`.
- `src/batch.ts:89-92, 115-118` (`buildStack`) calls `mkdirSync(dirname(dir), { recursive: true })` to create `worktreeStore(repo)`, adds `batch-*` and `batch-*.owner`, and removes only `batch-*` and `.owner` in `finally` — **leaving `<homedir()>/.akrogon/worktrees/akrogon-XXXXXX` empty**. (`src/verify.ts:785, 814, 971-974` does the same for `verify-<id>`.)
- **Broken per-test isolation still present on HEAD:** `tests/batch-merge.test.ts:28, 142` (17 `buildStack`/`batchFixture` calls) and `tests/merge-attempts.test.ts:89, 121` (15+ `buildStack`/`batchFixture` calls — **~32–35 fixture repos total**) run `buildStack()` **in-process** after assigning `process.env.HOME = f.home`, without setting `worktree_root: storeDir(f)` (contrast `tests/batch.test.ts:115, 133`, which does set `worktree_root: storeDir(f)`).
  - Observation 3 proved on Bun 1.4.5 that assigning or deleting `process.env.HOME` in JS **does not change `os.homedir()`** (Bun reads libc `getenv("HOME")`).
  - Observation 5 proved `tests/batch-merge.test.ts` therefore ignores `f.home` and creates empty `akrogon-XXXXXX` dirs under `suiteRoot/home/.akrogon/worktrees/` (outside `f.home`, so `f.clean()` never removes them).
- **How `os.homedir()` resolves to real `/home/ivan` (producing the 35 empty `~/.akrogon/worktrees/akrogon-XXXXXX` dirs):**
  1. **Empty or unset `HOME` in any child process:** Observation 3 proved on Bun 1.4.5 that both `HOME=""` and unset `HOME` make `os.homedir()` fall back to `/etc/passwd` (`/home/ivan`). `src/land.ts:42` emits `--setenv=HOME=${process.env.HOME ?? ''}` (turns unset `HOME` into `HOME=""`), and `src/verify.ts:1031` omits `--setenv=HOME=...` when `env.HOME === undefined` (letting the systemd user manager supply real `HOME=/home/ivan`). Any `--no-isolate` race where `afterEach` deletes `process.env.HOME` (`tests/batch-merge.test.ts:109`, `tests/batch.test.ts:78`, `tests/hold-retired.test.ts:18`, `tests/merge-attempts.test.ts:35`) triggers this in spawned children.
  2. **Running without `tests/isolation.ts`:** Observation 4 proved on Bun 1.4.5 that invoking `bun test` from a subdirectory (e.g. `tests/`) does **not** load root `bunfig.toml` preload. Currently `tests/helpers.ts:19` imports `./isolation` as a side-effect safety net (verified in Observation 5a), so any test or ad-hoc `bun` script that calls `buildStack`/`worktreeStore` without importing `tests/helpers.ts` or loading `bunfig.toml` (or before `helpers.ts` imported `./isolation`, or in a checkout/worktree running a test without preload) writes directly into `/home/ivan/.akrogon/worktrees/akrogon-XXXXXX` (~35 dirs from `batch-merge.test.ts` + `merge-attempts.test.ts` in one unpreloaded run).
  3. **Because `worktreeStore()` ignores `AKROGON_HOME`,** any subprocess given `AKROGON_HOME=f.home` without overriding `HOME` writes its worktree store into `/home/ivan/.akrogon/worktrees/<repo>`.

---

## 2. Material forks

### Fork 1: Where isolation belongs

- **Option 1A — Fix the product propagation gap + harden preload & broken test mutators (Recommended):**
  - Add `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT` to `copied` in `src/run-check.ts:55-64` (matching `AKROGON_HOME` there and matching `src/verify.ts:1001-1002` and `src/land.ts:49-50`).
  - Fix `src/land.ts:42` so it never passes empty `--setenv=HOME=`.
  - Harden `tests/isolation.ts` to also isolate `AKROGON_HOME` (`setEnv('AKROGON_HOME', join(suiteRoot, 'home', '.akrogon'))`), and forward `AKROGON_LEAF_TEMP_ROOT`/`AKROGON_RETIRED_TEMP_ROOT` in `tests/hc-fixture.ts` `cleanEnv`.
  - Fix the test-side isolation bugs: set `worktree_root: storeDir(f)` (and remove the ineffective `process.env.HOME = f.home` / `afterEach` mutation) in `tests/batch-merge.test.ts` and `tests/merge-attempts.test.ts`; serialize or subprocess-isolate concurrent `process.env` mutators in `tests/config.test.ts`, `tests/install.test.ts`, and `tests/hold-retired.test.ts`.
  - *What this could break or invite later:*
    - `tests/run-check.test.ts:168-190` asserts the exact `allowed` env set of `constructedEnv`; it must be updated to include the two forwarded temp root names (same pattern as `fd950485` for `displayEnv`).
    - Adding them to `copied` (not `repoSchema`'s `constructed` reserved set in `src/config.ts:110-125`) keeps existing repo configs and tests that declare `env`/`pass_env: ['AKROGON_LEAF_TEMP_ROOT']` parsing without migration (signpost 6a).
    - Setting `AKROGON_HOME` in `tests/isolation.ts` could affect tests that expect `AKROGON_HOME` to be initially unset (`tests/state-home.test.ts` already explicitly destructures `{ AKROGON_HOME, ...rest } = process.env`, line 54 & 295; must verify `tests/config.test.ts` and `tests/isolation.test.ts` too).
- **Option 1B — Preload-only (strengthen `tests/isolation.ts` alone, no `src/` changes):**
  - *What this breaks or invites later:* **Cannot fix the primary live leak.** `tests/isolation.ts` already sets `HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_RETIRED_TEMP_ROOT`, and `TMPDIR` via both `process.env` and `libc.setenv`. The 4 dirs/run happen *after* `isolation.ts` runs, because `src/run-check.ts` `constructedEnv` strips `AKROGON_LEAF_TEMP_ROOT` before spawning nested `akrogon`. Even removing `suiteRoot` at exit (which `bun test` does not run anyway; see §3) would not touch `/var/tmp/akr-<uid>`.
- **Option 1C — Per-test fixes only (keep `src/run-check.ts` stripping `AKROGON_LEAF_TEMP_ROOT`, patch `state-home.test.ts` and `run-permit.test.ts`):**
  - *What this breaks or invites later:* Invites immediate recurrence. Seven test files already had to add `env`/`pass_env: ['AKROGON_LEAF_TEMP_ROOT']` workarounds, and two still got missed. Every future test running a nested `akrogon` inside `run-check` (and any real operator or test harness running `akrogon run-check` with a custom `AKROGON_LEAF_TEMP_ROOT`) will hit the exact same leak. Violates signpost 1a ("removing the failure class beats guarding it").
- **Option 1D — Make the product refuse an unset `AKROGON_LEAF_TEMP_ROOT` (or real `HOME`) under test (e.g. `NODE_ENV=test` / sentinel env var):**
  - *What this breaks or invites later:* Couples production code (`src/config.ts`) to test-runner detection; breaks legitimate unit tests that verify the default `/var/tmp/akr-<uid>` path (`tests/config.test.ts:1038`, `tests/next.test.ts:2722`); and a sentinel env var set by the test preload would *itself* be stripped by `src/run-check.ts` `constructedEnv`, silently disabling the refusal at the exact boundary that leaked!

### Fork 2: Default `worktreeStore()` root — `homedir()` vs `homePath()` (`AKROGON_HOME`)

- **Option 2A — Keep `worktreeStore()` at `resolve(homedir(), '.akrogon/worktrees', repo.name)` and fix tests + `src/land.ts` (Recommended for minimal blast radius):**
  - *What this could break or invite later:* Preserves current contract for all callers and tests (e.g., if `AKROGON_HOME` points at a tool root during migration, worktrees still land in `~/.akrogon/worktrees`, not inside the repo checkout — see `src/config.ts:397-400` refusing a worktree store inside the checkout!). Leaves a subtle footgun if a future test sets `AKROGON_HOME` without setting `HOME`.
- **Option 2B — Root default `worktreeStore()` under `resolve(homePath(), 'worktrees', repo.name)`:**
  - *What this breaks or invites later:* When `AKROGON_HOME` is unset, `homePath()` equals `resolve(homedir(), '.akrogon')` (identical path). **However**, during pre-cutover state-home tests or unmigrated checkouts where `globalHome()`/`AKROGON_HOME` is the checkout itself, or if an operator sets `AKROGON_HOME` to a non-default path expecting existing worktrees in `~/.akrogon/worktrees` to remain found, it changes the store location and breaks existing `worktreeStore` expectations (`tests/config.test.ts:275`, `tests/reconcile.ts:1384` `storeRoot`). Needs an explicit operator/door decision before changing product path semantics.

### Fork 3: How leftovers are detected so the class cannot return

- **Option 3A — Targeted boundary regression tests (no live-host `/var/tmp/akr-<uid>` suite guard) (Recommended):**
  - Add free boundary tests proving:
    1. `akrogon run-check` forwards `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT` to a nested `akrogon run-check` with no `env`/`pass_env` declaration, and the nested check writes under the caller's override root.
    2. `tests/isolation.test.ts` asserts `HOME`, `AKROGON_HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_RETIRED_TEMP_ROOT`, `TMPDIR`, `homedir()`, `homePath()`, `leafTemp()`, and `worktreeStore()` all resolve under `suiteRoot`.
    3. `tests/batch-merge.test.ts` / `tests/merge-attempts.test.ts` assert `f.home` contains the store and `suiteRoot/home/.akrogon/worktrees` stays untouched.
    4. A guard test (or static check in `tests/isolation.test.ts`) ensures no non-serial `test(` in `tests/*.test.ts` deletes or mutates `process.env.AKROGON_LEAF_TEMP_ROOT` or `process.env.HOME` in-process (or verifies it stays intact).
  - *What this could break or invite later:* Does not catch a brand-new external binary or subprocess that hardcodes `/var/tmp/akr-<uid>` directly bypassing `AKROGON_LEAF_TEMP_ROOT` (though no such binary exists in akrogon).
- **Option 3B — Host-directory diff guard in `tests/isolation.ts` `afterAll` or a wrapper around `bun test` (snapshot `/var/tmp/akr-<uid>` and real `~/.akrogon/worktrees` before and after, fail on any new entry):**
  - *What this breaks or invites later:* **Flaky false positives on shared hosts.** On this machine, live akrogon seats, `akrogon verify` runs, and parallel test runs share `/var/tmp/akr-1000` and `~/.akrogon/worktrees`. In our own Observation 2 (`task-91`), 3 extra dirs appeared in `/var/tmp/akr-1000` during the 95 s suite window from concurrent host activity! A guard inspecting the shared real host dirs will randomly fail green runs whenever any other leaf or consultant runs concurrently. (Also, `afterAll` in a preload runs after *every file* under `--parallel --no-isolate`, multiplying race windows.)
- **Option 3C — Private-root wrapper guard (run suite with a wrapper setting sentinel `HOME` + `AKROGON_LEAF_TEMP_ROOT` and check those private roots stay empty on exit):**
  - *What this breaks or invites later:* If the suite runs with `AKROGON_LEAF_TEMP_ROOT=<sentinel>`, it only catches leaks that *honor* `AKROGON_LEAF_TEMP_ROOT` (which are already isolated inside `suiteRoot`), not code that *strips* `AKROGON_LEAF_TEMP_ROOT` and falls back to `/var/tmp/akr-<uid>`! And `tests/isolation.ts` overwrites `HOME` and `AKROGON_LEAF_TEMP_ROOT` anyway. Adds a wrapper layer (against signpost 3a "fewest moving parts") without catching the actual escape class.

### Fork 4: Should `reconcileHost` (`src/reconcile.ts`) play any part?

- **Option 4A — No; keep `reconcileHost` conservative (Recommended):**
  - `src/reconcile.ts:1380-1409` was deliberately narrowed in `dc426cd7` (#151) so a host sweep never deletes directories owned by another `AKROGON_HOME`. That safety invariant is sound and should stay untouched.
- **Option 4B — Have `reconcileHost` delete empty or aged unknown dirs under `/var/tmp/akr-<uid>` and `~/.akrogon/worktrees`:**
  - *What this breaks or invites later:* Reintroduces cross-home interference (#151): an empty leaf temp dir created by `ensureLeafTemp` before a seat or check writes into it (or an empty worktree store for an active repo in another home) can be deleted mid-flight. Worse, it masks future test leaks instead of fixing them (violating signpost 1a).

---

## 3. Practitioner questions and pitfalls

Grounded in inspected source files, primary Bun docs (read 2026-11-25 via `bun.sh` / `bun.com` docs on `[test]` `bunfig.toml`, `preload`, `--parallel`, `--isolate`/`--no-isolate`, and `beforeAll`/`afterAll` lifecycle), and direct probes on Bun `1.4.5`:

1. **`bun test` never runs `process.on('exit')` handlers.** Confirmed in `tests/isolation.ts:20`, `git show 02dc5f91`, and Observation 4 on Bun 1.4.5 across default, `--parallel --isolate`, and `--parallel --no-isolate`. Any design relying on `process.on('exit')` to delete `suiteRoot` will leak every worker's scratch root.
2. **Preload `afterAll` runs *per file*, not *per worker*, under `--parallel=4 --no-isolate`.** Observation 4 proved on Bun 1.4.5 that with `--parallel=2 --no-isolate`, preload top-level code executes once per worker, while `beforeAll` and `afterAll` registered in the preload execute around **every single test file** in that worker. Deleting `suiteRoot` inside preload `afterAll` would delete `HOME`, `TMPDIR`, `GIT_TEMPLATE_DIR`, and `AKROGON_LEAF_TEMP_ROOT` after file 1 and crash files 2..N in the same worker.
3. **`process.env.HOME = ...` does not update `os.homedir()` in Bun 1.4.5, and empty/unset `HOME` falls back to `/etc/passwd`.** Observation 3 proved `os.homedir()` reads libc `getenv("HOME")` (not JS `process.env.HOME`), and when libc `HOME` is unset or `""`, `os.homedir()` returns `/home/ivan`. Only `libc.setenv('HOME', ...)` (as in `tests/isolation.ts:57-60`), a spawned child's `env`, or explicit `worktree_root` redirects `worktreeStore()` in-process.
4. **Running `bun test` from a subdirectory skips root `bunfig.toml` preload.** Observation 4 proved `bun test t1.test.ts` with `cwd = <repo>/tests` does not run `[test].preload` from `<repo>/bunfig.toml`. Today `tests/helpers.ts:19` imports `./isolation` as a side effect, saving tests that import `helpers.ts`, but any test file that does not import `helpers.ts` runs unisolated from a subdir.
5. **`tests/run-check.test.ts:168-190` pins the exact allowlist of `constructedEnv`.** Adding `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT` to `copied` in `src/run-check.ts:55-64` will immediately fail that allowlist test unless updated alongside it (just as `fd950485` updated it when `displayEnv` was added).
6. **Backward compatibility with existing `issues/config.yaml` files (`src/config.ts:110-137`).** Do **not** add `AKROGON_LEAF_TEMP_ROOT` or `AKROGON_RETIRED_TEMP_ROOT` to `repoSchema`'s `constructed` reserved set (`src/config.ts:110-125`). At least 7 existing test fixtures (and potentially external repos) already list `AKROGON_LEAF_TEMP_ROOT` in `env` or `pass_env`; reserving it would break them, violating signpost 6a ("old records keep parsing"). Notice `AKROGON_HOME` is also in `copied` (`src/run-check.ts:62`) and deliberately absent from `constructed` (`src/config.ts:110-125`) for the same reason.
7. **Concurrent `process.env` mutations in `--no-isolate` + `concurrentTestGlob = "**/*.test.ts"`.** `tests/config.test.ts` (36 concurrent `test()`, 0 `test.serial()`), `tests/install.test.ts` (9 concurrent `test()`, 0 `test.serial()`), and `tests/hold-retired.test.ts` mutate `process.env.AKROGON_LEAF_TEMP_ROOT`, `AKROGON_RETIRED_TEMP_ROOT`, `AKROGON_HOME`, `HOME`, and `PATH` in-process. Because `tests/config.test.ts:1042` deletes `AKROGON_LEAF_TEMP_ROOT`, any concurrent save/restore can permanently wipe the preload's override for the rest of the worker's lifetime.
8. **`LESSONS.md` `run-check TMPDIR cross-device` (2026-10-22) and `run-check drops kept evidence` (2026-11-15, 2026-11-20):** Forwarding `AKROGON_LEAF_TEMP_ROOT` in `constructedEnv` does **not** alter `TMPDIR` or `run_root` (RAM TMPDIR) or `AKROGON_EVIDENCE` behavior for top-level or nested checks — it only ensures a nested `akrogon` shares the caller's leaf-temp root instead of escaping to `/var/tmp/akr-<uid>`.
9. **Shared-host interference on `/var/tmp/akr-<uid>`:** Any verification or CI step that asserts "zero new dirs in `/var/tmp/akr-<uid>`" on a machine with active seats or concurrent runs will observe false positives (seen in Observation 2). Prove the fix via isolated boundary tests plus a quiet-host verification run, not a permanent shared-host assertion inside `bun test`.

*(Note on primary doc citations: `search_web` returned `bun.sh` / `bun.com` doc summaries for `[test]` `bunfig.toml`, `preload`, `--parallel`, `--isolate`/`--no-isolate`, and `beforeAll`/`afterAll` via Google grounding redirects on 2026-11-25; every runtime detail that matters for the design — `process.on('exit')`, preload `afterAll` frequency under `--no-isolate`, subdir `bunfig.toml` discovery, and `os.homedir()` vs `process.env.HOME` — was additionally verified directly against local Bun `1.4.5`.)*

---

## 4. Recommended direction, cost, free boundary proof, and open questions

### Recommended direction (one leaf, per signpost 4a)

Combine **Option 1A + Option 2A + Option 3A + Option 4A**:

1. **Product (`src/run-check.ts:55-64`):** Add `'AKROGON_LEAF_TEMP_ROOT'` and `'AKROGON_RETIRED_TEMP_ROOT'` to `copied` in `constructedEnv`, directly beside `'AKROGON_HOME'` (with a brief comment mirroring `AKROGON_HOME`'s rationale). Do **not** add them to `repoSchema`'s `constructed` reserved set (`src/config.ts:110-125`).
2. **Product (`src/land.ts:42`):** Only pass `--setenv=HOME=${home}` when `process.env.HOME` is non-empty (or fall back to `homedir()`), never `--setenv=HOME=` which silently reverts Bun's `os.homedir()` to `/etc/passwd`.
3. **Suite preload & shared test fixtures (`tests/isolation.ts`, `tests/hc-fixture.ts`):**
   - In `tests/isolation.ts`, set `AKROGON_HOME` to `join(suiteRoot, 'home', '.akrogon')` via `setEnv` (or verify whether any test needs `AKROGON_HOME` unset; note `state-home.test.ts` already strips it explicitly).
   - In `tests/hc-fixture.ts:285-301` (`cleanEnv`), forward `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT` when defined in `process.env`.
4. **Fix broken test-side isolation:**
   - `tests/batch-merge.test.ts` and `tests/merge-attempts.test.ts`: set `worktree_root: storeDir(f)` in `batchFixture`/`soloFixture`/`restack` (matching `tests/batch.test.ts:115, 133`) and remove the ineffective `process.env.HOME = f.home` + module-level `originalHome`/`originalTempRoot` `afterEach` mutation.
   - `tests/config.test.ts` (`420, 717, 780, 1020, 1038, 1128, 1167`), `tests/install.test.ts` (`selfUpdateFixture` / `withHome`), and `tests/hold-retired.test.ts`: stop mutating `process.env.AKROGON_LEAF_TEMP_ROOT` / `AKROGON_HOME` / `HOME` inside concurrent `test(...)` blocks (use `test.serial` or spawn a child process for the unset-`AKROGON_LEAF_TEMP_ROOT` default-path test, as `tests/next.test.ts:2722` already does).
   - Update `tests/run-check.test.ts:168-190` `allowed` set to include `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT`.
5. **Leave `reconcileHost` (`src/reconcile.ts:1380-1409`) untouched.**

**Cost:** Small, single-leaf change (~5–8 files touched, mostly mechanical test hygiene + 2 lines in `src/run-check.ts` + 1–2 lines in `src/land.ts`). Zero schema/record migrations, zero new config knobs, zero runtime overhead.

### Free tests at the real boundary that prove it

1. **Nested `run-check` propagation test (`tests/run-check.test.ts`):** With a fixture `issues/config.yaml` declaring **no** `env` or `pass_env` for `AKROGON_LEAF_TEMP_ROOT` or `AKROGON_RETIRED_TEMP_ROOT`, run `akrogon run-check` whose child runs a nested `akrogon run-check` printing `$AKROGON_LEAF_TEMP_ROOT`, `$AKROGON_RETIRED_TEMP_ROOT`, and `$TMPDIR`; assert both overrides match the caller's fixture roots, the nested `$TMPDIR` starts with `leafTempRoot(f)`, and the nested run creates its dir inside `leafTempRoot(f)` (never under `/var/tmp/akr-<uid>`).
2. **`state-home.test.ts` and `run-permit.test.ts` boundary check:** Assert in `tests/state-home.test.ts:265-335` that the nested run created its temp under `resolve(home, 'leaf-temp')` (already in the fixture env!) and zero entries outside it; same for `tests/run-permit.test.ts` nested runs.
3. **In-process `buildStack` store isolation (`tests/batch-merge.test.ts` / `tests/isolation.test.ts`):** Assert `suiteRoot/home/.akrogon/worktrees` receives no `akrogon-XXXXXX` dir from `batch-merge.test.ts` / `merge-attempts.test.ts`, and assert `tests/isolation.test.ts` covers `AKROGON_HOME` / `homePath()` alongside `HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_RETIRED_TEMP_ROOT`, and `TMPDIR`.
4. **`land` empty-`HOME` unit check (`tests/green-merge.test.ts` or `tests/display-env.test.ts`):** Assert `launchLand` never emits `--setenv=HOME=` when `HOME` is unset.
5. **Verification run:** Run `tests/state-home.test.ts` and `tests/run-permit.test.ts` before/after diffing `/var/tmp/akr-<uid>` and `~/.akrogon/worktrees` (confirming 4 -> 0 new dirs), then run the repo `test` check once on a quiet host.

### Open questions not settled by intake

1. **`worktreeStore()` under `homePath()` vs `homedir()` (Fork 2):** Should default `worktreeStore(repo)` remain `resolve(homedir(), '.akrogon/worktrees', repo.name)` (minimal change, safe when `AKROGON_HOME` is a checkout) or move to `resolve(homePath(), 'worktrees', repo.name)`?
2. **`AKROGON_HOME` in `tests/isolation.ts`:** Confirm setting `AKROGON_HOME` in `tests/isolation.ts` is wanted (every CLI test overrides it anyway; setting it in preload protects in-process tests when the caller has `AKROGON_HOME` set, while tests of unset `AKROGON_HOME` like `tests/state-home.test.ts` already strip it explicitly).
3. **Cleanup of the 7 redundant `env`/`pass_env: ['AKROGON_LEAF_TEMP_ROOT']` declarations in existing test fixtures:** Remove them in the same leaf to prove `constructedEnv` carries `AKROGON_LEAF_TEMP_ROOT` everywhere, or leave untouched (and keep 1 dedicated test proving old configs listing `AKROGON_LEAF_TEMP_ROOT` in `env`/`pass_env` still parse)?
4. **`suiteRoot` leftovers when running bare `bun test` inside a live seat:** Since `bun test` never runs `process.on('exit')`, bare `bun test` (outside `run-check`) leaves one `akrogon-suite-<pid>-*` in `TMPDIR` until the next `bun test` starts. Is the existing dead-worker sweep in `tests/isolation.ts:31-50` sufficient (since `issues/config.yaml`'s `test` check runs under `akrogon run-check`, whose run scratch is removed at exit), or does the door also want `package.json`'s `bun run test` wrapper to sweep its own scratch root?

---

## 5. Free observations log

All observations run on 2026-11-25 with `bun 1.4.5` in `/home/ivan/Work/infra/akrogon` (HEAD `64681915`). No pre-existing host directories or processes were modified or deleted.

1. **Observation 1 — Isolate suspect test files (`tests/state-home.test.ts`, `tests/run-permit.test.ts`)**
   - Command: `bun test --timeout=120000 tests/state-home.test.ts` and `bun test --timeout=120000 tests/run-permit.test.ts` (each bracketed by snapshots of `/var/tmp/akr-1000` and `~/.akrogon/worktrees`).
   - Date / version: 2026-11-25T12:09Z, Bun `1.4.5`.
   - Result: Both exited `0`. `tests/state-home.test.ts` created 1 empty leaf dir (`c4cb/37a2de63`) in `/var/tmp/akr-1000` and 0 in `~/.akrogon/worktrees`. `tests/run-permit.test.ts` created 3 empty leaf dirs (`29aa/2cabc955`, `90b7/eade3453`, `aea1/50f20b84`) in `/var/tmp/akr-1000` and 0 in `~/.akrogon/worktrees`.
   - Cleanup: Removed only the 4 newly created dirs (and their newly created empty `<hash4>` parents); verified post-cleanup diff = `[]` for both roots.
   - Limits: Ran only two files sequentially; did not test cross-file `--no-isolate` races.

2. **Observation 2 — Single full-suite run (`issues/config.yaml` `test` command)**
   - Command: `bun test --timeout=120000 --parallel=4 --max-concurrency=5 --no-isolate` (once, in main checkout).
   - Date / version: 2026-11-25T12:10:44Z–12:12:19Z, Bun `1.4.5`.
   - Result: 1463 pass / 2 fail (`frozen guard` tests, unrelated) across 91 files in 94.88 s. Diff on `/var/tmp/akr-1000`: 7 new empty `<hash4>/<hash8>` dirs (`21f1/f512b04d`, `2ffd/c93ebd45`, `4847/a28807de`, `6008/52aabbb4`, `c36b/ef12161b`, `c500/80ff8356`, `e061/fdf08f9d`). Diff on `~/.akrogon/worktrees`: 0 new entries.
   - Cleanup: Removed only the 7 newly created dirs and their newly created empty `<hash4>` parents; verified post-cleanup diff = `[]`.
   - Limits: Shared host — other processes (parallel slots/watcher) were active during the 95 s window (and a standalone 3-dir cluster was already observed at 12:06:31Z while this slot ran no tests), which likely accounts for the extra 3 dirs beyond the 1 + 3 = 4 reproduced in Observation 1.

3. **Observation 3 — Bun `1.4.5` `os.homedir()` vs `process.env.HOME`**
   - Command: `bun -e` probing `os.homedir()` after `process.env.HOME = '/tmp/override-js'`, `process.env.HOME = ''`, and `delete process.env.HOME`, plus fresh processes with `HOME` unset or `HOME=""`.
   - Date / version: 2026-11-25T12:08Z, Bun `1.4.5`.
   - Result: In-process JS assignment, empty string, and `delete` on `process.env.HOME` all left `os.homedir()` returning the startup value (`/tmp/initial-env`). At startup, both unset `HOME` and `HOME=""` caused `os.homedir()` to return `"/home/ivan"`.
   - Cleanup: No files or dirs created.
   - Limits: Linux (`glibc`) only; matches target host.

4. **Observation 4 — Bun `1.4.5` `bunfig.toml` preload, `afterAll`, `process.on('exit')`, and subdir discovery**
   - Command: `bun test` with `[]`, `['--parallel=2', '--no-isolate']`, `['--parallel=2']`, and `bun test t1.test.ts` from `cwd=tests/` in a throwaway dir `/tmp/bun-preload-probe-q3gjcd5t`.
   - Date / version: 2026-11-25T12:11Z, Bun `1.4.5`.
   - Result: `process.on('exit')` never fired in any mode. Under `--parallel=2 --no-isolate`, preload top-level ran once per worker while preload `beforeAll`/`afterAll` ran once per test file. Running `bun test` from `cwd=tests/` skipped root `bunfig.toml` preload entirely.
   - Cleanup: Removed `/tmp/bun-preload-probe-q3gjcd5t` and verified gone.
   - Limits: Minimal 3-file harness; confirms runner semantics directly.

5. **Observation 5 — `tests/batch-merge.test.ts` `buildStack` worktree-store escape**
   - Command:
     - 5a: `bun test batch-merge.test.ts -t "a green holder pushes once"` from `cwd=tests/` with throwaway `HOME`, `TMPDIR`, and `AKROGON_LEAF_TEMP_ROOT` under `/tmp/obs-wt-leak-bvm27505`.
     - 5b: `bun test tests/batch-merge.test.ts -t "a green holder pushes once"` from repo root with `TMPDIR=/tmp/obs-preload-wt-9xja5ard`.
   - Date / version: 2026-11-25T12:13Z, Bun `1.4.5`.
   - Result:
     - 5a exited `0` with `{}` in `<HOME>/.akrogon/worktrees` because `tests/batch-merge.test.ts` imports `tests/helpers.ts`, which statically imports `./isolation`, activating `libc.setenv('HOME', ...)` even without `bunfig.toml`.
     - 5b exited `0`, left `akrogon-suite-1134722-HSYo13` in `TMPDIR`, and left an empty `akrogon-BkTc80` directory inside `akrogon-suite-1134722-HSYo13/home/.akrogon/worktrees/` — proving `process.env.HOME = f.home` fails to keep `buildStack` inside `f.home`.
   - Cleanup: Removed both throwaway dirs and verified gone.
   - Limits: Single test case of `batch-merge.test.ts`; the same `batchFixture` pattern repeats 17 times in `batch-merge.test.ts` and 15+ times in `merge-attempts.test.ts`.
