# Waiting seats: slot B blind notes

2026-11-21. Code at akrogon `4f5e3fd2`. Evidence is tier `better-than-training` (inspected code, measured ledgers, live cgroup files, harness session records) unless marked `practitioner`. Ledger window 2026-11-14 to 11-21, read 2026-11-21.

## Measured for this fork

- M1. Cap use, rebuilt from `log.jsonl` and prompt rows in `timings.jsonl` of all registered repos (framework 694 leaf-hours, akrogon 20): seated leaves reached 12 or more for 11.8 h, 6% of the window. For 10.9 of those hours, 9 to 13 of the seated leaves were in `merge`. Leaves outside `merge` never passed 10 (median 1, p90 4). The rebuild overcounts a little (it shows 15 at most).
- M2. Live memory, `/sys/fs/cgroup/.../akrogon.slice`, 20:30Z: a waiting merge leaf holds 0.47 to 0.58 GB of process memory in 5 processes (5 leaves). A working leaf holds 0.5 to 3.0 GB, with slice peaks of 4 to 8 GB, and about 21 GB for a leaf that ran the merge suite. `akrogon.slice`: current 34.6 GB (10.1 process, 17.4 file cache), peak 47.7 GB, `MemoryHigh` 64 GB, `MemoryMax` 96 GB, `MemorySwapMax` 0, `memory.events` high 0, max 0, oom 0. Host 123 GB.
- M3. Wake cost after idle, from 208 codex and 306 pi session files for framework worktrees. Slot B (codex, `gpt-6.2-sol`): context 180k tokens median at the last turn, p90 298k, window 475k. Turns below 50% cached: 3% after a 5 to 30 min gap, 12% after 30 to 60 min, 41% after 1 to 3 h, 95% after 3 h, with 153k uncached tokens median on a miss. Slot A (pi, `devin/swe-2-max`): context 66k median, p90 154k. Misses: 17%, 27%, then 100% past 1 h, about 110 to 130k uncached. A new seat starts at 23k (codex) or 5k (pi).
- M4. Wait in merge: median 48.9 min, p90 185. Live now: six leaves waiting 2 h 41 m to 11 h 36 m (`akrogon status`).
- M5. How often a waiting leaf's seat is needed again: B on 112 of 248 attempts today (any red run), about 92 after the main-red cover. A on 46 `check.fix` exits over 198 landed leaves (23%). After landing, only B is prompted, and only for a completed owner's broadcast (`src/next.ts` `broadcastPass`).

## Q1. Which leaves stop counting

- Pick: every leaf in phase `merge`, in both branches. One change: the `unfinished` test in `activeCount` also excludes `merge`. Both branches already use that test (`src/next.ts:372`, `:387`, `:392`).
  - Reason: under red-exit no seat is prompted in `merge`, and the holder's land run has no seat. The holder's load is the suite, which the one-holder line bounds, not the seat cap. M1 shows the cap, when it binds, is spent on waiters.
  - Cost: `max_active` changes meaning to "leaves being worked outside merge". Twelve working leaves at once becomes a routine state in a burst. It was never reached in the window (M1).
  - Consumers that change: `src/next.ts` `activeCount`; through it `allocate` (`:414`), `dispatchLeaf` (`:761`), `broadcastPass` (`:1064`), `seatCommand` (`:1171`, its error text); `src/config.ts:25` and the init-akrogon text describing `max_active`.
  - A leaf leaving `merge` for `check.repair` has live seats, so `allocate` skips the cap check (`:413-414`) and the count can pass 12. That is at most one leaf per line turn, for a short stay (B's read 65 s median, `check.fix` round trip 5.9 min median). I accept it and evict nothing.
- Rejected: exclude only non-holder waiters. The holder has no prompted seat either, and telling it apart needs `mergeQueue` per repo inside a host-wide count, for one slot.
- Rejected: leave `activeCount` alone and let closed seats drop out of the live branch. It ties the cap to Q2. The unreadable branch would still count merge leaves. A returning leaf with no live seat would also meet the cap check and could be refused a seat while 12 others work.
- Evidence: M1, M2. `practitioner`, read 2026-11-21: GitLab merge trains leave the queue unlimited and cap only running pipelines (https://docs.gitlab.com/ci/pipelines/merge_trains/); Zuul bounds the active window, not the queue (https://zuul-ci.org/docs/zuul/latest/gating.html).
- Pitfalls:
  - Memory with 12 working leaves, the suite and waiters: about 24 to 48 GB, plus 21, plus 7. The top of that range passes `MemoryHigh` 64 GB, and the slice has no swap, so the kernel throttles it. The driver is working leaves, not waiters. Removed only by reading `memory.events` high after the change and lowering `max_active` if it moves.
  - The 1a number gets worse without anything being slower. When the line is full, leaves that used to wait for a seat now wait in `merge`, inside the counted span. Removed by reading leaf start to landed next to first entry to landed.
  - Nothing bounds the number of waiting leaves. Each costs 0.55 GB of memory and a worktree (12 GB for 7 on disk). See Q2.
- Not asked: is 12 the right number once it means working leaves only? Does the waiting queue need a bound, as Zuul's window is?

## Q2. Idle seats of a waiting leaf

- Pick: both seats stay alive. No close at merge entry.
  - Reason 1: memory is small. 13 waiters, the most seen, hold about 7 GB, 11% of `MemoryHigh`. The slice has never reached that limit (M2).
  - Reason 2: the hand-off stays fast. A live seat gets its prompt by `send` (`src/next.ts` `dispatchSlot`). A closed seat is a new session with no resume (`src/seat.ts` `startSeat`; pi gets a new session id each start), with up to 60 s of start proof before any reading. B is needed on about 4 in 10 attempts (M5).
  - Reason 3: no new code. Closing needs a close path, cleared seat state, and a cap exemption for the returning leaf.
  - Reason 4: token cost cannot grow, because nothing changes.
  - Cost: 0.55 GB per waiting leaf with no bound on their number. A wake after a long wait pays the whole context uncached (M3). That cost exists today, and red-exit and the cover shorten the waits.
  - Consumers that change: none.
- Rejected: close both at merge entry. Every red exit pays a cold B that has lost its review context. The restart is booked as a lost seat when `state.seat` is still recorded (`src/next.ts:513-545`, `seat_lost`, three losses fail the leaf). A cold leaf also meets the cap check in `allocate`.
- Rejected: close A only. A is needed by 23% of leaves and its cache is gone after 1 h, so the token case is real. It frees about 0.3 GB per waiter, 4 to 5 GB at most, for a new close path.
- Rejected: close seats idle past a set age. M3 supports it: past 3 h a warm B resumes at 153k uncached, more than a new seat likely reads. It needs a timer and a clean close for at most 7 GB today. Revisit if waiters pass 20 or `memory.events` high moves.
- Evidence: M2 to M5. The operator's 2026-10-05 answer kept tabs because "wait is at most one run". That reason no longer holds (M4), but the pick stands on M2.
- Pitfalls:
  - Waiters are unbounded and the slice has no swap, so idle seats cannot be pushed out. About 29 waiters would fill the 16 GB between the 47.7 GB peak and `MemoryHigh`. Not removed by this pick. The age rule above is the fix if it shows.
  - A seat idle for hours can die unnoticed. Already handled: `dispatchSlot` restarts a missing or finished seat, and `commitMove` resets the loss count on each move.
  - A warm B at 298k (p90) of a 475k window can run out during a long repair. Already handled by the same restart path.
- Not asked: A is never prompted in `merge` or after landing. Is its seat kept only for the 23% `check.fix` case on purpose?

## Q3. Wait reason for a capacity refusal

- Pick: yes. Add `capacity` to `waitReasonSchema` and write it where `allocate` returns null in `dispatchLeaf`.
  - Reason: that refusal writes `none` today, and `none` has seven writers in `dispatchLeaf` (paused repo, stopped leaf, merged, failed, missing inputs, capacity, dispatched). In the window, 232 `none` rows fall where my rebuild shows 12 or more seated and 586 where it does not, so the rows cannot be split after the fact. `recordWait` writes only on a change of reason and a prompt closes the wait, so the duration comes for free.
  - Cost: one enum value and one call site. The timing report gains a named kind.
  - Consumers that change: `src/timing.ts` `waitReasonSchema`; `src/next.ts` `dispatchLeaf` (`:761`); `src/timing-report.ts` (named wait kinds, `:25-26`, `:234-235`).
- Rejected: keep `none`. Then 6a's effect cannot be counted.
- Rejected: a live counter in `akrogon status` only. It keeps no history.
- Evidence: `src/next.ts` wait writers and `src/timing.ts` `recordWait`.
- Pitfalls:
  - A true "before" needs this to ship and run before the Q1 change. Holding 6a back for a baseline costs speed. Removed by taking M1 as the before figure and landing both together.
  - An older release reading a row with the new value fails its schema parse after a rollback. Low risk on one host. Removed by not rolling back past this release while such rows exist.
- Not asked: `broadcastPass` also waits on capacity (`src/next.ts:1064`) and writes no row at all. Should it?
