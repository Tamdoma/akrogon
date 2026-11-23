# Signposts angles (slot C)

- **Priority (fix 1a): treat host headroom as a hard floor, not a 3rd-place trade-off behind queue time.**
  Reason: Host saturation drives a positive feedback loop (overload → teardown/verify timeouts → red lands → repair seats + retries → worse overload), so sacrificing load for throughput simultaneously breaks land reliability, queue time, and LLM spend.

- **Question (missing): should the scheduler enforce backpressure at the serial merge bottleneck (capping merge-queue WIP and throttling competing leaf checks during a land) before adding throughput machinery?**
  Reason: 891 h of merge queue wait against 243 h of land runs is classic WIP pile-up in front of a serial server, which stales queued leaves into rebases and starves the lane; backpressure changes `max_active`, K4 concurrency, and may eliminate P10 warm worktrees and P14 stacking.

- **Question (missing): where is the boundary between akrogon (generic orchestrator) and the target repo's test/build harness?**
  Reason: Compensating inside akrogon for one repo's 11 GB test bloat (K3 `node_modules`/Chromium exclude archiver, P10 mutable `node_modules` worktrees, P6 lane sharding) fixes symptoms in the wrong layer, adds permanent stateful parts, and undermines the minimalist/any-PC goal.

- **Hard limit (missing from 2a): every host-sized limit must degrade safely to concurrency=1 or disk fallback when tmpfs is smaller than a run's peak or cgroup v2 CPU/IO controls are unavailable.**
  Reason: Proportional sizing alone still deadlocks a 16–32 GB PC where tmpfs cannot hold even one 11 GB peak run, or fails silently on hosts without systemd CPU/IO delegation.

- **Hard limit (missing): every host resource akrogon creates or sweeps (systemd slices, temp roots, locks, test slices, cached worktrees) must be scoped by `AKROGON_HOME`/instance ID.**
  Reason: Without an instance-ownership invariant upfront, #148 K5 (orphan tmpfs sweeps) and P12 (`akrogon-test-*` cleanup) will repeat #151's cross-home kill race whenever a verify suite runs beside live akrogon.

- **Hard limit (missing): every speed shortcut (P1 rerun, P3 B-side test edits, P7 auto-leave `failed`, P10 worktree reuse) must enforce strict finite caps, cross-leaf hermeticity, and structured logging of every retry/bypass.**
  Reason: Unlogged retries mask systemic overload as green, uncapped `failed` restarts create runaway LLM spend loops, and unguarded test edits or dirty warm worktrees trade visible reds for silent false greens.

- **Ordering (fix line 33): ship minimal retry/cause telemetry (core of P11) alongside P1 in chart 1, pull K1 and P5 (merge-verify priority) ahead of bookkeeping/worktrees, unify host-ownership across #151/K5/P12, and gate P10/P6/P14 on post-fix re-measurement.**
  Reason: Shipping P1 blind loses the flake signal needed to judge charts 2–4, leaving P5 in chart 3 keeps lands starved during reliability work, and pre-committing to stateful additions (P10/P6/P14) acts on queue numbers measured under today's broken disk/CPU bottleneck.

- **Question (missing from 6): should we audit existing review logs and the 2-month revert history to delete whole redundant turns or gates (e.g., A's pre-B self-review, record-gap findings behind the 70% first-round repair rate) before tuning hand-off rules?**
  Reason: Framing LLM spend around only P3/P8 misses the largest simplicity-and-cost lever: eliminating one redundant seat turn or ceremony gate removes more moving parts and tokens than tuning hand-off boundaries.
