# Does sync refuse a non-default branch and commit only issue records?

## Question
What may `akrogon sync` stage, from which branch, under which lock?

### Carries
Standing design. Q14 finding: a stray deletion of `issues/parked/status-empty-open` was committed by sync in 13f92e0.

## Findings
(both) `src/sync.ts:175-180` stages everything and pushes `HEAD:main` from any branch, no lock. (B) reproduced: side branch plus unrelated file reached remote main; pre-staged unrelated changes also land, so scoping `git add` alone is insufficient; park holds only the global lock while phase holds global then repo. (both) `src/init.ts:38` ignores `issues/worktrees/` regardless of `worktree_root`.

## Resolution
Operator 2026-09-11: `2a` after explanation. Sync refuses when HEAD is not the checked-out `default_branch` or is detached, commits only paths under `issues/` excluding seeds, `.lock` files and the configured worktree root, leaves unrelated index and tree untouched, and holds the global then repo lock. Init ignores the configured `worktree_root`. Foreclosed: syncing from any branch through a separate index.
