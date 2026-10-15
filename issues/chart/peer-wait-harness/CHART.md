# Chart: peer-wait-harness

## Destination
peer-wait no longer reports failure for a non-Claude peer whose turn is still open, and still catches a peer that ended without writing. Registered repo: akrogon.

Route: lifecycle (debate no). Leaf: [peer-wait-signal](../../open/peer-wait-harness/peer-wait-signal/brief.md). Leaf review: C no disagreements, B F1 (identity carried across every budget rerun) applied to criterion 7.

## Forks taken
- [Turn end signal](forks/turn-end-signal.md): `failure` only on a proven end signal (claude transcript, pi hook authority, codex rollout turn); unproven kinds keep waiting, and an unproven idle `budget` goes to the operator before a rerun.

## Open forks
none

## Fog
none

## Off route
- An agy turn reader and an upstream herdr agy fix: agy is not a configured harness; an agy peer is handled as an unproven kind (A,B,C).

## Pending steps
none

Handed off 2026-10-16
