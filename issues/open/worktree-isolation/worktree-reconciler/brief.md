# Brief: worktree-reconciler

## What
Every `akrogon next` pass reconciles `git worktree list --porcelain`, the store directories from worktree-store, the leaf scratch root and its run roots from check-env, and base-run checkout records, against leaf state. It keeps a worktree while its leaf is active (not merged or failed) or a live pane is inside, and skips the run roots of a running attempt. Otherwise it removes a worktree when clean, not mid-rebase and HEAD reachable from a branch or remote; deletes branches only with `git branch -d`; and reports everything else in `akrogon status` with path and reason. Failed leaves lose the worktree and keep the branch. Run roots whose recorded process is gone are removed. Existing clean worktrees at the old in-repo location are removed so dispatch recreates them at the store from their branch, sparse. akrogon's in-process tests set AKROGON_LEAF_TEMP_ROOT inside their fixtures.

Consumes from worktree-store: the store path (`worktreeStore`) and the sparse-create helper used when dispatch recreates a migrated leaf. Consumes from check-env: the scratch root layout under `~/.akrogon/scratch/<repo>/` and the run root `.owner` record (pid, boot_id). Consumes from base-run: the base-run record lines (start, removal confirmation) and their reader. (B,C)

## Why
Worktrees are removed today only after the whole issue closes, so stock grows (failed leaves, seat-made variant checkouts, killed-run scratch, akrogon test debris in /tmp). Moving to the store needs a safe one-time migration of the old in-repo worktrees.

## Done-criteria
1. A clean worktree of a merged leaf, HEAD reachable, is removed in the next pass and its branch deleted with `-d`; a failed leaf's worktree is removed and its branch kept.
2. A worktree is kept, and reported with path and reason in `akrogon status`, when it is dirty, mid-rebase or mid-merge, has commits not reachable from any branch or remote (with count), has a live pane inside, or belongs to an active leaf; an unknown directory in the store is reported, not removed.
3. A run root whose `.owner` pid is not alive on the same boot_id is removed; a run root of a live process is kept.
4. An old clean worktree at the in-repo location for an active leaf is removed when no live tab or cwd is inside and the leaf has no `state.batch`; the next dispatch recreates it at the store, sparse, from the branch, and records the new path. Dirty, mid-rebase, live-tab, live-cwd and batch-holding cases are refused with the reason printed.
5. A worktree created sparse is read as clean by these checks (sparse state is not dirt).
6. A base-run checkout whose record lacks a removal confirmation is removed only under the rules of 1 and 2.
7. akrogon's own test run leaves nothing under `/tmp/akrogon-<uid>`.
