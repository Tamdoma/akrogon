# Leftover worktree: how a leaf's first allocation starts from the tracking ref

## Question

Gate, agreed in the opening map (A,B,C,D): the leaf's first allocation in `src/next.ts:ensureWorktree`, meaning `state.worktree` is unset, and the slug's branch `refs/heads/<slug>` exists with no commits of its own (every commit on it is reachable from `trackingRef(repo)`). A branch with commits of its own is adopted as-is, as today, which keeps the direct route's growth-stop handoff working (`skills/chart-issues/assets/direct-route.md` "Growth stop").

Q1. Under the gate, with the leftover worktree clean (or only the branch left), how does the leaf start from the tracking ref?
- a. Remove and recreate: `git worktree remove <path>` without `--force` when the path exists, then create through the existing `createSparseWorktree` from `trackingRef(repo)` with the branch reset to it (`-B <slug>`). One creation path for every first allocation.
- b. Fast-forward in place: `git -C <path> merge --ff-only <trackingRef>` when the path exists; when only the branch is left, move the branch to the tracking ref and create the worktree from it.

Q2. Under the gate, the leftover worktree holds modified or untracked files. What happens?
- a. Refuse loudly at allocation: no seat starts, and the dispatch error names the path, the files and the removal step for the operator.
- b. Save the leftover diff to a record, reset the tree and continue.
- c. Carry the files into the new attempt (today's behavior).

Q3. Does the first allocation fetch the remote before reading the tracking ref?
- a. No. Every new worktree already starts from the local tracking ref without a fetch; a stale local ref is a different failure, named as a residual.
- b. Yes, one `git fetch <remote>` before a first allocation.

### Carries

- Signposts: issues/chart/fresh-leaf-base/forks/signposts.md `## Taken` (copy; original in issues/chart/seat-turn-idle/forks/signposts.md).
- Opening map: issues/chart/seat-turn-idle/slots/map-merged.md sections "fresh-leaf-base (#156)" and "Shared facts".
- Lesson: learnings/LESSONS.md line "leaf worktree kept at a stale base" and learnings/history/2026-11-24-leaf-worktree-stale-base.md (uncommitted, needs-sheet row N1). The leaf retires it only if it stops the mechanism on every reachable path (lesson rule Retire).
- Operator words (INTAKE.md "Source: operator door message 2026-11-24"): "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."

## Findings

Merged notes: slots/fork-leftover-worktree-merged.md. Rebuttals: slots/fork-leftover-worktree-rebuttal-{B,C,D}.md. Blind notes: slots/fork-leftover-worktree-{A,B,C,D}.md.

- Research, better-than-training: free git 2.56.1 temp-repo probes by A, B, C, D on 2026-11-25 (see `## Charting proofs`), and `src/next.ts:ensureWorktree`, `createSparseWorktree`, `allocate`, `src/reconcile.ts:worktreeRemovable`, `leafSeats`, `src/preflight.ts:checkBase` at 085f2f88. Changed the question by adding the bound reset, the slug-branch HEAD rule and the reuse of `worktreeRemovable`.
- Rebuttal outcomes:
  - Branch reset: an unbound `-B` overwrites a ref that moved after the proof (D probe). `update-ref -d` deletes a branch checked out in another worktree (C probe). `git branch -d` fails when the tracking ref is ahead of the main checkout's HEAD (C probe). So the result is locked and the git calls are left to the plan.
  - HEAD off the slug branch: refuse (C,D). Reachability (B) could delete an unrelated branch's checkout. Adopting lets seats commit off `refs/heads/<slug>` while merge and restack move `refs/heads/<slug>` (`src/batch.ts`, `src/phase.ts:restack`, C).
  - Live check: `allocate`'s `live` is always false at first allocation, because `leafSeats` returns no seats while `state.seat` is unset (C). A `processesInside` scan blocks on an idle shell and cannot be complete (B,D). Neither is used.
  - Q3 reason qualified (D): the local ref holds merges landed from this checkout, not merges made elsewhere.
  - Submodules (D): a clean leftover with initialized submodules refuses even after `deinit`. The refusal names `git worktree remove --force <path>`.

## Charting proofs

All free, local git, no outside identity, no budget.

- G1 (A, 2026-11-25, git 2.56.1, scratchpad temp bare remote + clone + worktrees, removed after):
  - `git worktree remove <path>` without `--force` on a tree with only ignored `node_modules/`: exit 0, tree gone.
  - The same command on a tree with an untracked file: exit 128, "contains modified or untracked files, use --force to delete it".
  - `git merge --ff-only <trackingRef>` with a modified and an untracked file: exit 0, both kept.
  - `git worktree add -B <branch> <path> <trackingRef>`: the existing branch was reset.
  - `git rev-list --count <trackingRef>..<branch>`: 0 for a branch behind with no own commits.
  - Limits: one git version, no sparse checkout in this probe.
- G2 (B, fork-leftover-worktree-B.md P1–P12, /tmp/wt-probe, 2026-11-25, git 2.56.1):
  - Ignored files and empty dirs do not block `remove`. Modified or untracked files do (exit 128).
  - `-B` refuses while the branch is checked out elsewhere and succeeds after that worktree is removed.
  - ff-only on a detached HEAD moves HEAD and leaves the branch behind.
  - Sparse ff-only leaves an untracked file over a merge-added path.
  - Cleanup: temp dirs. Limits: one git version.
- G3 (C, fork-leftover-worktree-C.md and rebuttal-C.md, 2026-11-25, git 2.56.1):
  - `remove` succeeds on a clean tree with `MERGE_HEAD`. It refuses with initialized submodules.
  - `update-ref -d` deletes a branch checked out in another worktree, leaving that worktree unborn.
  - `git branch -d` exits 1 when the tracking ref is ahead of the main checkout's HEAD.
  - Limits: one git version.
- G4 (D, fork-leftover-worktree-D.md and rebuttal-D.md, 2026-11-25, git 2.56.1):
  - A bound `update-ref -d <ref> <old>` and a bound move refuse after the ref moved. An unbound `worktree add -B` overwrote it, leaving the new commit on no branch.
  - A worktree switched to another branch commits off the slug branch.
  - A second clone's push is absent from the first clone's tracking ref until a fetch.
  - Submodule removal refuses even after `deinit --all`.
  - Limits: one git version.

## Taken

A's autopilot pick, 2026-11-25. Not operator words. Round written in A's terminal. Sources: the Findings above.

- Q1 a, sharpened.
  - Gate: first allocation (`state.worktree` unset). The slug branch exists with no commits outside `trackingRef(repo)`, and equal counts as commit-free. When the store path exists, its HEAD is `refs/heads/<slug>`.
  - Action: remove the leftover worktree without `--force`, under `worktreeLock(repo.root)`. Then reset the branch to the tracking ref, bound to the sha the gate proved, so a moved ref fails loudly. Never move or delete a branch that another worktree has checked out (today's loud checkout refusal stays). Then run today's creation path. The exact git calls are open for the plan.
  - A store path whose HEAD is not `refs/heads/<slug>` (detached or another branch) at first allocation: refuse loudly, naming the path, its HEAD and the operator step. Never remove it, never adopt it.
  - A slug branch with its own commits: adopted as-is, as today. The direct route's growth-stop handoff depends on this.
  - Reason (signpost 1a, value simplicity): one creation path for every first allocation. The leftover is trusted for one fact only, that it holds nothing worth keeping.
  - Rejected b: needs its own dirty check (G1), moves a detached HEAD and leaves the branch behind (G2), and keeps a second path beside creation.
  - Cost: ignored files in the leftover (dependency folders) are deleted and reinstalled. An idle process with its cwd inside a clean leftover loses that cwd. No process check is added (rebuttals B, C, D).
- Q2 a. Under the gate, a leftover that `src/reconcile.ts:worktreeRemovable`'s rule would keep is refused at allocation and no seat starts. That covers uncommitted changes, a rebase or merge in progress and unreachable commits. One rule for "safe to delete a worktree", shared with reconcile. The refusal names the leaf, the path, the reason, the changed files from `git status --porcelain` (first 20 plus a total count) and the operator step (inspect or save, then `git worktree remove --force <path>`). A git refusal from `remove` itself (a lock, initialized submodules) names the same step, plus `git worktree unlock` for a lock.
  - Reason (signpost 3a): no new record kind, no destructive reset nobody approved.
  - Rejected b: a new record kind and a reset nobody approved. Rejected c: the reported harm.
  - Cost: that leaf waits for the operator. Allocation errors still go to the pass's stderr through `report()`, as every `ensureWorktree` throw does today (recorded only, B,C).
- Q3 a. No fetch.
  - Residual, named in the design: the local tracking ref holds merges landed from this checkout. A merge made elsewhere or a force-pushed default branch is missing until something fetches (`akrogon sync`, a merge turn, a land).
  - Rejected b: adds a network failure to allocation and only shrinks the window.
- Standing dissent: B held that a HEAD off the slug branch should be judged by reachability (rebuttal-B D2).

Correction 2026-11-25, A's, from the final-shape check (slots/fork-leftover-worktree-final-check-{B,C,D}.md; B and D found both, C found none). The leaf review checks the corrected shape.
- Unborn slug branch: a store path present at first allocation whose HEAD names `refs/heads/<slug>` while that ref is missing is refused loudly like the other HEAD anomalies, naming the unborn branch. It is never removed and never adopted. (B X1, D F2, probes /tmp/wt-probe4 and D's, git 2.56.1.)
- Checked-out guard: `git update-ref` moves and deletes a branch checked out in another worktree (B, D probes), and the creation refusal comes too late. So after removing the store path, and before the bound reset, the gate reads the worktree list (`src/reconcile.ts:registeredWorktrees`). It refuses loudly when the slug branch is on any remaining worktree, naming that path. Both steps and the reset run under `worktreeLock(repo.root)`. Residual: a person checking the branch out by hand in that same instant, outside akrogon's lock. git has no atomic guard-plus-bind operation.

Correction 2026-11-25, A's, from the leaf review (slots/leaf-review-{B,C,D}.md). A restatement of scope, no new mechanism.
- Order: the HEAD rule runs first at every first allocation with a store path present. An off-branch or unborn HEAD is refused even when the slug branch has commits of its own. "Adopted as-is" means a branch with its own commits whose store path is absent or has that branch checked out, which is the growth stop's shape. Standing dissent: B (leaf-review-B F2) would scope the HEAD rule inside the commit-free gate.
- The bound reset is a move with `git update-ref refs/heads/<slug> <trackingSha> <provenSha>`, followed by today's existing-branch checkout (D). The lock covers removal, guard and reset, and is released before `createSparseWorktree`, which takes it itself (C, D: `withLock` is a non-reentrant `flock -x`).
