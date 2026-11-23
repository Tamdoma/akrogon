# Owner-roots design (slot C): footprint

Goal: owner-named roots, removed by the call that ends the owner, reusing existing liveness tests, preferring deletion of mechanisms over new ones.

---

## 1. Watch consult folders (`skills/watch-issues/scripts/consults.ts`)

- **Smallest owner-named change:**
  - `skills/watch-issues/scripts/consults.ts:184-198` (`verbNew`): delete the `seq` counter loop (`:185-192`) and allocate one folder per anchor: `<consults>/<anchor>` (not `<anchor>-<seq>`). When `verbMatch` returns `clear` (signature changed) and `<consults>/<anchor>` already exists, remove and recreate it inside `verbNew` (simplifying `matchingCases` at `:162-182` to check `<consults>/<anchor>/signature.json` directly).
  - Also pass ephemeral `TMPDIR` (outside `<consults>`) when launching the watch consultant (`consults.ts:226`) so consultants never drop multi-GB `node_modules` fixtures inside `~/.akrogon/watch/`.
- **Where removal goes (owner's end):**
  - **Leaf-anchored cases (`anchor = <slug>`):** Remove `<globalHome>/watch/<repo>/consults/<slug>` in `src/reconcile.ts` inside the existing `merged` leaf path (`src/reconcile.ts:852` / `:1191`, **only when `leaf.state.phase === 'merged'`, NEVER on `failed`**, because watch consults exist *for* `failed` leaves!).
  - **Watch-anchored cases (`anchor = 'unknown'` or non-leaf anchor):** Remove `<consults>/unknown` (and any `<consults>/<dir>` with no matching open leaf) when the watch ends: in `skills/watch-issues/scripts/stop.ts:94` (inside `withConsultantLock`, right after killing timer + consultants) and in `skills/watch-issues/scripts/timer.ts:281` (right after `await sweepConsultant()`).
- **What breaks if removed while live / existing liveness test reused:**
  - *Breaks:* Deleting `<consults>/<anchor>` mid-consult destroys `brief.md`, `turn-*.md`, and `signature.json`, making the next tick's `consults.ts match` return `clear` and spawn a duplicate consultant.
  - *Reused liveness test:* In `reconcile.ts`, reuse `dropChecked(dir)` (`src/reconcile.ts:916-946`: `live !== null`, `union !== null`, `livePaneInside`, `pidsInside`, `ownerKeeps`) plus checking `panes` has no live `akrogon.watch-consult === repo.name` terminal. In `stop.ts:85-93` / `timer.ts:268-280`, removal runs strictly after verified timer + `isVerifiedConsultant` terminals are killed and removed (`withConsultantLock`).
- **Proof:**
  1. Two `consults.ts new` calls on the same anchor with different signatures leave 1 folder `<consults>/<anchor>`, not `-1` and `-2`.
  2. `reconcile` preserves `<consults>/<slug>` while leaf is `failed` or a consultant terminal is live; removes it once `phase === 'merged'` with no pane/pid/consultant.
  3. `stop.ts` removes `<consults>/unknown` after killing timer+consultant and keeps it on `conflict` (exit 2).

---

## 2. `-uN` worker worktrees (`src/phase.ts`, `src/reconcile.ts:1023-1035`)

- **Smallest owner-named change:** Workers are already owner-named `<slug>-u<N>` in `worktreeStore(repo)`. Their real owner is the `implement` / `check.fix` pass, not the whole leaf.
- **Where removal goes (owner's end):**
  - **Prevent leak at phase exit (`src/phase.ts:401-411` `moveGuards`):** On `(state.phase === 'implement' || state.phase === 'check.fix') && requested === 'check.review'`, check `worktreeStore(repo)` for any `<slug>-u\d+` entry and refuse the move naming the surviving worker worktree(s) (matching `skills/implement-issue/SKILL.md:62`). Do *not* block moves to `failed`.
  - **Tighten reconcile backstop (`src/reconcile.ts:1025`, 1-line edit):** Change
    `owner.state.phase !== 'merged' && owner.state.phase !== 'failed'`
    to
    `owner.state.phase === 'implement' || owner.state.phase === 'check.fix'`.
    Keep `force = owner?.state.phase === 'merged'` (`:1033`) so workers left behind in `check.review`/`check.repair`/`merge` are removed only if clean with zero unreachable commits (`worktreeRemovable`, `:610`).
- **What breaks if removed while live / existing liveness test reused:**
  - *Breaks:* Removing `<slug>-u<N>` during `implement` or `check.fix` destroys an active subagent's uncommitted edits and fails in-flight worker `run-check`s.
  - *Reused liveness test:* Phase check (`implement` / `check.fix`) plus the existing guard chain right below at `src/reconcile.ts:1057-1079` (`live`/`union` available, `livePaneInside`, `pidsInside`, `ownerKeeps`, `worktreeRemovable`).
- **Proof:**
  1. `tests/phase.test.ts`: `implement → check.review` and `check.fix → check.review` refuse while `<slug>-u1` exists and pass once removed; `implement → failed` still succeeds.
  2. `tests/worktree-store.test.ts`: clean `<slug>-u1` stays in `implement` and `check.fix`, is removed in `check.review`/`merge`, and stays kept if a process is inside or commits are unreachable.

---

## 3. Run lock files (`~/.akrogon/runs/locks`, 12,690 empty files, `src/admission.ts:51-58, :164`)

- **Delete the mechanism entirely — do NOT move locks under `leafTemp`:**
  - `withAdmissionLock` (`src/admission.ts:51-58`) already takes `resolve(globalHome(), 'admission.lock')` in `'shared'` mode, then creates a permanent per-slice file `runs/locks/<slice>` (`'exclusive'`), and `awaitTurn`/`cancelWaitingRun` (`:174-175, :211-212`) nest a third lock `runs/locks/line-<repo>`.
  - **Only 3 callers exist** (`admission.ts:174`, `admission.ts:211`, `reconcile.ts:225`), each holding the lock for ~1–20 ms (YAML read/write or `systemctl stop` on a finished leaf — never while sleeping or running a check).
  - **Smallest change:** Delete `runs/locks/` and `lineLock` (`src/admission.ts:52,55,164,175,212`); take `resolve(globalHome(), 'admission.lock')` directly in **`'exclusive'`** mode! Lock order stays identical (`.lock` → `admission.lock`, matching `src/state-home.ts:87` and `src/reconcile.ts:225`), eliminates 2 `flock` spawns per poll tick, prepares directly for `lane-first`'s host-wide cap, and cuts **12,690 unbounded files → 1 permanent file**.
  - **Why moving locks under `leafTemp` (X3) is worse:** (a) `stopSlice(slice)` (`reconcile.ts:225`) does not even receive `(repo, slug)`, and `checkout`/`AKROGON_RUN_SLICE` runs have no leaf temp; (b) unlinking a `flock` file while held creates the classic Unix split-brain inode race (new creator locks a brand-new inode while old holder still runs!).
- **What breaks if legacy `runs/locks` is removed while live / existing liveness test reused:**
  - *Breaks:* Deleting `runs/locks/` during the release cutover while an older release's process still locks `runs/locks/<slice>` causes a split-brain lock race.
  - *Reused liveness test:* Gate one-time removal of retired `resolve(home, 'runs/locks')` in `reconcileHost` (or cleanup) on `pidsInside(targets(), dir).length === 0` (exact same test as `src/reconcile.ts:1454`). The single `admission.lock` is never deleted.
- **Proof:** Existing `tests/run-permit.test.ts` + `tests/leaf-slices.test.ts` (concurrent promotion, cancel-vs-promote, `stopSlice`-vs-`awaitTurn` races) stay green, and `existsSync(resolve(f.home, 'runs/locks'))` is `false` after full admission + `stopSlice`.

---

## 4. Chart direct-route worktrees (`skills/chart-issues/assets/direct-route.md:7,19,28`, `src/reconcile.ts:1051-1057`)

- **Smallest owner-named change:**
  1. **Create sparse (`skills/chart-issues/assets/direct-route.md:7`):** Change `git worktree add --lock --reason "<chart-folder> direct" <worktree_store>/<slug>` to pass `--no-checkout` followed by `git -C <path> sparse-checkout set --no-cone '/*' '!/issues/' && git -C <path> checkout` (identical to `createSparseWorktree`, `src/next.ts:250-266`). Immediately removes the 168–557 MiB duplicate `issues/` tree from every direct worktree.
  2. **Owner-end removal already exists at `direct-route.md:19` (landing) and `:28` (abandon):** `git worktree unlock <path> && git worktree remove <path>` + `git branch -D <slug>`.
  3. **Backstop vs "why not" in `src/reconcile.ts`:** Do **not** weaken `reconcile.ts:1051-1057` for unlocked `"unmanaged worktree"` entries — an unlocked worktree in the store is indistinguishable from an operator's own worktree (verified live today: `land-own-reds`, `one-test-cap`, `run-scratch`, `watch-timer` are all unlocked in `git worktree list`!). Instead, **only** if a backstop is wanted for forgotten locked direct worktrees, mirror `endedAgentWorktree` (`src/reconcile.ts:674-726`) matching `row.locked` = `/^(issues\/chart\/[^/\s]+) direct$/` **only** when `<chart>/CHART.md` carries a `Closed ` line AND `git cherry <targetRef> HEAD` proves every commit landed on `origin/main` (never auto-delete unlanded `Held`/growth-stop worktrees!). If the door consistently follows step 19/28 (and `akrogon pack <chart>` checks no locked worktree remains for that chart), zero new reconcile code is needed at all — prefer the 1-line sparse creation + `pack` check over adding a new reconcile branch.
- **What breaks if removed while live / existing liveness test reused:**
  - *Breaks:* Removing a direct worktree during `implement`, `B review`, `repair`, or `Growth stop` loses uncommitted or unpushed direct-attempt commits.
  - *Reused liveness test:* If a `Closed` backstop is added in `reconcile.ts`, reuse `endedAgentWorktree`'s exact checks (`src/reconcile.ts:695-715`: `git cherry` 100% landed, `live`/`union` available, `livePaneInside`, `pidsInside`, `worktreeRemovable` with `force = false`).
- **Proof:**
  1. Creating a direct worktree per `direct-route.md:7` has `!existsSync(resolve(worktree, 'issues'))`.
  2. (If `pack` check or `Closed` backstop is added) a `Closed` + 100%-landed locked direct worktree is removed (or refused by `pack` while still present), while an open or unlanded direct worktree stays kept.
