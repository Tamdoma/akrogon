# Chart: handoff proves what execution needs before any leaf exists

## Destination
No leaf state is written until the configured git base is usable and every external write a leaf performs has operation-level proof recorded in the chart. `akrogon next` refuses with remediation when the configured base is missing at dispatch. A fresh repo or an unproven scope never reaches a seat.

## Forks taken
None yet.

## Fog
None.

## Off route
- Consumer probe repair (boulevard probe-ghl-scopes.ts logs failures without throwing, proves no events write, deletes a hardcoded field). Boulevard owns it.
- Teaching akrogon service-specific APIs. The skill specifies evidence; the consumer owns probes.
- Automatic bootstrap of an empty remote unless chosen in `forks/git-base.md`.

## Territory findings
See `slots/map-merged.md` and the fork files.
