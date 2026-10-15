# Release final shape (A, 2026-10-16, operator on autopilot: 1a 2a 3a)

1. Failed leaves keep their tab (today's behavior). No change.
2. The slice stop in the per-repo step (src/reconcile.ts:476-500) and the host step (src/reconcile.ts:1045-1068) no longer skip unfinished leaves. Any leaf whose recorded tab is proven gone, that is not the pass's own slice and that no live run record names, gets its loaded slice stopped. An unfinished leaf with no recorded tab is not stopped (it was never dispatched, or is mid-dispatch).
3. Leaf temp deletion (src/reconcile.ts:951-973): when the unit inventory is unreadable (`loadedSlices === null`), a leaf's temp is kept with an inventory-unavailable reason, for every phase, like `live === null`.
4. After an unfinished leaf's slice is stopped because its tab vanished, the existing tab_closed flow still re-dispatches it (src/next.ts:1445-1470) with new seats adopted into the same slice name.
5. Parked leaves stay outside the leaf map; their temp stays with the unowned sweep.
6. Leaf temp stays on disk at `/var/tmp/akr-<uid>/<4>/<8>`; the leaf-path lock is recorded as superseded by c698170.
7. Destination text changes to: a leaf's temp lives in one short folder it owns on disk under `/var/tmp`, and once the leaf's tab is gone and its processes are stopped, the temp is deleted whatever the leaf's phase; failed leaves keep their tab for recovery.
