# Chart: implement workers use one worktree location

## Destination
Every new delegated leaf worker worktree is created at `<registered root>/<worktree_root>/<slug>-u<N>`, read from an absolute store path printed by `akrogon config`, used unchanged across creation, spawn and cleanup, starting from the leaf's committed HEAD. Standalone workers and retained-work recovery are unchanged.

## Forks taken
- [Worker worktree location](forks/worker-location.md): registered-root store beside the leaf; `akrogon config` prints the absolute store; retained old-path workers finish in place

## Open forks
None.

## Fog
None. The create-peer-panes deviation is recorded in forks/worker-location.md Findings: the transcript shows no reason.

## Off route
- Letting watch-issues answer seat prompts. Foreclosed by stuck-seat-recovery restart-hung-seat Q2-A; #36 closed as a duplicate of #35.

## Territory findings
See `slots/map-merged.md` and `slots/map-rebuttal-B.md`.
Handed off 2026-09-28
