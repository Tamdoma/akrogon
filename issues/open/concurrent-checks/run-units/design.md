# Design: run-units

## Binding decisions, verbatim
### Cross-leaf kill (forks/cross-leaf-kill.md)
1a 2a, operator 2026-10-13 (verbatim "1a 2a |").
- 1a: each run-check and base-run run gets its own unit under the leaf slice, stopped on every exit path, with a stale sweep for a killed wrapper; `akrogon stop-run` takes its target from the caller's own cgroup and cannot reach another leaf or seat. Unit type (scope or supervised service) is settled by the leaf's proofs: SIGTERM and SIGKILL of the wrapper both end with zero descendants, a sibling run survives a stop. B's supervision dissent carried to the leaf design.
- 2a: stopgap rule committed 873db4e (implement-issue, check-issue, worker-protocol): no pattern kills; stop only by recorded PID; stopped only when no started process remains. stop-run replaces the PID wording when 1a lands.
- Foreclosed: deny-pkill wrappers, pkill --cgroup by unit name.

### Load guard (forks/load-guard.md)
2026-10-13, operator, verbatim: "1b | 2a | what about making the actual tests shorter and not running all of them all the time? that just doesn't make sense for the framework."
1b: fixed limits (bounded lane width per check, about 4; max_active trial 6-8; workers do not run the full check) plus a start check that delays a heavy run only while akrogon.slice is near its memory limit. Reason: a short wait on busy days beats killed and rerun tests. Accepted cost: under peak this is a short start line.
2a: the permit stays until a concurrency sweep (1, 2, 3, 4 simultaneous changed-tests runs inside the slice) records makespan, memory peak, memory.events and timeouts; its numbers size the lane width, max_active and the start-check threshold.
Foreclosed: slice only (1c). Carried: B's race objection (simultaneous starters all see room) and C's coverage gap (verify:core, hook tests, raw runs) go to the leaf design of the start check.

Amended 2026-10-13 (operator "1a, 2a, 3a, 4a, 5a", round slots/ship-merged.md):
- 2a: the operator stopgap in src/permit.ts raised to 4 lanes (uncommitted, cheap/selftest exempt) until the start check merges. Sweep accepted as provisional evidence (N=4 58.6 GB at 741 s, memory.events 0).
- 3a: start check form: admit when akrogon.slice memory.current < 48 GB, at most one admission per ~30 s under a short flock, every check, no name exemptions, nested runs start at once. Exact per-run reservation (B: max(0, reserve - run unit memory)) lands with the run-unit leaf. B,C dissent (rebuttals R1, F6): a start-time read cannot see later lane growth; backstop is MemoryHigh 64G throttle and MemoryMax 96G at max_active 6.
- Metric (A, 2026-10-13 read): the start check uses memory.stat anon + shmem, not memory.current. memory.current counts reclaimable page cache (25.8 GB of 57 GB at 11 leaves) and would block every start at 12 leaves. shmem counts because MemorySwapMax=0.

### Guarantee (forks/guarantee.md)
2026-10-13, operator, verbatim (after asking "what if we remove the serial limits altogether, but just cap to 16 cores and that's it?" and the door's answer): "I don't want the line to even be there, but we need to optimize everything else, too. I just don't want the PC to blow up, but we need to make sure there's no clogging and everything's going fast, and the tests don't take up so much time."
Decision: remove the run permit (the host-wide line) entirely. The akrogon.slice ceiling (CPUQuota 1600%, MemoryHigh 64G, MemoryMax 96G, no swap) is the host limit. Round 1 options 1a, 1b, 1c and questions 2 and 3 are moot.
Reason: the slice already keeps the PC safe; the line made the clog (queue, timeouts, bypass) and caps throughput at one run while most runs use 2-4 of 16 cores.
Reopens (host-test-load): limit-boundary revised 1a (permit part only; seat containment and the bus cut stay), heavy-runs, permit-release, queue-order. Foreclosed: gating entry points, refuse/re-enter, permit count 2, queue visibility for the permit.
Carried risks into fork load-guard: memory (one full run ~16 GB, 409 Chrome) and timeout flakes when many runs share 16 cores.

### Excluded
Long-run path: detached mode off route, skill background form owned by worker-test-duty. Worker duty, evidence: worker-test-duty. Dispatch WIP, ceiling trigger: no surface.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: tests prove done-criteria at the real boundary (CLI and real systemd/cgroup files where possible, fake cgroup root only for threshold states that cannot be made safely); one deliberate break per new behavior turns its test red; no wording tests on skill prose; no new proof machinery.

## Leaf architecture
Owned: src/scope.ts (run-unit helper beside adoptShell :53-90), src/run-check.ts, src/base-run.ts, src/shell.ts:38-46 if spawn must change, src/akrogon.ts (new `stop-run` verb), a stop-run module, the admission module from memory-start-check (reservation term), tests for these, skills/implement-issue/{SKILL.md:57,worker-protocol.md}, skills/check-issue/SKILL.md (pattern-kill paragraph from 873db4e).
Unit mechanism (proven at charting, forks/cross-leaf-kill.md proof 2026-10-13): run scope via StartTransientUnit plus a guard transient service in the leaf slice running the equivalent of `tail --pid=<wrapper> -f /dev/null; systemctl --user stop <run scope>`. SIGKILL and SIGTERM of the wrapper stopped the run scope and guard within 3 s while a sibling pair kept running. On normal end the wrapper stops its scope and guard itself. A different mechanism needs its own proof of criterion 3 before it replaces this. (B,C)
Tests create units under a disposable test slice (akrogon-test-*.slice) and stop it in cleanup; use sleep/child trees, not browsers, as descendants.
Excluded: detached run-check mode and run-id wait/status API (long-run-path Taken: off route); dispatch changes.
