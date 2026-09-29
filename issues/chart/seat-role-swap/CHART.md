# Chart: seat-role-swap

## Destination
In every new leaf tab the seat doing synthesis, implementation and repair sits in the left pane.

## Forks taken
- [What moves](forks/what-moves.md): letter swap, A becomes the worker on the left, B re-reviews and merges; slots.a/b values swap so each model keeps its job
- [Cutover](forks/cutover.md): go live immediately; operator keeps every other leaf idle; no conversion code
- [Config swap owner](forks/config-swap-owner.md): door pushed the operator's config edit (3704d86); the leaf swaps slots.a/b values with the code; local main updates after the swap leaf's merger finishes

## Open forks

## Fog

## Off route
- chart-issues door A/B/C peers. The door's A is already the left pane.
- Creating the second pane only when first needed. Both panes stay allocated up front ("everything else is the same").
- Rewriting historical letters in learnings, issues/closed and issues/log.jsonl.
- Keeping the worker left after a lost pane is recreated. Recovery splits right today for either seat and stays as is.

Handed off 2026-09-29
