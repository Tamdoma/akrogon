# merge-order 1d rebuttal, slot C

Read `slots/merge-order-1d-merged.md`. For Q4 evidence I also read the Nit lines of `skills/check-issue/SKILL.md` and `skills/merge-issue/SKILL.md:35`. Step numbers refer to the merged file. Disagreements only.

## Step 3 (holder on top): agreed, with one gap it creates

No dispute on the order. Checking out the top commit in the holder's worktree any other way would leave `HEAD` off the holder's branch, and the guards and the log all read `HEAD` (`src/phase.ts:276,284`, `src/log.ts:10`).

Gap: the holder's worktree now runs code from every carried member, with the packages installed for the holder's own lockfile. `ensureWorktree` installs nothing (`src/next.ts:245-278`), and whatever `forks/dependency-setup.md` adds will have run before the stack existed. If any carried member changes the lockfile, the single check run uses stale packages, and it is the only run those members get. Needed as a binding line in step 6 or carried into dependency-setup: setup runs again in the holder's worktree when the lockfile at the top commit differs from the one it was installed for.

## Step 4 (holder conflict means solo now): the stated reason is wrong, and one race is open

**Wording.** Step 4 says the holder "merges solo now, resolving the conflict as `SKILL.md:41` says". When the holder conflicts on top of the stack, the conflict is with carried members' commits, which are not on main. Once the carried members are restored and the holder rebases onto `<remote>/<default_branch>` alone, that conflict is gone. The holder usually has nothing to resolve. The conflict comes back later for the carried member, in its own turn, against the landed holder, and that member's B resolves it. The behavior is right. The sentence should say so, or the leaf plan will give the holder's seat a conflict step it never reaches and leave out the one the carried member's seat needs.

**Race: a member can leave `merge` while the batch is building or running.** Step 4 builds "outside the global lock", and the check run is 35 minutes with no lock. A move to `failed` is legal from `merge` (`src/routing.ts:35`) and skips every worktree guard (`src/phase.ts:216-224`). The operator, or the member's own seat stopping on an operator blocker (`skills/merge-issue/SKILL.md:27`), can fail a carried member during the run. The holder then pushes a top commit that contains the failed leaf's commits. Its code is on main, and the leaf cannot be moved to `merged`, because `failed` cannot go straight to `merged` (`src/routing.ts:37-50`).

Needed: the batch record is written under the lock before any rebase, and the pre-push `merged --check` on the top refuses unless every recorded member is still in `merge`. A refusal dissolves the batch as in step 8, without solo marks, so the next turn rebuilds it without the leaf that left. Done-criterion: a carried member moved to `failed` during the run causes no push.

## Q2 (2a): agreed, and the merged file understates the case for it

Under 1d a waiting leaf waits at most for the current run to end, then it is carried in the next batch. The capacity cost that A raised against 2a was a multi-hour queue. That queue no longer exists except after a red batch. Step 10's bound also only holds under 2a. No disagreement.

## Q3 (3a): agreed, with one cost the merged file does not state

3a is right for a first version, because step 8's solo mark is needed in either option. The missing cost is the red with no code cause. On 2026-10-05 one merge run went red and the repair diff was empty (`fw:issues/open/skill-rewrite-tooling/slice-boundary-anchors/review-B.md:137,160`, `fw:` being `/home/ivan/Work/infra/tamdoma/framework/`). Under 3a that kind of red in a batch of six costs seven runs, about four hours, which is the day this chart exists to prevent. The operator should see that sentence beside 3a. It does not change the recommendation: 3b halves the cost of that case and adds restack steps and a second kind of batch record.

## Q4 (4a): right idea, wrong phase

4a says move the step "into check.review, where the reviewer holds the Nit". Three facts from the code say check.review is not the place:

- The merge skill's rule is about a Nit "B still holds" (`skills/merge-issue/SKILL.md:35`). At review time B cannot know that. A `fix` verdict sends the leaf to `check.repair` (`src/phase.ts:246-250`), and Nits can disappear during repair. A lesson written at review can describe something the repair removed.
- First-round check.review is run by both A and B, blind (`src/routing.ts:32`). The rule names B only. 4a as worded either has two seats writing lessons or needs a new exception.
- B enters `merge` from two phases, check.review and check.repair (`src/routing.ts:32-33`). A step tied to check.review is skipped whenever the last B pass before merge was a repair.

The step belongs to B's own move into `merge`, from either phase: it is B's last act before that move, on the Nits it still holds then. This still removes the class, since every leaf's own B does it before the leaf can be carried. One further cost to state: a leaf that reaches `merge` and later fails leaves a lesson for code that never landed. Today the line is written in the same pass that pushes.

## Nothing further

Steps 1, 2, 5, 6, 7, 8, 9 and 10: none.
