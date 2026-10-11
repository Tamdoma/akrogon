# Why leaves run 4+ hours: merged A, B, C

## Facts (A,B,C)
- formspark-build-wiring (framework log 2307-2372): implement 135 min; review/repair rounds 5-19 min each (B total ~52 min); A check.fix 263, 230, third still open. 74% of time in A's check.fix.
- All product findings (F1,F2,F4,F5,F6) were repaired by B by 10:21 (C). Everything after is proof work: ~2160 harness lines (run-formspark-build-wiring-proof.ts +1346, lib/blueprint-run.ts +434, lib/blueprint-fixture.ts +378), 39 `proof:` commits (C). F7, F8, F10-F12 were introduced by A's harness repairs (review-B.md:228,307) (A,B,C).
- Pattern, not one leaf (C): across 353 framework leaves check.fix median is 24 min; the tail (emdash-launch 840, formspark-build-wiring 494, emdash-offer-join 488, offer-join-deploy 423) all carry a live-run criterion plus a harness or browser daemon built or repaired inside the leaf. B's comparisons: siblings in the same area finish phases in 5-80 min.

## Stock and flow
- Stock 1 (A,B,C): unproven done-criteria. After 10 hours only criterion 1's declaration is established; 2-7 open (review-B.md:366).
- Stock 2 (B,C): unreviewed proof-harness code, 0 at charting, ~2160 lines now. This is where new findings come from.
- Inflow (B,C): live-run Fixes only A may do (check-issue SKILL.md:75); defects in A's own harness found at recheck; framework bugs exposed by live runs and fixed in-branch (standing-design.md:15); environment failures (browser daemon, hooks).
- Outflow (B,C): B's repairs (7-10 min per round); A's passes close 0 criteria for 2-7 per round.
- Multiplier (C): "after every repair, supply passing proof for every done-criterion" (implement-issue SKILL.md:84, :40): every harness tweak re-queues the whole live matrix.

## Bottleneck (A,B,C)
Seat A in check.fix running live proof chains (claude -p sessions, build, consumer repo, browser). Any failure in the chain costs the whole chain again.

## Reinforcing loops
- R1 (A,B,C) Harness breeds findings: live proof needs a harness -> harness is new code -> review finds harness defects -> A repairs -> new defects.
- R2 (B,C) Live runs expose bugs outside the leaf -> fixed in-branch -> more diff, more review, more reruns.
- R3 (B) False green: the runner reports pass=true with 18 of 19 cases not run (proof script :350-362); the earlier 13/13 used the wrong path (review-B.md:34). A keeps working on cases while acceptance debt stays.
- R4 (C) A labels its own bug a flake (report.md:69); B finds the cause (F10); a round is spent.

## Balancing loops with wrong target or sensor
- B1 (A,B,C) fix_rounds cap counts B->A handoffs, not effort inside a pass (src/phase.ts:306-320). A 4-hour round counts as one; the leaf fails only after ~16 hours.
- B2 (B,C) Leaf size at charting: shapes.md:286 has no proof-cost rule; the plan sized the live matrix as "~8 sessions, minutes each" while the harness did not exist yet (plan.md:82,90). The sensor read proof cost before the machinery existed.
- B3 (B) Worker target: U8 (the harness unit) succeeded on helper tests and turn count, with live runs forbidden (brief-8.md:60,72-74), so the leaf inherited the real work.
- B4 (B,C) Review routes "proof machinery cannot produce evidence" as a repair, not a stop (check-issue SKILL.md:75; implement-issue SKILL.md:36 "after the repairs the protocol permits" is unbounded).
- B5 (B,C) 60-minute busy notice: senses "busy", which is not the quantity that matters, and has no action.

## Root cause (A,B,C)
A leaf may bundle a product change, the new machinery that proves it, and the live proof. When the machinery is new, the check loop spends hours on machinery defects while the product was done after the first repair, and nothing tells "product not done" from "proof machinery not done". Repair is bounded by handoff count, never inside a pass.

## Highest-leverage changes (A,B,C)
- L1 Structure (B D1, C C1): new proof machinery (a live-run harness) is its own prerequisite leaf, proven on existing behavior, before the product leaf opens. The product leaf runs its live proof on machinery that already works. Invites: one more leaf per live-run feature; harness drift absorbed as small repair.
- L2 Rule (B D3, C C2): in check.fix, a criterion that stays red because the proof machinery or environment cannot run ends the pass with the existing `failed --reason "<criterion> red: <cause>"` instead of building more machinery. Ordinary defects in an established path are still repaired. Invites: more failed leaves, each a short decision instead of hours.
- L3 Sensor (B D2, C C3): at charting and planning, a live-run criterion whose proof needs machinery not already in the repo is refused unless L1's leaf precedes it; a worker's proof must catch the same failure the criterion names; subset passes are labelled, never whole-leaf pass.
- Not recommended (A,B,C): a wall-clock cap or a louder busy notice; both watch the loop and leave R1 running.

## Rebuttal corrections (B, C)
- B F1: the product was not proven done after the first repair; A also fixed production code later (a2b40cbc5, report.md:57) and review-B.md:179 still required refusal outcomes. Root cause: unresolved product evidence vs defects in the evidence machinery, not "product done".
- B F2: reruns are selective by rule (implement-issue SKILL.md:84 reuse unchanged evidence; standing-design.md:15 changed stages and consumers); the growing harness invalidates downstream evidence, not a mandatory full replay.
- B F3: L1/L3 are conditional: split machinery only where it is independently provable; otherwise first prove one complete real path before expanding the matrix (B D2). No automatic refusal for "machinery absent from repo".
- B F4: review+repair total 39 min; 74% covers completed phases; "fails after ~16 hours" has no basis (cap counts entries, not time).
- B F5: stock 2 is B's "unlanded changed work"; the harness was reviewed; partial progress exists (review-B.md:299,366).
- C1: F9 also A-introduced (review-B.md:288); all F7-F12 came from A's repairs.
- C2: outflow per round: round 1, 263 min to run 1 of 6 real cases (report.md:59,61); round 2, 230 min to run 6 cases to 3 pass, 3 partial (report.md:67-74).
- C3: chart-issues SKILL.md:69: the live-run estimate "never times out a leaf and never waives a criterion"; the only time target ever set was A's own 30-minute budget, rejected by B under the rules (review-B.md:226).
- C4: the notice fires once and is suppressed until idle (src/next.ts:246).
- C5: the 5-80 min sibling comparison is B's; C's is the 353-leaf distribution.
