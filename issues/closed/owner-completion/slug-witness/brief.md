# Brief: slug-witness

## What

`closeSources` closes each source with the comment `delivered by <slug>`, where the slug is the leaf whose completion closed it, the same text `akrogon close --by` already posts. The worktree requirement and the `git rev-parse HEAD` read are removed, so a merged sourced leaf whose worktree was cleaned up completes on retry: its sources close and its owner moves to `issues/closed`.

## Why

`closeSources` throws "Sourced completion requires a worktree" once reconcile removes a merged leaf's worktree, so every later completion retry fails and the owner never closes (#103: 20 framework leaves, repaired by hand before this chart). The commit hash it posted was presentation only: nothing reads it back, and for an epic's shared sources it was the triggering leaf's HEAD, not the delivering commit.

## Done-criteria

1. A merged leaf with a GitHub source and no recorded worktree, under an otherwise complete owner, completes on retry through `akrogon next`: the fake GitHub receives a close with comment `delivered by <slug>` and the owner folder moves to `issues/closed`. Shown failing before the change (today: "Sourced completion requires a worktree") and passing after, through the CLI test fixture.
2. At epic completion, a source shared by leaves of different child issues is closed with the triggering leaf's slug in the comment.
3. No text under `src`, `tests` or `skills` still describes the completion source-close comment as `merged <commit>`.
