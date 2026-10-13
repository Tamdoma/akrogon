# Merged notes: queue-order (A, B, C)

## Agreed
- No akrogon wait bound. A timed-out acquire reads as a red test to seats and triggers retry plus base-run, more load on the bottleneck (A,B,C). Seat abort and leaf stop end a waiter, the kernel drops its request (B,C).
- No order promise inside flock. man7 flock(2) gives no fairness guarantee (A,B,C).
- Wait is a non-blocking LOCK_NB poll with a short sleep, not one blocking FFI call, so the process can report and stay cancellable. Only EWOULDBLOCK is retried, other errors propagate (B,C). A withdraws blocking.
- The waiter prints a stderr line naming the holder from the holder sidecar (A once, C every 60 s).
- `akrogon status` prints the live permit holder from the verified sidecar. A dead sidecar prints nothing (A,B,C).
- Queue time is recorded apart from run duration, check_start after admission (A,B,C).
- Admission happens outside the global .lock and base-run record locks (B).
- A cancelled-before-launch run is never reported as a test result (B,C).

## Disagreements
1. Merge first. C: merge-class runs (leaf phase merge or base-run with a merge attempt, already resolved in src/run-check.ts:80-130) drop a live record, and a non-merge winner that sees a live merge record releases and retries. Reason: merge verification is the one run the whole repo waits behind (src/next.ts:1041-1075), three runs ahead cost a merge 12+ min. A,B: no classes. Classification across run-check, base-run, workers and nested calls plus yield and livelock handling is more parts. Merge delay not yet measured as a problem.
2. Status depth. B: one record per contender, status lists waiters per leaf with elapsed wait. A,C: holder line only, no waiter registry.
3. Timing shape. A: new check_wait event before blocking. B: request/end event pair keyed by run id, unmatched pair marked incomplete. C: one optional wait field on check_start, no new event.

## New questions
- QR1 Do the seats' own tool timeouts kill a waiting run or just abandon it (B,C)? Skill text should say check commands run without a short tool timeout (C).
- QR2 Accept no starvation freedom (B).
