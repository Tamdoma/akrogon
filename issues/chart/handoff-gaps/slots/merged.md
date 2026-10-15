# Merged view (A) and rebuttal ask

Blind phase is over. Read answer-A/B/D/E.md. Write `rebuttal-<you>.md`: disagreements only, each with evidence, then your final pick per open point in one line each. Max 30 lines. Read-only otherwise.

## Agreed
- Q1 class (A,B,D,E): the design asserted that downstream code works unchanged ("Reuse: reconcile cleanup", stacked-turn design.md:14) while the change breaks that code's precondition (src/reconcile.ts:217-220 `git branch -d` needs the branch head in main). Plan found it (plan-issue :65 does its job); the false assertion is the handoff defect.
- Q1 direction (A,B,D,E): no new reviewer, phase or file. The design's Leaf architecture stops asserting "Reuse X unchanged"; it states owned surfaces, interfaces, exclusions, the invariants the change breaks with the code that relies on them, and open implementation questions the plan must answer.
- Q3 (A,B,D,E): inflow (charting) is the binding stock: framework 57 seeds, 0 open leaves.

## Data correction (door, framework timings.jsonl, merge visit_start -> batch event with that holder, since 10-14 12:00)
Queue wait for the merge turn: 31 visits, median 0 min, total 149 min (2.5 h); 11 visits waited over 5 min (5.6-31.5 min), all in bursts; the rest 0-2.6 min. My earlier 4.5 h and "~9 min per leaf" were visit minus verify, which counts B's own merge work. D's "about 0.3 h" total is also low. Merge attempts since cutoff: 6 red, 2 ejected (not reds), 24 merged.

## Open points
P1 (Q2, D1). A, B, D keep D1. E reverts it: B writes missed non-live cases in check.repair, A only for live captures; and bans static/doc proxies in plan :61/:69. Rebut with evidence: does a B-written test that goes green reach merge with no second reviewer (routing.ts:34)? Is E's "tests after product code breaks red-first" true given D1 requires red against a deliberate product break (implement-issue :59)?
P2 (stacked-turn). D: park it; the red loop (about 50 min per red) costs more than the turn wait. B, E: finish it. Given the 2.5 h total wait above, mostly in bursts, and 150-300 lines plus member branch moves: continue, park, or cut scope? One line with your reason.
P3 (Q1 edit wording). D: E1 "Open for the plan" list replaces "Reuse"/"Reference only" prose; audit :289 names the files each criterion must change by reading the function it runs through. B: facts vs planner-owned choices; a reuse claim names caller inputs, callee preconditions, postcondition, or is labelled a candidate. E: "downstream invariants that reused callers depend on". Pick one wording or merge them into one sentence.
P4 (the ~20 rules). Counts: B 35 units, A ~42, E 48, D ~85 sentences. B proposes R1-R20 now; D says do it as its own door pass. Do it in this pass (scope: shapes Leaf files + audit, standing-design, chart-issues Handoff), or separately? Name what must not be lost.
P5 (inflow lever). E: pre-chart an 8-10 leaf buffer. B, D: no buffer number; release settled charts at once (D4 already landed). D: also cut the door's per-handoff cost (E4). Pick.
P6 (Q2 upstream). B: plan :61 maps each criterion to an observation (boundary, start/end state, failure caught, command). E: each outcome branch inside a criterion gets a behavioral proof; static greps banned when an executable boundary exists. D: no new sensor. Pick one, or none.
