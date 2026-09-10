# Worker protocol

Read when B delegates a brief or checks a worker return; all instructions here apply with only this skill folder and the concrete brief, in a leaf or standalone task.

## Launch and return

Delegate the sub-brief to a subagent with its absolute brief path, the worktree path (current checkout for standalone), and this one reminder line:

> Read the brief before editing, follow sections 5 and 6, reread section 8 and fill its report before returning.

Workers execute sequentially in one worktree and return the brief's report and changed-test output; B judges the four contents, not their headings or order.

A report missing changed files/reasons, tests/results, known limitations or unverified criteria goes back to that worker for completion, even when the worker says it is done; this is a worker turn with no phase change or `fix_rounds` increment.

A mismatch names the conflicting requirement, actual code/interface or scale evidence, and the smallest brief correction; B revises the brief and reruns the affected worker, without escalating the implementation choice to the operator or changing phase.

## Failure ownership

Workers run only the brief's changed-test command against B's supplied base and repair failures within their brief; the full suite belongs to B after the final worker.

A red full suite becomes one more sub-brief whose criteria are the failing tests with their output pasted, then the worker repairs and runs changed tests and B reruns the full suite.

A failure between briefs, a wrong shared interface or incompatible worker choices belongs to B to fix in the brief and rerun the affected worker; a one- or two-line repair may be edited directly by B.

On the last allowed leaf repair round B repairs itself without a worker, while standalone self-repair is B's responsibility without lifecycle counters.
