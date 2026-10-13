# No-line round, merged (A, B, C notes: noline-{A,B,C}.md)

## Agreed
- Removing the run permit keeps the PC safe; the slice does that (A,B,C).
- It does not remove waiting. Without a brake, demand moves inside the slice: past MemoryHigh 64G runs throttle, past MemoryMax 96G the kernel kills work, CPU shares shrink and browser timeouts flake. A killed 12-min run is lost work plus a rerun (A,B,C).
- Numbers: one core run 15.9 GB, 409 Chrome, 8.3 cores. Slice already ~22.5-22.9 GB at a quiet sample. About 3 core-shaped runs reach MemoryHigh, about 5 reach MemoryMax. Two runs fill 16 cores (A,B,C).
- "One flag --parallel" is wrong: bun --parallel has no width limit, so 101 lanes would start at once. Use a bounded lane pool, longest-first (A,B,C).
- Lower max_active as a measured trial; it counts leaves, not test runs. 20 active leaves x 3 workers can start far more runs than the slice holds (A,B,C).
- Workers running the full test:changed is now the largest unguarded load source; worker-duty stands and gets stronger (A,B,C).
- Dead: permit count, permit queue visibility, entry-point gates. Long-run path stands (runs are 4-14 min vs a 600 s tool cap) (A,B,C).
- Always-floor is the biggest durable lever. Some always-lanes honestly read the whole repo; un-mark only with read-root fixes and cost/yield data, never by guess (B,C).

## Disagreements
- load-guard pick: A width scales from slice load (no wait). B fixed lane width plus fixed WIP, adaptive later; a start delay is a queue and must be named one. C start delay only near the memory wall (memory.pressure "full"), fixed N slots as fallback; refusing any guard means OOM-kill is the chosen guard.
- Next fork: B,C load-guard (it decides whether any start-delay exists, which shapes run-check, subset width and dispatch signal). A subset-speed. A yields to load-guard.
- Sequencing (C): do not delete permit.ts before load-guard is answered; the flock is the machinery a slot or pressure guard would reuse.
- B: withdraw "PC is not the constraint" as a lasting conclusion; it was measured with sequential subsets and short samples.
- Measurement (C): concurrency sweep, 1/2/3/4 simultaneous test_changed runs in scratch worktrees, record makespan, memory and pressure peaks, timeouts (~40 min). B: fixed width/WIP measurement first, no controller untested.
