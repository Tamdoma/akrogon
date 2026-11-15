# Territory map, slot A

## Mechanism as inspected (main 50d925f2)

- `nextCommand` (src/next.ts): under the global lock, sweep then `reconcileRepos`; after the lock, `mergePass` per touched repo. `unpausePass` has the same order. So cleanup always runs before the pass's merge step.
- `mergeTurn` → `reconcileBatch` releases a batch: holder already `merged` → `batch: undefined` (last branch); holder in `merge` with a landed candidate → `commandMerged` then `batch: undefined`; not landed → `batch: undefined`. Each runs after this pass's cleanup.
- Land route (src/land.ts `land` → src/phase.ts `landPush` → `batchPush`): on push success it appends the attempt, sets `recorded: true`, then moves the leaf to merged with the batch still set. `landAlive` keeps `reconcileBatch` off while the land unit lives; `landedWake` closes the tab only when no broadcast waits.
- src/reconcile.ts keeps a worktree for `state.batch` in two places (per-leaf loop and `mergedWorktree`), and `reconcileNeedsPanes` skips batch leaves. A merged leaf with no batch is fully handled by the existing path (tests/hc-teardown.test.ts, tests/next.test.ts merged cleanup tests).
- What the batch protects on a merged leaf: an unconfirmed publication (tests/batch-dispatch.test.ts "cleanup retains a merged holder worktree while publication recovery is blocked": candidate set, fetch fails). After a successful push with `recorded: true` it protects nothing the land unit still uses: `landedWake` touches tabs and dependents, not the worktree.
- Listener (src/listen.ts): passes only on startup/resubscription and a labelled terminal's turn, blocked, finished or lost. Nothing fires after a pass's own writes.

## Forks

### F1 mechanism: how does the releasing pass finish cleanup?

- a. Cleanup last: in `nextCommand` (and `unpausePass`) run `reconcileRepos` after `mergePass` instead of before. Covers every release route (signpost 2a) and any other state the merge step leaves, with no new state or call. Could break: anything that relied on cleanup before the merge step in the same pass (a missing worktree's record cleared before `mergeTurn` reads it; tab-close timing); invites doc drift on cleanup timing (lesson 2026-10-11). Lock: reconcile takes the lock again after `mergePass`.
- b. Remove the window: `batchPush` success moves to merged and drops the batch in the same write (both the land and seat routes go through it). Removes "merged + recorded batch" state. Misses the `reconcileBatch` merge-holder recovery route (land died after push, before the move), which releases after cleanup ran, so signpost 2a is not met alone.
- c. After `reconcileBatch` releases a merged holder, call cleanup for that repo. Adds a call and a path; covers release routes but not other merge-step changes.
- d. a + b.
- A leans a: one structural move, no added parts; b only if a breaks a same-pass dependency.

### F2 proof: what test proves it?

- One fixture test at the pass boundary: a merged leaf with a landed, recorded batch, its tab live with finished seats; one `next` pass leaves no worktree, no branch and no tab. Red on base (worktree kept for `state.batch`), green after. Plus the existing retention test stays green (unconfirmed publication still kept).
- Practitioner question: does the reorder change any existing test's expectation of cleanup-before-merge? The plan must run tests/next.test.ts, batch-dispatch, green-merge, pause-next.

## Pitfalls

- Removing a worktree whose publication is unconfirmed: kept by the unchanged `state.batch` veto; existing retention test is the guard.
- Cleanup while the land unit is alive: `reconcileBatch` does not release while `landAlive`, so the veto stays until the unit exits.
- Doc drift: the plan greps docs for cleanup timing claims (src/AREA.md, docs/) and updates the one that states the order.

## Off route

- A periodic pass or new listener event (signposts 1a, 2a).
- Leftover display (signpost 5a). The current framework leftovers: the operator's (a later `akrogon next` in framework).
