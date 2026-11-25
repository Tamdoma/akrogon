# Leaf review: fresh-first-worktree, slot D

Disagreements only.

## X1. Criterion 6 cannot pass in the leaf's diff, and its input has no home

Brief criterion 6 retires the lesson in this leaf's diff: the line leaves `learnings/LESSONS.md` and `learnings/history/2026-11-24-leaf-worktree-stale-base.md` ends with the Applied line. Neither text is on the base the leaf branches from. Both exist only as uncommitted changes in the operator's checkout, so a fresh worktree from the tracking ref contains neither the line to remove nor the history file to close. The implementer would have to guess a source for the history file's content, or leave the operator's uncommitted line behind to be committed after the leaf lands. The draft gives this need no home: `readiness.yaml` has `inputs: []` and `state.yaml` has `blocked-by: []`.

Evidence: better-than-training, git reads in the akrogon checkout, 2026-11-25. `git status --porcelain` on the two paths reports `M learnings/LESSONS.md` and `?? learnings/history/2026-11-24-leaf-worktree-stale-base.md`. `git cat-file -e refs/remotes/origin/main:learnings/history/2026-11-24-leaf-worktree-stale-base.md` fails, and the lesson line does not occur in `refs/remotes/origin/main:learnings/LESSONS.md`. Practitioner, 2026-11-25: `forks/signposts.md` section "Needs," item N1, records this exact pending operator commit, names the fresh-leaf-base leaf handoff as its consumer, and defines done as `git log origin/main --oneline -- learnings/history/2026-11-24-leaf-worktree-stale-base.md` printing a commit.

Smallest fix: carry N1 as an input in `readiness.yaml` (and block handoff on it) with that done check, so the leaf is dispatched only once the lesson line and history file are on the tracking ref.

## X2. The replace sequence cannot run "all under worktreeLock" as written

Design "Leaf architecture" heads the replace sequence "all under `worktreeLock(repo.root)`," then step 4 runs `createSparseWorktree`, which takes the same lock inside itself, and leaves "how steps 1 to 3 hold the lock without deadlocking against that call" open for the plan. There is no way to hold it across that call: `withLock` is an `flock -x` held by a child process, and a nested exclusive flock on the same file blocks forever. The fork correction requires only the checked-out guard and the reset under the lock, not the creation.

Evidence: better-than-training, code read 2026-11-25 at akrogon 085f2f88: `src/state.ts:withLock` spawns `flock -x <path> sh -c 'printf locked; cat >/dev/null'` and holds it for the action; `src/next.ts:createSparseWorktree` wraps its `git worktree add` in `withLock` on the same `worktreeLock`. Better-than-training, probe 2026-11-25: inside an `flock -x` on a temp lock file, a second `flock -x` on the same file never acquired and was killed by a 2-second timeout.

Smallest fix: change the design to say steps 1 to 3 run under `worktreeLock`, the lock is released, and step 4 takes the lock inside `createSparseWorktree` as today. That matches the fork correction's scope and needs no restructure of `createSparseWorktree`.

## X3. Criterion 5's proof has no entry point, and brief and design disagree on the reset

Brief criterion 5 is proven by "own test that runs the bound reset with a sha the ref has already moved past." No such runnable unit exists or is owned. `ensureWorktree` and `allocate` are not exported, the design's owned surfaces name no reset helper, and the race the criterion describes (a commit landing between the check inside allocation and the reset inside the same allocation) cannot be staged through the allocation path from a test. At the same time the brief's What says the branch "is moved to the tracking ref," while design step 3 says "Move or delete the branch" and step 4 leaves move-then-checkout versus delete-then-`-b` open. The implementer must guess both the reset's shape and how a test reaches it.

Evidence: better-than-training, code read 2026-11-25 at 085f2f88: the exports of `src/next.ts` include `createSparseWorktree` and the command entry points, not `ensureWorktree` or `allocate`. Practitioner, 2026-11-25: draft `brief.md` sections "What" and "Done-criteria" (criterion 5), and draft `design.md` section "Leaf architecture" (owned surfaces and replace sequence steps 3 and 4), read against each other.

Smallest fix: pin one reset in the design, the brief's move (`git update-ref refs/heads/<slug> <trackingSha> <provenSha>`), name it as its own function in `src/next.ts` under owned surfaces and exported for the criterion 5 test, and drop the delete variant from step 4.

## X4. The `mustCreate` change is open with no criterion to judge either choice

Design owned surfaces list `src/next.ts:dispatchLeaf`'s `mustCreate` as "Open for the plan." The two options differ in observable behavior. Keeping today's path-existence rule means a replaced leftover is created fresh with only local proof, breaking the mirror the code comments on ("a missing worktree needs remote proof, an existing one only local") because the worktree now does get created. Making it follow first allocation means `checkBase` runs `ls-remote` before those allocations, so a replaced leftover can newly fail allocation on a network or remote error even with a good local tracking ref. No done-criterion covers remote proof, so a checker has no standard for either choice and the implementer is guessing.

Evidence: better-than-training, code read 2026-11-25 at 085f2f88: `src/next.ts:dispatchLeaf` computes `mustCreate` from `!existsSync(resolve(worktreeStore(repo), slug))` and passes it to `checkBase`; `src/preflight.ts:checkBase` with `remoteRequired` set additionally runs `remoteBase`, an `ls-remote` against the configured remote. Practitioner, 2026-11-25: draft `design.md` section "Leaf architecture," owned surfaces, leaves the choice open, and draft `brief.md` criteria 1 to 6 say nothing about remote proof.

Smallest fix: decide in the design, one line. Either state `mustCreate` stays path-based (remote proof unchanged, the mirror comment updated), or state it follows first allocation with a commit-free branch and add the remote-proof expectation to a criterion.
