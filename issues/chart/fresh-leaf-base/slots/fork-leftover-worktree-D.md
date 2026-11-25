# Fork notes: leftover-worktree, slot D

Gate as given in the fork: first allocation (`state.worktree` unset) and `refs/heads/<slug>` exists with no commits of its own. A branch with its own commits is adopted as-is. Picks: Q1 a, Q2 a, Q3 a.

## Q1. Clean leftover: how the leaf starts from the tracking ref

1. Pick: a, remove and recreate. `git worktree remove <path>` without `--force` when the path exists, then create from `trackingRef(repo)` through `createSparseWorktree` with the branch reset (`-B <slug>`). When only the branch is left, the same create with `-B` covers it, so both leftover shapes end in one creation path.
   - Reason: the gate already proves no committed work can be lost. Recreation re-establishes every invariant the fresh path owns, not just HEAD: the worktree is on the slug branch, the sparse pattern is the current `/*` plus `!/issues/`, and the index is fresh. A fast-forward fixes only HEAD and leaves the rest of the leftover state in place.
   - Cost: `createSparseWorktree` today only supports `-b`, so it needs a reset form. Ignored files in the leftover are deleted (see pitfalls). A leftover already at the tracking ref pays a full checkout for no change. Leftovers are rare (frequency seen once, INTAKE.md), so this cost is small. Low confidence on rarity beyond that one report.
2. Rejected: b, fast-forward in place.
   - `git merge --ff-only` moves whatever is checked out. On a detached HEAD it moves HEAD and not the slug branch. On another branch it moves that branch and leaves the slug branch old, so the seat would commit to the wrong branch and the failure would surface far from allocation. `ensureWorktree` today never checks which branch the existing path has checked out, so b needs a branch check plus detached and wrong-branch handling to be safe.
   - A fast-forward keeps a drifted sparse pattern. A leftover whose sparse pattern excludes a folder stays blind to that folder after the fast-forward.
   - The branch-only shape under b is a different operation (move the branch, then create), so b is two paths where a is one.
   - Keeping ignored files and caches is b's real gain. It does not outweigh the above because ignored files in a days-old leftover are stale by the same measure as its HEAD, and `.env` is rewritten by `writeLeafEnv` on allocation anyway.
3. Evidence:
   - Practitioner, 2026-11-24: INTAKE.md (Tamdoma/akrogon#156). The leftover branch had no commits of its own and the seat recovered by hand. Nothing committed was at risk.
   - Better-than-training, read 2026-11-25 at akrogon 085f2f88: `src/next.ts:ensureWorktree` reuses an existing path after same-repo checks only, and checks out an existing slug branch as found. `src/next.ts:createSparseWorktree` creates with `-b`, sets the sparse pattern, holds `worktreeLock`, and force-removes its own partial worktree on failure. `src/next.ts:allocate` passes a `live` flag into `ensureWorktree`. `src/reconcile.ts:removeWorktree` is the existing no-force removal under `worktreeLock`.
   - Better-than-training, temp-repo probes 2026-11-25, git 2.56.1: `git worktree remove` without `--force` refuses modified, untracked, and staged files and a locked worktree, and succeeds when only ignored files (including `.env`) are present, deleting them. `git merge --ff-only` on a clean tree succeeds and keeps ignored files, keeps a drifted sparse pattern, and on a detached or other-branch checkout moves that HEAD or branch instead of the slug branch. `git worktree add -B` and `git branch -f` refuse while the branch is checked out in another worktree. The gate test `git rev-list --count <tracking>.. <slug>` returned 0 for a commit-free branch and 1 after one own commit.
   - Operator, 2026-11-24: INTAKE.md operator door message ("simplicity, clarity elegance") and signposts `## Taken` point 1 (fix in the mechanism so the failure class cannot happen again, recorded as A's pick from the operator's simplicity value, not operator words).
4. Pitfalls:
   - Removal deletes ignored files without refusing. Nothing removes this. It is accepted: git and `src/reconcile.ts:worktreeRemovable` (status `--porcelain`, which excludes ignored files) both treat ignored files as disposable, and `writeLeafEnv` recreates `.env`. Dependency folders are reinstalled.
   - The leftover path holds a detached or other-branch HEAD with commits not on any branch. The gate checks the slug branch, not that HEAD, so recreation could orphan those commits. Low confidence that `git worktree remove` refuses this case; I did not prove it. Removed by also proving the worktree HEAD commit is reachable from the tracking ref (or that HEAD is the slug branch) before removal, and refusing otherwise. `worktreeRemovable` already uses an unreachable-commit count of this kind.
   - A locked leftover (the direct route creates worktrees with `--lock`) makes removal refuse. That refusal is the desired loud stop. The error should name the unlock step. Never auto-unlock or force.
   - Remove succeeds and create then fails, leaving no worktree. Removed in practice: dispatch runs `checkBase` before `allocate`, which proves the local tracking ref exists, and the next dispatch retries as a plain fresh creation. The gate proved the branch held no own commits, so the failed attempt loses nothing committed.
   - A seat or pane is somehow live in the leftover path while `state.worktree` is unset. Recreating under it would pull the directory from a running process. Removed by applying the gate only when the `live` flag `allocate` already passes to `ensureWorktree` is false.
   - Concurrent dispatch and reconcile passes touching the same path. Removed by running the removal under `worktreeLock`, as `createSparseWorktree` and `removeWorktree` already do.
5. Questions the fork does not ask:
   - The path exists but the slug branch does not (a detached or other-branch worktree squatting on the expected path). The gate requires the branch, so this shape falls outside it and is still adopted as-is today. Is it reachable, and who owns it?
   - The slug branch is checked out at a different path while the expected path is missing. Git refuses a second checkout of that branch (probed), so allocation fails loudly today. Is that refusal the intended end state?
   - The tracking ref was rewritten (force push), so a commit-free leftover's commits are no longer reachable from it and the gate reads them as the branch's own commits. The stale branch is then adopted. Intended?

## Q2. Dirty leftover: modified or untracked files present

1. Pick: a, refuse loudly at allocation. No seat starts. The error names the path, the files from `git status --porcelain`, and the operator step: save anything wanted, then `git worktree remove --force <path>`. The slug branch can stay, because under Q1 a the next allocation resets it.
   - Reason: the files belong to a dead attempt and nobody can judge them but the operator. Refusing is the only option that neither destroys them nor lets them into the new attempt unrecorded.
   - Cost: the leaf stalls until the operator acts. Dispatch reports the error per leaf and skips it, so other leaves proceed. Under full autopilot this leaf still waits. That wait is the price of not deleting unjudged work.
2. Rejected:
   - b, save the diff to a record, reset, continue. `git diff` does not capture untracked files (probed: a modified tracked file appeared, an untracked file did not), so the record looks complete while missing part of the tree. Capturing everything needs a stash-style copy, a home for it, and a reader, none of which exist. Signposts `## Taken` point 3 also says no new record kinds. The reset still destroys the working state during an unattended pass, with a record nobody is tasked to read.
   - c, carry the files (today's behavior). This is half of the reported bug. The new attempt plans and builds on files with no record of where they came from.
3. Evidence:
   - Practitioner, 2026-11-24: INTAKE.md and learnings/history/2026-11-24-leaf-worktree-stale-base.md. Four files held uncommitted test edits from the earlier attempt. The seat saved the diff, fast-forwarded, and re-applied it. One file conflicted and was rewritten by hand. Hand-carrying five-day-old edits across 1271 commits already failed once in the one observed case.
   - Better-than-training, read 2026-11-25 at 085f2f88: `src/reconcile.ts:worktreeRemovable` already defines dirty as non-empty `git status --porcelain` output, which covers modified, staged, untracked, and unmerged files and excludes ignored ones. `src/next.ts:writeLeafEnv` refuses to write `.env` unless it is git-ignored, so akrogon's own `.env` never makes a leftover dirty.
   - Better-than-training, temp-repo probes 2026-11-25, git 2.56.1: `git worktree remove` without `--force` refuses modified, untracked, and staged files but names none of them, so Q1 a alone does not produce the file list. `git merge --ff-only` with a dirty tree is inconsistent: it succeeds and carries a dirty file the fast-forward does not touch, and refuses only when a dirty or untracked file would be overwritten. So neither git command by itself gives a clean refuse-with-names. The explicit porcelain check is needed under either Q1 pick.
4. Pitfalls:
   - Git's own refusal names no files. Removed by the porcelain check above, run before removal, with the file list in the error.
   - A leftover with a very large untracked set makes the error huge. Not removed by this pick. The list is still the evidence the operator needs. Low confidence this matters in practice.
   - The refusal repeats on every automatic dispatch pass until the operator acts. Removed only by the operator step. Accepted as the cost above.
   - An in-progress merge or rebase in the leftover may show a clean porcelain status in narrow moments. Low confidence. `worktreeRemovable` checks rebase and merge markers separately, and Q1 a's remove plus those same markers would close most of it.
5. Questions the fork does not ask:
   - Ignored files count as clean here, so under Q1 a they are deleted silently while untracked files block everything. Is an ignored-but-expensive artifact (a built dataset in an ignored folder) meant to be disposable, or should size or age change that?
   - Empty untracked directories are invisible to git status and are deleted by removal. Fine, or named?

## Q3. Fetch before the first allocation

1. Pick: a, no fetch. The first allocation starts from the local tracking ref, exactly as every fresh worktree creation does today.
   - Reason: the reported failure is a reused branch sitting behind the tracking ref. The chart scope in INTAKE.md `## Scope` says "the current tracking ref," and `trackingRef(repo)` is by definition the local `refs/remotes/<remote>/<default_branch>`. Fetching only on the leftover path would make reused slugs fresher than brand-new slugs created in the same pass from the same local ref.
   - Cost: a stale local tracking ref still gives a stale base. Named as a residual below, not fixed here.
2. Rejected: b, one `git fetch <remote>` before a first allocation.
   - It puts a network call in a step that runs during automatic sweeps. A failed fetch then needs a rule: block and stall fresh leaves that start fine today, or warn and continue on the stale ref, which gives no guarantee. The codebase already splits on this: `reconcileBatch` reports a failed fetch and stops that batch, `mergeTurn` warns and continues on the existing ref. Either choice imports one of those costs into allocation.
   - It makes a leaf's base depend on when dispatch happened to run. Two leaves of one epic allocated across a push get different bases routinely instead of only when someone fetches by hand.
   - It still proves nothing at planning time, because the remote can move again a minute later. Freshness is enforced where it affects correctness: the merge path fetches before landing.
3. Evidence:
   - Operator, 2026-11-24: INTAKE.md `## Scope` fixes the target as the current tracking ref.
   - Practitioner, 2026-11-24: learnings/LESSONS.md line "leaf worktree kept at a stale base" states the retirement test as comparing a reused commit-free branch "against the tracking ref before the first phase." Q1 a plus Q2 a do exactly that on both leftover shapes (path exists, branch only), so the lesson retires without a fetch.
   - Better-than-training, read 2026-11-25 at 085f2f88: `src/preflight.ts:trackingRef` returns the local remote-tracking ref. `src/preflight.ts:checkBase` returns the local ref's sha from `localBase` and, when a worktree must be created, only proves the remote branch exists with `ls-remote` (`remoteBase`). It does not update the local ref. Dispatch in `src/next.ts` calls `checkBase(repo, mustCreate)` before `allocate`. The only fetches in `src/next.ts` are in `reconcileBatch` and `mergeTurn`.
   - Model-knowledge: a fetch updates every remote-tracking branch, not just the default branch, and concurrent fetches can contend on ref locks. Low confidence either point bites here. Not probed.
4. Pitfalls:
   - The local tracking ref is itself days stale, so the leaf starts stale anyway. Nothing in this pick removes it. It is bounded: the merge path fetches and rebases before landing, so stale work is caught there instead of landing silently. Wasted planning on an old base remains possible. This is the named residual.
   - With the path missing, `checkBase` proves by `ls-remote` that the remote branch exists but never compares its sha to the local ref, so a moved remote passes silently. Same residual, existing behavior for fresh leaves today.
5. Questions the fork does not ask:
   - Who owns keeping the local tracking ref fresh on this host (the operator's own fetches, the merge path's fetches, nothing)? If the answer is nothing, the residual is a standing condition, not an edge case.
   - If a fetch is ever added, should it be one fetch per dispatch pass per repo rather than one per first allocation, so a pass that starts several leaves gives them one base?

## Process note

One repo-wide grep for `createSparseWorktree` during this work returned a single line from another slot's fork file in its output. I did not open that file, and the code reads and probes above were done before that grep. Nothing in these notes uses that line.
