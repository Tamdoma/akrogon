# Final B: wake-cost

Checked 'Taken' at main 814a2387. Four breaks. B1 and B2 are mistakes in my own design list (I1 said open is enough for every `discover` caller). Picks 2, 4 and 5 are ok. (H) marks what I counted on 2026-11-23.

## Breaks

- B1. Pick 3: the broadcast is never sent.
  - A leaf that completes its owner is moved to closed inside the move to merged (`src/phase.ts:275`), with the broadcast saved in that same move (`src/phase.ts:353`). So a leaf with a pending broadcast sits in closed.
  - `broadcastPass` finds it through `discover` (`src/next.ts:1165, :1168`). Open only, it finds nothing and B is never prompted.
  - Size: 256 closed framework leaves and 49 closed akrogon leaves carry a broadcast (H).
  - Fix: `broadcastPass` names closed.
- B2. Pick 3: closed leaves keep their tab and worktree.
  - `reconcileRepos` passes `discover`'s leaves to `reconcile` (`src/next.ts:1439, :1445`). `reconcile` closes the tab of a merged leaf (`src/reconcile.ts:811-819`), ends its finished seats (`:821`) and removes its worktree (`:855-856`, with `open` false for a closed leaf).
  - Open only, a leaf whose owner completed is never in that list. Its worktree falls to the unowned branch and stays while any leaf of the repo runs (`src/reconcile.ts:965-968`).
  - Fix: `reconcileRepos` names closed.
  - Cost of both fixes: about three closed walks per repo per pass, about 0.4 s in all where my design said 0.15 s. Today it is 1.9 s (H).
- B3. Pick 1: the wait write recreates a moved leaf folder.
  - `src/next.ts:727-728` runs `completeOwner`, then `recordWait(repo, slug, 'none')`. A merged leaf last waited on `merge_turn` (`:782`, `:1023`), so that call writes.
  - When `completeOwner` moves the owner there (a completion that `src/phase.ts:275` could not do earlier), the write goes to the old open path. `writeYaml` creates missing folders (`src/shell.ts:148`). The result is an owner folder in open and in closed, which `twinConflict` then refuses (`src/turn.ts:14-24`).
  - Fix: record the wait before `completeOwner`.
- B4. Pick 1: a wait write outside the lock can undo the land's save.
  - `src/next.ts:1023` records `merge_turn` for the holder while the land run is alive. The holder was read at `:1015`. No lock is held there (the locks start at `:1026`).
  - The land saves the batch record under the lock (`src/phase.ts:906-909`). A state write at `:1023` from the older copy drops that save.
  - Fix: `recordWait` reads the state again and writes it under the global lock, and `:1023` takes the lock. Inside `dispatchLeaf` the local `state` must take the written value, or the later save at `src/next.ts:739` drops `wait`.

## Not breaks

- `phaseWake` (`src/next.ts:1239`) no longer finds a leaf that an operator moved to merged and that closed. Its dependents start on the next wake through the new filter term.
- `landedWake` (`src/next.ts:1311`) is fine. A leaf it does not find has completed its owner, so it has a broadcast and the tab close is skipped anyway.
