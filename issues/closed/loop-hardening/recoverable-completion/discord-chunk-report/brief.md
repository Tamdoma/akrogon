# Brief: discord-chunk-report

## What
When a Discord chunk fails its retry, that target stops as today, and the raised error for that target reports delivered, failed and unattempted chunk counts.

## Why
A truncated message today surfaces only the failing chunk; the operator cannot tell how much landed (#13).

## Done-criteria
1. `bun test skills/broadcast-issue/scripts/discord-send.test.ts` passes with new cases: a three-chunk message whose second chunk fails twice raises with `delivered: 1, failed: 1, unattempted: 1` for that target, the third chunk is never requested, and a second target still receives all chunks.
2. Existing behaviour for full success and single-chunk failure is unchanged.
3. `bun run format`, `bun run typecheck`, `bun test` pass.
