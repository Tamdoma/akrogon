# Slot C analysis — `paid-budget` deadline teardown (`1b978eef`)

## 1. Judging A's candidate (empirical check on this host)

### Critical finding: `hc` escapes the caller's cgroup under `watch-tier.ts` today

In `tests/e2e/watch-tier.ts:124-135`, `coreEnv` sets `XDG_RUNTIME_DIR: realRuntime` (`/run/user/1000`, which contains `/run/user/1000/systemd`) and `DBUS_SESSION_BUS_ADDRESS: unix:path=/run/user/1000/bus`.

Empirically tested on this host (`herdr-core 0.1.22`) by running `hc server start` + `hc run --bg -- sleep 30` inside a transient systemd scope (`akrogon.slice/akr-cgprobe2-...scope`):

1. **With `XDG_RUNTIME_DIR=/run/user/1000` (current `watch-tier.ts:129`):**
   - Caller: `.../akrogon.slice/akr-cgprobe2-...-real_runtime.scope`
   - `herdr-core serve`: **`.../app.slice/hc-serve-<hash>.service`** (escaped)
   - `hc run` terminal (watcher / consultant / timer): **`.../app.slice/hc-hold-<hash>.service`** (escaped)
   - Additionally, `akrogon next` (`src/seat.ts:280-286`) spawns leaf seats into `akrogon.slice/akrogon-l<hash>.slice`, and consultant-run `akrogon run-check`/`verify` (`src/scope.ts:36-57`) spawns units into `akrogon.slice` unless `AKROGON_RUN_SLICE` is set.
   - **Verdict on A's candidate as-is:** **Fails.** Killing the test's scope kills only the `hc` CLI clients and leaves the core, paid watcher, and paid consultant running in `app.slice`.

2. **With a scratch `XDG_RUNTIME_DIR` lacking a `systemd` symlink** (the same pattern `tests/hc-fixture.ts:5-6, 200-223` already uses: `/run/user/1000/<dir>` with `herdr-core/` and a `bus` symlink, no `systemd` symlink):
   - Caller: `.../akrogon.slice/akr-cgprobe2-...-scratch_no_systemd_link.scope`
   - `herdr-core serve`: **stayed inside the caller's scope**
   - `hc run` terminal: **stayed inside the caller's scope**

3. **Kernel kill primitive verified on this host:**
   - On a transient slice under `akrogon.slice` (`akrogon-e2e<pid>.slice` — no extra hyphen so its parent is `akrogon.slice`, leaving zero intermediate slices), both `cgroup.kill` (`--w-------`, owned by `ivan:ivan`) and `systemctl --user kill --signal=SIGKILL <slice>` immediately kill `trap '' TERM` processes (`cgroup.events` flips `populated 1` → `populated 0` in <100 ms).

### Two more requirements A's candidate must satisfy to work
- **Supervisor outside the killed cgroup:** `bun test` (`watch-consults.e2e.ts`) cannot live inside the scope it `SIGKILL`s, or it dies before preserving `outcome`, writing `absence.json`/`paid-sessions.json`, and removing state. The outer `bun test` must stay outside and spawn the test body in **one** child process inside `akrogon-e2e<pid>.slice` (one `systemd-run --user --scope` call total, zero per-`hc` overhead).
- **Incremental evidence files:** The inner process writes `stage`, consultant `created` addresses, and any pre-deadline `outcome` (written **before** diagnostic screen reads) into `<out>/`, so a `SIGKILL` at the deadline (even mid-diagnostics) never loses the selected red or session count.

---

## 2. Recommendation: Fixed A's candidate (supervisor-outside + child-in-slice + scratch `coreRuntime` + `cgroup.kill`)

### Concrete shape
1. **Scratch `coreRuntime` in `tests/e2e/watch-tier.ts:15, 50-52, 124-139`:** Put the core's `XDG_RUNTIME_DIR` at `resolve(realRuntime, session)` (`/run/user/1000/akr-e2e-watch`, socket path 58 bytes < 107) with `herdr-core/` and a `bus` symlink, **no `systemd` symlink** (mirroring `tests/hc-fixture.ts:200-223`). Every consumer (`tier.hc`, `tier.rpc`, `tier.runtime` symlink, `observe`) already reads `tier.coreEnv`/`tier.runtime`; no `herdr-app` window opens (`watch-tier.ts:3`). Update `absent()` (`watch-tier.ts:50-52`) to check `[coreRuntime, coreState]`.
2. **One killable slice (`akrogon-e2e<pid>.slice`) around the inner body (`tests/e2e/watch-consults.e2e.ts:152-483`):**
   - Outer `bun test` launches an inner runner (same script or helper via env gate) inside `systemd-run --user --scope --slice=akrogon-e2e<pid>.slice` with `AKROGON_RUN_SLICE=akrogon-e2e<pid>.slice`.
   - Every child (`herdr-core serve`, `pi` watcher, `agy` consultant, `watch-timer`, pending `hc run` launches, diagnostic `hc read` clients, and any consultant `akrogon verify`/`run-check` scopes) stays inside `akrogon-e2e<pid>.slice`.
   - Only `akrogon next`'s resumed leaf seat (`src/seat.ts:286`, free `fake` stand-in at `watch-consults.e2e.ts:173-174`) lands in the single deterministic `leafSlice({ name: 'akre2e' }, SLUG, home)`, which teardown stops alongside the slice.
3. **One idempotent `killSlice()` for both deadline and teardown:**
   - Synchronously writes `'1'` to `/sys/fs/cgroup/.../akrogon.slice/akrogon-e2e<pid>.slice/cgroup.kill` (zero D-Bus, zero stop-client subprocesses; falls back to `systemctl --user kill --signal=SIGKILL` if missing), waits for `cgroup.events` to stop reporting `populated 1` (bounded), stops `akrogon-e2e<pid>.slice` and the one `leafSlice`, then removes `coreRuntime`, `coreState`, and `tier.paths`.
   - Delete `stopAndBlockCore`, `blockSocket`, `unblockSocket` (`tests/e2e/watch-tier.ts:212-216`, `tests/hc-daemon.ts:39-48`).
4. **Keep `tests/hc-daemon.ts:31` (`stopDaemon`) fixed in 1 line for `tests/hc-fixture.ts:13, 61`:** Pass `killSignal: 'SIGKILL'` to `spawnCaptured` (`src/shell.ts:45` already supports it), closing F12 for `hc-fixture.ts` and `tests/hc-daemon.test.ts` too.

### What this removes (all four round-8 races by construction)
- **F10 (`watch-consults.e2e.ts:455-460`, `watch-tier.ts:221-234`):** Teardown never runs `terminal.list`/`hc kill`/`hc rm` before killing; `killSlice()` is the first teardown step and the deadline timer stays armed through inner diagnostics. Because the inner process writes `outcome.json` before diagnostics start, a deadline kill mid-diagnostics stops the watcher immediately while the outer supervisor preserves the pre-deadline red.
- **F11 (`watch-tier.ts:213-215`, `hc-daemon.ts:41-44`):** `cgroup.kill` atomically `SIGKILL`s both the core and every pending `hc run` launch client in one kernel operation — no client survives to connect or auto-start a replacement core.
- **F12 (`hc-daemon.ts:30-35`):** Deadline and teardown never spawn an `hc server stop` client that can hang or ignore `SIGTERM`; `cgroup.kill` kills `trap '' TERM` processes immediately and `cgroup.events` confirms `populated 0` before deleting state.
- **F13 (`watch-consults.e2e.ts:205-208, 442-452`):** `killSlice()` is invoked inside the supervisor with its error captured (never an unhandled rejection from `setTimeout`), and the outer supervisor always keeps `outcome` primary with any teardown error appended (`:477-480`).

### What it could break / watch-outs
- **`watch-live.e2e.ts` and `watch-stop.e2e.ts` share `watch-tier.ts`:** Both use `tier.coreEnv`/`tier.runtime` and open no `herdr-app` window (`watch-tier.ts:3`); moving `coreEnv.XDG_RUNTIME_DIR` to `resolve(realRuntime, session)` works for both, as long as `absent()` (`watch-tier.ts:50-52`) checks `coreRuntime` (and `watch-stop` / `watch-live` still call `stopWatchTier`).
- **Existing `watch-consults-deadline.e2e.ts` probes:** Probes that wrap `hc` on `PATH` (slow `hc read`, pending `hc run`, slow teardown) continue to work unchanged because the inner process inherits `PATH`. The F12/F13 probes that specifically mocked `hc server stop` returning `{"stopped":false}` or ignoring `SIGTERM` move to `tests/hc-daemon.test.ts` (for `hc-fixture.ts`), while `watch-consults-deadline.e2e.ts` tests deadline kill + `populated 0` + preserved red directly.
- **Unit cleanup:** Use `akrogon-e2e<pid>.slice` (single hyphen under `akrogon.slice`) and stop it in teardown so no empty parent slice leaks in systemd.
