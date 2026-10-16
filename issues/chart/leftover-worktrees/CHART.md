# Chart: leftover-worktrees

## Destination
Reconcile removes a Claude Code agent worktree by itself once the agent is gone and its work is on main, with its branch. Nothing new to learn or run. Everything else stays as today.

Route: lifecycle (debate no)

Handoff review 2026-10-16: operator `r1b, just do the handoff, don't start it. I want to test another model as a subagent, ok?` Leaf drafts reviewed by [B](slots/leaf-review-B.md) and [C](slots/leaf-review-C.md); applied: path leg in identification and admission.ts in owned surfaces (C F1, F2); git operations proved and linked in readiness (C F3); update-ref failure kinds and stale-target limit (B F1, F2). Leaf: issues/open/leftover-worktrees/agent-worktrees. Not dispatched: the operator starts it.

## Forks taken
- [auto-remove](forks/auto-remove.md): dead Claude lock owner releases the lock (1a); every commit on main as same commit or same patch, ignored files go (2a); branch deleted bound to the proven commit (3a).

## Open forks
none

## Fog
none

## Off route
- Branch-only leftovers (`single-merge`, `worktree-agent-adfa0843775529512`): one-off `git branch -d` if the operator asks.
- Operator's own unmanaged worktrees: kept and listed in `akrogon leftovers` as today.

Handed off 2026-10-16
