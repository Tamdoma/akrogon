# waiting-seats: slot A blind note

2026-11-21. Code at akrogon working tree (eb4d64e9 + uncommitted issue files). Host: 123 GiB RAM, 67 GiB available; akrogon.slice MemoryCurrent 35.5 GiB, MemoryHigh 64 GiB, MemoryMax 96 GiB (`systemctl --user show akrogon.slice`, read 2026-11-21). `~/.akrogon/config.yaml` max_active 12.

## Q1 predicate

- Pick: `activeCount` (`src/next.ts`) drops leaves whose phase is `merge` in both branches: the live-terminal branch and the refused-session branch (`unfinished` gains `phase !== 'merge'` for counting only). Leaves in `check.repair` count as today. Reason: a leaf in `merge` has no prompted seat under red-exit Taken 1, and the land run is a command, not a seat. Cost: one predicate; the `unknown` and `unreadable` terms stay as they are, since they are the safe ceiling when state cannot be read.
- Rejected: counting only the line holder out (the holder is the one leaf whose seats matter least; every waiter is idle too); a separate merge cap (new config the operator did not ask for).
- Evidence: code tier, `activeCount` and `allocate` read 2026-11-21; `allocate` is the only consumer (map-merged, A,B,C).
- Pitfalls: (1) a leaf with a live seat bypasses the cap in `allocate` (`live` check), so a red exit returning to `check.repair` with its seats alive starts work without a cap check and the count can pass 12; bound is the number of leaves in `check.repair` from merge at once, one per line turn. Removed by nothing; accepted, because refusing it would park a red leaf behind new leaves (lock 1a). (2) 6a removes the only backpressure on merge: more leaves finish implement and wait, so queue depth and rebase conflicts grow (map-merged pitfall, B,C). Lock 6a accepts it; measured by Q3 and the attempts ledger.
- Consumers: `src/next.ts` `activeCount`; `docs/reference/config.md` `max_active` text; `akrogon status` if it prints the active count.

## Q2 idle seats

- Pick: keep both seats alive, as today. Reason: nothing to build; a red exit goes to `check.repair` where B judges from the kept log and diff, and B's warm review context is what makes that cheap (token lock); a cold start re-reads brief, design, plan and diff. Memory: 0.65 GiB per waiting leaf (B, map), so 9 waiting leaves cost about 6 GiB, inside MemoryHigh with 28 GiB to spare.
- Rejected: close both at merge entry (frees about 0.65 GiB a leaf, but every red exit, 45% of first runs, pays a cold B start and re-read, which grows tokens); close A only (A is needed only on `check.fix`, about 1 in 5 exits; saves about half, but a cold A on `check.fix` re-reads the whole leaf, and the split adds a seat-close step that today does not exist).
- Evidence: map-merged line 20 (B 0.65 GB per leaf, C 6.3 GiB for 5 leaves); slice limits above.
- Pitfall: if queue depth grows under 6a past about 40 waiting leaves, idle seats alone reach MemoryHigh. Removed by: Q3's record plus `akrogon status` showing depth; no code now.
- Consumers: none.

## Q3 capacity wait reason

- Pick: add `capacity` to `waitReasonSchema` (`src/timing.ts`) and have dispatch end with it when `allocate` returns null (`src/next.ts`, today `end('none')`). Reason: the cap's effect is unmeasured today, so the gain of 6a cannot be shown; one enum value, older rows still parse. Cost: one value, one call site.
- Rejected: a separate counter or log file (duplicates the timing ledger); nothing (6a's effect stays unprovable).
- Evidence: code tier, `waitReasonSchema` holds `prerequisite`, `parked`, `merge_turn`, `none`; the cap refusal records `none` (`src/next.ts` dispatch, `allocate` null branch), read 2026-11-21.
- Pitfall: the broadcast path's `allocate` null return (`src/next.ts` broadcast loop) records nothing; it serves merged leaves only, so it never waits on 6a. Leave it.
- Consumers: `src/timing.ts` `waitReasonSchema`; `src/next.ts` dispatch; any timing report that lists reasons.

## Question the fork does not ask

- Should uncounted merge leaves have any bound at all (for example count them past a depth)? 6a says they stop counting; a bound would bring back the backpressure the operator removed. I would not add one now; Q3's record shows whether it is needed.
