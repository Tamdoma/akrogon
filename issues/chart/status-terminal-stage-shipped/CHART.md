# Chart: status --charts reports closed and held charts as terminal

## Destination
`akrogon status --charts` reads `closed` or `held` for a chart whose CHART.md carries that marker, so `charting` only means open work.

## Forks taken
None. The destination was reached before this chart opened.

## Fog
None.

## Off route
- Any new leaf. Commit 2edea9c already ships the three markers with last-line precedence, verified live against the framework repo on 2026-09-18 (INTAKE.md agent findings).
- Closing Tamdoma/akrogon#15 on GitHub. The shipped leaf does not carry the identity in `sources`, so the command will not close it; the operator closes it by hand citing 2edea9c.
- Inferring a terminal stage from prose in fork files. The marker contract is settled and a missing marker is an operator edit of the owning CHART.md.

Closed 2026-09-18: already shipped, nothing handed off.
