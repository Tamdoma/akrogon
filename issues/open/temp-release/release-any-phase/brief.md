# Brief: release-any-phase

## What
Reconcile stops the slice of any leaf whose recorded tab is proven gone, whatever its phase, then deletes its temp under today's vetoes. An unreadable unit list or pane list never counts as proof that processes stopped or that a tab vanished. Every dispatch path takes the global lock reconcile holds, so a pass never acts on a half-made dispatch. Failed leaves keep their tab.

## Why
Operator note 2026-10-02 (issues/chart/temp-release/INTAKE.md): free a leaf's resources as soon as it releases. worktree-cleanup (#93) delivered this for merged and failed leaves only. The stop step skips every unfinished leaf (src/reconcile.ts:190, 486, 1056), so an unfinished leaf whose tab vanished keeps its slice processes, and with the unit list unreadable its temp is deleted without a slice check (src/reconcile.ts:965-972).

## Done-criteria
1. An unfinished leaf (for example `implement`) whose recorded tab herdr no longer lists, with a loaded slice holding a process, no live run record naming the slice and not the pass's own slice, has its slice stopped and its temp removed after one reconcile pass.
2. The same leaf with a live run record naming its slice keeps its slice and temp.
3. An unfinished leaf whose recorded tab is live keeps its slice and temp, including when its temp folder does not exist; when the pane list is unavailable it also keeps them.
4. An unfinished leaf with no recorded tab and a loaded slice keeps its slice.
5. When the unit list cannot be read, a merged, failed or unfinished leaf's temp is kept with an inventory-unavailable reason.
6. The host-level slice step applies criteria 1 to 4 to a slice matched to an unfinished leaf.
7. A manual merge dispatch (`akrogon next <slug>` for a leaf in `merge`) holds the global lock while it records the tab and adopts seats; a reconcile pass that starts during that dispatch runs after it and keeps the new seats' slice and temp.
8. After a tab-loss stop, the `tab_closed` flow re-dispatches the leaf with seats in the same slice name, and the next pass keeps them.
9. A failed leaf whose tab is live keeps its tab, slice and temp.
