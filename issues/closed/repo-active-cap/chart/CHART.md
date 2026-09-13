# Chart: repo-active-cap

## Destination
A registered repo with `max_active: N` in its `issues/config.yaml` never has more than N non-merged leaves with live tabs, while the machine-wide `max_active` still bounds the total. A repo without the key behaves as today.

## Forks taken
- [What happens when repo caps add up to more than the global cap?](forks/cap-sum.md): silent, global is the ceiling
- [How does an unreadable repo inventory count against its own cap?](forks/unreadable-repo.md): same rule as the machine count

## Forks open

## Fog
Nothing. The key, its schema, the allocate check and the guide pages to touch are listed in the intake findings.

## Off route
- Replacing the global cap with per-repo caps. The operator kept the global as ceiling.
- Weighted or round-robin sweep ordering across repos. Registration order stays.
- A default value for the repo key. Absent means no repo limit.

Handed off 2026-09-11
