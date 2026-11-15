# Brief: cleanup-last-in-pass

## What

`akrogon next` (every mode) and the unpause pass run their existing cleanup (`reconcileRepos`) after the merge step instead of before it, once per invocation, under the global lock, for the same repos and automatic flag as today, on a fresh read of the leaves. A merged leaf whose merge batch the pass releases is then cleaned up by that same pass: seats ended, tab closed, worktree and branch removed, with every existing retention rule kept. `mergeWake` is unchanged and runs no repo cleanup. No new state, timer, event or listener change.

## Why

Tamdoma/akrogon#132: framework leaf `scenario-settle-read` kept its tab, two live seats, worktree, branch and slice for hours after merging. Its batch is released only by a pass's merge step (`reconcileBatch` in src/next.ts), and every pass runs cleanup before that step. The releasing pass at 11:04:03Z kept the worktree for `state.batch`, released the batch at 11:04:05Z, and under the hc listener no further event came, since the leaf's seats were already done and no other leaf was open. The report expects cleanup "should not depend on a later, unrelated `akrogon next` pass".

## Done-criteria

1. One `akrogon next` pass that releases the landed, recorded batch of a merged holder whose owner has moved to closed, with no broadcast pending and its seats finished, ends with no batch, no worktree pointer, path or Git registration, no branch, no recorded seats and its tab closed, all observed after that first invocation. It fails on the base and passes after.
2. A holder still in `merge` with a landed candidate whose land unit is gone, an incomplete owner (so no broadcast is created) and no live tab: one pass moves it to merged, records one attempt and releases its batch, and a second pass right after, with nothing else changed, removes nothing more than the first left. It fails on the base and passes after.
3. Retention is unchanged: an unconfirmed publication (the remote cannot be fetched) keeps batch, worktree and branch; a live land attempt is untouched; a working broadcast seat survives until it finishes; seat-owned phase completion clears the batch without closing the holder's own tab. These hold in the configured `test` command.
