# Fork notes: leftover-worktree (slot C)

## Q1: Clean leftover worktree (or branch only) under the gate

### 1. Pick, reason, and cost

**Pick: a. Remove and recreate (`git worktree remove <path>` without `--force` when `<path>` exists, then `createSparseWorktree` from `trackingRef(repo)` with `-B <slug>`).**

- **Reason:** Every first allocation under the gate runs through one creation path (`createSparseWorktree`), whether the leftover is a worktree plus branch, a branch alone, or nothing at all. `git worktree add --no-checkout -B <slug> <path> <trackingRef>` handles both creating a missing branch and resetting an existing commit-free branch in one command. `git worktree remove` without `--force` natively enforces cleanliness (refusing modified, staged, untracked, and locked trees while removing ignored files like `.env` and `node_modules/`), and recreating guarantees every fresh-worktree invariant (`checkLocation`, `worktreeLock`, sparse-checkout `'/*' '!/issues/'`, clean checkout, and regenerated `.env` via `writeLeafEnv`). This aligns with the operator's emphasis on simplicity, clarity, and elegance and `signposts.md` section "Taken" (fewest moving parts).
- **Cost:**
  - `git worktree remove` deletes ignored files inside `<path>`, including `node_modules/` and local build caches; `config.setup` (run by `src/config.ts:setupCommand` before checks) must reinstall dependencies on the next run.
  - One remove plus full sparse checkout costs slightly more local disk/git work than an in-place fast-forward (identical to a normal fresh leaf allocation).
  - Unlinks the old directory inode; any stray shell with its cwd inside `<path>` is left on a deleted directory (mitigated by the process check below).

### 2. Rejected options

- **b. Fast-forward in place (`git -C <path> merge --ff-only <trackingRef>`):** Rejected for four reasons:
  1. **Silent dirty-tree carry-over:** Probed in git 2.56.1, `git merge --ff-only` exits `0` when the tree holds non-overlapping modified tracked files, staged tracked files, or untracked files — and inside a sparse-checkout worktree (`--no-cone '/*' '!/issues/'`), it even exits `0` when an untracked file collides with a newly tracked incoming file, printing only a warning and leaving the stale untracked file shadowing the tracked path.
  2. **Wrong-HEAD hazard:** Probed in git 2.56.1, if `<path>` is on a detached HEAD, `git merge --ff-only` exits `0` and advances detached HEAD while leaving `refs/heads/<slug>` behind; on another branch it fast-forwards the wrong branch.
  3. **Two creation paths and stale worktree state:** Splits first allocation into an in-place branch (requiring separate manual checks for cleanliness, checked-out branch, and sparse-checkout config) and a branch-only creation path, while keeping potentially stale ignored artifacts (`node_modules/` from an older lockfile, old build outputs, or wrong sparse patterns).
  4. **More moving parts for a rare event:** A withdrawn-and-re-handed-off slug is uncommon (`INTAKE.md` section "Source: Tamdoma/akrogon#156": seen once); maintaining a second worktree-setup path only to preserve ignored caches in that edge case adds complexity without proportional payoff.

### 3. Evidence

- `operator` — `issues/chart/fresh-leaf-base/INTAKE.md` section "Source: operator door message 2026-11-24" (2026-11-24): "Think from the systems perspective: simplicity, clarity elegance."
- `practitioner` — `issues/chart/fresh-leaf-base/forks/signposts.md` section "Taken" (2026-11-25): 1a (removing the failure class beats guarding it) and 3a (fewest moving parts).
- `practitioner` — `src/next.ts:createSparseWorktree`, `src/next.ts:ensureWorktree`, `src/next.ts:writeLeafEnv`, `src/config.ts:setupCommand` (inspected 2026-11-25): `createSparseWorktree` enforces `checkLocation`, `worktreeLock`, `--no-checkout`, `sparse-checkout set --no-cone '/*' '!/issues/'`, and `checkout`; `writeLeafEnv` rewrites `.env` on every allocation when no seat is live; `setupCommand` already runs `config.setup` before checks.
- `practitioner` — Temp-repo probe, git 2.56.1 (2026-11-25):
  - `git worktree remove <path>` (no `--force`): exits `0` on clean sparse worktree, on clean sparse worktree with ignored `.env` and `node_modules/`, and on empty untracked dir; exits `128` on modified tracked file, staged tracked file, untracked non-ignored file, locked worktree, and initialized submodule.
  - `git worktree add --no-checkout -B <slug> <path> refs/remotes/origin/main`: exits `0` for both missing and existing unattached `<slug>`, resetting `<slug>` to `origin/main` and configuring upstream tracking; exits `128` if `<slug>` is checked out in another worktree.
  - `git -C <path> merge --ff-only refs/remotes/origin/main` in a sparse worktree: exits `0` with non-overlapping modified tracked file, staged tracked file, untracked file, colliding untracked file (warning only, shadowing new tracked file), and detached HEAD (leaving `<slug>` stale); exits `1` only on overlapping modified tracked file.

### 4. Pitfalls and what removes each

- **Leftover `<path>` is on detached HEAD or another branch while `refs/heads/<slug>` has no commits of its own:** Removing `<path>` could delete an operator's unrelated branch checkout or orphan unreachable detached commits.
  - *Removes it:* Check `git -C <path> symbolic-ref --quiet HEAD` equals `refs/heads/<slug>` before entering the remove-and-recreate path; refuse loudly if detached or on another branch.
- **In-progress git operation on a clean working tree:** Probed in git 2.56.1, `git worktree remove` without `--force` exits `0` when `MERGE_HEAD` exists if `git status --porcelain` is empty.
  - *Removes it:* Check the same operation markers as `src/reconcile.ts:worktreeRemovable` (`rebase-merge`, `rebase-apply`, `MERGE_HEAD`, `CHERRY_PICK_HEAD`, `REVERT_HEAD`) before removing, and refuse loudly if any exists.
- **`refs/heads/<slug>` checked out in a different worktree:** `git worktree add -B <slug>` exits `128` (`already used by worktree at ...`).
  - *Removes it:* Surface git's error naming the other worktree path; never pass `--force` to steal a branch from another checkout.
- **Live process with cwd or open fd inside `<path>`:** Removing `<path>` unlinks the directory under a live process.
  - *Removes it:* Check `src/reconcile.ts:processesInside([path])` before removing and refuse loudly naming the path (and PIDs) so the operator exits the shell first.
- **Initialized submodule inside `<path>`:** Probed in git 2.56.1, `git worktree remove` without `--force` exits `128` (`working trees containing submodules cannot be moved or removed`) even when clean. *(Low confidence on whether any managed repo uses initialized submodules — not checked across external repos.)*
  - *Removes it:* Let the refusal surface clearly with manual removal instructions; do not add `--force`.
- **Worktree lock & scoped `-B` flag:** Removing without `worktreeLock(repo.root)` can race `reconcile` or `buildStack`, and changing `createSparseWorktree` to always pass `-B` would let non-gated callers overwrite branches with commits.
  - *Removes it:* Run `git worktree remove` under `worktreeLock(repo.root)` (matching `src/reconcile.ts:removeWorktree` and `src/next.ts:createSparseWorktree`), and pass `-B` only through an explicit option set under the proven commit-free gate.
- **Skipping the gate when `HEAD === trackingRef(repo)`:** Would skip cleanliness checks when a leftover worktree sits on the current commit with dirty files.
  - *Removes it:* Evaluate the gate solely via `state.worktree === undefined && isAncestor(repo.root, 'refs/heads/' + slug, trackingRef(repo))` (true both behind and equal).

### 5. Questions the fork does not ask

1. What should `ensureWorktree` do when `state.worktree` is unset, `<path>` exists as a same-repo worktree, and `refs/heads/<slug>` does **not** exist (for example, `<path>` is on detached HEAD or another branch)?
2. In `src/next.ts:dispatchLeaf`, `mustCreate` is `!existsSync(resolve(worktreeStore(repo), slug))` to mirror `ensureWorktree`. Now that an existing leftover worktree may be removed and recreated, should `mustCreate` stay `!existsSync(path)` or become `state.worktree === undefined`?
3. `src/next.ts:seatCommand` (`akrogon seat <slug> <A|B>`) and `src/next.ts:broadcastPass` call `allocate` -> `ensureWorktree` without calling `checkBase`. Should `ensureWorktree` call `localBase(repo)` before the ancestry check so a missing local tracking ref yields `PreflightError` `C3` rather than a raw `git merge-base` error?

---

## Q2: Dirty leftover worktree (modified or untracked files) under the gate

### 1. Pick, reason, and cost

**Pick: a. Refuse loudly at allocation (no seat starts; error names the path, the files, and the removal step).**

- **Reason:** Uncommitted edits or untracked files in an unmanaged leftover worktree may be salvageable work from the withdrawn attempt (as in #156, where four test files came from the earlier run and one conflicted when re-applied) or operator edits. Refusing before `saveState` and before seat launch prevents silent data loss, prevents silent pollution of `plan.synthesis`, consumes zero seat capacity, leaves `state.worktree` unset so retry works immediately once cleared, and matches `src/reconcile.ts` (which never deletes dirty or unmanaged worktrees). It also introduces no new record kind, honoring `signposts.md` section "Taken".
- **Cost:** That one leaf stalls until the operator inspects and removes the leftover worktree (also holding any leaves listing it in `blocked-by`). Independent leaves in the repo keep running, and no seat slot is held.

### 2. Rejected options

- **b. Save the leftover diff to a record, reset the tree, and continue:** Rejected because it invents a new record kind that no existing skill or command reads (against `signposts.md` section "Taken"), a plain diff omits untracked files and binary/index state unless building a bespoke archive format, resetting an unmanaged directory destructively alters files the operator has not reviewed, and the fresh seat still has no signal on whether those changes belong in the new attempt.
- **c. Carry the files into the new attempt (today's behavior):** Rejected because it reproduces the dirty-leftover half of #156, leaves the `learnings/LESSONS.md` mechanism unretired (blocking retirement under lesson rule Retire), is incompatible with Q1a (`git worktree remove` without `--force` refuses dirty trees), and even under Q1b silently shadows newly tracked files in sparse checkouts or fails mid-merge on overlapping edits.

### 3. Evidence

- `practitioner` — `issues/chart/fresh-leaf-base/INTAKE.md` section "Source: Tamdoma/akrogon#156" and `learnings/history/2026-11-24-leaf-worktree-stale-base.md` sections "Case" and "Learning" (2026-11-24): four leftover test files sat uncommitted from the 2026-11-19 attempt; re-applying after fast-forward conflicted on one file; "Leftover uncommitted files from an abandoned attempt then sit in the new attempt's tree without any record."
- `practitioner` — `learnings/LESSONS.md` line "leaf worktree kept at a stale base" (2026-11-24): explicitly cites the earlier attempt's uncommitted files as part of the lesson mechanism.
- `practitioner` — `src/reconcile.ts:worktreeRemovable`, `src/reconcile.ts:removeWorktree`, `src/reconcile.ts:reconcile` (inspected 2026-11-25): akrogon's cleanup contract never force-removes dirty or unmanaged worktrees.
- `practitioner` — `src/next.ts:allocate`, `src/next.ts:ensureWorktree`, `src/next.ts:dispatchLeaf` (inspected 2026-11-25): throwing inside `ensureWorktree` happens before `saveState` sets `worktree`, before `dispatchSlot` starts any seat, and is caught by `dispatchLeaf` to emit a structured JSON skip via `report` and set exit code 1.
- `practitioner` — `issues/chart/fresh-leaf-base/forks/signposts.md` section "Taken" (2026-11-25): reuses existing records and avoids new record kinds unless no other way exists.
- `practitioner` — Temp-repo probe, git 2.56.1 (2026-11-25): `git worktree remove <path>` without `--force` exits `128` on modified, staged, or untracked files, but stderr only states `'<path>' contains modified or untracked files, use --force to delete it` without listing which files.

### 4. Pitfalls and what removes each

- **Relying on `git worktree remove` stderr alone omits the file list:** Git's refusal names only the directory, not the dirty or untracked paths.
  - *Removes it:* Run `git -C <path> status --porcelain` before removal; when non-empty, throw a clear refusal naming `<path>`, the dirty/untracked paths (capped, e.g., first 20 entries plus total count so huge untracked trees do not flood stderr), and the operator remedy (`git worktree remove --force <path>` after inspecting or saving changes).
- **In-progress merge/rebase with clean status:** `git status --porcelain` can be empty while `MERGE_HEAD` or `rebase-merge` exists.
  - *Removes it:* Check the `worktreeRemovable` operation markers alongside `status --porcelain` and name the active operation in the refusal.
- **Quiet skips during automatic wakes:** In `src/next.ts:dispatchLeaf`, allocation throws are only emitted as JSON to stderr via `report(...)` with no Herdr notice. On manual `akrogon next <slug>` the caller sees stderr immediately, but when a `blocked-by` leaf wakes automatically after its dependency lands (`landedWake` -> `dispatchDependents`), stderr may go unnoticed.
  - *Removes it:* Keep stderr clear and actionable for manual calls; decide explicitly (see Q5) whether automatic passes should also surface allocation refusals via a notice or `akrogon status`.
- **Same-commit dirty leftover slipping past a `HEAD !== trackingRef` shortcut:** A leftover at the exact current tracking commit with modified/untracked files would be carried over if the gate skipped equal SHAs.
  - *Removes it:* Gate on `isAncestor(branch, trackingRef)` (which includes equality), so dirty leftovers are always refused.

### 5. Questions the fork does not ask

1. What if a leftover worktree has a branch **with** commits of its own (outside the gate) *and* uncommitted or untracked files? `skills/chart-issues/assets/direct-route.md` section "Growth stop" always leaves a clean tree after its partial commit, so a dirty tree even on a branch with commits is never an expected direct-route handoff — should dirty files be refused on every first adoption (`state.worktree === undefined`), or only under the commit-free gate?
2. Should an allocation refusal on an automatic wake (`--wake`, `--resume`, `landedWake`) raise a Herdr notice or appear in `akrogon status`, or is `report(...)` to stderr enough?

---

## Q3: Whether first allocation fetches the remote before reading the tracking ref

### 1. Pick, reason, and cost

**Pick: a. No. Start from the local tracking ref without fetching; name a stale local tracking ref as a residual.**

- **Reason:**
  1. **Matches scope and retires the lesson:** `INTAKE.md` section "Scope" targets "holding the current tracking ref, not a stale reused worktree or branch." In #156, local `origin/main` was already up to date (`4055186fd7`, 1271 commits ahead of the leftover worktree); the bug was ignoring it. Fixing leftover reuse at `ensureWorktree` stops the `learnings/LESSONS.md` mechanism on every reachable path without fetching.
  2. **Preserves the `preflight` / `C3` contract:** `src/preflight.ts:checkBase` and `tests/next.test.ts` explicitly assert that a missing local tracking ref is refused as `C3` with remedy `git fetch <remote> <branch>`, not auto-fetched.
  3. **Keeps network I/O out of the global lock:** `src/next.ts:nextCommand`, `seatCommand`, and `broadcastPass` call `allocate` -> `ensureWorktree` while holding `withLock(globalHome/.lock)`. Existing `git fetch` callers (`src/next.ts:reconcileBatch`, `src/next.ts:mergeTurn`, `src/phase.ts:finishPush`) deliberately fetch *outside* the global lock so remote latency does not block every akrogon command on the machine.
  4. **Local tracking ref already updates on normal akrogon flows:** Probed in git 2.56.1, both `git push origin <head>:refs/heads/main` (`src/phase.ts:landPush`) and `git fetch <remote> <default_branch>` (`src/sync.ts:integrate`) update `refs/remotes/<remote>/<default_branch>` locally, as do `mergeTurn`, `reconcileBatch`, and `finishPush`.
  5. **Fewest moving parts:** Honors `signposts.md` section "Taken" (3a) and avoids duplicating remote traffic alongside `checkBase`'s `git ls-remote` or inventing a new fetch-failure policy for `next` and `seat`.
- **Cost:** Residual failure class — if commits reach the remote out of band (another machine, GitHub UI merge, or a separate clone) and neither `akrogon sync`, a merge turn, nor `git fetch` runs locally before handoff, a first allocation (fresh or leftover) starts from the last locally fetched `trackingRef(repo)` instead of the remote tip.

### 2. Rejected options

- **b. Run one `git fetch <remote>` before a first allocation:** Rejected because:
  1. **Scope expansion:** Solves a different failure class (stale local tracking ref for *all* new leaves) rather than leftover-worktree reuse.
  2. **Contract and lock conflicts:** Running before `checkBase` breaks `C3` refusal (`tests/next.test.ts`); running inside `ensureWorktree` holds `globalHome/.lock` across full network I/O and makes a second remote round-trip right after `checkBase`'s `git ls-remote`, unless refactored outside the lock with a TOCTOU re-check.
  3. **Unscoped fetch hazards:** `git fetch <remote>` without a branch argument pulls every remote branch and tag, increasing latency and failing on unrelated remote tag/ref conflicts.
  4. **Unclear failure mode:** Forces a choice between failing hard offline (blocking `akrogon seat` / `next` on transient remote errors) or silently warning and falling back to the stale local ref anyway (like `src/next.ts:mergeTurn`), adding moving parts for marginal guarantee.

### 3. Evidence

- `practitioner` — `issues/chart/fresh-leaf-base/INTAKE.md` sections "Scope" and "Source: Tamdoma/akrogon#156" (2026-11-24): scope names "the current tracking ref"; in #156 `origin/main` was already at `4055186fd7` with the merged dependency present locally.
- `practitioner` — `learnings/LESSONS.md` line "leaf worktree kept at a stale base" and `learnings/history/2026-11-24-leaf-worktree-stale-base.md` section "Learning" (2026-11-24): mechanism is reusing an old worktree/branch instead of `trackingRef(repo)`.
- `practitioner` — `src/preflight.ts:checkBase`, `src/preflight.ts:localBase`, `src/preflight.ts:remoteBase`, and `tests/next.test.ts` (tests "next refuses a new leaf with a missing base (C3) before worktree creation", "next dispatches an existing worktree without querying an unreachable remote", "next refuses to create a worktree while the remote is unreachable", inspected 2026-11-25): `checkBase` explicitly enforces `C3` without fetching, and queries the remote via `ls-remote` only when `mustCreate` is true.
- `practitioner` — `src/next.ts:nextCommand`, `src/next.ts:reconcileBatch`, `src/next.ts:mergeTurn`, `src/next.ts:seatCommand`, `src/next.ts:broadcastPass`, `src/phase.ts:landPush`, `src/phase.ts:finishPush`, `src/sync.ts:integrate` (inspected 2026-11-25): `allocate` runs inside `globalHome/.lock`, whereas `reconcileBatch`, `mergeTurn`, and `finishPush` fetch outside it; `landPush` and `sync` keep `trackingRef(repo)` current on normal landings and syncs.
- `practitioner` — Temp-repo probe, git 2.56.1 (2026-11-25): both `git push origin <sha>:main` and `git fetch origin main` update `refs/remotes/origin/main` locally when standard fetch refspecs are configured.
- `practitioner` — `issues/chart/fresh-leaf-base/forks/signposts.md` section "Taken" (2026-11-25): 3a (fewest moving parts).

### 4. Pitfalls and what removes each

- **False expectation that "fresh base" means freshly fetched from the remote:** An operator or agent who merges a PR in GitHub UI without running `akrogon sync` or `git fetch` could still see an older local `trackingRef(repo)`.
  - *Removes it:* Name the stale local tracking ref explicitly as a residual in the chart/design, with the clear boundary: first allocation starts from local `trackingRef(repo)`, refreshed by `akrogon sync`, landings, merge turns, or manual `git fetch <remote> <default_branch>`.
- **Missing local tracking ref when entering `ensureWorktree` via `seatCommand`:** `seatCommand` does not call `checkBase`, so a missing `trackingRef(repo)` would hit `isAncestor` first and throw a raw git error instead of `PreflightError` `C3`.
  - *Removes it:* Call `localBase(repo)` inside `ensureWorktree` before evaluating the commit-free gate (cheap local `rev-parse`, zero network I/O, gives consistent `C3` errors on every entry path).
- **Mismatch between `mustCreate` in `dispatchLeaf` and recreate behavior:** If `mustCreate` remains `!existsSync(path)`, a clean leftover worktree skips `remoteBase` even though `ensureWorktree` will recreate it, while a brand-new leaf runs `remoteBase`.
  - *Removes it:* Decide explicitly whether `mustCreate` means "worktree dir absent" or "first allocation (`state.worktree === undefined`)" and test the chosen behavior.

### 5. Questions the fork does not ask

1. If stale local tracking refs later prove to be a recurring real problem (e.g., frequent out-of-band pushes), should `src/preflight.ts:checkBase` compare the SHA `git ls-remote` already fetches against `localBase(repo)` (warning or refusing when behind, or replacing `ls-remote` with a single scoped `git fetch <remote> <default_branch>` outside the global lock) rather than adding a separate fetch inside `ensureWorktree`?
2. Should `akrogon handoff` / chart handoff documentation explicitly note that `akrogon sync` (which already fetches `default_branch`) keeps `trackingRef(repo)` current before `akrogon next`, making out-of-band staleness rare in normal workflow?
