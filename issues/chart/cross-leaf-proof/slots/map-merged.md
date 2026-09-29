# Merged map: Tamdoma/akrogon#41

Attribution: (A), (B), (C) = slots that independently hold the line.

## Destination
akrogon's charting, standing design, planning and review guidance make each property proven by the cheapest test that can catch it, in the leaf that owns it, so a multi-leaf pipeline epic finds cross-leaf defects near their cause and a proof leaf converges in one or two runs. No check is removed. No `src/` change. (A,B,C)

## Findings
- M1 The proof leaf's own locks multiplied each defect: live-replay design.md:48 "Fixing any defect the run finds. The run fails, and the owning leaf reopens." and design.md:119 / brief.md:36 "The run happens once at that revision with no source edit after." Each defect cost a new leaf lifecycle plus a from-scratch rerun. Speed returned only after the 2026-09-29 overrides (design.md:41-42). (A,B,C)
- M2 A spine already existed and was never grown. fixture-network brief.md:4 says each later leaf swaps its step from recorded to real. At framework HEAD `per-site-content-weave` and `recorded-build` are still `recorded` (run-fixture-network.ts:648,653) and content-prep/batch/finalize/verify are absent. No later brief was required to swap its step. So "spine first" alone would not have helped; "each leaf grows the spine" is the missing rule. (B,C; A verified the file)
- M3 Rehearsals that continued with stand-ins found several defects per pass (report.md:707-722); labelled runs found one each. (A,B,C) The "17 defects, one per run" shorthand overstates it: the history mixes harness defects, product defects and rehearsals. (B)
- M4 Several defects needed no live run: #13/#15/#17 are CSS findable by the renderer's own tests; #16 is a pigeonhole findable by a unit test at the check; #10/#11/#12/#14 are writer/checker drift findable at the leaf that adds the check. (A,C)
- M5 akrogon has no rule on where integration proof sits or on proof cost: standing-design.md:9 covers per-leaf user-visible E2E only; chart-issues SKILL.md Drain and shapes.md:118 order only by dependency; plan-issue owns concrete verification (SKILL.md:55-57) but has no cheapest-sufficient-test rule. (A,B,C)

## Forks, in proposed order
1. Proof selection principle: every done-criterion is proven by the cheapest command that can catch its failure; a slow or live run must name the property no smaller test proves. Where does this live (standing design line applied at chart, plan maps criterion to command/cost/rerun trigger, review checks adequacy)? (B leads, A,C agree in substance)
2. Spine growth (A1, A3): when a chart splits a pipeline, one runnable spine command exists early and each pipeline leaf's done-criteria swap its stage from recorded to real (or re-record its fixture from the real producer) and keep the spine in `checks`; model and external steps stay recorded-from-real, never live per merge. Trigger scope of "pipeline chart" is still open (C G1). (A,B,C)
3. Proof leaf policy (A2 + in-branch fixes): a proof leaf fixes bounded defects in-branch with a fail-first test, opens a new leaf only for a locked-decision change, resumes from the failed stage, collects failures across stages whose inputs are valid, and names which invariants a resumed final run weakens. (A,B,C)
4. Review rules (A4, A5): a rule's writer and checker share one source or the design says why not (model-writer instructions derive from the checker's definition); a new check ships with a real passing and a failing example at target scale. Review runs these, not reads them. (A,B,C)

## Disagreements
- D1 Collect-all boundary. (C) continue to the next stage when its inputs exist. (A) rehearsal with stand-ins before labelled runs. (B) never manufacture valid input to continue; stand-ins are diagnostic only, never acceptance evidence; downstream checks are marked blocked, not passed. Merge proposal: collect independently evaluable failures; stand-ins allowed only in diagnostic runs and never counted as acceptance.
- D2 Runtime budget. (A) a numeric budget N for verification. (C) Farley's <5 min commit, <1 h acceptance as a reference, number unset. (B) no evidence for a number; stage durations unmeasured; leave it out. Merge proposal: Fog, not a fork, unless the operator wants a number.
- D3 Split. (A,C) three leaves: spine, proof-leaf speed, review rules. (B) two leaves: proof selection + execution (forks 1, 3), producer/consumer compatibility and achievable checks (forks 2, 4). Merge proposal: decide after forks settle.
- D4 A3 fixtures. (B) keep small authored negative/edge fixtures; only positive stand-ins for another producer need provenance. (C) all stand-in fixtures name their producer and re-record. Merge proposal: B's narrower scope.

## Practitioner sources (read 2026-09-29)
- Freeman and Pryce, GOOS ch.10 walking skeleton (https://www.oreilly.com/library/view/growing-object-oriented-software/9780321574442/ch10.html). (A,C)
- Ian Robinson, consumer-driven contracts (https://www.martinfowler.com/articles/consumerDrivenContracts.html). (A,C)
- Mike Wacker, Google Testing Blog, "Just Say No to More End-to-End Tests" (https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html); Adrian Sutton counterpoint (https://www.symphonious.net/2015/04/30/making-end-to-end-tests-work/). (B,C)
- Ham Vocke, Practical Test Pyramid (https://martinfowler.com/articles/practical-test-pyramid.html). (B)
- Dave Farley, deployment pipeline / CD pipelines: move common late failures into early fast stages. (B,C)
Synthesis: all agree the fix is fast feedback at the cheapest level that catches the defect; they disagree only on how much E2E to keep, and E2E stays here because rendered defects need a real browser, but it should run on recorded model output, not live sessions.

## Pitfalls
- R1 More prose repeating existing intent leaves the same gap; the handoff audit must check each pipeline leaf names its spine step (M2). (B,C)
- R2 A spine that needs live model sessions per merge recreates the delay at the front. (A,B,C)
- R3 Standing-design lines are reinterpreted per leaf (standing-design.md:13); a pipeline-only rule must state when it applies. (A,C)
- R4 Resume and in-branch fixes weaken proof unless weakened invariants are listed. (A,B,C)
- R5 Shared writer/checker code can share a defect; keep independent observable assertions. (B)
- R6 Testing skill wording mechanically tests format; validate by applying revised guidance to the live-replay case. (B)

## Off route
Framework fixes and the live-replay run; new phases or `src/routing.ts` changes; removing or loosening checks; writes under `issues/` from a leaf. (A,B,C)

## Fog
- G1 What counts as a pipeline chart. (C)
- G2 A numeric verification budget (D2).
