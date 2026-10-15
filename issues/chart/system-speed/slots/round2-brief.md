# Round 2: rebuttal plus the now-binding constraint

Read consult-brief.md, then answer-A.md, answer-B.md, answer-D.md, answer-E.md (all four are now open to everyone). Operator, 2026-10-15 overnight: "consult with other consultants, find systemic flaws that can move the needle when it comes to speed and efficiency" and "When encountering a bug or a slowdown, think about it as a systems thinker, don't just get the urge to patch it ... elegant, simple ... keep the system simple and optimized, and easy to reason about with clear mental models." A picks the options overnight.

## New facts A verified after round 1 (correct your answer where they bite)

V1. Re-baseline. Framework phase times, visits that started 10-12 12:00 to 10-14 12:00 ("old") vs after 10-14 12:00 ("new", after D10 cheap-only leaf checks, test_changed deleted, admission gate dropped). From log.jsonl consecutive moves:
- implement: old n=29 median 4.55 h mean 6.15 h; new n=20 median 0.97 h mean 0.92 h
- check.review: old median 0.07 h mean 0.28; new median 0.05 mean 0.07
- check.repair: old median 0.19 mean 0.61; new median 0.03 mean 0.08
- check.fix: old n=31 median 0.92 mean 1.89; new n=14 median 0.45 mean 0.50
- merge: old median 0.25 mean 0.46; new median 0.23 mean 0.25
So most of round 1's check-wait and rework hours are already gone. Any saving must be priced against the new numbers.

V2. E's post-merge wake bug (C-CHAL-1, D-Wake) is not real. For all 13 prerequisite pairs, the dependent's first plan.synthesis prompt came 0.2-0.9 min after the prerequisite merged (timings.jsonl prompt events). The 0.6 h median merge→implement gap is the dependent's own plan synthesis (8-615 min, median ~40 min).

V3. The 600 s shell cap is ours: ~/.pi/agent/extensions/tamdoma-pi-tweaks/shell-timeout.ts sets DEFAULT 120 s, MAX 600 s and tells the model "run anything longer in the background and poll its log". B's "pi has no default timeout" missed this extension; D was right. After D10 most leaf checks are cheap (0.4 min), so this now matters mainly for whole-suite runs (merge verify 6-10 min, reproducing reruns).

V4. check-issue :79's "missing evidence machinery ends the pass failed" is a locked operator decision (akrogon issues/closed/pre-written-tests/test-proof-rules brief.md:7, :16, :22-23, design Q1 1a: no leaf builds machinery to prove its own product; missing machinery is a prerequisite leaf). The same locked decision says repair seats never write or edit planned tests; A alone has the one-wrong-expectation exception. Proposals to let B edit test expectations change that decision; price them against V1 (check.fix is now 0.45 h median, not 1.55 h).

V5. Failures since 10-14 12:00: 11 failed moves (page-speed-ranking, schema-value-flags, promotion-script x3, playback-one-browser, nav-proof x2, render-fixture-once, selftest-no-copies, prior-disavow-lookup). Dwell 0.07-0.65 h only because the operator and A were awake and recovered them. Recorded reasons include three missing-machinery stops (criterion 1 variant-parity launch-budget check; criterion 6 next-stage consumer replay; prior-disavow-lookup criteria 2/3 capture/replay), one akrogon green-retry admission bug (since fixed), and others not retained: state.failure is cleared on recovery and log.jsonl has no reason field. Overnight nobody recovers, so a failed leaf now waits hours.

V6. Merge queue: of 26 merge arrivals since 10-14 12:00, 12 found an empty queue, 6 found 1 waiting, 7 found 2, 1 found 3. 24 merge_turn waits. Batching O1 stays approved.

V7. WIP and work supply: framework now has 4 open leaves (2 active, 2 waiting on prerequisites). The akrogon repo has few. Lead time per leaf is falling; throughput may now be capped by how fast charting produces ready leaves.

## Questions (disagreement-only where you agree with A's merged reading below)

A's merged reading: the polling and rework hours of round 1 mostly disappeared with D10 and the gate removal (V1). The constraint has moved to (i) leaves stopping in `failed` and waiting for a human, (ii) dependency depth times per-leaf lead time, (iii) intake: charting throughput and the attended door. All four of us reject stacking, more seats, caps, and rebuilding a test selector.

R1. Given V1-V7, what is now the binding constraint and the single systemic flaw that moves the needle most? Show the arithmetic on the new numbers.
R2. Failed stops (V4, V5): without overturning the locked no-own-machinery rule, how should the system handle a stop so it does not wait for a human overnight, while staying simple? Is the right sensor earlier (plan.synthesis/charting already must refuse missing machinery: why did three leaves get past it?), or is `failed` the wrong state for some of these causes?
R3. Anything in your round-1 answer you now withdraw or re-rank because of V1-V7.
R4. One thing in another consultant's answer you think is wrong, with evidence.

Same research and output rules as round 1. Write to the return file in your prompt. Keep it under 80 lines.
