# Rebuttal: leftover-worktree, slot D

Disagreements only.

## R1. Adopt-as-today for a path whose HEAD is not the slug branch

Merged point: in section "Q1 clean leftover," the gate entry for a path whose HEAD commit is not reachable from the tracking ref falls back to "otherwise adopt as today," repeated in "Where slots differ."

Why it is wrong: adopting that path hands the seat a detached HEAD or another branch. Work committed there does not land on `refs/heads/<slug>`, while the leaf's later phases still name the slug branch. The mismatch is found far from allocation. This shape should refuse loudly at allocation, naming the path, its current branch or detached HEAD, and its HEAD commit.

Evidence: better-than-training, temp-repo probe 2026-11-25, git 2.56.1. A worktree created for `slug` was switched to a branch `other`. A commit made in that worktree moved `other` and left `slug` unchanged.

## R2. An unbound `-B` reset after the gate proof

Merged point: in section "Q1 clean leftover," reset the branch by creating with `-B <slug>` after removal.

Why it is wrong as stated: `-B` resets to the tracking ref without checking the branch still holds the sha the gate proved commit-free. A commit added to the slug branch after that proof, by any git user outside `worktreeLock`, is silently reset away and left on no branch. The reset must be bound to the proven sha, so a moved ref fails instead of being overwritten.

Evidence: better-than-training, temp-repo probe 2026-11-25, git 2.56.1. After a gate-style proof (`rev-list --count main..slug` returned 0 at sha S), the slug branch gained an own commit N through another worktree. `git update-ref -d refs/heads/slug S` and a bound `update-ref` to main with old value S both refused because the ref had moved. `git worktree add -B slug <path> main` then succeeded, moved `slug` to main, and `git branch --contains N` named no branch.

## R3. "A merged dependency is already in the local ref"

Merged point: in section "Q3 fetch," akrogon's merges fetch before landing, "so a merged dependency is already in the local ref."

Why it is wrong unqualified: that covers only merges landed from this checkout. A dependency merged or pushed anywhere else, such as a GitHub merge or another host, is not in this checkout's tracking ref until a fetch. Stated without that limit, the reason overproves freshness and understates the residual named later in the same section.

Evidence: better-than-training, temp-repo probe 2026-11-25, git 2.56.1. Two clones shared one bare remote. The second clone committed `dep.txt` and pushed it to `main`. The first clone's `refs/remotes/origin/main` still held the older sha and `git cat-file -e refs/remotes/origin/main:dep.txt` failed.

## R4. Submodule refusal treated as an ordinary surfaced refusal

Merged point: in section "Pitfalls and what removes each," initialized submodules make `remove` refuse even when clean, "surfaced as a refusal."

Why that does not remove the pitfall: a clean leftover with initialized submodules stalls on every allocation, and the obvious non-force cleanup does not clear it. The design still owes an exact operator step for this case, separate from the dirty-tree step, or these leaves wait forever on an opaque git error.

Evidence: better-than-training, temp-repo probe 2026-11-25, git 2.56.1. A worktree with an initialized submodule and an empty `git status --porcelain` made `git worktree remove` exit 128 with "working trees containing submodules cannot be moved or removed." The same exit 128 followed `git submodule deinit --all`. A worktree whose submodule was never initialized removed with exit 0.

## R5. Adding a `processesInside` pid check to the gate

Merged point: in section "Pitfalls and what removes each," also check `src/reconcile.ts:processesInside([path])` and refuse naming the pids.

Why it is wrong: a pid snapshot cannot prove the path is unused. A process can hold files open in the path while its working directory is elsewhere, and a process can enter the path after the check and before the removal. In the other direction, one forgotten idle shell parked in the path blocks the leaf indefinitely. The check adds a second liveness rule that is neither complete nor stable.

Evidence: model-knowledge, 2026-11-25. On Unix, a process's current directory and its open file descriptors are separate facts, and any scan of running pids is stale by the next step. Low confidence on the exact fields `processesInside` reads, since the merged notes name only the function.
