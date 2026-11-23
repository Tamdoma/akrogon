# Design brief: wake-cost final shape

You are a consultant. Read only. Write your own view before seeing anyone else's.

Locked: forks/signposts.md (2026-11-23: computer load fixed where cheap; part count: remove at least what is added). Chart destination (CHART.md): a next --wake pass reads no timings.jsonl and walks closed leaves only where needed; flip-flop residue deleted with old ledger rows still parsing.
Opening-map direction (issues/chart/lean-akrogon/slots/map-merged.md "Chart 4 wake-cost" and "After rebuttals"): timings.jsonl write-only for the wake (keep the wake's facts it reads, capacity wait and visit start, in state.yaml); repoInventory reads open leaves only where closed are not needed; residue deletion (reused, members/split/held/reuse/ejected, Batch.decision, red-records.jsonl), not fix_rounds; verify-runs append-only was dropped.
#149 figures: readTimings parses 29.9 MB timings.jsonl at 398 ms, about 38 times per next --wake, under the global lock; repoInventory walks 1,097 closed and 19 open leaves at 146 ms, 25+ times per wake and on every run-check.

Code on main /home/ivan/Work/infra/akrogon: src/next.ts (wake pass, global lock), src/timing.ts:96-128 (readTimings), src/state.ts (repoInventory), src/run-check.ts, src/log.ts, src/phase.ts, src/land.ts, src/verify.ts; grep every readTimings and repoInventory caller. Measure on this host: `time akrogon next --wake` style or a bun one-liner timing readTimings and repoInventory on the framework repo (/home/ivan/Work/infra/tamdoma/framework).

Answer with file:line:
1. Each readTimings caller in the wake path: which fact it needs, and the smallest place to keep it (state.yaml field, or read once per pass). Same for repoInventory callers that need closed leaves vs open only.
2. Residue: each named item, whether anything still reads or writes it, and what deletion breaks (old rows must still parse).
3. Current measured cost per wake on this host, and the expected after.
4. Fewest-parts final shape and open forks with your pick.
Under 60 lines. Write slots/design-<slot letter>.md here.
