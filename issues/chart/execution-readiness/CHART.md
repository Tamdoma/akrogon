# Chart: handoff proves what execution needs before any leaf exists

## Destination
No leaf state is written until the configured git base is usable and every external write a leaf performs has operation-level proof recorded in the chart. `akrogon next` refuses with remediation when the configured base is missing at dispatch. A fresh repo or an unproven scope never reaches a seat.

## Forks taken
- [Missing configured git base](forks/git-base.md): refuse with case-specific remediation; one rule in a new read-only `akrogon preflight`, run before handoff writes and at dispatch before `ensureWorktree`; local tracking ref on every dispatch, remote branch also at handoff and new-worktree creation.

## Open forks
- [Proof of external writes](forks/write-proof.md): what counts as proof and who runs it

## Fog
None.

## Off route
- Consumer probe repair (boulevard probe-ghl-scopes.ts logs failures without throwing, proves no events write, deletes a hardcoded field). Boulevard owns it.
- Teaching akrogon service-specific APIs. The skill specifies evidence; the consumer owns probes.
- Automatic bootstrap of an empty remote unless chosen in `forks/git-base.md`.

## Territory findings
See `slots/map-merged.md` and the fork files.
