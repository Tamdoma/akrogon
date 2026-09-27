# Chart: parallel implement units

## Destination
Akrogon's implement seat runs up to three independent units at the same time, each in its own worktree, and the leaf reaches review with the same checks as today.

## Forks taken
- [Wave shape](forks/wave-shape.md): up to 3 chunks at once, recorded in brief section 4, checkpoint commit then cherry-pick, worktrees at `<lane>/issues/worktrees/<slug>-u<N>`

## Open forks

## Fog

## Off route
- Seat effort changes: the operator keeps max (2026-09-27).
- Anything outside #31, by operator lock.
- The pi-extensions concurrency change: its own intake, Tamdoma/pi-extensions#4. The akrogon leaf can merge first. Waves run one at a time until #4 lands.
- A configurable cap (fixed 3, operator 2026-09-27) or a port of `packet-parallel-policy.ts`: a fixed cap and B's judgment are simpler (A, B, C).
- Parallel workers in one shared worktree: changed-test runs and git state race (A, B, C).

Handed off 2026-09-27
