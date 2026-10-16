# Map merged (A, B, C), main d0a4bc9

## Agreed
- Scope: only Claude Code agent worktrees. An operator's own unmanaged worktree stays kept and listed, because a fresh one (clean, no commits) passes every git test and must not be deleted (A,B,C). Candidate identified by path `<repo>/.claude/worktrees/agent-*` plus Claude's lock form (A,C); B: name is a filter, not proof.
- Reuse the non-force removal path: process/owner veto, pane veto, clean status, no rebase/merge markers (src/reconcile.ts:193-212, 526-566) (A,B,C). Never raw `dropChecked` on a registered worktree (B). Never kill a process (A,B,C).
- Branch-only leftovers (`single-merge`, `worktree-agent-adfa...`) are off route (A,B,C).
- Detached HEAD with commits not on main is kept (B,C). Missing target, git error, stale ref: keep (fails safe) (A,B,C).
- `worktreeRemovable`'s reachability test is satisfied by the worktree's own branch, so it proves nothing about main (A,B,C).

## Fork 1: the Claude lock
- 1a Release only when the lock text matches `claude agent agent-<id> (pid N start T)` exactly and /proc/N/stat field 22 is absent or differs from T; every other lock honored (A,C). The pid is the parent Claude session, so cleanup waits for that session to end; that is the safety margin (C). Start-time equality is the existing pid-identity pattern (src/admission.ts:50-82) (C). Unknown format: no match, kept (A,C).
- 1b Honor every lock; only unlocked candidates (B). Reason: worktree-cleanup settled "a locked worktree is never removed"; parsing a harness-specific reason adds a protocol. Cost: Claude always locks, so nothing is ever removed automatically, including the reported case (A,B,C agree on the cost).

## Fork 2: what proves nothing is lost
- 2a Ancestor of `<remote>/<default>` OR `git cherry` prints only `-` with no merge commits in the range (A,C). Covers the reported rebased case. C adds the no-merges condition (cherry gives merges no patch id).
- 2b Ancestor only (B). Reason: cherry compares diffs, not commit identity. Cost: rebased agent work (the reported case) stays.
- Ignored files: go with the folder for agent scratch (A,C). B: treat ignored files as content and keep. Cost of B's: any worktree with installed deps or build output stays forever.

## Fork 3: the worktree's branch
- 3a Delete after the worktree removal succeeds: `-d`, else `-D` only when 2a's cherry proof passed; never the default branch; failure keeps with a reason (A,C). Keeping it rebuilds the clutter as branches and can collide with a later agent of the same id (C).
- 3b Keep the branch (B). Reason: separate decision; a branch is the recovery ref. Cost: local refs pile up.

## Pitfalls and what removes them
- Live agent: parent pid/start matches, lock honored; /proc cwd veto as second guard (A,C).
- Check-to-delete race: revalidate HEAD/lock at deletion; `git worktree remove` without force re-checks clean itself (A,B).
- Unlock then failed remove: harmless, next pass retries (A).
- `-D` drops the original commit ids; the removed record keeps the head sha (src/reconcile.ts:548-550) until gc (C).

## Open questions
- Cost bound of `git cherry` on every pass for a long branch vs stale upstream (C). A: candidates are rare (only dead-lock agent worktrees), so it runs almost never.
- Runs for every registered repo reconcile covers (C). A: yes, same loop.
