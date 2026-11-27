# Final-shape check, Slot C: `fresh-worktree-setup`

Three concrete code-path blockers to fix in the shape/spec before implementation (no re-argued dissents):

## Blockers

1. **Item 4 + Item 2 — `ensureLeafTemp` runs *after* `ensureWorktree` (`src/next.ts:allocate`)**:
   - *Inputs*: Any brand-new leaf on first allocation (its `leafTemp(repo, slug)` directory does not exist yet).
   - *Wrong state*: `src/next.ts:allocate` currently calls `ensureWorktree(repo, leaf, live)` first and `ensureLeafTemp(repo, worktree.slug)` after. Creating Item 4's scratch dir (`mkdtempSync`) under `leafTemp(repo, slug)` inside `ensureWorktree` throws `ENOENT` on every first allocation.
   - *Fix*: Call `ensureLeafTemp(repo, leaf.state.slug)` before creating the scratch dir (and prefix the scratch dir `setup-`, not `run-`, so `src/reconcile.ts:ownerKeeps` never treats it as an `.owner`-bearing run dir).

2. **Item 2 — `allocate` returning `null` for a busy seat misroutes `dispatchLeaf` and `seatCommand` (`src/next.ts:allocate`, `dispatchLeaf`, `seatCommand`)**:
   - *Inputs*: Leaf with a stale marker and a live `working` seat A during `akrogon next` (`dispatchLeaf`) or `akrogon seat <slug> B` (`seatCommand`).
   - *Wrong state*: `allocate` currently returns `Allocation | null`, where `dispatchLeaf` treats `null` as `end('capacity')` (recording a false `capacity` wait in `timings.jsonl` and moving the leaf out of `resumeRepos`'s active sweep into `refill()`), and `seatCommand` throws `No free seat capacity: undefined`.
   - *Fix*: Return a distinct busy variant from `allocate` (not `null`), so `dispatchLeaf` returns `end('none')`, `broadcastPass` returns without error, and `seatCommand` throws naming the busy seat.

3. **Item 2 — Seat-only busy predicate misses a live `run-check` on the leaf (`src/next.ts:allocate`, `src/admission.ts:liveRuns`)**:
   - *Inputs*: Seat A starts a background `akrogon run-check` in leaf L and ends its turn (`A.status.state` is `'idle'`/`'done'`), so `setupCommand`'s flock has released and the check command is actively running in the worktree. Meanwhile `issues/config.yaml`'s `setup` changes on `main` via `selfUpdate`, and `next --wake` runs.
   - *Wrong state*: Both recorded seats read `idle`/`done`, so Item 2 runs `setup` (e.g., `pi-extensions`'s `npm ci`) concurrently with the leaf's live `run-check` command.
   - *Fix*: Include `liveRuns().some((r) => r.repo === repo.name && r.leaf === leaf.state.slug)` in the busy check (matching `src/next.ts:dispatchSlot`'s existing guard).

## Verification of the three asked checks

- **Busy test vs real seat status values (`src/next.ts:dispatchSlot`, `src/hc.ts:Seen`)**: `liveSeat(t) && t.status?.state !== 'idle' && t.status?.state !== 'done'` matches `dispatchSlot`'s exact non-deliverable status set (`'working'`, `'blocked'`, `'error'`, `null`). Combined with Blockers 2 and 3 above, it holds.
- **`src/batch.ts:move` as the sole post-creation leaf worktree file mutation**: Confirmed across `src/` — `move`'s `git -C leaf.state.worktree reset --keep target` (via `applyTop` from `src/next.ts:mergeTurn` and `src/phase.ts:restack`) is the only akrogon path that mutates tracked files in an existing leaf worktree after creation. One edge detail: unlink the marker right after `reset --keep` executes (not only when `remaining === ''` returns `'worktree'`), because if a concurrent untracked file lands mid-reset `move` returns `'dirty-ref'` after `reset --keep` already updated the working tree.
- **Item 5 vs `createSparseWorktree`'s catch and `tests/first-allocation.test.ts`**: Composes cleanly with no conflict. Set `created = true` only *after* `createSparseWorktree` resolves so a failure inside `createSparseWorktree` is not double-removed; on setup/guard failure when `created`, remove via `git worktree remove --force` under `worktreeLock` and skip `saveState` (matching `expectRefusal`'s no-`worktree:` invariant and keeping adopted worktrees untouched). Note: `guard(worktree, ['own-modules'])` (`src/guard.ts:guard`) returns `1` rather than throwing, so Item 7 must check its return code and throw to trigger rollback.
