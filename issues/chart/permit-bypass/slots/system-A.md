# Systems map, slot A (written before reading B, C)

## Stocks and flows
Open leaves -> active seats (max_active 20, akrogon config) -> check requests -> permit queue -> permit-held minutes -> pass/fail -> fix rounds -> more check requests -> merge (batch_limit 4, merge verify 5.5 min) -> merged leaves. CPU budget: akrogon.slice CPUQuota 1600% (16 of 32 cores), memory 64G/96G.

## Key measurement (primary records, framework issues/timings.jsonl + check logs, read 2026-10-13)
- test_changed runs: pull-rebuild-scripts 02:42Z and 03:04Z selected 106/139 scripts, 12.2 min each; technical-page-inventory 12:34Z selected 101/140, 13.8 min. 97 of the 101 were `(always)`.
- Partial selection runs `bun run --sequential` (framework .claude/workflow/scripts/run-test-changed.ts:435-440). A full selection runs `framework:verify:core`, which is `--parallel` (package.json:168), and took 239-265 s under the same slice (host-test-load measurement 2, T4).
- So "changed tests" is about 3x slower than "all tests". Any one path outside the map selects everything (run-test-changed.ts:270-276), which is then the faster case.

## Loops
- R1 queue wait -> harness timeout (pi 120-600 s) -> raw run or timeout-wrapped run-check -> contention or killed waiter -> slower runs and resubmits -> longer queue. Delay: minutes. Evidence: intake reports 1-2, pids 399055/3693707.
- R2 contention -> browser flakes -> red checks -> fix rounds (watch: 3 rounds = 4 cycles x 14 min) -> more permit minutes -> more contention. Delay: one cycle (~15-30 min).
- R3 long check -> seat idle in queue -> more seats active at once under max_active 20 -> more concurrent requests -> longer queue. No limit ties dispatch to queue depth.
- R4 (structural, not a loop) "always" list growth: each new browser test added as always lengthens every leaf's check forever.
- B1 slice quota caps CPU: works (cpu.max 1600000/100000; host 86% idle at 14:40 while load was 87).
- B2 permit serializes admitted runs: works for run-check only.
- B3 missing: nothing feeds queue depth or permit utilization back into dispatch or into seats.
- B4 missing: nothing feeds per-check duration back into selection (no alarm when a "changed" run selects 70% of scripts).

## Binding constraint
Permit minutes per check cycle. With 1 permit and 13.8 min per test_changed, ceiling ~4 cycles/hour. The permit count is a proxy for the CPU budget: one verify:core averages ~8.3 cores (1988 CPU-s / 239 s), the slice allows 16, so the permit leaves about half the budget idle during a parallel run and more during a sequential one.

## Leverage, ranked by gain per cost
1. framework: run selected scripts `--parallel` like verify:core (one flag in run-test-changed.ts:437). Expected 13.8 -> ~4-5 min per run, ~3x permit throughput. Risk: parallel browser lanes inside one admitted run; already proven safe as verify:core under the slice. Reopens nothing in akrogon; framework-test-scope chart owns selection.
2. framework: shrink the 97 always-scripts to path-owned ones. Bigger gain for small changes (seconds to minutes). Risk: missed tests; framework-test-scope release-gate fork must catch them (merge verify still runs everything).
3. akrogon: close the bypass at the seat path (printed command at every rule location, pi sentence carve-out, long-run path). Shorter runs from 1-2 make the long-run problem smaller.
4. akrogon: permit count 2 or CPU-share admission, only after measuring two runs together vs one.
5. akrogon: queue visibility, dedup of same leaf + same check, dispatch hold when the queue is deep (B3).

## Measurements
- M1 same selection, `--parallel` vs `--sequential`, one scratch worktree, under the permit: ~5 + 14 min, risk none beyond one normal run.
- M2 two permitted test runs together vs one, after M1: ~10 min, peak inside the slice cap.
