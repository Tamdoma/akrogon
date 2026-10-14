# Re-check brief: C1 temp fix, round 2 (B and C)

Your round-1 returns: fix-temp-review-B.md (F1, akrogon-io-* captured output deleted by the wipe), fix-temp-review-C.md (no defects).
A's repair: the new-tab wipe in `src/next.ts` is removed entirely. Reconcile stays the only remover of leaf temp, keeping a leaf's folder while any run root has a live owner (`src/reconcile.ts:415-445`). The test now asserts a top-level `akrogon-io-*/out` survives a no-tab redispatch. Diff: `/home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/fix-temp-diff-2.patch` (worktree `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/wt-temp`).
Evidence: config, next and reconcile test files 282 pass 0 fail; typecheck clean; round-1 full suite 892 pass 0 fail.
Trade-off A accepts: a new seat can inherit the previous seat's top-level temp until reconcile removes it on a later tab close; it is now on disk, not RAM.

Return `/home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/fix-temp-recheck-<your letter>.md`: concrete defects with file:line and failing scenario, or "no defects". Do not edit the worktree.
