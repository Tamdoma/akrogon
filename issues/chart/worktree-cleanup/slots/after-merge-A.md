# Notes, slot A (written before reading B, C, D)

## Q1 stacked members
- Pick: no new close path for the worktree. Reason: reconcile's `mergedWorktree` closes the live tab of any merged leaf (src/reconcile.ts:245-250) and removes the worktree on the following pass; reconcile runs on every `akrogon next` pass and on tab-close events (src/next.ts:1327, :1441). So a stacked member's tab and worktree go one or two passes later, not never. The skipped `dispatchDependents` for members (src/next.ts:991-994) delays dependents, which is dispatch, not worktree cleanup. Cost: cleanup of members lags the holder by a pass.
- Dirty member worktree (`dirty-ref`, src/batch.ts:164-166): keep, reported as `uncommitted changes`. Reason: a leaf's own worktree is where seats work, so uncommitted files may be real unsaved work; 2a/3a covered scratch copies only. Cost: it stays until someone looks, which Q2 makes visible.
- Rejected: force-remove a merged leaf's own dirty worktree (loses seat work); add closeMergedTab for members inside reconcileBatch (duplicates reconcile's close).
- Evidence: code, 2026-10-15, lines above. Explore pass on real batch merges pending.
- Pitfall: if no next pass follows a batch merge (paused repo), members stay; removed by reconcile on the next pass whenever it runs.
- Extra question: should dependents of stacked members dispatch at merge (separate seed, out of #93)?

## Q2 plain status
- Pick: plain `akrogon status` prints every kept entry with path and reason per repo. Reason: today only `akrogon status <slug>` prints them (src/status.ts:352), and with no open leaves nobody sees them. Cost: kept lines appear on every status call until resolved; the file is rewritten each reconcile pass so stale entries drop.
- Rejected: only log them in `next` output (scrolls away).
- Pitfall: status tests snapshot output; a done-criterion covers the line.

## Q3 unregistered folders
- Pick: keep and report (now visible by Q2). Reason: the store also holds folders akrogon did not make, and `prose-asserts-u1-cmdlogs` came from a since-fixed bug (before a77c260, D map). Cost: the operator deletes such a folder by hand.
- Rejected: delete by finished-leaf prefix (could delete operator folders; names like `<slug>-*` are not ownership proof).
