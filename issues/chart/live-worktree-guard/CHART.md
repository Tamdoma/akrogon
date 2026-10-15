# Chart: live-worktree-guard

## Destination
Store cleanup never deletes a worktree that holds live work, such as a chart's direct attempt, while finished akrogon worktrees still go away. Registered repo: akrogon. Source: Tamdoma/akrogon#94.

Route: lifecycle (debate no)

Handoff review 2026-10-15, operator `s1a | s2a | r1a`: one issue `live-worktree-guard` with leaf worktree-keep-rule, sources Tamdoma/akrogon#94. Leaf drafts reviewed by B and C; A's two record corrections in removal-rule Taken; store-sweep (#93) brief and design corrected to match.

## Forks taken
- [Removal rule](forks/removal-rule.md): delete only finished akrogon kinds, keep and list the rest; direct route locks its checkout at creation; each pass records what it removed.

## Open forks
none

## Fog
none. G1 cross-repo, G2 idle versus abandoned and G3 other creators are settled by Taken 1 (kept and listed). G4 process veto stays with #93.

## Off route
- Moving direct worktrees out of the store: growth-stop adoption needs `<store>/<slug>`.

Handed off 2026-10-16
