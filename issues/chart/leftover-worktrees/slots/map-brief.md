# Leftover worktrees: independent map

You are a consulting slot. Do not edit any repo file and do not remove anything. Read main at d0a4bc9 (`git -C /home/ivan/Work/infra/akrogon log -1`). Write your map to the exact return path in the prompt text below:
- slot B: /home/ivan/Work/infra/akrogon/issues/chart/leftover-worktrees/slots/map-B.md
- slot C: /home/ivan/Work/infra/akrogon/issues/chart/leftover-worktrees/slots/map-C.md
Keep it under 60 lines.

## Intake
Read /home/ivan/Work/infra/akrogon/issues/chart/leftover-worktrees/INTAKE.md (operator notes verbatim plus agent findings).

## Locks already decided (do not reopen)
- store-hygiene and worktree-cleanup charts (issues/chart/worktree-cleanup/): nothing is deleted for age; a locked worktree is never removed; a worktree is removed only when clean and reachable; every deletion passes the live pane and same-uid /proc cwd/fd veto, never a kill list; kept items show in `akrogon leftovers`, not `akrogon status`.
- Operator constraints for this chart: automatic, simplest, adds nothing to the operator's mental model (no new command or concept), must not break anything else.

## Live surfaces
- src/reconcile.ts (worktree rules 415-680, unowned/registered loop 750-850, guards 193-212 and 526-566, 707-730), src/leftovers.ts, tests/reconcile*.test.ts.
- `git worktree list --porcelain` in /home/ivan/Work/infra/akrogon, /home/ivan/Work/infra/tamdoma/framework.

## Your map
1. The forks that change the outcome, each with your pick, the reason and cost. At least: (a) which unmanaged worktrees may be removed automatically and what proves "nothing is lost" (ancestor of the default branch, `git cherry` all `-`, clean tree incl. untracked files, stash?); (b) the Claude Code lock: honor it, or treat a lock whose named pid/start is dead as released, or touch only unlocked; (c) the worktree's branch: delete, keep, and with `-d` or `-D`; (d) scope: only Claude Code agent worktrees (`.claude/worktrees/agent-*`), or any registered unmanaged worktree including an operator's own; (e) whether leftover branches with no worktree belong here.
2. What each option could break or invite later (an operator's fresh worktree with no commits yet, a live agent, a different harness's lock text, a remote-only branch, detached HEAD).
3. Questions a practitioner would ask that this list misses.
Cite path:line for every code claim.
