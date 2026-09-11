# Chart: repo-active-cap

## Destination
A registered repo with `max_active: N` in its `issues/config.yaml` never has more than N non-merged leaves with live tabs, while the machine-wide `max_active` still bounds the total. A repo without the key behaves as today.

## Decisions So Far
- [What happens when repo caps add up to more than the global cap?](decisions/cap-sum.md): silent, global is the ceiling
- [How does an unreadable repo inventory count against its own cap?](decisions/unreadable-repo.md): same rule as the machine count

## Open Decisions

## Not Yet Specified
Nothing. The key, its schema, the allocate check and the guide pages to touch are listed in the intake findings.

## Out Of Scope
- Replacing the global cap with per-repo caps. The operator kept the global as ceiling.
- Weighted or round-robin sweep ordering across repos. Registration order stays.
- A default value for the repo key. Absent means no repo limit.

Handed off 2026-09-11
