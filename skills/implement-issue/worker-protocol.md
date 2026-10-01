# Worker protocol

Read when A delegates a brief or checks a worker return; all instructions here apply with only this skill folder and the concrete brief, in a leaf or standalone task.

## Launch and return

Delegate each sub-brief to a subagent with its absolute brief path, its worktree path (current checkout for standalone), and this one reminder line:

> Read the brief before editing, follow sections 5 and 6, reread section 8 and fill its report before returning.

In delegated mode A runs each plan wave whole, up to 3 workers at once, once its prerequisites have landed, and waits on all of them together. A unit leaves a wave only for a recorded reason: an unmet prerequisite puts it in a later wave, and a shared owned path or shared test resource keeps it out of the wave of the unit it shares with. No other reason splits a wave. A plan without a wave grouping (written before this change) is grouped by A from the sub-brief records by the same rule; standalone workers keep running one after another in the current checkout. Each leaf worker runs in a detached worktree at `<worktree_store>/<slug>-u<N>` read from the `worktree_store` key of `akrogon config`, created with `git worktree add --detach` at the leaf's committed HEAD. A uses that one absolute path unchanged as the sub-brief worktree path, spawn cwd, inspection path and `git worktree remove` target; an occupied path is reported to the operator, never deleted, forced or reused; a worker retained at the old nested path resumes there; the worker installs dependencies there before its changed tests. Before each wave A commits pending lane edits when there are any and otherwise reuses HEAD, making no empty commit. Each worker commits only its chunk, returning the commit ID with the brief's report and changed-test output; A judges the four contents, not their headings or order. A then cherry-picks the wave's commits serially onto the lane, runs the lane changed tests after each pick, and removes that worker's worktree with `git worktree remove`; every worker worktree is gone before criterion proof, checks and `akrogon phase`.

A report missing changed files/reasons, tests/results, known limitations or unverified criteria goes back to that worker for completion, even when the worker says it is done; this is a worker turn with no phase change or `fix_rounds` increment.

A mismatch names the conflicting requirement, actual code/interface or scale evidence, and the smallest brief correction; A revises the brief and reruns the affected worker, without escalating the implementation choice to the operator or changing phase.

A worker whose failed result carries a provider error in its error text (the pi-retried kind: overloaded, 429/500/502/503/504, rate limit, unavailable, network and stream drops; never quota, billing or context overflow) is relaunched once, only after the old worker has ended, with its retained worktree as the spawn cwd and its original brief plus this added line verbatim:

> A previous worker died here. Check what is already done (criteria, commits, changed files and external effects such as uploads) before repeating work. Keep what is correct. Finish the brief.

A second provider failure of the same unit ends a leaf pass `failed`, with a reason naming the provider, the error text and both transcript paths; standalone, which makes no phase calls, reports the same contents in its return instead. A worker stopped by its turn budget or the output limit keeps the remainder rule: A lists what that brief still owes from the retained worktree's state and delegates only that remainder as a new sub-brief, never the original brief again.

## Failure ownership

Workers run only the brief's changed-test command against A's supplied base and repair failures within their brief; criterion proof and every `checks` command belong to A after the final worker.

A red criterion proof or `checks` command becomes one more sub-brief with failing output pasted, worker repairs with changed tests, A reruns that proof and `checks`.

A conflicting pick is aborted with `git cherry-pick --abort` and that worker's worktree kept so its commit stays reachable; A resolves the conflict itself or delegates only the remainder, whose sub-brief reads its starting state from the retained worktree. After a crash A inspects and resumes a retained worktree. A failure between briefs, a wrong shared interface or incompatible worker choices belongs to A to fix in the brief and rerun the affected worker; a one- or two-line repair may be edited directly by A.

On the last allowed leaf repair round A repairs itself without a worker, while standalone self-repair is A's responsibility without lifecycle counters.
