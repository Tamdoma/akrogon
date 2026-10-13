# Slot B: ceiling-values

Blind, read-only notes, 2026-10-13. Read the named intake/chart, all settled Taken sections and both measurements. No peer ceiling notes read. No live unit created, changed, stopped or probed.

## 1. Pick, values and cost

**D1: Put a fixed aggregate budget on akrogon.slice, with these values for this host.** One permit does not bound direct worker scripts or leftovers released over by a killed runner. The parent slice must cover all boxed leaves together.

| Reference | Property | Proposed value | Purpose |
|---|---|---|---|
| P1 | CPUWeight | 20 | Keep boxed work below the desktop's ordinary CPU priority under contention. |
| P2 | CPUQuota | 1600% | Limit the whole boxed workload to sixteen CPUs' worth of CPU time. |
| P3 | MemoryHigh | 48G | Begin memory reclaim/throttling well above the measured single-run footprint. |
| P4 | MemoryMax | 64G | Bound aggregate memory growth, with cgroup-local OOM as the emergency consequence. |
| P5 | MemorySwapMax | 0 | Keep boxed work from consuming the host's large swap pool. |
| P6 | TasksMax | infinity | Do not impose the rejected working task limit. |

Leave the CPU quota period at the systemd default. Add no CPU affinity, IO budget, runtime deadline, adaptive controller or per-leaf resource division. P6 must also be explicit on akrogon's pane scopes so a scope default does not silently restore a task cap. Verify effective ancestors rather than assuming a child's infinity removes their limits.

CPUQuota is a time budget, not sixteen dedicated cores or a desktop reservation. Weight remains useful within that budget when the operator competes for CPU. The limits apply to boxed descendants only. They cannot protect against a standalone holder command outside a box or the already accepted cold-restore window.

The local read-only snapshot reports 123 GiB total RAM, 86 GiB available and 246 GiB swap, with 16 GiB swap used. Swap usage alone does not prove current thrashing. A 64 GiB group budget leaves roughly 59 GiB of physical capacity outside that group's maximum charge, not a guaranteed allocation for the desktop. Other processes still consume memory. Values are fixed for this inspected host, not inferred from a changing free-memory snapshot at every launch.

**D2: Create the root slice transiently through the containment connection, before the first leaf scope can admit a seat.** Keep these constants in the one containment implementation that allocate already needs. Create the root with its full properties when absent and verify it when present. Its children use the taken leaf/pane hierarchy. Fail closed on creation or effective-policy errors. Do not implicitly create an unrestricted root first and apply limits after workers start.

This avoids a permanent unit file, an installer link, daemon-reload ordering and another user setup prerequisite. A manager restart or collection can remove the transient unit. The same allocate ensure path recreates it before adopting new pane shells. Do not add a second ensure path at run-check or a fallback to an unconfigured slice. Existing units with conflicting policy require an explicit error, not silent live retuning while seats run.

For the typed transient API, CPUQuota=1600% maps to `CPUQuotaPerSecUSec=16000000`. MemoryHigh and MemoryMax are unsigned byte values `51539607552` and `68719476736`. CPUWeight is 20 and MemorySwapMax is 0. Verify these values and the effective kernel controls in the required disposable operation proof. Unit-file syntax is not interchangeable with the API's variant types.

**D3: Accept slowdown and local workload failure as the cost of the aggregate boundary.** Measurement 2 averaged about 8.3 CPU-seconds per wall second and used a reported 15.9 GB, below the proposed budgets. That does not show its CPU bursts fit sixteen CPUs or that all seats plus a run fit those values. The exact bundle has not passed a suite here. The earlier quota run had 30 seconds of reported throttling and was invalidated by its TasksMax crashes. It cannot establish quota-only slowdown or failure.

Normal memory usage should have substantial headroom, but reclaim above 48 GiB can slow work and a 64 GiB limit can OOM-kill processes inside the group. No swap removes one source of host-wide IO pressure at the cost of less memory elasticity. OOM need not stop every worker or preserve every partial write. The taken leaf stop remains the cleanup route. Do not label a resource-induced failure as evidence of a defect in the leaf's code or silently raise the limits after it happens.

## 2. Rejected options

- **O1: CPUWeight=20 alone.** It prioritizes siblings under contention and permits full use when they are idle. It does not cap aggregate CPU demand from direct scripts and surviving browsers. Use it with the fixed quota if the goal includes a real CPU ceiling.
- **O2: MemoryHigh=48G alone.** Measurement 2 never exercised that threshold. High can be exceeded and imposes reclaim pressure rather than an absolute containment boundary. It does not remove runaway aggregate growth.
- **O3: MemoryMax=48G as the only memory property.** This turns the measured high threshold into an abrupt failure boundary with less room for agents, other boxed work and transient peaks. A high/max pair separates pressure control from emergency failure.
- **O4: No memory boundary because the host has 123 GiB.** The permit-release residual explicitly allows overlap, and direct worker scripts bypass admission. One passing 15.9 GB run does not bound future aggregate memory usage.
- **O5: Unlimited swap alongside MemoryMax.** The host has about 246 GiB swap. A RAM-related limit alone is not a small combined memory/swap budget. P5 is one declarative setting, without a swap-pressure monitor or cleanup daemon.
- **O6: A task ceiling based on process count.** The failing measurement hit 3000 tasks, while the passing measurement reached 6138 tasks and only 409 Chrome processes. Threads count. The Taken decision already rejects TasksMax as a working limit.
- **O7: CPUWeight=idle or a much smaller quota.** Strict idle scheduling can delay work heavily during sustained desktop activity. A quota near or below the measured 8.3 average would impose stronger slowdown without a measured need. Twenty weight and sixteen CPUs are a moderate proposed starting policy, not measured optimum values.
- **O8: Install a permanent akrogon.slice file now.** Declarative files are valid, but this repository currently installs command/skill/plugin links (`src/install.ts:14-21,52-61`), not user units. Containment already requires a transient-unit connection and an allocate ensure step. Reusing that path has fewer deployment and stale-file failure points for this fixed application-owned policy.
- **O9: Copy 48G/64G and 1600% to every leaf.** Six leaves could then consume six independent budgets. Put aggregate limits only at the shared parent. Per-leaf scopes retain identity and stop semantics.

## 3. Evidence, source tier and date

All sources read 2026-10-13. Public systemd sources are pinned to v262, matching the local `systemctl --version` output, systemd 262 (262-1-arch).

- **E1, operator:** `forks/limit-boundary.md:45-52` records a passing 239-second suite under CPUWeight=20 and MemoryHigh=48G: 1988 CPU-seconds, reported 15.9 GB, 6138 tasks, 409 Chrome processes and no remaining browsers. The high limit was not reached. This supports the measured weight/high starting values, not a guarantee of memory-pressure behavior or desktop responsiveness.
- **E2, operator:** `forks/limit-boundary.md:25-31` records the failed TasksMax=3000 run with CPUQuota=1600%, MemoryMax=48G and browser escapes. Its task-creation failures invalidate it as a successful quota benchmark. Final Taken at `57-60` binds low CPU priority and rejects a working task cap. Permit-release Taken accepts survivors overlapping a later admitted run. These facts support an aggregate backstop without reopening admission or scope placement.
- **E3, primary inspected host:** `free -g` returned RAM total 123, used 37, available 86, and swap total 246, used 16, all rounded GiB. `/proc/meminfo` reported MemTotal 129451672 kB. These are snapshots, not a measurement of pressure during verification. No live manager properties were queried.
- **E4, better-than-training:** [systemd v262 resource-control documentation](https://raw.githubusercontent.com/systemd/systemd/v262/man/systemd.resource-control.xml), CPU and memory sections, defines relative weight, quota percentages against one CPU, binary G units, inherited effective limits and high/max roles. It recommends high for normal control and max for final containment. Task accounting includes threads. These semantics support P1-P6, not their particular numeric suitability.
- **E5, better-than-training:** [Linux cgroup v2 documentation](https://docs.kernel.org/admin-guide/cgroup-v2.html), memory.high, memory.max and memory.swap.max, distinguishes reclaim/throttling, local OOM and swap restriction. High can be breached. Max can be exceeded temporarily under some circumstances. Neither creates a desktop memory reservation. The kernel guidance expects action when high pressure persists, which the selected operator stop supplies here.
- **E6, better-than-training:** [CFS bandwidth documentation](https://docs.kernel.org/scheduler/sched-bwc.html) describes enforcement over quota periods. A sixteen-CPU budget can throttle a thirty-two-thread burst even when long-run average consumption is lower. The measured average alone cannot predict wall-time cost.
- **E7, better-than-training:** [systemd control-group interface](https://systemd.io/CONTROL_GROUP_INTERFACE/) permits transient slices. [v262 transient settings](https://raw.githubusercontent.com/systemd/systemd/v262/docs/TRANSIENT-SETTINGS.md) includes the selected properties. [v262 dbus-cgroup source](https://raw.githubusercontent.com/systemd/systemd/v262/src/core/dbus-cgroup.c), properties and setters, accepts unsigned quota-per-second microseconds and memory byte values. This verifies API feasibility, not a successful call on the operator's manager.
- **E8, better-than-training:** `src/next.ts:427-453,523-532` places both panes inside allocate and saves their final identity. Seat-scope Taken adds adoption before that final save and before agent start. This is the existing authorization/ordering point for ensuring the parent policy. `src/install.ts:52-61` has no systemd unit installation or reload today. Practitioner searches found no accessible named account resolving this application's static-versus-transient choice more strongly than the v262 interface and inspected integration path.

## 4. Pitfalls and what removes each

- **R1: Resource settings cover only one suite or multiply per leaf.** Put P1-P6 on the single common parent and verify two leaf scopes beneath it. Both must share the same aggregate controls, including detached descendants.
- **R2: The root exists but was implicitly created without policy.** Ensure/configure it before adopting any shell, then read back effective limits before agent start. A mismatch skips dispatch. Prove root absence/recreation and pre-existing-policy mismatch handling without launching a seat first.
- **R3: A task default recreates the previous crash.** Explicitly request infinity on akrogon's owned scopes and inspect the effective ancestor chain. Do not edit the operator's broader user limits automatically. An inherited restrictive boundary is a named prerequisite rather than a reason to claim uncapped operation.
- **R4: A new CPU budget makes legitimate tests time out.** Run the representative full suite with the exact selected bundle and all normal seat overhead. Compare wall time, cpu.stat throttling, failures and cleanup with measurement 2. The door must report the result before calling this bundle a passing policy. A declined required proof holds handoff.
- **R5: An emergency memory limit is mistaken for graceful cancellation.** Present local OOM and partial-work costs in the operator round. Prove containment with a tiny disposable allocation under proportionally small high/max settings, then prove actual policy property read-back. The scaled probe does not prove that 64 GiB is enough for all real work.
- **R6: Swap or reclaim pressure keeps the desktop busy.** P5 removes boxed swap growth. The chosen leaf stop removes a stuck workload. This does not bound ordinary file IO, GPU work or other programs outside the slice. No claim of universal desktop isolation.
- **R7: Stopping the shared parent kills every leaf.** Ordinary stop continues to target the derived per-leaf slice. Do not stop or replace a populated akrogon.slice merely to reapply settings. Keep the rollout's already taken one-time manual tab closure.

Required operation proofs remain with the door: transient parent creation with the exact property types/values through the identity and connection that implementation will use, effective kernel read-back, disposable nested scopes sharing one parent, CPU throttling and bounded-memory behavior, complete cleanup and cold-manager recreation. The representative suite must establish actual correctness and slowdown under the selected budget. This read-only slot did none of those live operations.

## 5. Missing questions

- **Q2: Does the operator accept a slower verification run to enforce the sixteen-CPU aggregate ceiling?** My pick accepts it, but the amount is not known from measurement 2. If only relative priority is desired, choose that explicitly and accept the absence of an absolute CPU ceiling.
- **Q3: Is local OOM at 64 GiB, with no boxed swap, acceptable emergency behavior?** This bounds boxed growth at the cost of interrupting work. No existing measurement establishes that every supported repo or many active seats fit this budget.
- **Q4: What pressure outside CPU/RAM must the desktop guarantee cover?** This policy does not cap ordinary storage IO or GPU use. Keep those out of scope unless evidence makes them a current requirement, rather than adding speculative controls.
