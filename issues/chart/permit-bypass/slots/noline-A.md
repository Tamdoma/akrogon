# No-line notes, slot A (written before reading B, C)

## Challenge to decision 1
- The line never protected the PC; the slice does (ceiling-values Taken; slice memory.events oom 0, high 0 on 2026-10-13). So removing it is safe for the PC. Agree with intent.
- What the line did protect: memory headroom inside the slice. One verify:core = 15.9 GB. 64G MemoryHigh is about 3-4 full runs plus seats (slice at 22.9 GB with ~8 seats idle-ish, memory.current read 2026-10-13). Past 64G the kernel reclaims and throttles: runs slow, browser waits time out, red checks, fix rounds. Past 96G the OOM killer kills inside the slice: a run dies mid-way. That is the clog the operator wants gone, moved from a visible queue to invisible slowdowns.
- CPU: 16 cores shared by N runs. Each run gets 16/N. Browser tests with fixed timeouts flake when N is high (R2 flake loop).
- So no-line needs a replacement brake that is not a queue: fewer, shorter runs (test-cost), and a cap on how much heavy work starts (dispatch WIP), and per-run width that does not assume the whole machine.

## Correction to my earlier leverage 1
- "One flag" is wrong. `bun run --parallel` has no width limit (bun 1.4.3 --help). test_changed would start ~101 scripts at once, many with Chrome: memory spike well past 64G. verify:core is fast because it is 8 hand-built groups, two of them long sequential chains (package.json:168-170).
- Fix: a bounded pool in run-test-changed.ts (width W, longest-first by recorded timings), or filter verify:core's groups to the selection. W must be small (2-4) when many leaves run, which the pool cannot know without a signal.

## load-guard options
- 1a Nothing beyond the slice. Breaks: memory brake and OOM kills under 4+ concurrent full runs. Cheap.
- 1b Memory-aware start: run-check (no permit) waits to start while slice memory.current > X (e.g. 48G), polling, no ordering. Not a line in the operator's sense (no fixed count), but it is a soft gate. Breaks later: starvation if memory never drops; waiting still counts against tool timeouts.
- 1c Per-run width from load: test pool width = f(slice memory/CPU at start). No waiting, runs just go narrower. Breaks: runs get long under load; needs the pool from subset-speed.
- Pick 1c plus dispatch WIP. 1b is the line by another name.

## dispatch-wip
- max_active 20 counts leaves, not heavy runs (src/next.ts:414-460). Pick: lower to ~6-8 for framework-heavy load, measured, or make dispatch hold when slice memory is high. Little's law: WIP above the slice's capacity only raises cycle time.

## Next fork
test-cost subset-speed first: it sets per-run cost, which sets how many runs fit, which sizes load-guard and dispatch-wip.

## No longer stands
- L3 bypass fix: the bypass harms nothing now except env hygiene (TMPDIR, bus cut). Shrinks to the evidence fork.
- L4 permit count, L5 queue visibility: gone.
- L2 worker duty still stands (duplicate runs cost memory and CPU, line or not).
