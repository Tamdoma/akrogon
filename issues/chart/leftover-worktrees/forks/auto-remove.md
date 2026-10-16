# Fork: auto-remove ended Claude agent worktrees

## Question
Which leftover worktrees does reconcile remove by itself, what proves nothing is lost, and what happens to the branch?

## Carries
Scope agreed (A,B,C): only Claude Code agent worktrees (`<repo>/.claude/worktrees/agent-*` with Claude's lock form). Operator's own worktrees stay kept and listed. Branch-only leftovers off route.

## Findings
- Maps: slots/map-A.md, map-B.md, map-C.md; merged slots/map-merged.md; rebuttals map-rebuttal-B.md (5 points), map-rebuttal-C.md (none).
- better-than-training, lock probe 2026-10-16 (INTAKE.md): Claude locks agent worktrees `claude agent agent-<id> (pid N start T)`, N = parent session, T = /proc/N/stat field 22.
- better-than-training, src/admission.ts:50-82: existing pid identity check by start time.
- better-than-training, git-worktree(1): non-force `remove` refuses tracked changes and untracked files, allows ignored files; locked worktrees need unlock or `-f -f`.
- B F4 answered: unlock, remove, and on failure re-lock with the original reason, so a failed attempt leaves the worktree exactly as found.

## Taken
Round 1, 2026-10-16, operator: `1a | 2a | 3a`.
- 1a: a lock in Claude Code's exact form `claude agent agent-<id> (pid N start T)` counts as released only when /proc/N/stat is absent or its field 22 differs from T. Every other lock, and a matching live owner, is honored. Unknown format: kept.
- 2a: removable when `git status --porcelain` is empty (tracked changes and untracked files block, ignored files do not), no rebase/merge in progress, HEAD on a branch other than the default branch, and every commit in `<remote>/<default>..HEAD` is on the target as the same commit or the same patch (`git cherry <target> HEAD` prints no `+`), with no merge commits in that range. Missing target, git error, detached HEAD: kept.
- 3a: after the worktree removal succeeds, delete its branch with `git update-ref -d refs/heads/<branch> <proven head>` (license: the 2a proof, bound to the proven commit); never the default branch. A branch that moved since the proof stays: it is in use, not a leftover (final check B F1/F2, C 1, slots/final-check-*.md).
- Binding avoidance: existing process/owner veto and pane veto run first; unlock, then non-force `git worktree remove` (git re-checks tracked changes and untracked files); a proven worktree is disposable, so a failed remove is never undone: while git still registers it, re-lock with the original reason so the next pass retries; once git has unregistered it, record the remove error as a kept entry; the removed record keeps the head sha. Revised 2026-10-16, operator: "left as found" is unmeetable because a failing `git worktree remove` can delete files and unregister before it fails (agent-worktrees report.md, blocker F1).

## Proof: git operations (2026-10-16, A, git 2.56.0, throwaway repo under the job temp dir, removed after; identity: operator uid 1000)
- `git worktree lock --reason "claude agent agent-x (pid 1 start 2)" ../wt` on an existing unlocked worktree: exit 0, porcelain `locked claude agent agent-x (pid 1 start 2)`.
- `git worktree remove ../wt` while locked: exit 128 "cannot remove a locked working tree".
- unlock, untracked file present, `git worktree remove ../wt`: exit 128 "contains modified or untracked files"; re-lock with the same reason restored the porcelain line.
- ignored `node_modules/x` only: `git status --porcelain` empty, unlock + `git worktree remove` exit 0.
- `git update-ref -d refs/heads/wt-branch <wrong old>`: exit 1 "is at <sha> but expected <old>", branch unchanged; with the right old value: exit 0, branch gone.
- Cleanup: `rm -rf` of the throwaway dir, verified absent.
- Limits: does not prove Claude Code's lock text stays the same across versions (an unmatched text is kept), nor `git cherry` on merge ranges (the leaf excludes merges by `git rev-list --merges`).
