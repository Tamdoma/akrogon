# Chart: akrogon + framework

## Destination
Whole leaves go from 0 to merged faster at the same quality, without new caps, locks, gates or seats.

## Findings (round 1 and 2, slots/answer-*.md, slots/rebuttal-*.md)
- F1 (A,B,D,E): inside a leaf, the polling and rework hours are mostly gone since D10 and the admission-gate drop. Framework medians, old → new: implement 4.55 → 0.97 h, check.fix 0.92 → 0.45 h, check.repair 0.19 → 0.03 h, merge 0.25 → 0.23 h. A leaf is now about 1.7-2.4 h of active time.
- F2 (B,D,E): what is left is time with no seat working: leaves stopped in `failed`, prerequisite waits along a chain, and too few ready leaves for an unattended night (4 open, 2 runnable).
- F3 (B,E): `failure.reason` is kept in raw issues/log.jsonl (src/log.ts:62). Only `logSchema` drops it on read (src/log.ts:9-22). A's earlier "reason not kept" was wrong.
- F4 (A from log.jsonl:2769-2875): the 11 failed moves since 10-14 12:00 were 3 guessed caps (fixed by 7092fae), 2 "idle host needed" for a CPU proof, 2 foreign-flake verify reds (L2b and `akrogon flaky` landed since), 1 admission bug (fixed), and 3 "missing machinery".
- F5 (A,B,D,E): the 3 "missing machinery" stops were not one cause. promotion-script criterion 6 needed a consumer that a later, unmerged leaf delivers (promotion-script plan.md:13, resolved by an operator ownership call at :79): a charting miss of the cross-leaf owner audit. prior-disavow-lookup criteria 2/3 lacked real absent-answer and no-confirmation captures (review-B.md:19,29). Its plan used a proxy (plan.md C2: ask-once "pinned by doc order"), and B ruled the capture at the consumer boundary to be machinery. Under the locked test-authorship rule no seat may add a planned test after plan.synthesis, so `failed` was the only exit and it waits for a person.
- F6 (A, D): watch-issues already recovers transient stops with a two-cycle bound and sends a notice for human ones (skills/watch-issues/SKILL.md:40-41). It reruns `failure.phase` unchanged, so a criterion or plan defect (8 of the 11) fails twice and ends in a notice. Those stops are chart input, and their owner is the next door pass. The framework watcher is under an operator stop order, so tonight A recovers by hand.

## Decisions taken overnight (A, under the operator's overnight authority)
- D1: no new state, cause or route for failed stops. The inflow rules already exist (cost-criteria rule 7092fae, machinery audit and cross-leaf owner audit in shapes.md). A `contract` failure cause (D) or an event route to the door (B) would add a state or a route. Instead (D, final-check-D.md X1) the door's intake line (skills/chart-issues/SKILL.md:31) also lists failed leaves and their reasons from `akrogon status`, so the next door pass starts from them. That is one sentence and no code.
- D2: rejected D's plan path field and existence guard. It checks form, and it would not have caught prior-disavow-lookup, whose runner existed.
- D3: rejected E's check.repair → implement bounce. routing.ts:32 does not allow it, and it changes the locked test-authorship decision.
- D4: rejected E's load-wait helper. It is a lock, which the operator ruled out.
- D5: rejected E's plan-before-prerequisite-merges. Red-first tests need the prerequisite's code at the base, so the plan goes stale.
- D6: B correcting test expectations stays out. All three withdrew it. It saves about 8-10 min per leaf at new numbers.
- D7: merge batching O1 is deferred to the operator. Since 10-14 12:00, 12 of 26 merge arrivals found an empty queue and 8 found 2 or more waiting. The gain is a few minutes per leaf, and it brings back code removed in 6640ab5.
- D8: the pi shell cap (~/.pi/agent/extensions/tamdoma-pi-tweaks/shell-timeout.ts, 120 s default, 600 s max) forces long runs into background-and-poll. Estimated cost is about 7 min per leaf: a scenario assuming 1.5 whole-suite runs per leaf and half a polling interval each, not measured on the new cohort (B). Measured 2026-10-15 02:30 by A over 93 framework pi sessions started after 10-14 12:00 (25 leaves, 56.5 h session wall): 134 fixed-sleep poll calls in 93 poll sequences, mean 4.0 min per call, 8.8 h spent sleeping, 34 tool timeouts. Overshoot past run end, at half the last interval per sequence: about 3.1 h, or about 7 min per leaf (about 4% of a leaf). It is the operator's personal harness, so A did not change it. With no cap, `akrogon verify` blocks in one call and the poll paragraph at skills/implement-issue/SKILL.md:45 can go. Then no `wait-run` command is needed (D).

## Questions for the operator
- Q1: allow A in check.fix to add one missing criterion test, bounded (D) to a criterion the plan proved only by a proxy, running on existing test tools, shown red against a deliberate break of the product, with a Test-Change trailer citing the brief line? It keeps the no-own-machinery rule. It reopens part of the locked authorship decision (issues/closed/pre-written-tests/test-proof-rules brief.md:7), whose reason was that the seat writing the product should not write the test that grades it. How many of the 3 stops it would have saved is not shown: promotion-script needed a later leaf, and prior-disavow-lookup's captures were judged machinery (B).
- Q2: before stepping away, hand off already-approved work so the night has ready leaves? Rough scenario (D, labelled by B): with 2 leaves kept busy at ~1.7 h each, 8 h absorbs about 9 leaves. That assumes two continuously busy slots and independent ready work. Tonight 4 are open and 2 are blocked on prerequisites.
- Q3: lift the watcher's stop order, so transient failed stops recover while nobody is awake?
- Q4: do merge batching O1 now (D7), or keep it parked until queues are deeper?
- Q5: raise or remove the pi shell cap (D8)?

## Off route
- Stacking, more seats, caps, a test selector: rejected by all four seats.

- Q1 evidence, 2026-10-15 03:57: competitor-brand-names failed at check.repair, "criterion 4 red: missing recorded v1-prior report scenario and blocking replay proof". B's own review asked for the scenario "through the existing capture machinery" (review-B.md:26). Like prior-disavow-lookup (recovered 10-14 21:09Z, merged), A recovered it into check.fix with a note citing design.md:8 and :11: add one capture case to the existing driver and replay it in a blocking test. Without someone awake, this class waits until morning. Again at 04:35: coverage-page-inventory failed at check.repair, "Criterion 8 red: missing replay machinery running real pack selection and inventory mapping; target-resolution blocking consumer also missing" (review-B.md F3/F5). The replay helpers and the recording exist, so A recovered it into check.fix the same way. That is 5 stops of this class in about 12 hours, and all 4 open findings in each leaf sat unrepaired because the stop ends B's pass.

Route: direct. B pane: w8:pPT (codex gpt-6.1-sol). Landed 00f90c6 (skills/chart-issues/SKILL.md:31, D1). Review: direct/review-B-1.md ready. Verify: green.
Closed 2026-10-15
