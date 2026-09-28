# Wave shape C

## Q1. Which units may run together

Recommended: the plan says it. Each checklist unit carries `after: none | <units>` and its owned paths. B groups the next two units whose `after` is met and whose owned paths are disjoint. Plans already carry the fact in prose (`content-batch/plan.md:129` "No execution ordering"), and `skills/plan-issue/SKILL.md:57` names a dependency "only when execution actually requires ordering".

Alternative: B judges from briefs alone. Cheaper, but section 4 paths are incomplete.

Pitfalls: coarse ownership (`scripts/`) serializes everything; lockfiles need one owner.

Prose: `skills/plan-issue/SKILL.md:55`, after "ordered file/criterion checklist", add "where each unit names `after:` (none or earlier units) and the paths it owns". `skills/implement-issue/SKILL.md:37`, replace "delegate each to a subagent sequentially in this worktree" with "delegate them in groups of at most two whose `after` is met and owned paths are disjoint, one worker worktree each".

## Q2. How a result returns

Recommended: a patch. B runs `git add -A` in the worker worktree, then applies `git diff --cached --binary HEAD` to the lane after `git apply --check`. A refused patch means the ownership was wrong: B lands the other worker, then reruns the refused unit alone in the lane. Workers still do not commit, so `SKILL.md:45` (one commit after the last unit) stays.

Alternative: workers commit, B cherry-picks. Cleaner history, but it forces per-unit lane commits.

Pitfalls: plain `git diff HEAD` skips untracked files, hence `add -A`; exclude `.pi-command-logs/`.

Prose: `skills/implement-issue/worker-protocol.md:11`, replace "Workers execute sequentially in one worktree and return" with "Each worker executes in its own worktree, B applies its diff to the lane one at a time and reruns changed tests after each, and workers return".

## Q3. Where worker worktrees live

Recommended: `<lane>/issues/worktrees/<slug>-u<N>`, created with `git worktree add --detach` at the lane head, removed with `git worktree remove --force` after the patch lands. Inside the parent root, so `tools.ts:96` admits the cwd without the prompt at `tools.ts:97-98`. Ignored by the line `src/init.ts:54-55` writes, so `requireClean` (`src/phase.ts:253`) passes. Verified: only an unignored nested worktree shows as `??`.

Alternative: siblings under the repo's worktree root. Outside the parent root, so every spawn needs operator confirmation.

Pitfalls: a checked-out branch cannot be added twice, so detach. A fresh worktree lacks `node_modules`. After a crash, `git worktree prune`.

Prose: `worker-protocol.md:7`, after "the worktree path", add "(a detached worktree at `<lane>/issues/worktrees/<slug>-u<N>` cut from the lane head, removed after its diff lands)".
