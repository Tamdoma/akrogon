# Territory Map, Slot C: `fresh-worktree-setup` (Tamdoma/akrogon#158)

## 1. Material Forks

### Fork 1: When `setup` runs (trigger and lifecycle coverage)

Every leaf worktree passes through `allocate` -> `ensureWorktree` (`src/next.ts`), called by `dispatchLeaf` (`nextCommand`, `phaseWake`, `dispatchDependents`, `unpausePass`), `broadcastPass`, and `seatCommand`. Other code paths that create or mutate worktrees are `verify.ts:runOnce` (already runs `setup`), `batch.ts:buildStack` and `self-update.ts:gitStage` (git-only scratch checkouts; must never run `setup`), `batch.ts:applyTop`/`move` (`git reset --keep` onto a rebased merge top), and three skill-driven shell paths (`skills/chart-issues/assets/direct-route.md`, `skills/implement-issue/worker-protocol.md`, `skills/watch-issues/consultant-brief.md`).

- **Option 1A — Worktree creation only** (inside `ensureWorktree` only when `!existsSync(path)`):
  - *Covers*: brand-new leaf creation, replaced commit-free leftovers (`ensureWorktree` removes then recreates), and recreated missing worktrees.
  - *Breaks / invites later*:
    1. **Adopted existing worktrees**: on first allocation (`leaf.state.worktree === undefined` and `present === true`, e.g., a chart direct-route growth-stop handoff or manually created branch with commits), `!existsSync(path)` is false so `setup` never runs and the first seat still hits the hook block.
    2. **Post-rebase/restack lockfile drift**: `mergeTurn` (`src/next.ts`) and `restack` (`src/phase.ts`) call `applyTop` -> `move` (`src/batch.ts`), which runs `git reset --keep <top>` in the leaf worktree. If `main` added a package or hook dependency, `node_modules/` still exists (so `guard own-modules` still passes), while the new dependency is absent when `repairExit` dispatches seat B into `check.repair` (proven in Observation 2).
    3. **Silent skip after a failed setup**: if worktree creation succeeded, `setup` failed, and the directory remained on disk, the next pass sees `existsSync(path) === true`, skips `setup`, and launches the seat into a broken worktree (unless failure always removes the newly created worktree).

- **Option 1B — Every seat start** (before `startSeat` in `dispatchSlot` and `seatCommand`):
  - *Covers*: creation, adoption, recreation, and freshly started seats after `applyTop`.
  - *Breaks / invites later*:
    1. **Destructive clobbering of live sibling seats**: `pi-extensions` configures `setup: for l in */package-lock.json; do (cd "$(dirname "$l")" && npm ci --no-audit --no-fund) || exit 1; done`. `npm ci` deletes `node_modules/` completely before extracting. Running `setup` when seat B starts for `check.review` while seat A is still live in the same worktree deletes `node_modules/` out from under seat A.
    2. **Misses live idle seats reused via `hc send`**: in `dispatchSlot` (`src/next.ts`), a live idle seat (e.g., B surviving from `check.review` when `repairExit` returns the leaf to `check.repair` after `applyTop`) is prompted through `hc send`, never `startSeat`, so it still sees pre-restack dependencies.
    3. **Repeated cost and lockfile drift**: `varhop` configures `setup: bun install` (non-frozen), and `pi-extensions` runs 4x `npm ci`; re-running on every seat restart adds tens of seconds and risks mutating `bun.lock`.

- **Option 1C — Eager after every `applyTop` (plus creation/adoption)**:
  - *Covers*: creation, adoption, and post-rebase lockfile updates immediately in `mergeTurn` / `restack`.
  - *Breaks / invites later*:
    1. **Wasted work on the happy merge path**: `merge` holds no seat (`src/routing.ts:routing`), and `akrogon verify` runs in its own fresh `verify-<id>` checkout (`src/verify.ts:runOnce`), never using the leaf worktree's `node_modules`. On every clean merge (~majority of leaves), eager post-`applyTop` setup installs dependencies right before `reconcile` deletes the worktree.
    2. **Slows the merge pipeline**: runs inside `mergeTurn` / `restack` before `launchLand`, delaying landing and holding the merge queue.

- **Option 1D — Demand-driven via a worktree-gitdir readiness stamp** (invalidate on creation, adoption without stamp, `applyTop` worktree move, `setup` command change, or missing `node_modules` when `package.json` exists):
  - Store a small stamp inside the worktree's private gitdir (`<git-dir>/akrogon-setup.json` — beside `akrogon-install.lock` and `akrogon-env-<pid>`), written *only* after `setup` (and `guard own-modules`) exits 0, holding `{ setup: repo.config.setup }`.
  - Stamp is automatically absent on brand-new worktrees, replaced commit-free leftovers (`git worktree remove` deletes the worktree gitdir), adopted un-stamped worktrees, and retries after a failed setup.
  - When `applyTop` -> `move` (`src/batch.ts`) moves a worktree (`moved === 'worktree'` and `oldHead !== top`), unlink `<git-dir>/akrogon-setup.json` (zero cost on happy merges).
  - Before dispatching any seat (`dispatchLeaf`, `broadcastPass`, `seatCommand`), if `repo.config.setup !== undefined` and the stamp is missing, its recorded `setup` string differs from `repo.config.setup`, or `package.json` exists without `node_modules`, run `setup` — gated so we never clobber a *working* sibling seat (only run when no seat in the worktree is currently working, or when no seat is live yet).
  - *Breaks / invites later*:
    1. If a seat edits `package.json` + lockfile in `implement` (without installing in the leaf worktree) and relies on `akrogon verify` (which uses a separate `verify-<id>` checkout), the leaf worktree's stamp stays valid and B in `check.review` would still rely on `setupCommand` in `checks` or running `setup` for ad-hoc commands. (In practice seats install locally during `implement` to run unit tests/typecheck; keying on `HEAD` instead would trigger `npm ci` clobbering on every phase transition.)
    2. Adds one internal gitdir marker file (invisible to `git status`, removed with the worktree, zero `state.yaml` schema change under signposts 3a & 6a).

---

### Fork 2: Where `setup` runs (lock ownership, execution container, environment)

#### 2a. Inside `globalHome()/.lock` vs outside it

Currently all six callers of `allocate` (`nextCommand`, `unpausePass`, `phaseWake`, `landedWake`, `broadcastPass`, `seatCommand` in `src/next.ts`) hold `resolve(globalHome(), '.lock')` exclusively. Every mutating CLI verb across all 12 registered repos contends on that single lock (`phaseCommand`, `land`, `stop`, `pause`, `park`, `sync`, `reconcile`).

- **Option 2a-1 — Run `setup` inside `globalHome()/.lock`**:
  - *Breaks / invites later*:
    1. **Cross-repo head-of-line blocking**: a 20–60 s `npm ci` (`pi-extensions`) or cold-cache / registry-slow `bun install` stalls `akrogon phase`, `akrogon land`, `akrogon stop`, and `akrogon pause` for all 12 repos.
    2. **Hard AB-BA deadlock if combined with `checkedRun`/`withAdmission`**: `land` (`src/land.ts:land`) holds the repo land admission while repeatedly acquiring `globalHome()/.lock` (`landClaim`, `landGates`, `landPush`, `repairExit`, `restack`). If `next` held `globalHome()/.lock` and waited in `withAdmission` behind a live `land`, both processes deadlock until `listen.ts`'s 20-minute `PASS_DEADLINE_MS` kills `next` (or forever for manual `akrogon next`).
    3. **Hung `setup` freezes the whole machine** for up to 20 min (`PASS_DEADLINE_MS`) unless bounded by a short per-setup timeout.

- **Option 2a-2 — Run `setup` outside `globalHome()/.lock`** (under the worktree's own `akrogon-install.lock`, using the same two-phase lock-release pattern `mergeTurn` and `restack` already use around `buildStack`):
  - Phase 1 (under `.lock`): validate capacity/state, create worktree + `.env` (or identify existing worktree needing setup), release `.lock`.
  - Phase 2 (outside `.lock`): run `setup` under per-worktree `flock "$(git rev-parse --git-path akrogon-install.lock)"`.
  - Phase 3 (re-acquire `.lock`): re-read `state.yaml`, re-check `isPaused(repo.name)` (if automatic), `isStopped(repo.name, slug)`, phase still unchanged, and `capRefusal` (`activeCount` counts live hc terminals, not worktrees), then commit/dispatch seat.
  - *Breaks / invites later*:
    1. **Larger refactor of `src/next.ts`**: today `nextCommand`, `unpausePass`, `phaseWake`, `landedWake`, `broadcastPass`, and `seatCommand` each wrap their whole dispatch sweep in one `withLock(globalHome()/.lock, ...)`. Releasing `.lock` mid-pass requires careful handling of the `pause-dispatch` cascade guarantee (`learnings/LESSONS.md`, "Automatic cascade lock ownership (2026-10-09)"): `akrogon pause` can land during the lock gap, so re-checking `isPaused` after re-acquiring `.lock` is mandatory (mirroring `mergeTurn` in `src/next.ts`).
    2. **Worktree survival during the lock gap**: while `.lock` is released during `setup`, a concurrent `reconcile` pass could inspect the worktree store. If `state.worktree` is not saved yet, `reconcile` relies on `processesInside` (`src/reconcile.ts:processesInside`) vetoing removal while `setup` has cwd inside the worktree — there is a tiny window between `setup` exiting and Phase 3 re-acquiring `.lock` where `reconcile` could see an unrecorded worktree and remove it! Mitigations: either hold `worktreeLock`? (no, blocks other worktree ops), or save `state.worktree` in Phase 1 (or hold a live owner file like `batch-*.owner` / `reconcile.ts:ownerKeeps`), or check `existsSync(path)` in Phase 3.
    3. **Capacity race**: two concurrent `next` calls could both prepare worktrees before either launches a seat, so one gets `capRefusal` in Phase 3 (harmless — worktree is ready for when capacity frees, though it leaves an unseated worktree on disk).

#### 2b. Execution container: `checkedRun` (`run-check` scope) vs plain shell + `flock` vs `leafSlice` `systemd-run --scope`

- **Option 2b-1 — Full `checkedRun` (`src/run-check.ts:checkedRun`)**:
  - *Breaks / invites later*:
    1. **Breaks `broadcastPass` on every completing owner**: `broadcastPass` (`src/next.ts:broadcastPass`) dispatches merged leaves whose owner has already moved to `issues/closed/`. `checkedRun` calls `ownerRefusal` (`src/run-check.ts:ownerRefusal`), which unconditionally throws `PublishRefusedError('owner closed: ...')` for any leaf under `issues/closed/`.
    2. **Blocked behind every `land` run**: `withAdmission` (`src/admission.ts:holds`) queues every non-land run of the repo behind any active `land` hold (10–20 min on `framework`), preventing fresh leaves from starting while another leaf lands — and deadlocking if inside `.lock`.
    3. **Abandoned captures block `akrogon phase`**: `checkedRun` creates `leaf/implementation/capture-setup-<run>-out.log` during `plan.synthesis` (before `implementation/` even exists). If `next` is killed mid-setup (Ctrl-C or `listen.ts` deadline), `refuseAbandonedCaptures` (`src/phase.ts`) blocks all non-failed phase moves until someone writes `cleared-<run>.md`.
    4. **`refuse()` rejects unrelated operator shell env**: `runCheck` refuses if `CHROME_PATH`, `FFMPEG_BIN`, or `~/.bunfig.toml` exists in the caller's shell, breaking `akrogon next` for operators who never hit that refusal before.

- **Option 2b-2 — Plain `spawnCaptured` / process-group child with `flock <akrogon-install.lock> sh -c <setup>` + in-process `guard(worktree, ['own-modules'])`**:
  - Shares the exact per-worktree lock `git rev-parse --git-path akrogon-install.lock` (`src/config.ts:setupCommand`), serializing with concurrent checks in the same worktree while staying parallel across different worktrees (verified in Observation 1: `--git-path` resolves inside `.git/worktrees/<name>/`, never shared across worktrees).
  - Works in `plan.synthesis`, `check.repair`, `broadcastPass` (closed owner), and `seatCommand`.
  - No `withAdmission` land-hold blocking, no `implementation/` pollution, no abandoned captures.
  - *Breaks / invites later*:
    1. `akrogon stop <slug>` stops `leafSlice` (`src/stop.ts:stopLeaf`); a plain child outside `leafSlice` is not killed by `akrogon stop` (though it is bounded by the setup timeout and process-group kill).
    2. Runs outside `akrogon.slice`'s memory ceiling (`systemd/akrogon.slice`: `MemoryHigh=50%`, `MemoryMax=75%`).

- **Option 2b-3 — `flock <akrogon-install.lock>` inside a transient `systemd-run --user --scope --slice=<leafSlice>` (no `withAdmission`, no capture files)**:
  - Keeps `setup` inside the leaf's cgroup (`akrogon stop <slug>` kills it cleanly; `akrogon.slice` memory ceiling applies; cgroup guarantees no orphan postinstall children survive timeout/kill).
  - Works with `tests/helpers.ts` (`fake-systemd-run.sh` already handles `--scope ... -- <cmd>`).
  - *Breaks / invites later*:
    1. Adds one `systemd-run --user --scope` round-trip per fresh worktree (~50–100 ms) and requires `sessionBusEnv()` (`src/scope.ts:sessionBusEnv`) so `next` called from inside a cut-bus environment (e.g., a seat's `akrogon phase` -> `phaseWake`) still reaches the user manager.
    2. Needs care with `akrogon next` invoked in headless/CI environments without a user systemd bus (though `seat.ts:startSeat` already requires `systemd-run --user --scope`).

#### 2c. Environment passed to `setup`

- **Option 2c-1 — Inherited `process.env` as-is**:
  - *Breaks / invites later*: leaks `CLAUDECODE` / `CLAUDE_CODE_*` markers (`src/seat.ts:MARKERS`) when `next`/`seat`/`phaseWake` runs from inside a Claude seat; leaks another leaf's `TMPDIR` or `AKROGON_RUN` during `phaseWake`; leaks `NODE_PATH` / `BUN_OPTIONS` / `BUN_INSTALL_CACHE_DIR` into installs.

- **Option 2c-2 — Clean constructed env aligned with `src/run-check.ts:constructedEnv` (minus `refuse()` throwing)**:
  - Copies `HOME`, `PATH`, `XDG_CACHE_HOME`, `AKROGON_HOME`, `displayEnv`, plus `repo.config.env` and `repo.config.pass_env` from `process.env`; sets `LANG=C.UTF-8`, `NODE_DISABLE_COMPILE_CACHE=1`, `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`, and a per-setup scratch `TMPDIR` + `BUN_RUNTIME_TRANSPILER_CACHE_PATH` inside `ensureLeafTemp(repo, slug)` (removed in `finally`).
  - *Why this is safe*: every registered repo whose `akrogon verify` passes today already runs `setup` under `constructedEnv` (`src/verify.ts:runOnce` -> `checkedRun`), so dispatch-time and verify-time `setup` see the exact same environment.
  - *Breaks / invites later*: if a future repo's `setup` requires a git credential helper over D-Bus keyring or an unlisted shell variable (e.g., `NPM_TOKEN`, `SSH_AUTH_SOCK`), it must be declared in `pass_env` (same contract as `verify` today). Note that `<worktree>/.env` is already written by `writeLeafEnv` before `setup` runs, matching `verify.ts:runOnce` (`emitEnvFile` before `setup`).

---

### Fork 3: What a failed or slow `setup` does to dispatch

#### 3a. Failed `setup` (non-zero exit or post-setup `guard own-modules` failure)

- **Option 3a-1 — Skip this leaf (roll back newly created worktree, keep `state.worktree` unset on first allocation), continue dispatching other leaves, exit 1**:
  - Matches every existing allocation failure in `src/next.ts` (`checkBase`, `createSparseWorktree`, `writeLeafEnv`, `branchReservation` refusals): `dispatchLeaf` catches, logs structured JSON error via `report`, returns `'skipped'`, `sweep` continues to remaining leaves, and `nextCommand` sets `process.exitCode = 1`.
  - On first allocation, removing a worktree that `ensureWorktree` *just created* keeps `state.worktree` unset (matching `tests/first-allocation.test.ts` refusal invariant) and prevents leaving a dirty/half-installed directory that would trip `first-allocation`'s leftover refusal on the next pass. On an *existing/adopted* worktree, never remove it — simply omit the setup stamp so the next pass retries `setup` cleanly.
  - *Breaks / invites later*: under `akrogon listen` (`src/listen.ts`), exit code 1 schedules a retry after `RETRY_MS` (60 s). A *deterministic* `setup` failure (e.g., broken lockfile on `main`, wrong `setup` string in `issues/config.yaml`) will retry every 60 s indefinitely, creating/deleting the worktree and logging only to `akrogon-listener.service`'s journal with no desktop notice and no `failed` state in `akrogon status`.

- **Option 3a-2 — Move leaf to `phase: failed` immediately on first `setup` failure**:
  - *Breaks / invites later*: a single transient network blip (registry 503, brief Wi-Fi drop) moves every newly queued leaf to `failed`, requiring manual `akrogon phase <slug> plan.synthesis` recovery in unattended/overnight runs. Also cannot apply to `broadcastPass` because `merged` is terminal (`src/routing.ts`).

- **Option 3a-3 — Skip on transient failure, move to `failed` (with notice) after N consecutive setup failures** (mirroring `lost` / `attempts` >= 3 in `dispatchSlot`):
  - *Breaks / invites later*: requires a new counter field on `state.yaml` (or keeping state clean vs adding `setup_failures: number` with `.default(0)`). Still needs Option 3a-1's skip behavior for `broadcastPass` (terminal `merged` leaf) and `seatCommand` (direct throw to caller).

#### 3b. Slow or hung `setup`

- **Option 3b-1 — No dedicated timeout (rely on `listen.ts` `PASS_DEADLINE_MS` = 20 min)**:
  - *Breaks / invites later*: a single hung `setup` (interactive prompt, hung postinstall, stalled registry) stalls every remaining leaf and repo in that `next` pass, blocks `listen.ts`'s single-flight pass queue for 20 minutes, and kills the entire pass (skipping `mergePass` and `reconcileRepos`).

- **Option 3b-2 — Bounded per-setup timeout (e.g., default 300_000 ms, overridable via `AKROGON_SETUP_TIMEOUT_MS`) with full process-group / scope kill**:
  - On timeout, kill the entire child tree (`-pid` or `systemctl --user stop <scope>`), treat as a failed `setup` for that leaf only (including captured stdout/stderr tail in the error), and continue dispatching other leaves.
  - *Breaks / invites later*: a legitimate repo with a huge cold install (e.g., downloading Playwright browsers in postinstall) could hit a too-short default timeout; 5 minutes (300 s) with env override avoids false positives on normal repos (`framework` warm `bun install`: 1.88 s per `INTAKE.md`; `pi-extensions` 4x `npm ci`: ~10–30 s).

---

### Fork 4: `guard own-modules` when `setup` is absent vs present

- **Option 4A — Run `guard(worktree, ['own-modules'])` in-process ONLY when `repo.config.setup !== undefined`**:
  - Catches a `setup` command that exits 0 without creating `node_modules/` in a JS/TS repo before launching a seat.
  - Leaves non-JS repos (`herdr-setup`), repos with `package.json` and no `setup` (`mdcny-ghl-data-pulls`, `clinique-la-roya` — both live registered repos on this machine!), and existing test fixtures unaffected.
  - *Breaks / invites later*: a JS repo whose operator forgot to configure `setup` in `issues/config.yaml` (like `clinique-la-roya`) will still fail at its first check or hook instead of at dispatch.

- **Option 4B — Run `guard own-modules` unconditionally on every worktree with `package.json`**:
  - *Breaks / invites later*: immediately refuses dispatch for live registered repos `mdcny-ghl-data-pulls` (which has `package.json` with `devDependencies`, `checks: {}`, no `setup`) and `clinique-la-roya` (framework satellite with `package.json`, no `setup`) until their `issues/config.yaml` files are edited.

---

### Fork 5: Non-`ensureWorktree` worktree paths and retiring the lesson

The lesson (`learnings/LESSONS.md`, `learnings/history/2026-11-25-fresh-worktree-skips-setup.md`) may be retired only if the fix stops the failure mechanism on every path. Inspecting every worktree creation site across `src/` and `skills/`:

| Path | Creates worktree | Runs `setup` today? | Seat runs with cwd in worktree? |
| --- | --- | --- | --- |
| `src/next.ts:ensureWorktree` (leaf dispatch, `broadcastPass`, `seatCommand`) | `createSparseWorktree` | **No** (the bug) | **Yes** (`startSeat` sets `cwd: worktree`) |
| `src/verify.ts:runOnce` | `createSparseWorktree` | **Yes** (`checkedRun` `'setup'`) | No |
| `src/batch.ts:buildStack`, `src/self-update.ts:gitStage` | `createSparseWorktree` / `git worktree add` | No (git-only; must stay no) | No |
| `skills/chart-issues/assets/direct-route.md` | Manual `git worktree add --lock ...` | **No** (until `checks`/`verify`) | Door/B run with `cwd: repo.root` (`seat.ts:launch`), but direct tests/hooks run in `<worktree>` |
| `skills/implement-issue/worker-protocol.md` | Seat A runs `git worktree add --detach <slug>-u<N>` | Worker prompt says "installs dependencies there before its targeted tests" | Subagent worker spawned with `cwd: <slug>-u<N>` — if a Claude subagent hook reads `cwd`, installing before spawning workers (or inside worker setup) matters |
| `skills/watch-issues/consultant-brief.md` | Consultant runs `git worktree add --detach <case>/worktree` | No (proofs run via `akrogon verify --holder`) | Consultant runs in `repo.root` |

- **Option 5A — Fix `ensureWorktree` / leaf dispatch only** (retire the lesson because the lesson and #158 are specifically about fresh *leaf* worktrees created by akrogon before seat dispatch).
- **Option 5B — Also add a one-line `setup` step in `skills/chart-issues/assets/direct-route.md` step 1** (after `git checkout`, run the repo's `setup` when configured) and note in `worker-protocol.md` that A runs `setup` when creating worker worktrees if configured. (Minimal doc-only addition if direct-route or subagents in `framework` can hit the same PreToolUse hook.)

---

## 2. Practitioner Questions and Pitfalls Over the Work's Lifetime

1. **AB-BA deadlock between `globalHome()/.lock` and `withAdmission` (`src/next.ts:nextCommand`, `src/land.ts:land`, `src/admission.ts:awaitTurn`)**:
   - Never call `checkedRun` or `withAdmission` while holding `globalHome()/.lock`. `land` holds a repo-wide admission lock for its entire attempt while acquiring `globalHome()/.lock` at `landClaim`, `landGates`, `landPush`, `restack`, and `repairExit`. Any non-land `withAdmission` call inside `.lock` deadlocks whenever a land is active.
2. **`ownerRefusal` in `src/run-check.ts:ownerRefusal` breaks `broadcastPass` (`src/next.ts:broadcastPass`)**:
   - `broadcastPass` calls `allocate` for merged leaves already moved to `issues/closed/`. `checkedRun` refuses any target under `issues/closed/` with `owner closed`. Any setup mechanism invoked by `allocate` must not go through `checkedRun`.
3. **`src/shell.ts:run` timeout leaks grandchild processes holding `akrogon-install.lock`**:
   - On `deadlineMs`, `src/shell.ts:run` calls `child.kill()` (single PID `SIGTERM`), not process-group kill. Since setup runs via `flock <lock> sh -c <setup>`, killing `flock` or `sh` leaves `bun`/`npm` grandchildren running and holding the flock or mutating `node_modules/`. Spawn with `detached: true` + `process.kill(-pid, 'SIGKILL')` (or `tests/helpers.ts:killTree` pattern) or inside a `systemd-run --scope` stopped via `systemctl --user stop`.
4. **Calling literal `akrogon guard own-modules` via shell depends on `PATH` (`src/config.ts:setupCommand`, `tests/helpers.ts:cli`)**:
   - In `tests/helpers.ts:cli`, `PATH` is `${unitBin(f)}:${process.env.PATH}` — it does *not* include the worktree's `akrogon` binary (`fakeAkrogon` is opt-in). A shell invocation of `akrogon guard own-modules` inside `next.ts` would execute `/home/ivan/.local/bin/akrogon` (the old installed release) or fail with `command not found` in clean-PATH tests. Call `guard(worktree, ['own-modules'])` (`src/guard.ts:guard`) in-process instead.
5. **Non-idempotent and destructive `setup` commands in real registered repos**:
   - Inspected all 12 registered repos' `issues/config.yaml`:
     - `pi-extensions` runs `for l in */package-lock.json; do (cd "$(dirname "$l")" && npm ci --no-audit --no-fund) || exit 1; done` — deletes `node_modules` on every run and has *no* root `package.json` (`guard own-modules` exits 0).
     - `varhop` runs `bun install` (not `--frozen-lockfile`) — can dirty `bun.lock` if run unnecessarily.
     - `mdcny-ghl-data-pulls` and `clinique-la-roya` have root `package.json` and *no* `setup` key.
     - `herdr-setup` has neither `package.json` nor `setup`.
     - `akrogon`, `framework`, `lens`, `Himne`, `lingua-relay`, `blepsis` use `bun install --frozen-lockfile --backend=copyfile`; `boulevard-automation` uses `bun install --frozen-lockfile`.
   - Any design that runs `setup` while a seat is live, or assumes root `node_modules` always exists after `setup`, or refuses every `package.json` repo lacking `setup`, will break at least one live registered repo.
6. **Failed first allocation + leftover worktree interaction (`src/next.ts:ensureWorktree`, `tests/first-allocation.test.ts`)**:
   - If `ensureWorktree` creates a fresh worktree, `setup` fails, and the worktree is left on disk without `state.worktree` being saved: on the next pass, `ensureWorktree` enters the first-allocation leftover branch. If the failed `setup` created any untracked non-ignored file, `worktreeRemovable` refuses forever as dirty; even if clean, `ensureWorktree` has to delete and recreate it. Rolling back a freshly created worktree on `setup` failure keeps the refusal contract clean and atomic (identical to `createSparseWorktree`'s catch block).
   - Conversely, on an *adopted* worktree (branch has commits of its own) or an *already-allocated* worktree (`leaf.state.worktree !== undefined`), never delete the worktree on `setup` failure — keep it intact and leave the setup stamp unwritten so the next pass retries.
7. **Lock-release gap with `reconcile` and `pause` (if Option 2a-2 is chosen)**:
   - Look at `learnings/LESSONS.md` ("Automatic cascade lock ownership (2026-10-09)") and `src/reconcile.ts`: releasing `globalHome()/.lock` mid-dispatch exposes two races:
     - `akrogon pause` can acknowledge during `setup`; Phase 3 must re-check `isPaused(repo.name)` (for automatic passes) and `isStopped(repo.name, slug)` under `.lock` before calling `startSeat`.
     - `reconcile` can see a newly created worktree before `state.worktree` is written; protect it with a live `.owner` record (`src/reconcile.ts:ownerKeeps` or `state.worktree` written before lock release, rolled back if setup fails).
8. **`writeLeafEnv` must run before `setup` (`src/next.ts:ensureWorktree`, `src/verify.ts:runOnce`)**:
   - `verify.ts:runOnce` calls `emitEnvFile` before `setup` so postinstall scripts or setup commands that read `.env` work. Keep the same ordering in `ensureWorktree`.
9. **Interactive prompts & stdin**:
   - Always spawn `setup` with `stdin: 'ignore'` (already default in `src/shell.ts:spawnFiles`), so a package manager prompt fails fast instead of hanging until timeout.
10. **Docs and skills drift (`learnings/LESSONS.md`, "implement-issue scope: stale-rule-in-docs")**:
    - `docs/reference/config.md` (`setup` row: "Akrogon runs it before check commands") and `docs/reference/checks.md` (`setup` paragraph) and `src/AREA.md` describe `setup` as check-time only; update them alongside the implementation.
    - Keep `setupCommand` (`src/config.ts`) wrapping `checks` and `verify` unchanged! Seats can edit `package.json`/lockfiles during `implement`, and `verify` runs in its own fresh `verify-<id>` checkout — check-time `setup` remains necessary as defense-in-depth.
11. **Model knowledge note**:
    - Whether `bun install --frozen-lockfile --backend=copyfile` is completely safe under concurrent invocations across *different* worktrees sharing `~/.bun/install/cache` is partly inferred from model knowledge and the fact that `akrogon verify` already runs `bun install --frozen-lockfile --backend=copyfile` concurrently across verify worktrees with only per-worktree `akrogon-install.lock` (`src/verify.ts:runOnce`, `src/config.ts:setupCommand`). No official Bun concurrency spec was fetched (web search not run; existing `akrogon` production usage across 6 Bun repos and `tests/config.test.ts` are the strongest local evidence).

---

## 3. Recommended Direction, Cost, Proof Plan, and Open Questions

### Recommended direction

1. **Trigger (Option 1D — worktree-gitdir readiness stamp)**:
   - Write `<git-dir>/akrogon-setup.json` (`{ setup: repo.config.setup }`) only after `setup` exits 0 and in-process `guard(worktree, ['own-modules'])` exits 0 (only when `repo.config.setup !== undefined`, Option 4A).
   - Run `ensureWorktreeSetup` before seat dispatch whenever `repo.config.setup !== undefined` and the stamp is missing, its `setup` string does not match `repo.config.setup`, or `package.json` exists without `node_modules` — and **never** while a seat in that worktree is currently working (`!live` or only idle seats).
   - In `src/batch.ts:move` (called by `applyTop` in both `mergeTurn` and `restack`), when `moved === 'worktree'` and `oldHead !== target`, delete `<git-dir>/akrogon-setup.json` so if the leaf later exits to `check.repair`, setup refreshes dependencies before seat B runs, while happy merges pay zero extra installs.
2. **Execution (Option 2b-2 + Option 2c-2, with Option 2a-1 vs 2a-2 weighed carefully)**:
   - Run `flock <akrogon-install.lock> sh -c <setup>` in `worktree` using a clean `constructedEnv`-equivalent environment (without `refuse()`, with `stdin: 'ignore'`, per-setup scratch `TMPDIR` under `ensureLeafTemp` cleaned up in `finally`, `NODE_DISABLE_COMPILE_CACHE=1`, `LANG=C.UTF-8`, `CLAUDE*` markers excluded by construction), a bounded timeout (`AKROGON_SETUP_TIMEOUT_MS`, default 300_000 ms) with process-group kill (`detached: true`, `process.kill(-pid, 'SIGKILL')`), and in-process `guard(worktree, ['own-modules'])`.
   - **Locking recommendation**: **Start by running outside `globalHome()/.lock` (Option 2a-2) ONLY if the lock-split is kept narrow** (specifically: move `setup` into a pre-seat helper called *between* releasing/before taking `.lock` or release `.lock` around `setup` with explicit `isPaused`/`isStopped`/`capRefusal` re-checks), **OR** keep it inside `.lock` (Option 2a-1) with a tight timeout if simplicity beats non-blocking setup.
   - *Tradeoff*: Running inside `.lock` is ~60 lines of clean code in `src/next.ts` + `src/batch.ts` with zero lock-splitting risk (recall `startSeat` already holds `.lock` for up to 75 s while waiting for `START_PROOF_MS` + `PANE_WAIT_MS` in `src/seat.ts`!), whereas running outside `.lock` eliminates cross-repo `.lock` contention during slow `npm ci` / cold installs at the cost of splitting the lock across `nextCommand`, `unpausePass`, `phaseWake`, `landedWake`, `broadcastPass`, and `seatCommand` and guarding the `reconcile` + `pause` windows. Given `startSeat` already holds `.lock` during seat startup and `framework`'s warm `bun install` takes ~2 s, **Option 2a-1 inside `.lock` with a bounded timeout and process-group kill** is dramatically simpler and lower-risk unless the operator specifically wants slow `npm ci` installs not to hold `.lock`. (Worth deciding explicitly at charting!)
3. **Failure handling (Option 3a-1 + Option 3b-2)**:
   - Failed or timed-out `setup` rolls back a *newly created* worktree (leaving `state.worktree` unset), preserves an existing/adopted worktree unstamped, includes the exit code / timeout and stderr tail in the thrown error, skips that leaf via `dispatchLeaf`'s existing `report` + `'skipped'` path, continues dispatching other leaves, and sets exit code 1.
   - Do not add a new `state.yaml` schema field unless bounded `failed` transition (Option 3a-3) is chosen.
4. **Retire the lesson**:
   - Remove the `fresh worktree skips setup (2026-11-25)` line from `learnings/LESSONS.md` and append `Applied` to `learnings/history/2026-11-25-fresh-worktree-skips-setup.md` once leaf dispatch + post-`applyTop` + adoption are all covered (and optionally add the one-line setup note to `skills/chart-issues/assets/direct-route.md`).
5. **Estimated cost**: One leaf (signpost 4a), ~100–180 lines of production code across `src/next.ts`, `src/batch.ts`, `src/run-check.ts` (if sharing env builder), plus targeted docs updates (`docs/reference/config.md`, `docs/reference/checks.md`, `src/AREA.md`) and ~250–350 lines of free boundary tests.

### How a free test at the real boundary proves it

Using the existing `hcFixture` + `cli` + temp bare remote + real git worktrees (same boundary as `tests/first-allocation.test.ts`, zero model calls, zero network — local `file:` dependency package like `tests/config.test.ts:installFixture`):

1. **Fresh leaf creation runs `setup` before seat launch**: configure `setup` (e.g., `bun install --frozen-lockfile --backend=copyfile` with a local `file:vendor/widget` package, plus a harness stand-in / pre-start check that verifies `node_modules/widget` exists at the moment the seat starts!). Run `akrogon next <slug>`. Assert exit 0, `node_modules/widget` exists inside the worktree, `<git-dir>/akrogon-setup.json` exists, `git status --porcelain` is empty, and the stand-in seat saw `node_modules/widget` on startup.
2. **Replaced commit-free leftover runs `setup` on the fresh replacement**: seed a commit-free stale worktree without `node_modules`, run `akrogon next <slug>`, assert replacement succeeded and `setup` ran before seat launch.
3. **Adopted existing worktree without `node_modules` runs `setup`**: pre-create a worktree with its own commit and no `node_modules`, run `akrogon next <slug>`, assert `setup` ran and seat started.
4. **Subsequent wake / live seat does NOT re-run `setup` unnecessarily**: configure `setup` to append to a counter file; run `akrogon next <slug>` once, then trigger a second `akrogon next <slug>` (and a phase transition to `implement` / `check.review`); assert counter is 1 (crucial for `npm ci` repos).
5. **Post-`applyTop` restack invalidates stamp and re-runs `setup` before `check.repair` dispatch**: advance `main` adding a second local package `w2`, run `applyTop` (moving the leaf worktree via `git reset --keep`), move leaf to `check.repair`, run `akrogon next <slug>`, assert `node_modules/w2` is installed before seat B receives its prompt.
6. **Failed `setup` skips leaf, rolls back fresh worktree, does not launch seat, and still dispatches sibling leaf**: configure `setup: 'echo boom >&2; exit 7'` on leaf 1 (or repo 1) alongside a second dispatchable leaf/repo with passing setup. Assert exit 1, stderr carries `boom`, no seat started for leaf 1, `state.worktree` remains unset, fresh worktree directory is removed, and the sibling leaf *is* dispatched.
7. **Hung `setup` hits `AKROGON_SETUP_TIMEOUT_MS`, kills grandchild process, and releases `akrogon-install.lock`**: configure `setup` that spawns a background `sleep 60` grandchild, set `AKROGON_SETUP_TIMEOUT_MS=500`, assert prompt failure, grandchild PID is dead, and `flock -n <lock> true` succeeds immediately.
8. **Post-`setup` `guard own-modules` failure**: repo with `package.json` and `setup: 'true'` (exits 0 without creating `node_modules`) refuses before seat start; repo with `package.json` and *no* `setup` still dispatches normally (regression guard for `mdcny-ghl-data-pulls`).
9. **Closed-owner `broadcastPass` and `akrogon seat <slug> A`**: prove both paths run `setup` when stamp is absent and succeed even when the owner sits under `issues/closed/` (proving no `ownerRefusal` regression).
10. **Clean env parity & `akrogon-install.lock` serialization**: prove `CLAUDECODE` / `AKROGON_RUN` from caller do not leak into `setup`, `<worktree>/.env` already exists when `setup` runs, and `setup` holds `akrogon-install.lock` (`! flock -n "$(git rev-parse --git-path akrogon-install.lock)" true`).

### Open questions the intake does not settle

1. **Locking boundary (Fork 2a)**: Is holding `globalHome()/.lock` during `setup` (bounded by a timeout, mirroring `startSeat`) acceptable for simplicity, or must `setup` run outside `globalHome()/.lock` so a slow `npm ci` / cold install never blocks `akrogon phase` / `akrogon land` in other repos?
2. **Repeated deterministic `setup` failures under `akrogon listen` (Fork 3a)**: Should a persistently failing `setup` keep skipping with exit 1 (60 s listener retry, matching `checkBase`/`writeLeafEnv`), or move the leaf to `failed` (with desktop notice) after N failures?
3. **`package.json` repos with no `setup` configured (Fork 4)**: Should `guard own-modules` run only when `setup` is set (preserving `mdcny-ghl-data-pulls` and `clinique-la-roya` as-is), or should it refuse all `package.json` repos without `setup`?
4. **Skill-created worktrees (Fork 5)**: Should this leaf also add a one-line `setup` step to `skills/chart-issues/assets/direct-route.md` (and/or `worker-protocol.md`), or scope strictly to `akrogon`'s own leaf worktree paths?

---

## 4. Free Observations

### Observation 1: `git rev-parse --git-path akrogon-install.lock` in linked worktrees
- **Date**: 2026-11-25
- **Versions**: `git version 2.56.1`, `bun 1.4.5`
- **Command**:
  ```bash
  d=$(mktemp -d) && trap 'rm -rf "$d"' EXIT && \
  git init -q -b main "$d/repo" && git -C "$d/repo" config user.email t@t && git -C "$d/repo" config user.name t && \
  touch "$d/repo/a" && git -C "$d/repo" add a && git -C "$d/repo" commit -q -m init && \
  git -C "$d/repo" worktree add -q -b wt1 "$d/wt1" && \
  echo "main: $(git -C "$d/repo" rev-parse --git-path akrogon-install.lock)" && \
  echo "wt1: $(git -C "$d/wt1" rev-parse --git-path akrogon-install.lock)" && \
  echo "wt1-common: $(git -C "$d/wt1" rev-parse --git-common-dir)"
  ```
- **Result**:
  - `main: .git/akrogon-install.lock`
  - `wt1: /tmp/tmp.v8g5vmQTaV/repo/.git/worktrees/wt1/akrogon-install.lock`
  - `wt1-common: /tmp/tmp.v8g5vmQTaV/repo/.git`
  - Confirms `akrogon-install.lock` is strictly per-worktree, not shared across worktrees or with `self-update` on `repo.root`.
- **Cleanup**: `trap 'rm -rf "$d"' EXIT` deleted `$d` on command exit.
- **Limits**: Tested with default git layout (no separate `$GIT_DIR` / submodule).

### Observation 2: `bun install --frozen-lockfile --backend=copyfile` idempotency and `git reset --keep` dependency staleness
- **Date**: 2026-11-25
- **Versions**: `git version 2.56.1`, `bun 1.4.5`
- **Command**:
  ```bash
  d=$(mktemp -d) && trap 'rm -rf "$d"' EXIT && mkdir -p "$d/vendor/w1" "$d/vendor/w2" "$d/repo" && \
  printf '{"name":"w1","version":"1.0.0"}' > "$d/vendor/w1/package.json" && printf 'module.exports=1\n' > "$d/vendor/w1/index.js" && \
  printf '{"name":"w2","version":"1.0.0"}' > "$d/vendor/w2/package.json" && printf 'module.exports=2\n' > "$d/vendor/w2/index.js" && \
  git init -q -b main "$d/repo" && git -C "$d/repo" config user.email t@t && git -C "$d/repo" config user.name t && \
  printf 'node_modules/\n' > "$d/repo/.gitignore" && \
  printf '{"name":"r","dependencies":{"w1":"file:../vendor/w1"}}' > "$d/repo/package.json" && \
  (cd "$d/repo" && bun install --backend=copyfile >/dev/null 2>&1) && \
  git -C "$d/repo" add . && git -C "$d/repo" commit -q -m c1 && \
  git -C "$d/repo" worktree add -q -b leaf1 "$d/wt1" && \
  (cd "$d/wt1" && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile' >/dev/null 2>&1) && \
  printf '{"name":"r","dependencies":{"w1":"file:../vendor/w1","w2":"file:../vendor/w2"}}' > "$d/repo/package.json" && \
  (cd "$d/repo" && bun install --lockfile-only >/dev/null 2>&1) && \
  git -C "$d/repo" add . && git -C "$d/repo" commit -q -m c2 && \
  top=$(git -C "$d/repo" rev-parse HEAD) && git -C "$d/wt1" reset --keep "$top" && \
  echo "w2 before: $(test -e "$d/wt1/node_modules/w2" && echo yes || echo no)" && \
  echo "node_modules exists: $(test -d "$d/wt1/node_modules" && echo yes || echo no)" && \
  (cd "$d/wt1" && bun install --frozen-lockfile --backend=copyfile >/dev/null 2>&1) && \
  echo "w2 after: $(test -e "$d/wt1/node_modules/w2" && echo yes || echo no)" && \
  echo "status: [$(git -C "$d/wt1" status --porcelain)]"
  ```
- **Result**:
  - Fresh `wt1` had no `node_modules`.
  - First install: 5 ms; second no-op install: 4 ms (local 1-package fixture).
  - After `git reset --keep` onto commit adding `w2`: `node_modules/` still existed (`yes`, so `guard own-modules` would pass), while `node_modules/w2` was absent (`no`).
  - After re-running `bun install --frozen-lockfile --backend=copyfile`: `node_modules/w2` present (`yes`), `git status --porcelain` empty (`[]`).
- **Cleanup**: `trap 'rm -rf "$d"' EXIT` deleted `$d` on command exit.
- **Limits**: Tiny local `file:` fixture (does not measure network/cache latency or `npm ci` wall time; `INTAKE.md` supplies the real `framework` figure of 1.88 s for 804 packages).
