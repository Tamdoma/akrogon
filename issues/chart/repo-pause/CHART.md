# Chart: repo-pause

## Destination
The operator can pause automatic dispatch for one registered repo. While paused, herdr-driven `akrogon next` launches, relaunches and prompts nothing for that repo; explicit operator commands still work and other repos keep dispatching.

Route: lifecycle (debate no)

## Forks taken
- [Boundary](forks/boundary.md): freeze every automatic action for the repo (events, startup --resume, merge wake, dependents, cleanup); manual next <target>, bare next and --all run in full
- [Control](forks/control.md): no-argument `akrogon pause`/`unpause` on the current registered repo, local gitignored state file, unpause runs one repo-scoped resume pass, status annotates paused repos

## Open forks

## Fog

## Off route
- Parking a running leaf: park's refusal of allocated leaves is correct (src/park.ts:22) and the report needs pause, not park.

Handed off 2026-10-08
