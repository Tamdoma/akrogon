# Worker protocol

Read when B delegates a brief or checks a worker return; all instructions here apply with only this skill folder and the concrete brief, in a leaf or standalone task.

## Launch and return

Delegate each sub-brief to a subagent with its absolute brief path, its worktree path (current checkout for standalone), and this one reminder line:

> Read the brief before editing, follow sections 5 and 6, reread section 8 and fill its report before returning.

A delegated leaf runs chunks in waves of up to 3 whose recorded prerequisites have landed and whose edits and verification are independent, one at a time when unsure; standalone workers keep running one after another in the current checkout. Each leaf worker runs in a detached worktree at `<lane>/<worktree_root>/<slug>-u<N>` (`worktree_root` from `akrogon config`, default `issues/worktrees`), created with `git worktree add --detach` at the lane head: the path stays inside the repo so it is gitignored and inside pi's parent root so no confirm dialog appears, the worker installs dependencies there before its changed tests, and the worktree is removed once its result lands. Before each wave B commits pending lane edits when there are any and otherwise reuses HEAD, making no empty commit. Each worker commits only its chunk, returning the commit ID with the brief's report and changed-test output; B judges the four contents, not their headings or order. B then cherry-picks the wave's commits serially onto the lane, runs the lane changed tests after each pick, and removes that worker's worktree with `git worktree remove`; every worker worktree is gone before the full suite, checks and `akrogon phase`.

A report missing changed files/reasons, tests/results, known limitations or unverified criteria goes back to that worker for completion, even when the worker says it is done; this is a worker turn with no phase change or `fix_rounds` increment.

A mismatch names the conflicting requirement, actual code/interface or scale evidence, and the smallest brief correction; B revises the brief and reruns the affected worker, without escalating the implementation choice to the operator or changing phase.

A worker that stops without a report, whether over its turn budget, cut off at the output limit or failed by the provider, keeps its landed edits and its worktree; B lists what that brief still owes from the retained worktree's state and delegates only that remainder as a new sub-brief, never the original brief again.

## Failure ownership

Workers run only the brief's changed-test command against B's supplied base and repair failures within their brief; the full suite belongs to B after the final worker.

A red full suite becomes one more sub-brief whose criteria are the failing tests with their output pasted, then the worker repairs and runs changed tests and B reruns the full suite.

A conflicting pick is aborted with `git cherry-pick --abort` and that worker's worktree kept so its commit stays reachable; B resolves the conflict itself or delegates only the remainder, whose sub-brief reads its starting state from the retained worktree. After a crash B inspects and resumes a retained worktree. A failure between briefs, a wrong shared interface or incompatible worker choices belongs to B to fix in the brief and rerun the affected worker; a one- or two-line repair may be edited directly by B.

On the last allowed leaf repair round B repairs itself without a worker, while standalone self-repair is B's responsibility without lifecycle counters.
