# Intake: worker-worktree-location

## Scope
One consistent location for implement worker worktrees, and seats that follow it. Destination: akrogon `skills/implement-issue`.

## Provenance
- GitHub: Tamdoma/akrogon#37
- Operator: 2026-09-28 "go with all recommendations" (P2: new chart for #37)

## Source: Tamdoma/akrogon#37
# Implement worker worktree created inside the leaf worktree instead of under the repo issues/worktrees

Source: Tamdoma/akrogon#37
URL: https://github.com/Tamdoma/akrogon/issues/37

Unverified intake.

## Observation
On 2026-09-28, `owner-defect-stop` seat B (`w8:pCW`, pi) started implement worker brief-2 in this cwd:

`/home/ivan/Work/infra/akrogon/issues/worktrees/owner-defect-stop/issues/worktrees/owner-defect-stop-u2`

That worktree sits inside the leaf's own worktree. At the same time, `create-peer-panes` put its worker at the repo level: `/home/ivan/Work/infra/akrogon/issues/worktrees/create-peer-panes-u1`.

## Location
- akrogon: `skills/implement-issue` (worker worktree creation)
- Leaf `owner-defect-stop` (issues/open/failed-leaf-escalation), pane `w8:pCW`

## Reproduction
1. Run implement on a leaf whose plan has parallel worker briefs.
2. Check the worker cwd in the subagent panel.

Seen once on 2026-09-28. Frequency otherwise Not provided.

## Expected behavior
Worker worktrees are created at one consistent location under the registered repo's `issues/worktrees`, not nested inside the leaf worktree.

## Urgency
Not provided. The nested worktree may confuse cleanup and merge. No known workaround.

## Agent findings
- (A) The nested path is the written rule. skills/implement-issue/worker-protocol.md:11 (added 86edcc3, 2026-09-27) places each worker at `<lane>/<worktree_root>/<slug>-u<N>`, "inside pi's parent root so no confirm dialog appears". So `owner-defect-stop` followed the protocol and `create-peer-panes` (repo level) did not.
- (A) The repo-level worker is what raised the tamdoma-subagents outside-root confirm reported in #36.
- (A) pi-extensions leaf `same-repo-worktree-cwd` (running) admits any same-repo worktree without a dialog. Once merged, the protocol's stated reason for nesting is gone. A move to repo level depends on that leaf merging.
- (A) Both worker worktrees were already removed by 2026-09-28 (`git worktree list` shows only the two leaf worktrees).
