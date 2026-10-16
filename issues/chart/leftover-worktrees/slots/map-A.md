# Map A (written before reading B and C)

F-a Proof nothing is lost. Pick: clean `git status --porcelain` (untracked counts, ignored does not), no rebase/merge in progress (existing worktreeRemovable, src/reconcile.ts:193-212), plus `git cherry <remote>/<default> HEAD` prints no `+` line (covers plain ancestors and rebased patch-equal commits; the agent-adfa case was rebased). Stash is repo-wide (refs/stash), not lost by removing a worktree. Cost: ignored files (.env, build output) go with the folder; acceptable for agent scratch, not for an operator's own worktree, which is why F-d limits scope. Rejected: "reachable from any branch" alone (src/reconcile.ts:203-210), because the worktree's own branch always holds HEAD, so it proves nothing.

F-b Claude Code lock. Pick: treat a lock as released only when its text matches Claude Code's exact form `claude agent agent-<id> (pid <N> start <T>)` and /proc/<N>/stat field 22 is absent or differs from T (pid reuse removed by the start time). Every other lock is honored as today (keepLocked, src/reconcile.ts:442-447). Reason: Claude Code always locks its agent worktrees (probe in INTAKE), so "only unlocked" would never remove one; the lock names its owner, so a dead owner is proof, not a guess. Cost: depends on Claude Code's lock text; a format change means no match, so the worktree is kept as today (fails safe).

F-c Branch. Pick: after the worktree is removed, delete its branch with `git branch -D` only because F-a's cherry check already proved every commit is on main (`-d` refuses rebased branches). Never touch remote branches. Rejected: keep the branch (leaves the junk the operator asked to remove).

F-d Scope. Pick: only worktrees carrying a dead Claude Code agent lock. An operator's own unmanaged worktree stays kept and listed as today (src/reconcile.ts:766, 815, 839). Reason: an operator's fresh worktree with no commits passes F-a (cherry empty, clean) and would be deleted under them; a live-process veto does not cover an editor whose cwd is elsewhere. The lock is the only signal that says "a tool made this and the tool is gone". Rejected: any unmanaged worktree; path match `.claude/worktrees/agent-*` alone (does not prove the agent ended).

F-e Leftover branches with no worktree (`worktree-agent-adfa...`, `single-merge`, both ancestors of main). Pick: off route. Not a folder, not shown anywhere, costs nothing; F-c stops new ones. One-off `git branch -d` by the door if the operator wants.

Where: the registered-worktree loop already marks out-of-store paths `unmanaged worktree` (src/reconcile.ts:762-767) without a lock check. Add one branch there: dead Claude agent lock -> unlock, then removeWorktree(path, false, 'ended agent worktree') (process veto + worktreeRemovable + `git worktree remove` without force), plus the cherry check, then branch -D. Failure keeps it with the existing reasons in `akrogon leftovers`.

Pitfalls
- Live agent: its pid/start matches, so its lock is honored. Also the /proc cwd veto in removeWorktree (src/reconcile.ts:527-535).
- Unlock then remove failing leaves an unlocked worktree with a dead owner; harmless, next pass retries.
- Stale `<remote>/<default>` ref: cherry against an old ref says `+` for new main commits, so it keeps (fails safe).
- Other harnesses (codex, pi) do not create git worktrees here today; no rule for them (YAGNI).

Practitioner questions: does Claude Code itself ever reclaim these (resume, exit prompt)? If it does, double removal just fails `git worktree remove` and keeps. Tests: fake lock text with a dead pid, a live pid, a wrong start time, a `+` commit, a dirty tree, untracked file.
