# Merged: wave shape

Attribution: (A) chart seat, (B) slot-b codex, (C) slot-c fable-5-1 medium.

## Map rebuttals applied
- A worktree checks out a commit, not the lane's uncommitted edits. Today the lane stays uncommitted until the last unit (`implement-issue/SKILL.md:45`). Without a checkpoint commit before each wave, later waves miss earlier units (B, confirmed by A).
- Savings stay a range: about 20% if verification dependencies are kept (B) up to 35-49% on the brief graph (C). C shows content-batch units 5-7 do not wait on unit 4 (`plan.md:129`). B shows satellite-build unit 4 consumes renderer outputs (`brief-4.md:21`). Neither is measured.

## Q1. Which units may run together
- B records each unit's prerequisites and owned paths in brief section 4 and runs waves of at most 2 whose prerequisites have landed (A, B). There is no plan-issue change, because `plan-issue/SKILL.md:57` already names real ordering.
- The plan lists `after:` and owned paths per unit (C). Reason: brief paths are incomplete.
- Common ground: the cap is 2, ownership is explicit and serial is the default when unsure (A, B, C).

## Q2. How a result returns
- B commits the lane before each wave. Each worker commits its unit in its own worktree, and B cherry-picks results one at a time, then runs lane changed tests. A failed pick means B lands the other unit and reruns this one alone (A, B).
- Patch: `git add -A` in the worker, then `git apply` onto the lane, with no worker commits (C). Gap: a worktree cut from HEAD lacks the lane's uncommitted edits, so C's patch route also needs the checkpoint commit (A, from B's R1).

## Q3. Where worker worktrees live
- `<lane>/issues/worktrees/<slug>-u<N>`, detached at the lane head and removed after its result lands (A, C). It sits inside pi's parent root, so there is no confirm dialog (`tools.ts:96-98`), and `issues/worktrees/` is already gitignored (`src/init.ts:54-55`, framework `.gitignore:44`), so `requireClean` (`src/phase.ts:253`) passes.
- `<lane>/.akrogon-units/<unit>` (B). It is not ignored, so a leftover shows as `??` and blocks phase until removed.
- Common ground: remove worktrees before lane checks and handoff, provision `node_modules` per worktree, and run `git worktree prune` after a crash (A, B, C).

## Prose touched (A, B, C)
`implement-issue/SKILL.md:3,21,37,45`, `worker-protocol.md:7,11`, `brief-template.md:21`. C also adds `plan-issue/SKILL.md:55`.

## Rebuttals applied
- C withdraws the patch route and the plan-level field. Cherry-pick after a checkpoint and brief section 4 stand (C).
- A failed cherry-pick is aborted before the next result. The worker commit is kept, and B resolves the conflict or delegates only the remainder, never a full rerun (B, `worker-protocol.md:17,25`).
- After a crash, B inspects and resumes the retained worktree. `git worktree prune` only clears records of missing worktrees (B).
- `implement-issue/SKILL.md:23` limits edits to the leaf worktree and must admit worker worktrees (B).
- Q1 names verification independence too, such as shared test resources and consumed outputs (B, satellite-build `brief-4.md:20-21`).
- Savings on unit time: content-batch 392→200 minutes, plan-script 368→238, satellite-build 299→255 (C, corrected). These are unmeasured simulations.
