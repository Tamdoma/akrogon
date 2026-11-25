# Design: fresh-first-worktree

## Binding decisions, verbatim

### Signposts, from forks/signposts.md


A's picks under full autopilot (operator: "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."), not operator words:

1. 1a. Removing the failure class beats guarding it (operator value: simplicity, removing over adding).
2. 2a. Free tests catch these mechanical bugs at lower cost (operator values: speed and price).
3. 3a. Fewest moving parts (operator value: simplicity).
4. 4a. Fewest leaves to dispatch and review (operator value: simplicity).
5. 5a. #157 stalls unattended runs and holds capacity; #153 is the widest change and gains from the others landing first.
6. 6a. No migration step to run or get wrong (operator value: simplicity).

Account: the session prioritizes fixing each mechanism in akrogon itself, proving it with free tests, and reusing existing records. It gives up per-repo config knobs, live-run evidence and new record kinds unless a chart shows no other way.

### Leftover worktree, from forks/leftover-worktree.md

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

Signpost exclusions: 2 (free tests) and 3 (extend records) apply. 4 gives one leaf. 5 and 6 add nothing here: no record or schema changes.

Installed path: /home/ivan/.akrogon/releases/085f2f88c3a1920732e10afbc0bad190cf32d540/skills/chart-issues/assets/standing-design.md. How it applies here:
- Every done-criterion is proven by an own test at the real git boundary: temp bare remote, clone, real worktrees, the real `git` binary. No mocks of git.
- The bug-fix rule applies. Criteria 1, 2 (dirty files carried today) and criterion 3's first two bullets fail on the current base and pass after. Criterion 3's third bullet passes today, because `git worktree add` refuses a branch checked out elsewhere. Like criterion 4, it is kept behavior, shown by a deliberate break: skipping the checked-out guard before the reset turns criterion 3's test red, and resetting a branch with commits turns criterion 4's test red. Criterion 5 tests the new reset function. (A,C)
- No paid call, live run or end-to-end run. Charting proofs G1 to G4 (fork `## Charting proofs`) observed the git behaviors the design relies on with git 2.56.1.
- No new machinery. The tests use the repo's existing temp-repo helpers.

## Held disagreements

- Not a decision, the decision stands. It is against criterion 3's first bullet refusing a store path whose HEAD is off the slug branch even when that branch has commits of its own.
  - Fact: today `src/next.ts:ensureWorktree` adopts such a path, and B judges a branch with commits to be protected whatever HEAD says.
  - Consequence B names: a messy direct-route handoff, with partial work committed on the slug branch but the worktree switched or detached, would be refused instead of adopted.
  - Raised by B (slots/leaf-review-B.md F2). A kept the refusal: the growth stop's worktree is on the slug branch by construction, and adopting an off-branch HEAD lets seats commit where merge and restack never look (`src/batch.ts`, `src/phase.ts:restack`, rebuttal-C). State: unanswered, recorded under autopilot.

## Leaf architecture

- Owned surfaces:
  - `src/next.ts:ensureWorktree` (the first-allocation branch).
  - A new exported function in `src/next.ts` for the bound reset: it moves `refs/heads/<slug>` to the tracking ref sha with `git update-ref refs/heads/<slug> <trackingSha> <provenSha>`, so a moved ref fails. Criterion 5 tests it directly. (A,D)
  - `src/reconcile.ts:worktreeRemovable`, exported with its rule unchanged, so allocation and reconcile share one definition of "safe to delete a worktree". `registeredWorktrees` is already exported.
  - `learnings/LESSONS.md` and `learnings/history/2026-11-24-leaf-worktree-stale-base.md` (lesson retirement). Both are on the default branch at handoff (N1).
- Gate, evaluated only when `state.worktree` is undefined:
  1. When the store path exists, its HEAD must be the symbolic ref `refs/heads/<slug>` and that ref must resolve. Otherwise refuse (criterion 3). This runs before the commit check, so an off-branch HEAD is refused whatever the branch holds. (A,B,D)
  2. When `refs/heads/<slug>` exists with commits outside `trackingRef(repo)`, adopt as today (criterion 4).
  3. When it exists and is commit-free (ancestor test, equal counts), replace (criterion 1) or refuse (criterion 2).
  4. When it does not exist and no store path exists, run today's creation path unchanged.
- Replace sequence:
  1. Under `worktreeLock(repo.root)`, when the store path exists: apply `worktreeRemovable`'s rule and refuse when it keeps the tree. Otherwise run `git worktree remove <path>` without `--force`. A git refusal (lock, submodules) becomes the same loud refusal, carrying git's stderr.
  2. Still under the lock, read `registeredWorktrees(repo.root)` and refuse when any remaining row has the slug branch checked out.
  3. Still under the lock, run the bound reset.
  4. Release the lock, then run today's existing-branch creation, `createSparseWorktree(repo, path, slug, {})`, which takes the lock itself. `withLock` is a non-reentrant `flock -x`, so the lock is never held across this call. (A,C,D)
- `src/next.ts:dispatchLeaf`'s `mustCreate` stays path-based and unchanged. A replaced leftover passes `checkBase`'s local proof (`localBase`), which is the ref the replace uses, and gets no new network call. Update the mirror comment to say so. (A,D)
- Refusal: one error type or message shape for every refusal. It carries the leaf slug, path, reason, git stderr where git refused, the changed files from `git status --porcelain` when there are any (first 20 plus a total count; a clean tree holding `MERGE_HEAD` has none) and the operator step: (A,C)
  - inspect or save, then `git worktree remove --force <path>`
  - or `git worktree unlock <path>` for a lock
  - or switch or remove the other worktree for a checked-out branch.
  It reaches the operator through `src/next.ts:report` like every `ensureWorktree` throw today.
- Consumers of changed state:
  - `src/config.ts:base` (`merge-base HEAD <trackingRef>`) reads the new HEAD. That gives the fresh base, the point of the leaf.
  - `writeLeafEnv` rewrites `.env` in the new worktree, as on any creation.
  - The direct route's growth-stop handoff (`skills/chart-issues/assets/direct-route.md` "Growth stop") hands over a branch with a partial commit, so it takes the adopt branch.
- Residuals, recorded and not fixed:
  - The local tracking ref holds merges landed from this checkout. A merge made elsewhere or a force-pushed default branch is missing until a fetch (`akrogon sync`, a merge turn, a land).
  - A person checking out the slug branch by hand in the instant between steps 2 and 3, outside akrogon's lock.
  - Ignored files in a replaced leftover are deleted and reinstalled.
- Exclusions:
  - A fetch before allocation (fork Q3).
  - Any change to `mustCreate`'s remote proof.
  - A withdraw verb.
  - Notices for allocation errors (they go through `report()` as today).
  - Leaves whose `state.worktree` is set.
