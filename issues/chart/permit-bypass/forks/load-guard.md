# Load guard

## Question
Q1. With no line, what keeps many concurrent test runs from clogging inside the 16-core, 64G/96G slice (memory brake, OOM kills, browser timeouts that cause reruns), without a queue?

### Carries
- guarantee Taken (no line; slice is the host limit). host-test-load ceiling-values Taken, measurement 2 (one verify:core: 15.9 GB, 409 Chrome, 8.3 cores avg).
- slots/system-merged.md R2 (flake loop), R4 (WIP), measurements.

## Findings
Round 2026-10-13, notes slots/noline-{A,B,C}.md, merge slots/noline-merged.md, rebuttals slots/noline-rebuttal-{B,C}.md.
- No line does not remove waiting; overload moves inside the slice: throttling past MemoryHigh 64G, kills past MemoryMax 96G, CPU share shrink and browser timeouts (A,B,C). Rough sizing (C, A; B calls it unmeasured): slice ~22.5 GB quiet, one core run 15.9 GB peak, about 3 core-shaped runs reach MemoryHigh.
- bun --parallel has no width limit (bun 1.4.3 --help); a subset pool must be bounded (A,B,C).
- Options: slice only (cost: OOM kills under peak); fixed lane width plus lower max_active (B pick); width scaled from load at start (A); start delay only near the memory wall via memory.pressure, under the existing flock (C pick). B: start delay is a queue and pressure checks race. C: width and WIP do not bound concurrent runs, verify:core or direct lanes.
- Sequencing (C): keep permit.ts until this fork is answered. B: keep only what the chosen guard needs.
- Measurement (C): sweep 1/2/3/4 simultaneous test_changed runs on today's runner, ~40 min, record makespan, memory.events, memory.pressure, timeouts. B: measure fixed width/WIP.
- Signal available today: akrogon.slice memory.events (high, max, oom_kill counters), all 0 on 2026-10-13.

## Taken
2026-10-13, operator, verbatim: "1b | 2a | what about making the actual tests shorter and not running all of them all the time? that just doesn't make sense for the framework."
1b: fixed limits (bounded lane width per check, about 4; max_active trial 6-8; workers do not run the full check) plus a start check that delays a heavy run only while akrogon.slice is near its memory limit. Reason: a short wait on busy days beats killed and rerun tests. Accepted cost: under peak this is a short start line.
2a: the permit stays until a concurrency sweep (1, 2, 3, 4 simultaneous changed-tests runs inside the slice) records makespan, memory peak, memory.events and timeouts; its numbers size the lane width, max_active and the start-check threshold.
Foreclosed: slice only (1c). Carried: B's race objection (simultaneous starters all see room) and C's coverage gap (verify:core, hook tests, raw runs) go to the leaf design of the start check.

Amended 2026-10-13 (operator "1a, 2a, 3a, 4a, 5a", round slots/ship-merged.md):
- 2a: the operator stopgap in src/permit.ts raised to 4 lanes (uncommitted, cheap/selftest exempt) until the start check merges. Sweep accepted as provisional evidence (N=4 58.6 GB at 741 s, memory.events 0).
- 3a: start check form: admit when akrogon.slice memory.current < 48 GB, at most one admission per ~30 s under a short flock, every check, no name exemptions, nested runs start at once. Exact per-run reservation (B: max(0, reserve - run unit memory)) lands with the run-unit leaf. B,C dissent (rebuttals R1, F6): a start-time read cannot see later lane growth; backstop is MemoryHigh 64G throttle and MemoryMax 96G at max_active 6.
- Metric (A, 2026-10-13 read): the start check uses memory.stat anon + shmem, not memory.current. memory.current counts reclaimable page cache (25.8 GB of 57 GB at 11 leaves) and would block every start at 12 leaves. shmem counts because MemorySwapMax=0.
