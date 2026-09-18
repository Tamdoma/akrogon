# Intake: stall-notifier-removal

## Scope
One issue, one leaf, registered repo `akrogon`: remove the elapsed-time stall notifier from `src/next.ts` and its state field.

## Provenance
- Operator: 2026-09-18, round 2 Q3, during the Tamdoma/akrogon#16 charting session.

## Source: operator 2026-09-18
Round 2 Q3 answer `3-A`: delete `STALL_MS`, the notification and `busy_notified`; keep `busy_since`.

Raised by the chart agent, not reported. The finding is that the notifier structurally cannot fire during the silence it targets, which is why the Tamdoma/akrogon#16 stall produced no alert and was read as a monitoring failure rather than a scheduler bug.

## Agent findings
- Confirmed at `src/next.ts:172, 191-203` against the trigger surface at `plugin/herdr-plugin.toml:7-27` and the early return at `src/next.ts:602`.
- This carries no GitHub identity. Tamdoma/akrogon#16 is owned by pi-extensions, so this leaf's `sources` is empty.
