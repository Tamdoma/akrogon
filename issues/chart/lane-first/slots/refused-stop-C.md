# Slot C analysis — `lane-first` refused-stop architecture (`e5b59a07`)

## 1. Host data: how often does `systemctl --user stop` actually fail here?

Queried the last 30 days of user-systemd journal (`journalctl --user _COMM=systemd --since "30 days ago"`, 638,770 lines), `akrogon-listener.service`, `dbus-broker`, and `~/.akrogon/verify-passes/`:

- **~185,731** `akrogon-*` unit/slice starts and **22,631** `akrogon-run-*` unit stops logged by the user manager.
- **0 real refused stops** (`Access denied`, `Failed to stop`, `Operation not permitted`) on `akrogon-run-*`, `akrogon-verify-*`, or `akrogon-land-*`.
- The **456** `Stopping timed out. Killing.` / `Failed with result 'timeout'` entries are normal `TimeoutStopSec=5` escalations to `SIGKILL` — systemd succeeds at killing the scope and `systemctl --user stop` returns exit `0`.
- The **27** `Transaction ... is destructive` entries (Nov 17–18) and **32** `Failed with result 'resources'` entries (Nov 23) were **start** failures (pre-`8eef2d0b` slice-stop races and today's 32k leaked-slice buildup), not stop refusals.
- The **only** `systemctl --user stop` error in `~/.akrogon/verify-passes/` was a test fixture failure from `lane-first`'s own `stopRunUnits` throwing `Failed to connect to user scope bus` on a `fake-systemd-run.sh` test (the exact mismatch that produced `tests/helpers.ts:100-119` and F19).

**Takeaway:** Draining background workers inside a scope after the main process exits (F15) are real and frequent (456× in 30 days). Refused stops (F16–F19) are rare/fault-injected, so the mechanism that protects against them must be **simple and self-healing by construction**, not a multi-actor state machine that breeds a new race every round.

---

## 2. Why rounds 9–10 kept hitting new holes

`e5b59a07` mirrors systemd scope liveness into a mutable YAML field (`record.unstopped` at `src/admission.ts:45, 94`) updated by three uncoordinated actors:
1. `withAdmission`'s `end()`/`finally` (`src/admission.ts:365-377`), which wrote the stale pre-promotion `state: 'waiting'` record with `unstopped: true` (F16).
2. `guard.service` (`src/scope.ts:101`), which runs `rm -f <record>` **before** `systemctl --user stop` (F17).
3. Concurrent `sweepStale()` callers (`src/admission.ts:282-308`), which can write `unstopped: true` back after another caller already confirmed stop and deleted the file (F18).

Separately, `src/land.ts:192` stamps land hold records with a synthetic nonexistent `unit: akrogon-run-<uuid>.scope`, and `tests/helpers.ts:100-119` sniffs `XDG_RUNTIME_DIR/bus` instead of gating on the fake runner (F19).

---

## 3. Options weighed

### O1 — Keep record-based holds; add per-run lock + guard stop-before-delete
- **Changes:** Per-run flock around `stopRunUnits` + record updates in `src/admission.ts:282-308, 365-377` (F16, F18); rewrite `guard.service` (`src/scope.ts:101`) so it stops before `rm -f` AND handles exit-5 `not-found` via `systemctl show` or an `akrogon` subcommand (F17); bind `tests/helpers.ts:100-119` shim to fake runner (F19); skip synthetic land units in `sweepStale`.
- **What it breaks / invites later:**
  - Keeps the split-brain model (YAML `unstopped` mirroring systemd state across three actors).
  - Holding a per-run flock across `stopRunUnits` (`TimeoutStopSec=5` + D-Bus latency) inside `awaitTurn`'s `sweepStale` (`src/admission.ts:198`) stalls unrelated admission polls or invites lock-order bugs against `admission.lock` / `lineLock(repo)`.
  - `systemctl --user stop` exits non-zero (code 5) when a scope already exited cleanly, so fixing F17 in `guard.service` (`src/scope.ts:101`) cannot be a plain `systemctl stop && rm -f` — it must duplicate `stopRunUnits`'s `show`-fallback + per-run lock in shell or spawn a `bun` subcommand on every wrapper death.
- **Cost:** Medium-high ongoing complexity (~100 lines, new lock family, heavier guard).

### O2 — The hold is the systemd unit itself (per-repo slice; record is metadata only)
- **Changes:** Put a repo's land/run units under a per-repo slice and query systemd in admission to see if the repo is held.
- **What it breaks / invites later:**
  - **Does not eliminate run records:** FIFO arrival order (`since`/`token_hash`, `src/admission.ts:156, 183-184`), `full` vs non-`full` checks (`:216-221`), nested runs (`AKROGON_RUN`, `:122-132`), land's own checks bypassing its hold (`hold.attempt !== run.attempt`, `:155`), and gaps between verify passes inside `landAttempt` (`src/land.ts:213-225`, where `land` runs in `leafSlice` at `:34` and no `akrogon-run-*` exists) still require records.
  - **Breaks sync callers and `lineLock` latency:** `live()`, `liveRuns()`, `lineRuns()`, `nested()`, `callerScope()` (`src/admission.ts:99-186, 310`) are all synchronous, called every `POLL_MS = 1000` inside exclusive `lineLock(repo)` (`:199-231`) and from `akrogon status`. Running `systemctl` inside `lineLock` adds D-Bus latency under the exclusive lock.
  - **Breaks unit-test isolation:** `fake-systemd-run.sh` (`tests/helpers.ts:99`) creates no systemd units; `tests/run-units.test.ts:60` overrides `AKROGON_RUN_SLICE` to `akrogon-test-<pid>-<n>.slice`; dynamic per-repo slices also introduce a new persistent-empty-slice leak surface.
- **Cost:** High invasive rewrite across `admission.ts`, `land.ts`, `verify.ts`, `stop.ts`, `scope.ts`, `install.ts`, and all admission tests.

### O3 — Refused stop fails loudly and blocks the repo line with an operator marker (no sweep retry)
- **Changes:** Drop `unstopped` and sweep retries (`src/admission.ts:45, 282-308`); on any refused stop (`stop.ts`, `admission.ts:366`), write `<globalHome>/runs/blocked-<repo>.yaml` (with `boot_id` and unit list) under `admission.lock` + `lineLock(repo)`; `awaitTurn` refuses new runs of that repo until `akrogon stop` confirms all listed units are gone and unlinks the marker.
- **What it breaks / invites later:**
  - **Permanently wedges unattended repos on a transient hiccup:** Even if the draining worker exits 2 seconds later on its own, the repo stays blocked until an operator manually runs `akrogon stop` (reintroducing the exact unattended-wedge risk we removed `SIGSTOP` to avoid).
  - **Does not automatically solve F17 or F19:** `guard.service` (`src/scope.ts:101`) still deletes the record before stopping (so a `SIGKILL`ed wrapper + refused stop either loses the hold or forces guard to write the marker), and `admission.end()` still invokes `stopRunUnits` on `fake-systemd-run.sh` tests (F19 still needs fixing).
  - Needs multi-leaf unit-set merging and `boot_id` expiry on the marker file.
- **Cost:** Medium, plus new operator failure mode (wedged repo lines).

### O4 (added option) — Kernel cgroupfs ground truth for scope liveness (no `unstopped`, no sweep writes)
Every real `akrogon-run-<id>.scope` already lives at a deterministic cgroup v2 directory under `cgroupRoot()` (`src/scope.ts:145-150`; path helper already written at `tests/run-units.test.ts:37-47`), with a kernel-maintained `cgroup.events` file containing `populated 1` iff any process (direct or nested descendant) is still alive in the scope (verified readable on this host: `-r--r--r--` `populated 1` while running, `populated 0` / `ENOENT` once drained).

- **Changes (~35 lines net, deletes `unstopped`):**
  1. Promote `scopeEventsPath(slice, unit)` into `src/scope.ts` (using `cgroupRoot()`, replacing the duplicate helper in `tests/run-units.test.ts:37-47`) and add synchronous `scopePopulated(slice, unit): boolean` (`readFileSync(eventsPath)` includes `populated 1`; `ENOENT` → `false`, ~50 µs, zero D-Bus).
  2. In `src/admission.ts:93-94`, replace `record.unstopped === true` with `scopePopulated(record.slice, record.unit)`:
     ```ts
     const ownLive = (record: RunRecord, boot: string): boolean =>
       record.boot_id === boot &&
       (liveStartTime(record.pid) === record.start_time ||
         (record.land !== true && scopePopulated(record.slice, record.unit)));
     ```
     Delete `unstopped` from `recordSchema` (`:45`), `end()` (`:365-372` only stops units and marks `ended` on success; on refusal it leaves the existing `state: 'live'` record untouched), and `finally` (`:375-376` unlinks only when `record.land === true || !scopePopulated(record.slice, record.unit)`).
  3. In `src/admission.ts:282-308` (`sweepStale`): **never call `writeRecord()`**. If `record.land !== true && liveStartTime(record.pid) !== record.start_time && scopePopulated(record.slice, record.unit)`, best-effort call `stopRunUnits(...recordUnits(record))` (logging warning on refusal). Only `rmSync(path, { force: true })` once `!live(record, boot)` (and never call `stopRunUnits` on a `record.land === true` synthetic unit).
  4. In `src/scope.ts:101` (`startRunGuard`): stop first, then delete the record only if the scope cgroup is no longer populated:
     ```sh
     tail --pid=${wpid} -f /dev/null; systemctl --user stop ${base}.scope; grep -qx 'populated 1' ${quote(eventsPath)} 2>/dev/null || rm -f ${quote(recordPath)}
     ```
  5. Fix F19 in `tests/helpers.ts:100-119`: gate the fake `systemctl` shim on an explicit env var (`AKROGON_FAKE_SYSTEMD_RUN=1` set in `cli()` and cleared in `tests/run-units.test.ts`'s `spawnReal`) instead of sniffing `XDG_RUNTIME_DIR/bus`.
- **How it removes the whole F16–F19 class by construction:**
  - **F15 & F16:** A draining scope has `populated 1` in the kernel regardless of whether `end()` failed or `state` wasn't rewritten; the record stays `state: 'live'`, `live(landHold)` stays `true`, and `akrogon stop` retry finds and stops it.
  - **F17:** Guard runs `systemctl stop` first and checks `cgroup.events` before `rm -f` — works identically whether `systemctl stop` returns `0` or `5` (`not-found`), and preserves the record whenever processes remain after a refused stop.
  - **F18:** `sweepStale` never writes or resurrects any record; `rmSync({ force: true })` when `!live()` is idempotent, so concurrent sweeps cannot race — zero new locks needed.
  - **Self-healing:** Unlike O3, the instant a draining worker exits on its own (or `akrogon stop` succeeds), `cgroup.events` stops reporting `populated 1`, `ownLive` flips `false` immediately, and the repo line unblocks without operator intervention.
  - **Zero test friction:** `fake-systemd-run.sh` creates no cgroup dir (`ENOENT` → `scopePopulated === false`), so every non-systemd unit test works unchanged; `tests/run-units.test.ts` uses real cgroups and real `cgroupRoot()`.
- **What it breaks / invites later:**
  - Assumes Linux cgroup v2 (`cgroup.events`), which akrogon already requires (`src/scope.ts:123-128`, `tests/run-units.test.ts:707`).
  - Only tracks process liveness inside the scope (not a post-process `guard.service` `ExecStopPost=rm -rf` of a RAM tmpdir, which is per-run `mkdtempSync` and safe to overlap the next run).
  - If `systemctl --user stop` refuses on a scope whose process stays alive forever (e.g. `sleep 300`), `sweepStale` still retries on admission polls and `akrogon stop` retries on demand; the repo line stays held until stopped or exited.
- **Cost:** Smallest of all options (~35 lines net, removes `unstopped` and `writeRecord` from `sweepStale`, zero subprocesses in `live()`, zero new locks).

---

## 4. Recommendation

**Recommend O4 (cgroupfs `populated 1` ground truth in `ownLive()` + guard stop-before-cgroup-check + explicit `AKROGON_FAKE_SYSTEMD_RUN` shim gate).**

It takes O2's core insight — *the kernel/unit is the source of truth, not a mutable `unstopped` flag* — without O2's D-Bus-in-`lineLock`, per-repo-slice, or unit-test breakage, removes F16/F17/F18/F19 by construction instead of layering locks onto O1, and self-heals automatically on transient glitches unlike O3.
