# Chart: akrogon

## Destination
Idle and leftover leaf processes and files are removed by the system, not capped. Registered repo: akrogon.

## Delivered elsewhere (checked 2026-10-16, A on operator autopilot delegation)
- I1 status shows only the cwd repo: `akrogon status` run outside a repo lists every registered repo (checked live 2026-10-16).
- I2 no signal for leaked processes, and I3 leftovers outlive the work: removed at the source by worktree-cleanup (#93): finished-leaf slices stopped, process and pane vetoes before any delete (3a3464a, ef0535c, 7778889, a67cd4e); kept items shown in `akrogon leftovers`. Per the operator's 2026-10-13 note, the fix is killing idle processes, not a cap or alarm.
- C1 leaf temp on tmpfs kept until merged or failed: temp moved to disk (c698170); release for every phase is leaf temp-release/release-any-phase.
- C3 hardcoded 48 GiB memory check: dropped (81196b3).
- Dispatch emptying leaf temp without checking `run-*` roots (src/next.ts:466 then): new-tab wiping removed in c698170.
- C2 framework `/tmp/swi`, `/tmp/page-measure-*`: framework repo, charted as framework-temp-owners.

## Open forks
none

Closed 2026-10-16
