# Simplify B: wake-cost

Read at base 814a2387, release 1 3ff3f5b5, release 2 7faab20b. (H) marks what I measured on this host on 2026-11-23. Nothing changed.

## Short answer

- Pick S3: keep `timings.jsonl` as the only truth and make the wake's read cheap. No state field, no import, one release. Nothing is carried, so there is no seam in either direction.
- Cost (H): one plain parse of all 12 repos' files takes 55.5 ms per pass. Today's 22 reads cost 2.4 s. Almost all of that 2.4 s is the strict schema check on rows the wake never uses, repeated per dispatch.
- My design picked the state field over "read once" on a 212 ms figure. The same design file says the parse is 39 ms without the schema check. That pick made the seam.
- S3 does not meet the destination as written ("reads no timings.jsonl"). It needs restating as a cost (Q1).

## Facts (H)

- Row kinds the wake uses (`wait`, `prompt`, `visit_start`): 17,493 of 102,732 rows in the framework, 2,288 of 20,420 in akrogon.
- Plain `JSON.parse` of every line, best of three: framework 40.9 ms (30.4 MB), akrogon 7.5 ms, lingua-relay 6.0 ms, the other nine under 1 ms together.
- Growth: the framework file took 42 days to reach 30.4 MB, about 0.72 MB a day. That adds about 1 ms per pass per day.
- The capacity queue is two days old (8ef5c061, 11-22). There is 1 capacity wait row in all 12 repos, of 4,082 wait rows. 0 leaves are open on the host right now.
- 24 release folders were installed in two days (9 on 11-22, 15 on 11-23).
- Findings per D round: 3, 3, 4, 5.

## Options

- S1. Patch F9 to F13.
  - Two truths in two releases stay. The count per round is rising, so I see no sign it converges.
- S2. `state.wait` only, no import, a default for a missing value.
  - The hole is the default. A wake never starts an unstarted leaf unless it is a capacity waiter (`src/next.ts:846-848`, `:864-877`). A missing `wait` cannot tell "never asked to start" from "asked under the other release".
  - Default "not waiting": a leaf queued for capacity under the other release is stranded with no message. F1 and F5 return unless every switch happens with an empty queue. lane-first's backpressure will make capacity waits common in the framework.
  - Default "waiting": every new leaf has no `wait`, so the wake starts it before the door asks. That is a lasting change, and a race with leaf creation.
  - Two releases stay, because the state schema is strict. The whole-state write for a wait stays (F2, my B3 and B4).
  - F6, F8 and F12 become accepted reorders. F7, F10, F11 and F13 go. F9 becomes one extra `visit_start` for a leaf first started under release 1.
  - Size: release 2 less the import, about 60 lines in `src` plus tests.
- S3 (pick). `timings.jsonl` only, read cheaply.
  - W1. A wake reader in `src/timing.ts`: parse every line as JSON, keep the three kinds, check the schema on those only. A line that fails is skipped with a warning.
  - W2. One read per file per process: remember the byte offset and the kept rows. A later call reads only the bytes added since, up to the last newline. The process's own appends arrive the same way. A file shorter than the offset is read again from the start.
  - W3. Three call sites change: `src/next.ts:703`, `:840`, `src/timing.ts:142`. The reports keep `readTimings` (`src/status.ts:116`, `src/timing-report.ts:234, :331`).
  - Size: about 25 lines added. Release 2's change goes (117 added and 60 removed in `src`, 202 test lines). Release 1 keeps picks 3 and 4 and the F3 and F4 fixes, and loses the schema key and the wait deletes.
  - F1, F2 and F5 to F13 cannot happen: no state write, no import, no release pair. Upgrade and rollback change nothing that is stored.
  - It also fixes the fault on main where one bad row empties the queue for every leaf and repeats `visit_start` (`src/timing.ts:96-105`). A row kind that an older release does not know is ignored after a rollback.

## What S3 breaks or invites

- R1. The cost grows with the file: about 0.4 s per pass in a year at today's rate. The reports already parse the whole file. A trim or rotation serves both and is a separate chart when the figure says so.
- R2. The destination wording is not met (Q1).
- R3. A malformed wait row of one leaf still hides that leaf's wait until the row is repaired. Main today hides every leaf's.
- R4. The cache is module-level state for one process. A file edited in place to the same length during one wake is not seen. A wake lasts seconds.
- R5. I estimate the schema check on the kept rows at about 30 ms for the framework (from 212 ms against 39 ms for all rows). I did not measure it alone.

## Is wait order across a rollback worth anything

- No. Order decides which waiter gets a freed slot first. Every waiter starts as slots free, and a land is not affected.
- What is worth something is that no waiter is stranded. S3 gives that with no code. S2 gives it only by a rule about when to switch releases.

## Forks

- Q1. Destination. O1: restate as "the wake's timings read costs under 0.1 s per pass" with the figure tracked (pick). O2: keep "reads no timings.jsonl" and take S2 with the rule "switch releases only with an empty capacity queue".
- Q2. The kept-rows cache. O1: per process, as W2 (pick). O2: no cache, one read per call, about 0.4 s per wake in the framework at ten dispatches.
