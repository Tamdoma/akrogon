# Rebuttal C

One disagreement: B's saving estimate (42 of 214 minutes on content-batch units 1-7) treats units 5-7 as waiting on unit 4. The evidence says they do not. `content-batch/plan.md:129`: "No execution ordering: every producer module above is present in the worktree." Briefs 5, 6 and 7 cite no earlier unit; only briefs 4, 9, 10, 11, 12 and 13 do (`brief-4.md:21`, `brief-9.md:21`). With that graph and measured child spans (45, 31, 32, 52 minutes for units 4-7), a cap of 2 turns the 160-minute serial run of units 4-7 into about 84. The merged map should not present B's number as the floor.

Q3 has an answer the merged map lacks: `src/init.ts:54-55` gitignores `issues/worktrees/` at the lane root too, so a worker worktree at `<lane>/issues/worktrees/<slug>-u<N>` stays inside `parentRoot` (`tools.ts:96`, no prompt) and invisible to `requireClean` (`src/phase.ts:253`). Verified: a nested worktree shows as `??` only when unignored.
