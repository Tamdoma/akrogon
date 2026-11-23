# Design C: lane-first final shape

## 1. Exact code placement & land-scope wiring

- **P5 (`akrogon-land.slice`, CPU only):**
  - Add `systemd/akrogon-land.slice` (`[Slice]\nCPUWeight=1000`), a child of `akrogon.slice` so land gets 10:1 CPU over sibling leaf/verify slices (`CPUWeight=100`) while staying inside `akrogon.slice`'s `CPUWeight=20` (vs `app.slice=100`) and memory limits.
  - Link it in `src/install.ts:37-57` (`planSkillLinks`, alongside `systemd/akrogon.slice` at `:40-42`); `linkServices` (`:140-143`) and `deployStage` (`src/self-update.ts:259-275`) already replay `daemon-reload`.
  - **Three slice sites (moving `src/land.ts:34` alone puts 0% of test CPU in the land slice):**
    1. `src/land.ts:34` (`launchLand`): `--slice=akrogon-land.slice`.
    2. `src/verify.ts:932` (`launchPass`): `--slice=${record.scope === 'merge' ? 'akrogon-land.slice' : 'akrogon.slice'}`.
    3. `src/run-check.ts:358` (`checkedRun`): `runSlice(attempt !== undefined ? 'akrogon-land.slice' : slug === 'checkout' ? 'akrogon.slice' : leafSlice(repo, slug, homePath()))`.
  - **Leaf `checks` inside `verify --attempt` belong in `akrogon-land.slice`:** `setup`, sequential `checks`, `merge_checks`, and base runs inside a land attempt all sit on the merge critical path and already carry `attempt !== undefined` (`src/run-check.ts:313,370`). Normal leaf verifies/checks (`attempt === undefined`) stay in `leafSlice`. (`src/reconcile.ts:154,1311-1327` globs `akrogon-l*.slice` but only stops exact `leafOf.get(slice)` matches, so `akrogon-land.slice` is never touched.)
- **Q3.2 (`systemd/akrogon.slice:7-8`):** replace `MemoryHigh=64G` / `MemoryMax=96G` with `MemoryHigh=60%` / `MemoryMax=80%` (keep `CPUWeight=20`, `MemorySwapMax=0`).
- **Q3.3 (Backpressure):** in `src/next.ts:380-418,436`, add a repo's merge waiters (`Math.max(0, mergeLeaves.length - 1)`) to `count.repo` (never `count.total`, so one repo never starves another) when gating **unstarted** leaves; update `docs/reference/limits.md:11` and `docs/reference/config.md:27,70`.

## 2. Still worth it after `land-own-reds` + `run-scratch` + `run-ram`?

All three still pay — keep all three:
- **P5: yes.** Even after `run-ram` cut `framework` merge verifies from ~600 s to 427 s (last 2 runs), **24/30 (80%)** of the last 30 `framework` merge runs overlapped an `akrogon` verify and **16/30 (53%)** overlapped a `framework` leaf check — all competing at equal `CPUWeight=100`.
- **Q3.2: yes.** 2-line portability fix; on this 123 GiB host `60%/80%` ≈ `74G/98G` (near today's `64G/96G`), while 16–32 GB hosts actually get protection instead of an unreachable 64G/96G cap.
- **Q3.3: yes (biggest merge-speed win).** In the last 48 h (`framework/issues/log.jsonl`, `max_active: 3` at `framework/issues/config.yaml:6`), `framework` hit **12 leaves in `merge` at once** (121 merge exits; dwell `p50=4,112 s` / 68.5 min, `p90=14,899 s` / 4.1 h, `max=29,022 s` / 8.1 h) because `unfinished` (`src/next.ts:380-381`) excludes `merge` leaves and keeps starting 3 more leaves on top of a full merge queue. (`akrogon` had `max48h=1`, `dwell p50=8 s`.)

## 3. What could break

- **Live unit upgrade / rollback:** `deployStage` (`src/self-update.ts:271-275`) creates links before `flip` and runs `daemon-reload` after `flip` (updates `akrogon.slice` live without killing running units). On rollback to a release lacking `systemd/akrogon-land.slice`, `staleIn` (`src/install.ts:83-84`) does not scan `~/.config/systemd/user/`, leaving a harmless dangling symlink unless `staleIn` also covers `.config/systemd/user/`.
- **Percentages on a small PC (16 GB RAM):** `50%/75%` (8G/12G) with `MemorySwapMax=0` is tight for parallel Chromium/Playwright runs; `60%/80%` (9.6G/12.8G) gives safer headroom while still shielding the desktop from OOM.
- **Backpressure starving `check.repair` / resuming seats (`src/next.ts:435-436`):** `allocate()` checks `capRefusal` for **every** `!live` leaf — including a leaf exiting `merge -> check.repair` whose B seat already died while waiting. If 3 waiters fill `framework`'s `max_active: 3`, counting waiters in `capRefusal` blocks `check.repair` from relaunching its B seat until the queue drains (and blocks dead-seat resumes of in-progress leaves). **Fix:** count merge waiters only when refusing **unstarted** leaves (`leaf.state.worktree === undefined`), never when resuming an existing worktree/tab. (Waiters themselves never deadlock because `mergeTurn` does not call `capRefusal`.)

## 4. Fewest-parts final shape, proof figures & open forks

1. **P5:** `systemd/akrogon-land.slice` (`CPUWeight=1000`) + `src/install.ts:37-57` + `src/land.ts:34`, `src/verify.ts:932`, `src/run-check.ts:358`. **Figure:** `framework` merge verify `p50`/`p90` and timeout rate under overlap (baseline `427–632 s`, `24/30` cross-repo overlap), plus `systemctl --user show akrogon-land.slice -p CPUWeight` = `1000`.
2. **Q3.2:** `systemd/akrogon.slice:7-8` → `MemoryHigh=60%`, `MemoryMax=80%`. **Figure:** `systemctl --user show akrogon.slice -p MemoryHigh,MemoryMax` matches host % after `daemon-reload`; `memory.events` `high`/`oom` stay `0`.
3. **Q3.3:** `src/next.ts:380-436` counts `Math.max(0, mergeLeaves.length - 1)` into `count.repo` for unstarted leaves (`worktree === undefined`) only + docs update. **Figure:** `framework` 48 h `log.jsonl` merge queue max & dwell `p50`/`p90` (baseline `max=12`, `p50=68.5 min`, `p90=4.1 h`).

**Open forks:**
- **F1 — Backpressure gate:** (a) unstarted leaves only (`worktree === undefined`) vs (b) all `!live` leaves (starves `check.repair`). **Pick: (a).**
- **F2 — Memory %:** (a) `60%/80%` vs (b) `50%/75%`. **Pick: (a).**
- **F3 — Land `CPUWeight`:** (a) `1000` (10:1) vs (b) `500` (5:1). **Pick: (a)** (signpost 4a: merge speed first).
