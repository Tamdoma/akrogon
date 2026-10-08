# Chart: next-named-targets

## Destination
`akrogon next <name>` accepts an epic, issue (top-level or nested) or leaf name from anywhere in the repo, refuses ambiguous names with the matches listed, and reports each operator-selected leaf blocked by an unmerged dependency with its blockers and their phase, exiting non-zero while ready leaves still start.

Route: lifecycle (debate no)

## Forks taken
- [Names](forks/names.md): open owners only, existing folder keeps path meaning, every collision refuses with paths, owners come from leaf folders
- [Blocked report](forks/blocked-report.md): every typed selection reports failed, dependency and input blocks per picked leaf, exit 1, automatic passes quiet
- [Leaf split](forks/leaf-split.md): two parallel leaves, named-targets and blocked-report, fit proven by Selection equivalence and input-independent subjects

## Open forks

## Fog

## Off route
Handed off 2026-10-08
