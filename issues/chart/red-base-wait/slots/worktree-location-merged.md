# Worktree location, merged A and B

## Q1 placement
- Pick (A,B): new default outside the repo, plus a parse-time reject of any worktree_root whose real path (symlinks resolved) lies inside the registered checkout (A,B). Default location: sibling `<checkout>-worktrees` (B), e.g. /home/ivan/Work/infra/tamdoma/framework-worktrees/<slug>. A's globalHome idea dropped: globalHome defaults to the akrogon repo itself (B O3, src/config.ts:172-177), which repeats the defect for akrogon's own leaves.
- One resolver for config, init and sync (A,B): src/config.ts:233 and src/init.ts:60 resolve, src/sync.ts:17 expands.
- Base checkouts (B, A agrees): already external. Skills create them with mktemp -d under the exported leaf TMPDIR (/tmp/akrogon-<uid>/..., src/config.ts:232-245, src/next.ts:413). Only add: the leaf temp root obeys the same inside-checkout reject. A's "<slug>-base beside the leaf" dropped.
- Test (B R5): fixture with a dependency only in main; nested lookup reaches it; external leaf and base cannot.

## Q2 existing worktrees and explicit configs (differ)
- Facts (B): framework and akrogon both set `worktree_root: issues/worktrees` explicitly (issues/config.yaml:3), so a new default changes nothing for them. src/next.ts:276-307 refuses a leaf whose recorded path differs from the configured root.
- B pick: rollout step: quiesce, `git worktree move` each live tree, reconcile state.worktree, restart seats; owner rollout operator, pending.
- A pick (simpler, no manual step): already-allocated leaves keep their recorded path (the mismatch check accepts an existing recorded path; new allocations use the configured root). The config lines in both repos are changed by the leaf (akrogon) and as one handoff step (framework). Old nested trees drain as their leaves merge. Cost: until they drain, those leaves can still hit a nested false red. Today's C8 false red is already fixed in framework (ac0349c33, ffaa233f4).
