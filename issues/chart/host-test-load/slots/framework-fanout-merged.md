# Merged notes: framework-fanout (A, B, C)
## Agreed
- No framework chart now, and no browser or branch counts picked now (A,B,C). B withdrew its round-1 "necessary complement" after measurement 2 and the quota.
- The ceiling-values rerun under the exact slice policy decides. It must report wall time, failures, browser timeouts, throttling, memory and cleanup on the same revision as measurement 2 (A,B,C).
- Not never: the rerun can fail, and suites grow (A,B,C).
- Revisit triggers, written into Taken and kept as an off-route line (C): the quota rerun fails with browser timeouts and the quota comes out; two or more known-red comparison records blame a run's own browser or probe timeouts; slice cpu.stat throttling or memory.events show the ceiling engaging on ordinary runs.
- Fan-out is structural: 8 parallel core branches (framework/package.json:167, not :165) and 10 site captures in Promise.all because sequential capture exceeds the harness timeout (site-nav-e2e-run.ts:552-563). 409 Chrome processes are a few dozen browsers (C). Sequential capture exceeding the timeout is a source comment, not a measurement (B).
## Disagreements
None.
## New questions
- QR1 What wall-time change counts as "materially worse" for the quota rerun (B)?

## After rebuttals
- C: none. B: ceiling engagement alone is intended behavior, a diagnostic, not a trigger. Triggers become reproducible browser timeouts, material slowdown, or harmful sustained pressure attributable to fan-out.
