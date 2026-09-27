R1. I did not recommend automatically rerunning every failed cherry-pick. Abort the failed pick before integrating another result, retain the worker commit, and let B resolve the conflict or delegate the actual remainder. Restarting the unit contradicts partial-work preservation (`skills/implement-issue/worker-protocol.md:17,25`).

R2. “Run git worktree prune after a crash” is not recovery. Prune removes stale administrative records for missing worktrees, not existing interrupted work. Inspect and resume retained work first ([Git worktree documentation](https://git-scm.com/docs/git-worktree), read 2026-09-27).

R3. Add `skills/implement-issue/SKILL.md:23` to the prose changes. It currently restricts code reads and edits to the leaf worktree, contradicting worker worktrees unless amended.

R4. Keep verification independence explicit in Q1. Landed prerequisites and owned paths alone omit shared test resources and semantic coupling. Satellite-build’s `implementation/brief-4.md:21` requires renderer outputs and expectations from units 2/3.
