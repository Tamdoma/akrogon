# Fork: removal rule

## Question
What may reconcile's store sweep delete among registered git worktrees, how does a direct attempt stay protected, when does protection end, and are removals recorded?

## Context
Merged map: [map-merged.md](../slots/map-merged.md). Sweep in src/reconcile.ts removes a registered worktree matching no known kind once clean, reachable and with no pane cwd inside. Unregistered folders are kept as `unknown directory` (tests/reconcile.test.ts:188). `git worktree remove` runs without `--force`, so a locked worktree survives today.

## Options
See map-merged.md Options Q1-Q6.

## Taken
Round 1, 2026-10-15, operator `1a | 2a | 3a`:
1. Reconcile deletes a registered store checkout only when it is an akrogon kind it knows is finished. Every other registered checkout is kept and listed by `akrogon leftovers`. Reason: a wrong keep is visible and reversible, a wrong delete loses work (a77c260, #94).
2. The direct route creates its checkout with `git worktree add --lock --reason <chart>` and unlocks right before its own `git worktree remove` at landing or abandon. Every store deletion goes through plain `git worktree remove`, never forcing past a lock. Reason: protects the checkout whatever its name, against store-sweep's prefix match.
3. Each reconcile pass writes the registered checkouts it removed (path, branch, head, rule) into the report it already rewrites. Caller label and append-only history are out of scope. Reason: the next wrong deletion becomes provable.
Correction by A, 2026-10-15, to the record of item 2 (no operator answer changed): the presented option read "Every store deletion must go through `git worktree remove` and never force past a lock", restated simply as "Cleanup must never override a lock". The word "plain" above overstated it. Binding: every removal of a registered store worktree goes through `git worktree remove` and never passes a lock (no `--force --force`, no unlock by cleanup, no filesystem delete); a single `--force` is allowed where an existing contract has it, because it cannot pass a lock (P1). Raised by B (slots/leaf-review-B.md F1).
Correction by A, 2026-10-15, to item 1's scope (no operator answer changed): akrogon's scratch kinds (`verify-<run>`, `batch-<attempt>`, `<leaf>-u<N>` of an existing leaf) keep the sweep's scratch rules on the leaf's base, which #93 scratch-copy-removal owns and the operator approved there; this fork's keep rule covers every other registered worktree. Reason: one owner per kind, so the two leaves cannot contradict each other in either landing order (B F1, F2; C F2).
Only the door removes a direct checkout (A,B,C). Process checks for akrogon's own kinds stay with #93 scratch-copy-removal.

## Findings
- Proof P1, 2026-10-15, git 2.56.0, identity: local user ivan, throwaway repo under the job temp folder. `git worktree add --lock --reason "chart issues/chart/x" <store>/d1 d1` exit 0. `git worktree list --porcelain` shows `locked chart issues/chart/x`. `git worktree remove <path>` exit 128 "cannot remove a locked working tree". `git worktree remove --force <path>` (single) also exit 128, folder still present. `git worktree unlock` exit 0, then plain remove exit 0, porcelain count 0. Cleanup: throwaway folder removed, `ls` confirms absent. Limits: does not prove behavior when the lock is added after creation, under another user, or with `--force --force`.
