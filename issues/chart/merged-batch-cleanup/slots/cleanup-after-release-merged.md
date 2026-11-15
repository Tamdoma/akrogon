# Merged notes: cleanup-after-release (from blind maps slots/map-A.md and slots/map-B.md)

## Q1 Where does cleanup follow the batch release?

- Clear the batch at the merged move (A map F1b, B map F1a). Rejected (A,B): the land unit lives in the leaf slice and still runs `landedWake` after the move (src/land.ts `land`, `launchLand`); cleanup made eligible then could stop its slice and seats mid-run. Also misses the `reconcileBatch` merge-holder recovery route (A).
- Move `reconcileRepos` to after `mergePass` in `nextCommand` and `unpausePass` (A map F1a, B map F2a). Covers listener and typed passes, but not `mergeWake` (land `handOff`, `landedWake`, phase wakes), which also calls `mergePass` and can release batches (B E2, F3). Changes the timing of every pass's cleanup (A, lesson 2026-10-11; B: pre-merge cleanup, host-report batching).
- Keep the first reconcile and add a final one after merge processing (B map F2b). Two full scans per pass (B).
- At the release point (A map F1c; B map F3a "the shared merge-processing boundary"): every release goes through `reconcileBatch` (src/next.ts), whose release section already holds the global lock. After it clears the batch of a holder that ends `merged`, it runs the existing `reconcileRepos` for that repo on a fresh view. Covers `nextCommand`, `unpausePass` and `mergeWake` alike, adds one scan only when a release happens (once per merge), changes no other pass's timing, keeps every existing veto (B S5). Cost: a call inside the lock section; `reconcileRepos` runs `reconcileHost` too (B P4: acting set is this repo only).
- Separate release from merge dispatch into its own stage before cleanup (B F2c). Rejected (B): new orchestration boundary, nested-lock risk.

## Q2 Proof

- (A,B) One fixture test at the pass boundary, seeded through the existing `tests/batch-dispatch.test.ts` pattern: closed merged holder, applied command batch, candidate published, recorded, no broadcast, land unit inactive; one `next --all`; then no batch, no worktree pointer, path and registration gone, branch gone, seats removed, tab closed. Red on base, green after, asserted after the first invocation (B P5).
- (B) A second route: a merge-phase holder with a landed candidate (land died after push), seats ended, no live tab (B P7); one pass moves, records one attempt, releases and cleans. Adapt the existing green-merge recovery test.
- (A,B) Existing guards stay green: fetch failure keeps batch, worktree and branch; a live land attempt is untouched; a working broadcast survives until done.

## Pitfalls

- Stale view: cleanup rediscovers after the move to closed (B P1); `reconcileRepos` rediscovers.
- Lock nesting: `reconcileRepos` takes no lock itself; called inside the release section, no nesting (A, B P2).
- Pause and mode: keep `isAutomatic` and pause checks (B P4).
- Open-owner leaf: `mergedWorktree` keeps an open-owner leaf's worktree after closing its tab; unchanged and out of scope (B P7).

## Points where slots differ

- B preferred testing a move of the existing reconcile first (F2a); A prefers the release point because F2a misses `mergeWake` (B's own E2/F3).
