# Slot C review — wake-cost wait carry redesign (`dfef3d2e` / `d5a2b917`)

Four concrete breaks in the proposal as stated:

## Break 1 — Conflating absent `state.wait` with "never visited" (`visit_start`) breaks `refill`, paused/stopped leaves, and already-visited leaves without wait/prompt rows

- `d5a2b917:src/next.ts:715-733, 914-923`, `src/phase.ts:287-292`, `src/timing-report.ts:53-76`, `dfef3d2e:src/next.ts:705-712`.
- `refill` (`src/next.ts:915-921`) scans every open leaf in every unpaused repo, including brand-new unstarted leaves never passed to `dispatchLeaf` and stopped leaves (`:716-720`).
  - Writing `visit_start` on "no rows" inside `refill` (or `end('none')` at `:715, 717`) starts the visit timing clock (`src/timing-report.ts:53-76`) for leaves never dispatched.
  - Setting `wait: none` without writing `visit_start` makes `dispatchLeaf`'s first-visit check (`:724`) see `state.wait !== undefined` and skip `visit_start` forever.
  - Leaving `state.wait` absent breaks Item 3: every unstarted open leaf in `issues/open/` forces a `timings.jsonl` read on every wake.
- Checking only `wait`/`prompt` rows also writes a duplicate `visit_start` (creating a duplicate visit in `src/timing-report.ts:55-76`) for any leaf that already has a `visit_start` row (e.g., `dfef3d2e:src/next.ts:705-712` followed by a `checkBase`/session error before any wait/prompt, or `src/phase.ts:287-292`) and no `wait`/`prompt` row.
- **Fix:** Separate visit tracking from wait import (e.g., optional `visited?: true` on `stateSchema` accepted by Release 1 and written by Release 2 only inside `dispatchLeaf` at `:724` after checking `event.kind === 'visit_start'`). `refill`/`recordWait`/`resumeRepos` import only `state.wait` (setting `wait: { reason: 'none', since }` when no `wait`/`prompt` row exists) without writing `visit_start`.

## Break 2 — Two Release 2 `state.wait` sites are missing from Item 1 (`resumeRepos:882` and `promptEndsWait:681`)

- `d5a2b917:src/next.ts:679-683, 873-889, 1304-1325`, `src/seat.ts:250-320`.
- `resumeRepos` checks `leaf.state.wait?.reason !== 'capacity'` at `:882` **before** `refill` (`:889`). After an upgrade or rollback, a seated capacity waiter (a restarted stopped leaf with `tab`/`worktree` set and absent `state.wait`) passes `undefined !== 'capacity'`, is dispatched in `sweep` (`:873-887`), and takes the free slot ahead of an older capacity waiter waiting for `refill`.
- `seatCommand` (`:1304-1325`) calls `startSeat` (`src/seat.ts:250-320`, which appends no `prompt` row) and then `promptEndsWait` (`:679-683`), which gates on `state.wait !== undefined && state.wait.reason !== 'none'`. On an upgraded capacity waiter with absent `state.wait`, `promptEndsWait` does nothing; `state.wait` stays absent and the next wake imports the stale `capacity` row from `timings.jsonl`.
- **Fix:** Import absent `state.wait` before the `:882` filter (skipping the leaf on failed read), and have `promptEndsWait` (`:681`) set `wait: { reason: 'none', since }` whenever `state.wait?.reason !== 'none'` (safe once Break 1 decouples `visit_start`).

## Break 3 — Release 1 deleting `state.wait` only on wait-row appends leaves stale `state.wait` after `prompt`/`seat`/`park` and reintroduces F2 in `mergeTurn`

- `dfef3d2e:src/next.ts:478-490, 1031, 1274-1282`, `dfef3d2e:src/timing.ts:121-125, 141-144`, `dfef3d2e:src/park.ts:98`, `d5a2b917:src/next.ts:671-672, 882, 918, 1067-1072`.
- When a leaf queued on `capacity` in Release 2 (`state.wait = { reason: 'capacity', since }`) rolls back to Release 1 and gets dispatched into a free slot, `dispatchSlot` appends `kind: 'prompt'` (`dfef3d2e:src/next.ts:480-488`), then `end('none')` calls `recordWait(repo, slug, 'none')` (`dfef3d2e:src/timing.ts:141-144`). Because `waitReasonAt` (`:121-125`) reads the `prompt` row as `'none'`, `recordWait` returns early **without appending a wait row**, leaving stale `state.wait = capacity` on disk. Likewise `seatCommand` (`dfef3d2e:src/next.ts:1274-1282`) appends no wait row, and `dfef3d2e:src/park.ts:98` calls `appendTiming` directly bypassing `recordWait`. On re-upgrade to Release 2, `state.wait` is non-absent, so Release 2 never re-imports it (skipping it in `resumeRepos:882`, queuing it in `refill:918`, and appending a spurious `wait: none` at `:671-672`).
- Mutating `state.yaml` to delete `state.wait` inside `recordWait` when called from `dfef3d2e:src/next.ts:1031` (`mergeTurn`) runs **outside `globalHome()/.lock`**, racing with `land`'s state saves under `.lock` (reintroducing F2 on Release 1; compare Release 2 at `d5a2b917:src/next.ts:1067-1072`).
- **Fix:** In Release 1, clear `state.wait` in `recordWait`, `src/park.ts:98`, `dispatchSlot` (`dfef3d2e:src/next.ts:480-488`), and `seatCommand` (`:1274-1282`), and wrap `mergeTurn:1031` in `withLock(resolve(globalHome(), '.lock'), ...)` with a fresh `readState`.

## Break 4 — `readTimings` swallows read/parse errors as `[]`, reopening F7

- `d5a2b917:src/timing.ts:96-106`.
- `readTimings` catches I/O and schema-parse errors at `:102-105` and returns `[]`, identical to a missing or empty `timings.jsonl`. Using it for per-leaf import treats a corrupted/unreadable file as "no rows", writing `wait: none` (and `visit_start`) instead of writing nothing and skipping the leaf for retry.
- **Fix:** Add a fallible reader for import (returning `null` or throwing on read/parse error, returning `[]` only when `timings.jsonl` is absent or empty) and have every import site (`resumeRepos`, `refill`, `dispatchLeaf`, `recordWait`) write nothing and skip on failure.
