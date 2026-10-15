# Consult brief: whole-system speed (akrogon + framework)

Operator ask (verbatim): "Think about all aspects of the system that could be a bottleneck and make sure to look at the logs to check all of them and then consult with the consultants to see if we can get a breakthrough. Don't just look at individual parts of the system but look at them individually and then as a part of the whole to see what balancing loops we can fix so that the system doesn't break, it still is high quality, but the whole thing, not just merges, goes faster."

Standing operator constraints: no CPU caps or locks, no slowdowns; simplest systemic fix, remove code where possible, no stacking of patches; quality must not drop; don't delete skills.

Already decided or landed (do not re-propose): D10 leaves run `checks` (cheap) plus own proofs, full verify only at merge; admission memory gate and 48 GiB limit dropped 2026-10-14 (src/admission.ts:127); green-rate L1-L3 landed (akrogon dba0c5c: no copied lists rule, repair→merge needs a green leaf receipt, repair reruns the narrowest reproducing command, `akrogon flaky`); framework copied-list removal is landing now; merge batching O1 is approved and queued next (minimal batch, skip a follower whose head already failed).

## Measurements (framework, leaves merged since 2026-10-12 12:00, n=42 unless noted)

Sources: framework issues/log.jsonl, issues/timings.jsonl, pi session transcripts under ~/.pi/agent/sessions, leaf review-B.md files. Scripts and raw tables are in the A seat; ask if you need one re-run.

M1. Lead time first visit → merged: median 9.0 h, mean 9.8 h, p90 28.8 h.

M2. Time per leaf by phase (mean h): plan.synthesis 5.43 (almost all prerequisite wait), implement 2.89, check.fix 1.55 (1.0 visit/leaf), merge 0.56 (1.5 visits), check.repair 0.47, failed 0.41 (0.6 visits/leaf), check.review 0.41 (1.9 visits).

M3. WIP: sampled every 10 min over 58 h, active leaves (implement/check/merge) mean 5.6, median 6, max 13, against max_active 24. 23% of the time ≤3 active, 10% zero. Load avg now ~2-4 on the host. Slots are not the limit.

M4. Dependencies (414 leaves, 145 with blocked-by; recent set: max chain depth 3). 25 edges on the 12 longest waits: 16 real code/data consumption, 6 data plus a shared spine test file, 3 shared-file only, 0 pure ordering. Waits on prerequisites: mean ~19 h per waiting leaf (15 leaves). In all 13 checkable pairs the prerequisite passed check.review 1.3-23.7 h (median ~5 h) before the dependent started; the dependent started 0.1-10 h (median 0.6 h) after the prerequisite merged. So a dependent waits for the prerequisite's whole review→repair→merge tail.

M5. Review loop. Transitions since 10-12: check.review→check.repair 47, check.repair→check.fix 31 (B hands ~2/3 of repairs to A), check.fix→check.review 43. Nearly every first review is fix. First-round B findings over 30 leaves: 76 Fix (median 3/leaf): (b) code defect tests missed 33, (a) done-criterion proof missing 18, (c) test weakness 8, (d) deviation from brief/design/plan 8, (f) required check/proof result missing 7, (e) doc drift 2. Hand-to-A reasons: test-expectation correction 9 leaves (check-issue :79 forbids B correcting a test expectation), plan/design change 6, live run 4, missing unit 1.

M6. Inside implement and check.fix (8 visits, 66 h wall, pi transcripts): 70% of wall is the agent sleeping/polling on background checks, 14.5% waiting on its workers, 8% model generation, 4.5% direct check commands. Sleeps of 540-590 s between polls are common despite implement-issue :45 ("never sleeps a fixed interval"), because the pi bash tool times out at ~600 s. 121 tool timeouts. Admission-gate waits were ~30% of wall in that sample (gate now removed).

M7. Check cost (timings.jsonl since 10-12 12:00): test_changed (leaf) 90 runs, median 16 min, p90 23 min, max 153 min, 44% red. Full verify at leaf scope 108 runs, median 7.4 min, 46% red. selftest 86 runs, median 2.4 min, 35% red. cheap 129 runs, median 0.4 min. Since 10-14 12:00 alone: 31 full `framework:verify` runs outside merge (implement, check.fix, check.repair, even plan.synthesis), ~50% red, 6-15 min each, mostly after red merges (reproducing command was the whole suite) and on leaves whose criteria name a whole run.

M8. Failures: 21 classified earlier: ~6 GitHub auth (gh auth/setup-git), ~5 host memory admission (gate since removed), 4 criterion red (missing evidence machinery, timing cap), 1 akrogon green-retry bug, rest verify reds or stalls. 13 more `failed` moves since 10-14 06:00; e.g. prior-disavow-lookup review-B.md:193 "criteria 2/3 red as an evidence gate ... missing machinery".

M9. Merge: verify ~5-6 min median; green rate was 80% (17:46-22:00 on 10-14); merge_turn wait 0.1-0.17 h/leaf.

## A's first reading (challenge it)

The system is not capacity-bound (M3). Lead time is three serial loops:
1. Dependency loop: a dependent cannot start until its prerequisite clears review, repair and merge (M4). Chain depth multiplies every other delay.
2. Rework loop: first-pass yield at review is ~0% (M5); each round costs a review visit plus a repair or A visit (~2.5 h/leaf). A third of findings (a, f) are missing proofs/results, which A could have seen itself.
3. Check-wait loop: agents spend most implement/fix wall time waiting on 7-16 min checks they poll every ~9 min (M6, M7); red checks cause reruns.

Balancing loops and their sensors/targets as A sees them: review (sensor B's review, target done-criteria) — correct but late; merge verify (sensor full suite, target green main) — correct; host load (sensor was memory gate, now removed). Reinforcing loop: red merge → whole-suite reruns in check.fix → more load and wall time → more timeouts/flakes → more red merges.

## Questions for each consultant (answer independently, no peer files)

Q1. Which constraint is the real bottleneck of the whole system (theory of constraints view), and is A's three-loop reading wrong anywhere? Use the numbers above; say which number would change your view.
Q2. For each loop (dependency, rework, check-wait, failures/infra, merge), the single highest-leverage change that removes the problem class rather than guarding it. For each: expected lead-time gain (rough, with arithmetic from M1-M9), what it could break later, and whether it removes or adds code/rules.
Q3. Dependencies specifically: is starting a dependent on the prerequisite's branch once the prerequisite passes check.review (stacked branches) worth its risk here, or is there a simpler way (e.g. charting interface-first leaves, or fewer/truer edges)? Cite practitioner experience with stacked diffs/merge queues.
Q4. Rework specifically: what raises first-pass yield without adding a ceremony step? Should B be allowed to correct a test expectation when the brief/design states the expected behavior (removing ~9/30 A round trips), and what keeps that from weakening tests?
Q5. Check-wait specifically: what is the simplest way to stop agents polling with 9-minute sleeps (e.g. an `akrogon` wait-on-run command that returns at exit, or a different run shape), and what makes test_changed take 16 min median?
Q6. What should we NOT do (ideas that look fast but would lower quality or add long-term complexity)?

## Research rule (chart-issues questions tiers)

Ground each recommendation in the strongest source you can find, most recent first: named practitioners or primary docs on agent/LLM coding workflows (2025-2026), stacked diffs and merge queues (e.g. Graphite, GitHub merge queue, Uber SubmitQueue, Google TAP/presubmit), flow and queueing (Little's law, Reinertsen's Principles of Product Development Flow, theory of constraints), and test selection practice. Name each source with title/URL/date. If a search finds nothing stronger than your own knowledge, say so and list the searches. Code claims about this repo cite path:line.

## Output

Write your answer to the return file named in your prompt: reference codes for every item, numbers with arithmetic, sources per claim, a ranked top 3 with your recommendation, and a short "would not do" list. Plain language. No edits to any repo file other than your return file; no commits, phase moves or test runs over 2 minutes.
