# waiting-seats merged notes

Sources: slots/waiting-seats-A.md, -B.md, -C.md (2026-11-21).

## Measured

- Seated leaves reached 12 or more for 11.8 h (6% of the window); for 10.9 h of those, 9 to 13 seated leaves were in `merge`; leaves outside `merge` never passed 10 (B). Live: 6 framework merge leaves and 2 akrogon leaves held 8 of 12 seats; earlier 10 framework merge leaves left 2 seats for 11 repos (C).
- A waiting merge leaf holds about 0.47 to 0.58 GB of process memory (B); 539 MiB anon per leaf, 65% of slice memory is reclaimable file cache (C). Working leaves 0.5 to 3.0 GB, a leaf running the merge suite about 21 GB (B). Slice current about 35 GB, peak 47.7 GB, MemoryHigh 64 GB, MemoryMax 96 GB, no swap, memory.events high 0 (A,B,C).
- Wait in merge median 48.9 min, p90 185; six live waiters 2 h 41 m to 11 h 36 m (B). The 2026-10-05 reason "wait is at most one run" no longer holds (B).
- Warm-seat cache: a B wake after 3 h idle misses the cache 95% of the time, 153k uncached tokens median (B).
- After entering merge, B is needed again by 86.6% of leaves (repair, review or broadcast), A by 19.4% to 23% (`check.fix`) (B,C).

## Q1

- Pick (A,B,C): every leaf in phase `merge` stops counting, in both branches of `activeCount` (`src/next.ts`), by excluding `merge` from the `unfinished` test that both branches and `seated` use. `check.repair` counts. `unknown` and `unreadable` terms unchanged (A).
- Rejected (A,B,C): excluding only waiters and counting the holder (the holder has no seat; it needs `mergeQueue` per repo inside a host-wide count). Rejected (B,C): live branch only (a refused session would still count merge leaves).
- Accepted cost (A,B): a red exit back to `check.repair` keeps live seats and skips the cap check in `allocate`, so the count can pass 12 by about one leaf per line turn for a short stay.
- Pitfalls: no backpressure on merge, so queue depth, branch age and conflicts may grow (A,B,C); 12 working leaves plus the suite could reach about 24 to 48 GB plus 21 GB, near MemoryHigh, with no swap (B); the 1a number can look worse when leaves that waited for a seat now wait in merge (B). Removal: measure after the change; a reopen trigger (B,C).
- Consumers: `src/next.ts` `activeCount` (through `allocate`, `dispatchLeaf`, `broadcastPass`, `seatCommand` error text); `src/config.ts` `max_active` text and init-akrogon text (B); docs config reference (A).

## Q2

- Pick (A,B,C): keep both seats alive; no close path.
- Reasons: memory is small (A,B,C); warm B keeps repair and broadcast cheap (A,B,C); closing adds code and failure modes: false `seat_lost` strikes when `state.seat` stays set, the returning leaf meets the cap check, and with both seats closed and `state.tab` set `sliceKeepReason` returns null and `reconcileRepos` can stop the leaf slice and kill `akrogon-land-<attempt>` (C, `src/reconcile.ts` `sliceKeepReason`).
- Rejected (A,B,C): close both; close A only. Rejected (B): close seats idle past an age, though past 3 h a warm B costs more than a fresh one; revisit if waiters pass 20 or memory.events high moves.
- Pitfall (A,B,C): unbounded waiters; about 29 to 40 waiters reach MemoryHigh. Reopen trigger: waiters above 20 to 30 or slice anon above 40 GB (B,C).

## Q3

- Pick (A,B,C): add `capacity` to `waitReasonSchema` (`src/timing.ts`), write it where `allocate` returns null in `dispatchLeaf` (today `end('none')`), and add it to the report's wait kinds (`src/timing-report.ts` `waitOrder`) (B,C).
- Reason: `none` has seven writers, so cap waits cannot be split after the fact (B); `recordWait` dedups and a prompt closes the wait (B,C).
- Before figure: take B's M1 rebuild as the baseline and land Q3 with Q1, not ahead of it (B,C).
- Pitfall: an older binary cannot parse the new value after a rollback (B,C).
- `broadcastPass` capacity null writes no row (A,B); leave it (A); B asks whether it should.

## Not asked

- Is 12 still the right number once it means working leaves only? Does the waiting queue need a bound? (A,B,C; A and C would add none now.)
- A `check.repair` leaf that lost its B seat while the cap is full: wait under the cap, or be exempt as a started leaf? (C recommends wait.)
- Show capacity waits in `akrogon status`? (C: not now.)
