# Merged territory map 2026-09-28 (A merged; tags (A) (B) (A,B))

## Findings
- (A,B) The nested path is the written rule: worker-protocol.md:11 `<lane>/<worktree_root>/<slug>-u<N>`, reason "inside pi's parent root so no confirm dialog appears". owner-defect-stop followed it with a lane-relative `git worktree add --detach issues/worktrees/owner-defect-stop-u1 HEAD` (T2:48, :60-63).
- (A,B) create-peer-panes read the same rule (T1:48), ran `akrogon config` and listed the registered store (T1:9), then created `/home/ivan/Work/infra/akrogon/issues/worktrees/create-peer-panes-u1` (T1:53). (A) `<lane>` is never defined as a path in skills/implement-issue, and akrogon itself resolves `worktree_root` against the registered root (src/next.ts:231), so the rule reads two ways. (B) The transcript records no explicit reason; do not invent one. Either way: an instruction defect, not a seat defect.
- (A,B) The nesting reason is obsolete: pi-extensions seat-subagent-freezes merged; tamdoma-subagents admits same-repo worktrees by canonical git common dir with no dialog (PX tools.ts:91-95, git-worktrees.ts:28-63, parallel sibling test tools.test.ts:496-527). (B) This proves source, not that every already-running pi process reloaded it.
- (B) Nesting makes a worker cwd count as inside the leaf by path containment (src/next.ts:166-171, used by paneOwners :656-665 and capacity :264-278). Not a measured misdispatch, since workers are subagents, not herdr panes.
- (B) Git accepts nested worktrees (T2:61; git-worktree docs set no ban). The reason to change is one predictable location, not a Git limit.
- (B) `.gitignore` covers the store only when it sits under the root (src/init.ts:51-60). Cleanup and resume of workers already belong to B (worker-protocol.md:17, :25; SKILL.md:45).
- (B) Workers start from the leaf's committed HEAD (T2:61, unit 2 at 758039c). Changing the path must keep that.

## Forks
- Q1 (A,B) Anchor: registered root + `worktree_root` + `<slug>-u<N>`, same resolution as leaf worktrees, started from the leaf HEAD; resolved once as an absolute path used for create, spawn, inspect and remove. Alternative: keep nested and define `<lane>`.
- Q2 (B) Prose rule fix vs an akrogon CLI that allocates worker worktrees. Recommend the prose fix.
- Q3 (B) Worker retained at the old nested path at rollout: finish it where it is, new units use the new path. Alternative: relocate all retained workers first.

## Destination
(A,B) Unchanged repo (akrogon skills/implement-issue). (B) Sharpened: new delegated leaf workers use the registered repo's configured worktree store across creation, spawn and cleanup, starting from the leaf's committed HEAD; standalone and retained-work recovery unchanged.

## Locks
restart-hung-seat Taken: no confirm dialog in any session, watch-issues Never list unchanged, no clocks, polls or watchdogs (A,B).
