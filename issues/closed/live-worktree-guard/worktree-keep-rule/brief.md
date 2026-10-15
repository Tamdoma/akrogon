# Brief: worktree-keep-rule

## What
Reconcile's store sweep removes a registered git worktree only when it is an akrogon kind it knows is finished. Every other registered worktree in the store or legacy root stays and is listed by `akrogon leftovers`. A locked worktree is never removed, whatever its name. Each pass records the registered worktrees it removed. The chart-issues direct route creates its worktree locked and unlocks it right before its own removal.

## Why
Tamdoma/akrogon#94: a reconcile pass deleted a chart's live direct-route worktree mid-attempt, because the sweep removes any clean, reachable registered worktree it cannot name and only a pane cwd protects it. Agent tool shells have no pane, so a running `akrogon verify` inside was invisible. The same class removed delegated workers on 2026-10-14 (a77c260). Nobody could prove which pass removed it, because removals are not recorded.

## Done-criteria
1. A registered worktree in the worktree store or legacy `issues/worktrees` root whose name is neither a leaf slug nor one of akrogon's scratch kinds (`verify-<run>`, `batch-<attempt>`, `<leaf>-u<N>` of an existing leaf) stays after a reconcile pass run by `akrogon next` and by the `tab_closed` event, while clean, reachable from a branch and with no pane inside; `akrogon leftovers` lists it under `unmanaged worktree`.
2. A worktree locked with `git worktree lock --reason <text>` stays after a pass whatever its name, including `<leaf>-x`, `verify-<ended run>`, `batch-<unrecorded>`, `<merged leaf>-u1` and a merged or failed leaf's own worktree; `akrogon leftovers` lists it with a reason naming the lock reason.
3. Unlocked akrogon worktrees keep the removal they have on this leaf's base: a leaf's own worktree under its leaf rules, and `verify-<run>`, `batch-<attempt>` and `<leaf>-u<N>` copies under the sweep's scratch rules (today's, or scratch-copy-removal's once merged); every such removal goes through `git worktree remove` and never passes a lock. (A,B,C)
4. After each pass the repo's reconcile report lists every registered worktree that pass removed, each with path, branch (none for a detached worktree), head commit and the rule that removed it, and lists none when the pass removed none; `akrogon leftovers` still reads a report written before this change. (A,C)
5. chart-issues SKILL.md Direct route creates the worktree with `git worktree add --lock --reason "<chart-folder> direct"` at step 1, and runs `git worktree unlock <path>` immediately before `git worktree remove` at landing step 8 and on abandon, and before a growth-stop lifecycle handoff hands the worktree to the leaf.
