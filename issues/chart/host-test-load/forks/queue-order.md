# Queue order

## Question
Q1. How do waiting runs queue: arrival order, or merge verification first; and is the wait bounded and visible in akrogon status?

### Carries
- Permit-release Taken: one flock(2) in the run process via bun:ffi. B and C flagged blocking vs non-blocking acquire, cancellation and fairness as this fork's.
- Measurement: one turn about 4 min (239 s core suite), six leaves put the last about 20 min out.
- Depends on limit-boundary.
- C merged notes.

## Findings
Round 2026-10-13, notes slots/queue-order-{A,B,C}.md, merge slots/queue-order-merged.md, rebuttals slots/queue-order-rebuttal-{B,C}.md.
- No merge priority in this chart (A,B,C, C withdrew). Merge-phase waits are visible in timing once the permit ships, and priority can be bought later on measured wait.
- No akrogon wait bound, no order promise inside flock (A,B,C). A cancelled-before-launch request is never reported as a test result.
- Non-blocking LOCK_NB poll with a short sleep, only EWOULDBLOCK retried. Waiter prints a stderr line naming the holder. Admission is outside the global .lock and base-run record locks.
- Status: holder line from the verified sidecar (A,C). B wants every waiter listed per leaf with elapsed wait.
- Timing: one optional wait field on check_start (A,C). B wants a request/end pair that also records cancelled waits.
- pi wait-abort leaves the child running (manager.test.ts:1663-1666), so a seat abort does not end a waiter. Leaf stop does (B).
- Fog: seat tool timeouts abandoning vs killing a waiting run, skill text telling seats to run checks without a short tool timeout.

## Taken
1a, operator 2026-10-13. Reason: least code.
- Order is whatever flock grants, no merge priority, no starvation promise. LOCK_NB poll with a short sleep, only EWOULDBLOCK retried, outside the global .lock and base-run record locks.
- No akrogon wait bound. A cancelled-before-launch request is never reported as a test result.
- Waiter prints a stderr line naming the holder. `akrogon status` prints the live holder from the verified sidecar only.
- Queue time is one optional wait field on check_start.
- Foreclosed in this chart: merge-first (later, on measured merge waits), waiter registry, request/end timing pair, wait timeout.
