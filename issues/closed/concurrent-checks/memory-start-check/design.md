# Design: memory-start-check

## Binding decisions, verbatim
### Guarantee (forks/guarantee.md)
2026-10-13, operator, verbatim (after asking "what if we remove the serial limits altogether, but just cap to 16 cores and that's it?" and the door's answer): "I don't want the line to even be there, but we need to optimize everything else, too. I just don't want the PC to blow up, but we need to make sure there's no clogging and everything's going fast, and the tests don't take up so much time."
Decision: remove the run permit (the host-wide line) entirely. The akrogon.slice ceiling (CPUQuota 1600%, MemoryHigh 64G, MemoryMax 96G, no swap) is the host limit. Round 1 options 1a, 1b, 1c and questions 2 and 3 are moot.
Reason: the slice already keeps the PC safe; the line made the clog (queue, timeouts, bypass) and caps throughput at one run while most runs use 2-4 of 16 cores.
Reopens (host-test-load): limit-boundary revised 1a (permit part only; seat containment and the bus cut stay), heavy-runs, permit-release, queue-order. Foreclosed: gating entry points, refuse/re-enter, permit count 2, queue visibility for the permit.
Carried risks into fork load-guard: memory (one full run ~16 GB, 409 Chrome) and timeout flakes when many runs share 16 cores.

### Load guard (forks/load-guard.md)
2026-10-13, operator, verbatim: "1b | 2a | what about making the actual tests shorter and not running all of them all the time? that just doesn't make sense for the framework."
1b: fixed limits (bounded lane width per check, about 4; max_active trial 6-8; workers do not run the full check) plus a start check that delays a heavy run only while akrogon.slice is near its memory limit. Reason: a short wait on busy days beats killed and rerun tests. Accepted cost: under peak this is a short start line.
2a: the permit stays until a concurrency sweep (1, 2, 3, 4 simultaneous changed-tests runs inside the slice) records makespan, memory peak, memory.events and timeouts; its numbers size the lane width, max_active and the start-check threshold.
Foreclosed: slice only (1c). Carried: B's race objection (simultaneous starters all see room) and C's coverage gap (verify:core, hook tests, raw runs) go to the leaf design of the start check.

Amended 2026-10-13 (operator "1a, 2a, 3a, 4a, 5a", round slots/ship-merged.md):
- 2a: the operator stopgap in src/permit.ts raised to 4 lanes (uncommitted, cheap/selftest exempt) until the start check merges. Sweep accepted as provisional evidence (N=4 58.6 GB at 741 s, memory.events 0).
- 3a: start check form: admit when akrogon.slice memory.current < 48 GB, at most one admission per ~30 s under a short flock, every check, no name exemptions, nested runs start at once. Exact per-run reservation (B: max(0, reserve - run unit memory)) lands with the run-unit leaf. B,C dissent (rebuttals R1, F6): a start-time read cannot see later lane growth; backstop is MemoryHigh 64G throttle and MemoryMax 96G at max_active 6.
- Metric (A, 2026-10-13 read): the start check uses memory.stat anon + shmem, not memory.current. memory.current counts reclaimable page cache (25.8 GB of 57 GB at 11 leaves) and would block every start at 12 leaves. shmem counts because MemorySwapMax=0.

### Dispatch WIP (forks/dispatch-wip.md)
Operator 2026-10-13, verbatim "1a, 2a, 3a, 4a, 5a". Round notes slots/ship-{A,B,C}.md, merge slots/ship-merged.md, rebuttals slots/ship-rebuttal-{B,C}.md.
Taken 1a: max_active 6 now, done by the door: config.yaml commit 237208f, `akrogon config` reads 6. The start-check leaf raises it to 8. Pressure-reactive dispatch off route until post-merge timings and memory.events show need.
Revised by operator 2026-10-13 ("We need to get to 12, instead of 6. 6 is too little."): max_active 12, commit after 237208f; the start-check leaf does not change it. Slice at 11 leaves read 17:30: anon 26.1 GB, shmem 11.6 GB, file 25.8 GB, memory.events 0, load 35.

### Ceiling trigger (forks/ceiling-trigger.md)
Operator 2026-10-13, verbatim "1a, 2a, 3a, 4a, 5a". Round notes slots/ship-{A,B,C}.md, merge slots/ship-merged.md, rebuttals slots/ship-rebuttal-{B,C}.md.
Taken 4a: the host-test-load ceiling-values reopen trigger (over 300 s or non-flake failure) covers framework:verify:core only. No CPUQuota change.

### Excluded
Cross-leaf kill: per-run units and stop-run belong to run-units. Worker duty, long-run path, evidence: skill text in worker-test-duty.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: tests prove done-criteria at the real boundary (CLI and real systemd/cgroup files where possible, fake cgroup root only for threshold states that cannot be made safely); one deliberate break per new behavior turns its test red; no wording tests on skill prose; no new proof machinery.

## Leaf architecture
Owned: src/permit.ts (replace with a start-admission module; name is the implementer's), src/run-check.ts:20,173-181, src/base-run.ts:19,165-169, src/status.ts:31,409-413, src/timing.ts:40 meaning, tests/run-permit.test.ts (rewrite), docs/guide/setup.md:70, docs/guide/files.md, src/AREA.md:18.
Interface: `withAdmission(holder, fn)` keeps the current `withPermit` call shape and the `AKROGON_RUN` token so callers change one name. Admission reads `<slice>/memory.stat` where slice is akrogon.slice under the user manager cgroup; the cgroup root is overridable by env for tests the same way `procRoot()` is (src/scope.ts procRoot), so tests use a fake memory.stat file, never a real near-full slice.
Constants, not config: threshold 48 GiB anon + shmem, spacing 30 s, poll 5 s. Why anon + shmem: memory.current counts reclaimable page cache (25.8 GB of 57 GB at 11 leaves, load-guard read 2026-10-13) and would block every start; shmem counts because MemorySwapMax=0.
The flock is held only for the read-and-record step, never for the run. Admission writes one record per waiting or live run under the global home (token hash, wrapper pid and start_time, repo, leaf, check, state, wait reason), created before polling, marked live on admission and removed in `finally`; the last admitted start time sits beside them. Nested admission validates `AKROGON_RUN` against live records; status lists waiting records only after validating pid and start_time. (C)
A missing or unreadable memory.stat is an error that names the path, not a silent start.
Cutover: processes already waiting on the old run.lock lanes keep old code until they exit; this leaf does not signal them. The operator's uncommitted 4-lane stopgap in the root checkout's src/permit.ts is reverted on main by the door before this leaf merges (CHART.md Pending steps); the leaf branch starts from committed main, which has the one-lane permit.
Excluded: per-run units, per-run reservations and stop-run (run-units); max_active (stays 12, operator config).
