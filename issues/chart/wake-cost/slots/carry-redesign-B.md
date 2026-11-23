# Carry redesign check B: wake-cost

Read at worktree release 1 dfef3d2e and release 2 d5a2b917. The per-leaf import fixes F5, F6 and F7 as described. Four breaks in the proposal as written. (H) marks what I measured on 2026-11-23.

## Breaks

- B1. A never-visited leaf stays "unknown" for ever, and the refill looks at every open leaf on every wake.
  - `refill` reads `wait` of all open leaves of all unpaused repos (release 2 `src/next.ts:914-919`). The filter before it does too (`:882`). Neither is in the proposal's list of places.
  - A leaf with no rows has two outcomes under point 1. Either the refill import writes `visit_start` for a leaf nobody started, so its first visit begins at the upgrade wake and the report counts the idle time as work. Or the import writes nothing there, and each such leaf costs one full read on every wake (212 ms in the framework (H)). Then point 3 is false and the chart destination (no timings read in a wake) is not met.
  - The leaves hit are those created and not yet dispatched. A leaf stopped or paused before its first visit is hit too: it reaches `recordWait` through `end('none')` before the first-visit check (`src/next.ts:715-717`, `:724`). Today 0 of the framework's 4 open leaves have no rows (H).
  - `:882` also needs the import first. A seated waiter from before the upgrade has no `wait`, passes that filter, and is dispatched ahead of the queue.
  - Fix: a third value, "known, not yet visited". Make `since` optional in release 1's schema (`src/state.ts:157`). The import writes `{ reason: none }` with no `since` for a leaf with no rows. The first-visit check becomes "`since` absent". Run the import for every open leaf without `wait` where `carryWaits` runs now (`src/next.ts:859`), one read per repo, and per leaf in `recordWait` for typed commands.
- B2. One bad row stops every new leaf of the repo.
  - Each new leaf imports at its first visit. `readTimings` parses every row with a strict schema and fails on one bad row (`src/timing.ts:101-104`). With "a failed read skips the leaf", no new leaf of that repo is ever dispatched until someone repairs the file. Today a bad row costs only the queue order. A rollback makes this likely: rows of a kind an older release does not know fail its parse.
  - `readTimings` also cannot report a failure. It returns an empty list (`:104`), the same as "no rows".
  - Fix: the import reads the file as text, keeps the lines that name the leaf's slug, and parses only those. Only an I/O error counts as failed. This costs 19 ms where the full read costs 212 ms (H).
- B3. Release 1's delete is a new state write at two unsafe places.
  - Release 1 `src/next.ts:1031` records the holder's wait with no lock held. The land saves the holder under the global lock. The delete must read the state again and save it under that lock, as release 2 does at `src/next.ts:1066-1072`.
  - Release 1 `src/next.ts:729-730` completes the owner, then records the wait. If the owner moves to closed there, a delete written to the old leaf path recreates the folder in open (`src/shell.ts:148`). Record first, as release 2 does at `:751-752`.
- B4. Release 1 must delete the key on a prompt row too (`src/next.ts:481` at dfef3d2e), not only on a wait row.
  - A prompt ends a wait with no wait row. A capacity waiter from release 2 that release 1 starts keeps `wait: capacity` in its state. Back on release 2 it is taken for a waiter with its old time. It clears after one dispatch if its seats are live. If they are not and the cap is full, it holds the front of the queue.
