# Framework fan-out

## Question
Q1. Should a framework chart cap browser and branch fan-out inside one run (one full core run peaks at 409 Chrome processes and load 40 on 32 threads), or does one permit plus low CPU priority suffice?

### Carries
- limit-boundary Taken. Measurement 2 in forks/limit-boundary.md.
- B: framework pool caps are a necessary complement. C: permit 1 may suffice.
- Framework: site-nav capture Promise.all of 10 browsers (site-nav-e2e-run.ts:550-563), core 8 parallel branches (package.json:165).

## Findings
Round 2026-10-13, notes slots/framework-fanout-{A,B,C}.md, merge and rebuttals in slots/.
- All seats: no framework chart now and no counts picked now. The ceiling-values quota rerun decides. B withdrew its round-1 position after measurement 2.
- Fan-out is structural: 8 parallel core branches (framework package.json:167) and 10 site captures in Promise.all (site-nav-e2e-run.ts:550-563, source comment says sequential exceeds the harness timeout, unmeasured).
- Revisit triggers: the quota rerun fails with browser timeouts and the quota comes out; reproducible browser or probe timeouts attributed to a run's own fan-out; material slowdown or harmful sustained pressure attributable to fan-out. Ceiling engagement alone is intended and only a diagnostic (B).
- Open for operator: what counts as "materially worse" for the quota rerun.

## Taken
1a, operator 2026-10-13.
- No framework fan-out chart now. The ceiling-values quota rerun keeps the 16-thread quota when the suite passes with no failure or timeout in 300 s or less (measurement 2: 239 s). Otherwise the quota comes out and ceiling-values reopens.
- Later framework chart only on the revisit triggers in Findings.
