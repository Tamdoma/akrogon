# Footprint map (slot C, systems view)

Measured live on this btrfs host (`/dev/mapper/root`, 930 GiB, 263 GiB used, 2026-11-22 21:11–21:13) against `/home/ivan/.akrogon/worktrees/akrogon/land-own-reds`.

---

## 1. Complete inventory of redundant or unbounded stores

| Store | Measured size (apparent / real btrfs Exclusive+Shared) | Current removal rule (`file:line`) | Overgrowth / redundancy gap |
|---|---|---|---|
| **Worktree store (`~/.akrogon/worktrees`)** | `framework`: **26.71 GiB** total / **8.43 GiB Excl** + 1.00 GiB Shared (20 dirs: 14 leaf, 3 `-u1..-u3` workers, 3 `verify-*`). `akrogon`: **595 MiB** / **508 MiB Excl** (5 dirs). | Merged/failed leaf & workers: **sweep only** (`src/reconcile.ts:852-872,1023-1034`). `verify-*`: `finally` (`src/verify.ts:847`) + sweep (`:1035`). `batch-*`: `finally` (`src/batch.ts:115`) + sweep (`:1044`). | **Huge:** `-u<N>` workers stay until leaf finishes (`reconcile.ts:1025`; 3 workers idle 6+ h today!), unbounded merge queue holds 14+ open worktrees (`~7 GiB` non-`node_modules` Exclusive bytes on btrfs; `24–38 GiB` on ext4!), old `mockup-content-*` sits 3 days. |
| **`node_modules` inside worktrees** | `framework`: `1.19–1.22 GiB` apparent each; **~76 MiB Excl** + `1.00 GiB` Shared on btrfs (1.5 GiB real across 20 dirs). On **ext4**: `~24–38 GiB` real! | Removed only with its worktree. | **No redundancy on btrfs/XFS** (kernel reflink CoW). **Linear `N × 1.2–1.9 GiB` redundancy on ext4**, multiplied by unbounded worktree count. |
| **Releases (`~/.akrogon/releases`)** | **3.3 GiB** (`du`) / **2.87 GiB** total, **2.08 GiB Excl** + 68 MiB Shared (**13 releases!**). | `pruneReleases()` (`src/release.ts:150-178`): keeps `current` + `previous` + every replaced release for **24 hours**, runs only during `deployStage` (`src/self-update.ts:248,282`). | `rollback()` (`src/rollback.ts:25`) only ever uses `previous`. Keeping 13 full releases + `node_modules` for 24 h wastes ~1.7 GiB real on btrfs (~2.8 GiB on ext4) on busy days. |
| **Watch scratch (`~/.akrogon/watch`)** | **`3.2 GiB`** (`watch/framework/consults`: `3.1 GiB`, includes `review-temp/fixture-e3bhef/node_modules`!). | **NONE.** Never swept by `reconcileHost`. | Watch consultants drop temp fixtures + `node_modules` inside `~/.akrogon/watch/` permanently. |
| **Bun caches (`~/.cache/.bun` + `~/.bun`)** | `~/.cache/.bun`: **9.8 GiB** (`install/cache`: `8.55 GiB` total, **3.31 GiB Excl** + 4.22 GiB Shared). Legacy `~/.bun/install/cache`: **1.70 GiB Excl** (0 B shared, `~/.bun` = `2.1 GiB`). | **NONE.** | Grows monotonically across every package version ever installed; legacy `~/.bun/install/cache` is 100% dead pre-XDG residue. |
| **Temp roots (`/var/tmp/akr-*`, `/tmp/akr*`)** | `/var/tmp/akr-1000`: **19 GiB** now (51 GiB earlier today). Plus 23 leaked `/var/tmp/akr-{c4,u5}-*`, 5 `/tmp/akr-consults-*` (1.3 MiB), ~80+ `/tmp/akrogon-io-*`, 4 `/tmp/akrogon-suite-*` (11 MiB). | `run-*`: `finally` on green (`src/run-check.ts:467`); `.akrogon-kept` stays until leaf close (`reconcile.ts:1171`). `leafTemp`: sweep (`:1191`). `akr-{c4,u5}-*`, `akrogon-io-*`: **NONE.** | `run-scratch` fixes `.akrogon-kept` + guard delete; ad-hoc test/consult prefixes in `/tmp` & `/var/tmp` have no owner-death cleanup or sweep. |
| **`~/.akrogon/verify-passes`** | `22 MiB`. | Sweep after 60 m (`src/reconcile.ts:1489-1505`). | Bounded unless many huge verify logs pile up within 60 m. |
| **Evidence archives & unpacked logs in git (`issues/`)** | `framework/issues`: **557 MiB** (`closed` 302 M, `open` 126 M, `chart` 94 M, `evidence.tar.zst` 134 M; `.git` = **1,023 MiB**). `lingua-relay/issues`: **655 MiB** (`closed` 473 M, `chart` 178 M, `evidence.tar.zst` 154 M; `.git` = **570 MiB**). `akrogon/issues`: **193 MiB** (`chart` 95 M, `closed` 92 M, `evidence.tar.zst` 15 M; `.git` = **141 MiB**). | `completeOwner` packs `issues/closed/<owner>/**/*.log` into `evidence.tar.zst` (`src/pack.ts:60-104`) and commits it to `.git` forever. `issues/chart/*/direct/` is **manual pack only** (`src/pack-command.ts`). **No deletion rule.** | **Unbounded permanent `.git` bloat:** every closed leaf's `evidence.tar.zst` stays in git history forever; direct charts accumulate hundreds of MB of unpacked `.log` files. |
| **Ledgers (`issues/*.jsonl`)** | `framework`: `timings.jsonl` **29 MiB**, `log.jsonl` 3.4 MiB, `verify-runs.jsonl` 2.4 MiB, dead `red-records.jsonl` 12 KiB. `akrogon`: `timings.jsonl` **5.2 MiB**, dead `red-records.jsonl` 150 KiB. `lingua-relay`: `timings.jsonl` 4.3 MiB. | **NONE.** Append-only forever (`src/timing.ts`, `src/log.ts`, `src/verify.ts`, `src/attempts.ts`, `src/budget.ts`). | Linearly grows with repo age; slows `readTimings` (`398 ms/call`), `verify-runs.jsonl` rewrites, and `.git` packfiles. |
| **Other harness worktrees (`.claude/worktrees`)** | `0 B` today across registered repos. | `endedAgentWorktree` (`src/reconcile.ts:674-726`): removes only dead-pid, merge-free, 100%-cherry-landed agent worktrees. | Unlanded/abandoned `.claude/worktrees/agent-*` fall through to `unmanaged worktree` and stay forever. |

---

## 2. `node_modules` with no redundancy: comparison

**Why `--backend=hardlink` was rejected in `#122` (`issues/chart/bun-copyfile/INTAKE.md:55,59`):** Bun hardlinks `node_modules` files directly to inodes in `~/.cache/.bun/install/cache`. Any agent, patch, or tool modifying a file inside `node_modules` silently mutates the shared cache and corrupts every other worktree and repo installed from it.

| Strategy | btrfs/XFS/APFS bytes | ext4 (no reflink) bytes | Tools writing `node_modules` (`.vite`, Prisma, Astro/Next) | Native builds & monorepo `workspace:*` | `guard own-modules` (`src/guard.ts:37`) | Fresh `verify` checkout |
|---|---|---|---|---|---|---|
| **1. `--backend=copyfile` (today)** | **Minimal (~CoW reflink):** ~76 MiB excl / 1.0 GiB shared per framework worktree. | **Full copy** (`N × 1.2–1.9 GiB`). | **Safe** (CoW isolates writes per worktree). | **Safe** (per-worktree `workspace:*` & native bins). | Passes. | Fast on btrfs; heavy copy on ext4. |
| **2. `--backend=hardlink`** (rejected `#122`) | Zero extra bytes. | Zero extra bytes. | **Unsafe:** in-place edits poison shared Bun cache for all repos. | Prebuilts/patches poison cache. | Passes. | Fast everywhere, breaks isolation. |
| **3. Shared read-only `node_modules` per lockfile hash + symlink** | Zero extra bytes. | Zero extra bytes. | **Breaks (`EACCES`/`EROFS`)** on `.vite`, `.prisma`, `.cache`, Babel/ESLint/Astro writes; writable breaks parallel isolation. | **Breaks monorepos (`workspace:*`)**: symlinks inside shared dir resolve relative to realpath, not the worktree — cross-worktree wrong-code imports! | `existsSync` passes, but realpath escapes worktree (defeats guard). | Instant `ln -s`, but fails monorepo & writable-cache suites. |
| **4. Bun `--linker=isolated`** | Same as (1) under `copyfile` (+ `.bun/` symlink forest). | **Still full copy** under `copyfile`; same cache bug under `hardlink`. | Same as (1)/(2). | Works for `workspace:*`, **but breaks repos importing unlisted transitive deps** (cannot be forced by akrogon). | Passes. | Same speed as (1); risks breaking consumer repos. |

**Recommendation for `node_modules`:** **Keep `--backend=copyfile`** (the only Bun backend that preserves worktree isolation, monorepos, and writable caches across all repos). On btrfs/XFS/APFS, `copyfile` already gives near-zero redundancy via kernel reflink (~1.5 GiB real across 20 worktrees; the 8.43 GiB Exclusive in `framework` is mostly non-`node_modules` build/checkout files + dead/excess worktrees). On **ext4**, minimize redundancy by **bounding the number of live worktrees** (see §3) from 20 down to ~3–5 (a 4–6x footprint cut with zero broken tooling), rather than fighting Bun's cache or breaking monorepos with symlinks.

---

## 3. Single mechanism that bounds footprint BY CONSTRUCTION

Sweeps (`reconcile.ts`, `pruneReleases`) always fall behind because creation is unbounded and new creators (`watch/consults`, `.akrogon-kept`, `-u<N>`, `chart/*/direct`, `akr-c4-*`) bypass the sweep.

**One structural invariant: Owner-bound allocation + bounded-cardinality slots** — *every mutable directory belongs to a capped active slot and is deleted on its owner's exit, never relying on a background sweep to bound steady-state size.*

Applied to every existing rule it replaces or tightens:
1. **Worktree cardinality bound + immediate owner teardown** *(tightens `reconcile.ts:852,1023-1028`, `next.ts:1306`, `phase.ts:401`):*
   - `lane-first` backpressure + host heavy-run cap `N` hard-caps active leaves + verify worktrees per repo.
   - **Worker worktrees (`<slug>-u<N>`):** enforce zero surviving `<slug>-u<N>` worktrees in `moveGuards` (`src/phase.ts:401`) on `implement → check.review` (and remove dead workers in `reconcile.ts:1025` once `phase !== 'implement' && phase !== 'check.fix'`, instead of keeping them until `merged`/`failed`!). Immediately eliminates the 6-hour-old `-u1/-u2/-u3` copies.
   - **Merged leaf worktrees:** remove on `landedWake` (`src/next.ts:1306`) right after `closeMergedTab` instead of waiting for a later sweep.
2. **Release slot cap = 2 (`current` + `previous`)** *(replaces 24 h `replacedLifetimeMs` in `src/release.ts:150-178`):*
   - At every `deployStage`, delete all releases except `current`, `previous`, and any dir with a live process (`pidsInside`). Bounds `~/.akrogon/releases` to **2 dirs (~450 MiB)** instead of 13 dirs (2.08 GiB real).
3. **Zero-retention ephemeral scratch** *(replaces `.akrogon-kept` in `run-scratch` + adds `watch/` rule):*
   - `run-*` dies unconditionally in `finally` and `startRunGuard` (refused logs go to disk `leafTemp`).
   - Watch consultants run with ephemeral `TMPDIR` (never writing fixtures/`node_modules` into `~/.akrogon/watch/`), eliminating the 3.2 GiB `watch/framework` growth.
4. **Stop committing bulk logs/archives into `.git` + auto-pack direct charts** *(tightens `src/pack.ts`, `src/init.ts`, `chart-issues`):*
   - Auto-pack `issues/chart/<chart>/direct` on direct-route landing (eliminates 95–178 MiB of unpacked chart logs).
   - Keep `evidence.tar.zst` **gitignored** (local on-disk archive with bounded count/age, e.g. last 30 days or moved under `~/.akrogon/evidence/<repo>`), OR stop committing multi-MB raw test logs into `.git` — the only way to prevent `.git` from growing to 1+ GiB permanently.
   - Delete dead `issues/red-records.jsonl`; cap/rotate `timings.jsonl` once `wake-cost` stops reading it in `next`.
5. **One-time host cleanup + `leftovers` visibility for external caches:**
   - Remove legacy dead `~/.bun/install/cache` (`1.70 GiB`), `~/.akrogon/watch/framework/consults/.../review-temp` (`~3.1 GiB`), old releases (`11` of `13`), leaked `/var/tmp/akr-{c4,u5}-*` and `/tmp/akrogon-io-*`, and stale worktrees (`one-gate-path-u1..3`, `mockup-content-*`). Surface `~/.cache/.bun` size in `akrogon leftovers` without auto-deleting a shared user cache mid-install.

---

## 4. Lifetime pitfalls & what each option could break

- **Pruning releases immediately (`slot cap = 2`) while an in-flight `verify-pass` or `land` runs on release `N-2`:** deleting a release directory underneath a running Bun process breaks dynamic `import()` (`src/land.ts:161`, `src/config.ts:460`). Guard deletion with `pidsInside` (or keep a short 1 h floor instead of 24 h, max ~3–4 releases) so live passes never `ENOENT`.
- **Moving `evidence.tar.zst` out of git:** breaks cross-machine `akrogon log` lookup for historical closed leaves (only local machine holds the archive) and requires updating `src/pack-command.ts:52` (`trackedRefusals`). Alternative if cross-machine history is needed: keep `evidence.tar.zst` committed *only* for compact summaries/artifacts and stop packing multi-MB passing `check-*.log` output at close (keep only red/failing logs + reports).
- **Tightening `-u<N>` removal in `reconcile.ts`:** if a seat delegates workers during `check.fix` (`skills/implement-issue/SKILL.md:75`), `-u<N>` must stay allowed in both `implement` and `check.fix` (only swept/refused on exit from those phases).
- **Auto-pruning `~/.cache/.bun`:** running `bun pm cache rm` while another repo runs `bun install` races and fails the concurrent install. Never auto-prune `~/.cache/.bun` during active runs; only prune manually or when no `liveRuns()` exist.
- **Switching `node_modules` to hardlink or shared symlink:** hardlink re-opens `#122` silent cache corruption; shared symlink breaks monorepo `workspace:*` resolution and `.vite`/Prisma writes.
