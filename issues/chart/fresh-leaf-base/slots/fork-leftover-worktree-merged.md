# Fork notes merged: leftover-worktree (A, B, C, D)

Sources: fork-leftover-worktree-{A,B,C,D}.md in this folder, written blind 2026-11-25 on akrogon 085f2f88. Every slot ran free temp-repo probes with git 2.56.1.

## Picks

- Q1 a, remove and recreate (A,B,C,D). Q2 a, refuse loudly (A,B,C,D). Q3 a, no fetch, residual named (A,B,C,D).

## Q1 clean leftover

- a (A,B,C,D). Reason: one creation path; the only fact read from the leftover is that it holds nothing worth keeping. Cost: ignored files (dependency folders) are deleted and reinstalled on the next setup; `.env` is rewritten by `writeLeafEnv` anyway (B,D).
- b rejected (A,B,C,D). `git merge --ff-only` carries dirty files silently (A,B,D probes), advances a detached HEAD while the branch stays behind (B probe P8), and in a sparse worktree leaves an untracked file over a merge-added path with only a warning (B probe P6c).
- How the branch is reset:
  - (B,C,D) Create with `-B <slug>`, after the worktree is removed (`-B` refuses while the branch is checked out elsewhere, B probe). C: pass `-B` only through an explicit option used under the gate, never for other callers.
  - (A) Delete the branch bound to its proven sha (`git update-ref -d refs/heads/<slug> <sha>`), then today's "branch missing" path creates it with `-b`. No new option on `createSparseWorktree`, and the delete refuses if the ref moved. B notes `git branch -d` also succeeds on a commit-free branch.
- Gate must cover what the path's HEAD holds, not only the slug branch:
  - (C) Refuse when the path's HEAD is not `refs/heads/<slug>`.
  - (A,D) Enter the gate only when the path's HEAD commit is also reachable from the tracking ref; otherwise adopt as today.
  - Equal SHAs count as commit-free (C): the gate is an ancestry test, so a dirty leftover at the current commit is still refused.

## Q2 dirty leftover

- a (A,B,C,D). Reason: `src/reconcile.ts:worktreeRemovable` already refuses to delete a worktree with uncommitted changes, an in-progress rebase or merge, or unreachable commits (B). Allocation applies the same judgment. Cost: that leaf waits for the operator; rare (seen once).
- b rejected (A,B,C,D): a new record kind (signpost 3a) and a destructive reset; a diff cannot hold untracked binaries (B). c rejected: the reported harm.
- File list: git's refusal names only the directory (A,B,C,D probes). A first proposed relying on git's refusal alone; (B,C,D) run `git status --porcelain` first and name the files. C: cap the list (first 20 plus a count).
- In-progress operations: `git worktree remove` without `--force` succeeds on a clean tree holding `MERGE_HEAD` (C probe). Removed by checking the same markers as `worktreeRemovable` (C,D).

## Q3 fetch

- a (A,B,C,D). Akrogon's own merges fetch before landing (`mergeTurn`, `src/phase.ts:finishPush`), so a merged dependency is already in the local ref (B). The report's ref was current (A,B). A fetch adds a network failure to allocation and only shrinks the window (B). Residual: a local ref stale against pushes made outside akrogon, or a force-pushed default branch (D), named in the design.

## Pitfalls and what removes each

- A live process inside the leftover (an old seat or an operator shell):
  - (A,D) Apply the gate only when `allocate`'s `live` flag is false.
  - (C) Also check `src/reconcile.ts:processesInside([path])` and refuse naming the pids.
- Racing reconcile or batch builds: run the removal under `worktreeLock(repo.root)` (C,D).
- A locked leftover (the direct route locks its worktree): `remove` refuses; the error names the unlock step, never `--force` (A,C,D).
- Initialized submodules: `remove` refuses even when clean (C probe); surfaced as a refusal.
- Crash between remove and create: the next allocation takes the fresh path (B,D).
- The slug branch checked out at another path: `-B`/checkout refuses with the other path named (C,D); existing behavior.

## Open questions raised

- `src/next.ts:dispatchLeaf` computes `mustCreate` from the path's existence to decide whether `checkBase` proves the remote. After recreation, should it follow first allocation instead (C)?
- `akrogon seat <slug>` and `broadcastPass` reach `allocate` without `checkBase`; a missing local tracking ref then fails as a raw git error instead of `C3` (C).
- Allocation errors on automatic passes go only to stderr through `report()`; should they raise a notice (B,C)? Pre-existing for every `ensureWorktree` throw (B).
- A branch with its own commits and a dirty tree is adopted as-is, outside the gate (C).
- A withdraw verb would prevent leftovers upstream (B). Out of scope.

## Where slots differ

- Branch reset: `-B` with a gated option (B,C,D) or a bound branch delete then today's path (A).
- HEAD not on the slug branch: refuse (C) or treat by reachability (A,D).
- Live check: the `live` flag (A,D) or also `processesInside` (C).
- File list: A's first notes relied on git's refusal; B,C,D name the files. A now agrees with B,C,D.
