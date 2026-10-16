# Brief: agent-worktrees

## What
Reconcile removes a registered Claude Code agent worktree, and then its branch, when the Claude session that locked it has ended, nothing is using it, and every commit is already on the repo's default branch target. Any other worktree, and any agent worktree failing a check, is kept with a reason in `akrogon leftovers` exactly as today. No new command, setting or report.

## Why
Claude Code leaves a locked agent worktree behind whenever its `isolation: worktree` agent changed files (operator report 2026-10-16: `.claude/worktrees/agent-adfa0843775529512`, 16 commits all landed by rebase). Reconcile keeps every unmanaged or locked worktree forever, so these pile up until the operator removes them by hand.

## Done-criteria
1. A registered worktree at `<repo>/.claude/worktrees/agent-<id>` of the repo being reconciled, whose lock reads `claude agent agent-<id> (pid <N> start <T>)`, where process N is gone or its start time differs from T, with no tracked changes, no untracked files, no rebase or merge in progress, on a non-default branch whose every commit is on the target as the same commit or the same patch with no merge commits in that range, is removed by a reconcile pass, its branch deleted, and the removal recorded with its head.
2. The same worktree with its lock owner still alive (same pid and start time) stays locked and kept, untouched.
3. The same worktree is kept, still locked as found, when any one of these holds: a commit not on the target, tracked changes, an untracked file, a merge commit in the range, detached HEAD, a lock text in any other form, a matching lock on a path outside `<repo>/.claude/worktrees/`, or a process with cwd or an open file inside.
4. A branch that moved after the proof stays; only the proven commit's ref is deleted.
5. Ignored files inside an otherwise eligible worktree do not block its removal.
6. An operator's unmanaged worktree and every other lock behave as on main d0a4bc9.
