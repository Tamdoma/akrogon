# Brief: kept-status

## What
Plain `akrogon status` prints, per registered repo, each path the last cleanup kept and its reason, also for repos with no open leaves, only for paths that still exist, labelled as the last cleanup's result. A merged leaf's own worktree with uncommitted changes stays and is shown that way.

## Why
Tamdoma/akrogon#93: kept worktrees were invisible unless the operator ran `akrogon status <slug>`, so 13 GB sat unseen.

## Done-criteria
1. In a repo with no open leaves and one kept entry whose path exists, plain `akrogon status` prints that path and its reason under the repo, labelled as the last cleanup's result.
2. A kept entry whose path no longer exists is not printed.
3. Plain `akrogon status` changes nothing on disk: the kept entry, its path and the report file are unchanged after it runs.
4. A merged leaf's own worktree with uncommitted changes is still on disk after a reconcile pass and shows in plain status with reason `uncommitted changes`.
