# Brief: scratch-copy-removal

## What
Reconcile removes the scratch worktrees a finished run leaves in the worktree store: `verify-*` copies whose run ended or whose owner died, `batch-*` build copies whose builder died, and delegated worker copies `<slug>-u<N>` once their owner leaf merged, using `git worktree remove --force`. `buildStack` writes an owner record before it creates its copy so a running build is never taken.

## Why
Tamdoma/akrogon#93: on 2026-10-15 framework's store held 13 GB in nine leftover copies, kept as "unreachable commits" because the leaf was rebased onto main. These copies are scratch space; crash cleanup should do what the normal path already does.

## Done-criteria
1. A `verify-*` copy whose verify run was killed, at a commit no branch reaches after its leaf was rebased, is gone after the next reconcile pass.
2. A `verify-*` copy whose run is still open with a live owner stays after a reconcile pass.
3. A build paused after its owner record and copy exist survives a second merge pass plus a reconcile pass; once its builder is killed, the next reconcile pass removes the `batch-*` copy and its owner record.
4. A `batch-*` copy with no owner record is removed by a reconcile pass.
5. A `<slug>-u<N>` copy holding a commit not on main and an untracked `__pycache__/` is gone after a reconcile pass once its owner leaf is `merged`; with the owner `failed` it stays under today's guard and is recorded with that guard's reason (`unreachable commits` here). (C)
6. A leaf whose own slug ends in `-u<N>` is handled as that leaf, not as another leaf's worker.
7. None of these copies is removed while a live herdr pane sits inside it, or in a pass where the pane list is unavailable.
8. A dead `verify-*` copy in which a surviving process of this user has its cwd or an open file stays, recorded with that pid as the reason. (B)
9. A `verify-*` copy with no verify record is removed like one whose owner is dead. (C)
