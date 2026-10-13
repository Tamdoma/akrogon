Chart idle-processes (repo akrogon, /home/ivan/Work/infra/akrogon). Intake: issues/chart/idle-processes/INTAKE.md. Write your independent territory map to issues/chart/idle-processes/slots/map-<your slot>.md, max 30 lines, before reading other slots' maps.
Map: material forks (each with 2-3 options and what each could break or invite later), practitioner questions, pitfalls, and the split into leaves. Cite path:line for every akrogon mechanism and an outside source (systemd, herdr, cgroup docs) for outside behavior, or say none was found.
Measured facts to verify, not trust (A, 2026-10-13 ~22:00):
- status.ts:385-388 filters to the cwd repo; outside any registered checkout it lists all repos. No flag.
- Merged leaves' slices are empty now (herdr tab close at reconcile.ts:119 appears to end them); stop.ts:52 is the only systemctl stop.
- 59 processes in open-leaf slices have parent = user systemd: 22 chrome_crashpad + 8 node + 2 bun in framework/coverage-unavailable-guard, 17 sh in akrogon/memory-start-check, others 1-2 each.
- Open leaf concurrent-checks/run-units (issues/open/concurrent-checks/run-units/brief.md) puts each run-check/base-run in its own unit with a guard that stops it when the run's wrapper dies. Map what it already covers and what stays open.
Operator constraint: no caps. Do not edit code or chart files other than your map.
