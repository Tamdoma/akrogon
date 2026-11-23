# Slot D review of wake-cost, round 3

**Verdict `fix`**

Base `814a2387`  
Release 1 `e351e3be`  
Release 2 `35dd9143`

## Findings

- **F2 reopened in release 1 · `src/next.ts:669–674, :1334–1338`, `src/state.ts:225–229`.** Release 1's land-triggered dependent dispatch still runs outside the global lock. It now calls `forgetWait`, which reads and saves the leaf's whole state. I gated that read on a dependent carrying release 2 state, saved `attempts.A = 1` while holding the real global lock, and let the delete proceed. It reset the counter to zero. Hold the global lock for this dispatch in release 1 as release 2 already does.
- **F8 · Release 1 `src/next.ts:1293–1300`, release 2 `src/timing.ts:133–141`.** A successful manual seat during rollback clears state without recording that its capacity wait ended. When the seat is lost and release 2 starts again, the old capacity row puts that already-seated leaf back in the queue. I queued two leaves, started the newer one with release 1's `seat`, removed that terminal, and woke on release 2. The older waiter took the free slot and the seated leaf stayed queued. With release 2's `seat` as the control, the seated leaf resumed before refill. Record the successful release 1 seat's wait transition in the timing log before clearing the state copy.
- **F9 · Release 2 `src/park.ts:104–107`, `src/timing.ts:137–141`, `src/next.ts:746–759`.** Park and unpark can suppress the initial visit of a leaf that has never run. I parked and unparked a fresh leaf, then started it through `next`. Release 1 wrote one `visit_start`. Release 2 imported the unpark wait timestamp as evidence of a visit and wrote zero. Decide whether the leaf has visited from visit evidence. A wait timestamp alone can predate dispatch.
- **F10 · Release 2 `src/timing.ts:133–141`.** The slug prefilter skips valid JSONL when there is whitespace between the colon and slug value. I added one space there to a release 1 capacity wait. Release 2 cached `{ reason: none }` and left a free slot unused. Release 1 started the same waiter from the same file. Match JSON whitespace around the slug field before parsing candidate lines.

## Re-check

F5–F7 passed their original replays. A waiter queued during rollback was imported even when it already had release 2 state before rollback. A typed `next` kept the original capacity timestamp and FIFO order. A malformed line naming one leaf skipped that leaf and it refilled after repair. A separate I/O failure probe confirmed known waiters could still run and unknown leaves imported on the next wake after repair.

All 351 release 1 tests and 358 release 2 tests passed across `config`, `state`, `next`, `timing`, `batch-dispatch`, `green-merge` and `merge-attempts`. Both typechecks and `git diff --check` passed. The supplied Verify logs record 1,379 and 1,386 passing tests, respectively. The probes used disposable worktrees and state homes.
