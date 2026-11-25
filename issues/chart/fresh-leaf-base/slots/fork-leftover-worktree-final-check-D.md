# Final-shape check: leftover-worktree, slot D

Two concrete defects in the shape in section "Taken" of the fork.

## F1. The bound reset can move a branch another worktree has checked out

Case: first allocation, the store path is missing, the slug branch exists commit-free, and that branch is checked out in a worktree at some other path. Taken's sequence resets the branch (bound to the proven sha) before running today's creation path, and says today's loud checkout refusal stays. It does not stay for the reset step. The natural bound reset, `git update-ref refs/heads/<slug> <tracking> <proven>`, succeeds on a checked-out branch. Only the later `git worktree add` would have refused, and by then the branch under the other worktree has already moved. That worktree's clean tree instantly reads as staged changes against the new HEAD, and a commit made there would commit that scramble.

Evidence: better-than-training, temp-repo probe 2026-11-25, git 2.56.1. A branch `slug` at sha S was checked out in a second worktree with a clean status. `git update-ref refs/heads/slug <T> <S>` exited 0. That worktree's HEAD moved to T while its file still held the S content, and `git status --porcelain` there then reported the file as a staged modification. In the same probe `git branch -f slug <S>` refused with "cannot force update the branch 'slug' used by worktree at" that path. Practitioner, 2026-11-25: fork section "Charting proofs" G3 records the matching delete case, `update-ref -d` deleting a branch checked out in another worktree.

Smallest fix: make the checked-out check an explicit step of the shape, before the bound reset and after any removal of the store path. Refuse loudly when `registeredWorktrees` (`src/reconcile.ts:registeredWorktrees`, read 2026-11-25 at akrogon 085f2f88) shows the slug branch on any remaining worktree row. Do not rely on the creation refusal, which runs too late.

## F2. A store path on an unborn slug branch falls through to adoption

Case: first allocation, the store path exists, its HEAD is symbolic to `refs/heads/<slug>`, but that ref does not exist. Taken's gate requires the slug branch to exist, so the gate does not apply. The HEAD rule refuses only when HEAD is not `refs/heads/<slug>`, which an unborn HEAD passes. Nothing else in the shape covers branch-missing with the path present, so the path falls through to today's behavior in `src/next.ts:ensureWorktree` (read 2026-11-25 at 085f2f88): an existing same-repo path is adopted as found. The seat then starts in a worktree with no HEAD commit, where every tracked file reads as staged and `base()` has no HEAD to merge-base against.

Evidence: better-than-training, temp-repo probe 2026-11-25, git 2.56.1. After `git update-ref -d refs/heads/slug2` on a branch checked out in a worktree (exit 0), `git symbolic-ref HEAD` in that worktree still printed `refs/heads/slug2`, `git show-ref --verify refs/heads/slug2` failed, `git rev-parse HEAD` failed, and `git status --porcelain` listed the tracked files as staged additions.

Smallest fix: in the HEAD rule, require the slug ref to exist and resolve, not only that HEAD names it. A store path present at first allocation with `refs/heads/<slug>` missing gets the same loud refusal, naming the unborn branch.
