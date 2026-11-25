# Brief: fresh-first-worktree

## What

One change in akrogon's worktree allocation, `src/next.ts:ensureWorktree`, at a leaf's first allocation (`state.worktree` unset):

1. When the slug branch `refs/heads/<slug>` exists and has no commits outside the tracking ref (`trackingRef(repo)`, equal counts), and the store path is absent or is a clean worktree on that branch, the leftover is replaced. The store path is removed, the branch is moved to the tracking ref (bound to the sha just checked), and the worktree is checked out as today's existing-branch path does. The leaf's base (`AKROGON_BASE`) is then the current tracking ref.
2. Under the same branch condition, allocation refuses loudly and starts no seat when the leftover holds anything worth keeping. That is a worktree that `src/reconcile.ts:worktreeRemovable`'s rule would keep (uncommitted or untracked files, a rebase or merge in progress), or one git refuses to remove (a lock, initialized submodules). The error names the leaf, the path, the reason, the changed files when there are any (first 20 plus a total count) and the operator step. (A,C)
3. At first allocation, allocation also refuses loudly in these cases:
   - a store path is present whose HEAD is not an existing `refs/heads/<slug>` (detached, another branch, or an unborn slug branch)
   - the commit-free slug branch is checked out in another worktree.
   The error names the path, the HEAD or other worktree, and the operator step. Nothing is removed or adopted. (A,B,D)
4. A slug branch with commits of its own is adopted as-is, as today, when the store path is absent or its HEAD is that branch. The direct route's growth-stop handoff relies on this, and its worktree is on the slug branch (`skills/chart-issues/assets/direct-route.md` "Growth stop": "the leaf slug equals the branch"). (A,B)

The leaf also retires the lesson "leaf worktree kept at a stale base". The lesson line and its history file are on the default branch before this leaf is handed off (needs-sheet row N1). (B,C,D)

## Why

Tamdoma/akrogon#156. A framework leaf handed off again five days after a withdrawn start opened plan.synthesis on a worktree 1271 commits behind origin/main. The worktree was missing the dependency its design said had merged and held the earlier attempt's uncommitted files. `ensureWorktree` reuses an existing path or branch as found, and only a missing branch starts from the tracking ref. There is no withdraw verb, so leftovers are expected.

## Done-criteria

1. At first allocation, these leftovers yield a worktree whose HEAD and `refs/heads/<slug>` equal the current tracking ref:
   - a clean leftover worktree on a commit-free slug branch behind the tracking ref, including one holding only git-ignored files
   - a commit-free slug branch with no store path.
   The base `src/config.ts:base` reports in that worktree is the tracking ref. Proof: own test with temp git repos (a bare remote, a clone, real worktrees) through the allocation path, entry point chosen by the plan.
2. At first allocation, a leftover on a commit-free slug branch is left in place unchanged when it holds any of the cases below. Allocation fails before `state.worktree` is recorded, so dispatch starts no seat (seats start only after allocation returns, `src/next.ts:dispatchLeaf`). The error names the leaf, the path, the reason and the operator step, plus the changed files when it is dirty. (A,C)
   - a modified tracked file
   - an untracked file
   - a merge in progress (`MERGE_HEAD`) on an otherwise clean tree
   - a locked worktree, whose error names `git worktree unlock` (C)
   Proof: the same own test setup.
3. At first allocation, allocation fails loudly and changes no ref or worktree in each of these cases. The error names the path and the HEAD state or other worktree. (A,B,D)
   - The store path's HEAD is detached or on another branch, whether or not the slug branch has commits of its own.
   - The HEAD names a missing `refs/heads/<slug>`.
   - The commit-free slug branch is checked out in a worktree at another path.
   Proof: the same own test setup.
4. A slug branch with a commit of its own is adopted unchanged when the store path is absent or its HEAD is that branch: same HEAD, same branch sha, files kept. Proof: the same own test setup.
5. The bound reset refuses when the slug branch no longer holds the sha the commit-free check proved, and the newer commit stays on the branch. Proof: own test calling the reset function with a sha the ref has already moved past. (A,D)
6. The lesson retires. `learnings/LESSONS.md` no longer holds the line "leaf worktree kept at a stale base". `learnings/history/2026-11-24-leaf-worktree-stale-base.md` ends with `Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>` in this leaf's diff (lesson rule Retire). Proof: the diff.
