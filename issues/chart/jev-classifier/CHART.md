# Chart: jev-classifier

## Destination
A decision on whether akrogon uses Jev or a similar decision API for cheap typed decisions, made without adding complexity or losing quality or speed. Repo: akrogon.

Route: none (decision only, no leaves)

Opening map: slots/map-merged.md (A, B, C blind maps).

## Forks taken
- [Adopt a classifier](forks/adopt.md): no classifier now (1a); the two plain-code ideas seeded as Tamdoma/akrogon#96 and #97.

## Open forks
None.

## Fog
None.

## Off route
- Jev or any hosted decision API in akrogon (operator 1a, 2026-10-17): fuzzy decisions live inside agent turns that must run anyway; low volume; adds key, network, vendor and duplicated rules. Revisit when a decision moves into akrogon code at real volume or a labelled decision set exists.
- Structured failure class and log-tail loop counts: seeded as Tamdoma/akrogon#96 and #97 for later intake.

## Pending steps
None.

Closed 2026-10-17
