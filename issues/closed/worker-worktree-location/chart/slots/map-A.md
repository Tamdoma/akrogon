# Territory map, slot A, 2026-09-28

## Findings
- Rule: skills/implement-issue/worker-protocol.md:11 puts workers at `<lane>/<worktree_root>/<slug>-u<N>` ("`worktree_root` from `akrogon config`"), reason "inside pi's parent root so no confirm dialog appears". `<lane>` is used as a noun ("lane edits", "onto the lane") but never defined as a path anywhere in skills/implement-issue.
- akrogon itself resolves `worktree_root` against the registered root: leaf worktrees are `resolve(repo.root, worktree_root, slug)` (src/next.ts:231). So `akrogon config` hands the seat a value whose only in-repo meaning is repo-root-relative.
- Fog resolved, transcripts 2026-09-28:
  - create-peer-panes seat ran `akrogon config`, listed `/home/ivan/Work/infra/akrogon/issues/worktrees/`, then `git worktree add --detach /home/ivan/Work/infra/akrogon/issues/worktrees/create-peer-panes-u1 HEAD` (session 2026-09-28T13-27-25-703Z). It read worktree_root the way akrogon does.
  - owner-defect-stop seat ran `git worktree add --detach issues/worktrees/owner-defect-stop-u1 HEAD` and `-u2` from the lane cwd (session 2026-09-28T13-27-29-001Z), which is relative, so nested. It matched the protocol by using a relative path.
  Both seats read the same rule; the rule's undefined `<lane>` plus akrogon's repo-root meaning of `worktree_root` gives two readings. Not a seat defect.
- The nesting reason is gone: pi-extensions seat-subagent-freezes merged (issues/closed/seat-subagent-freezes; commits c429911, fb0751c). tamdoma-subagents now admits any same-repo worktree by git common dir (tamdoma-subagents/git-worktrees.ts) and has no confirm call in tools.ts.
- Repo `.gitignore:1` ignores `issues/worktrees/`, so both locations are ignored inside the lane.
- Pane ownership by cwd (src/next.ts:166-172) only matters for herdr panes; workers are subagents inside the seat's pi process, not panes, so location does not affect dispatch ownership.

## Material fork
Worker location:
- A (recommend) Registered root: `<registered root>/<worktree_root>/<slug>-u<N>`, the same resolution akrogon uses for leaf worktrees. One meaning of `worktree_root` everywhere; workers show beside their leaf in `git worktree list`; no worktree nested in another. Needs the protocol's stated reason replaced (same-repo admission, not parent root).
- B Keep nested, and define `<lane>` as the leaf worktree path. Smallest edit, but `worktree_root` keeps two meanings, and a retained worker (crash, conflicting pick, worker-protocol.md:17, :25) sits inside the leaf worktree when the leaf worktree is removed.

## Pitfalls
- Whatever wins, write the path as an absolute resolved from one named root, not a relative path, since relative-from-cwd is how the two readings split.
- Slug collision at repo level: `<slug>-u<N>` could equal another leaf slug ending in `-uN`. Unlikely; leaf slugs are unique but not checked against this suffix.

## Destination
Unchanged: one location, and every seat reads it the same way.
