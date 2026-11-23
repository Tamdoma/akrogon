# Owner-roots brief (footprint)

Read forks/map.md (M2, M5, M6, X2, X3) and your own map. Taken so far: release archives drop issues/ (landed 0a74a994). run-scratch removes run roots at run end (separate chart, landing soon).

Design, independently, the smallest change that makes each of these owner-named and removed by the call that ends its owner, with file:line for where the removal goes and what proves it:
1. Watch consult folders (skills/watch-issues/scripts/consults.ts:92, :193-196): one folder per anchor, removed with the leaf (or the watch).
2. `-uN` worker worktrees: removed when the leaf leaves implement/check.fix, not only at merged/failed (src/reconcile.ts:1023-1035, src/phase.ts moveGuards). Workers can exist during check.fix.
3. Run lock files (~/.akrogon/runs/locks, 12,179 empty files, src/admission.ts:52-55, :164): live under the owner so one removal covers them, or are not needed at all.
4. Chart direct-route worktrees (src/reconcile.ts:1051-1057 "unmanaged worktree"): created sparse and removed when the chart closes; or say why not.
For each: what breaks if removal runs while the owner is live, and the one existing liveness test it reuses. Prefer deleting a mechanism over adding one.

Write slots/owner-<your slot letter>.md, then run: hc send t126 "done <letter>: <path>"
