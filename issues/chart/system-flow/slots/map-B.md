# System-flow map B

Read independently on 2026-10-15. No other seat's map read. Read-only investigation, no lifecycle commands or tests run.
Path keys: A = `/home/ivan/Work/infra/akrogon`; F = `/home/ivan/Work/infra/tamdoma/framework`. All evidence below was read on 2026-10-15.
Windows: W0 = Oct 7 06:30Z–Oct 14 06:30Z; W1 = Oct 14 06:30Z–Oct 15 06:30Z. Live inventory is a later snapshot, not a reconstructed W1 boundary.

## Evidence and research

- S1 [operator]: A/issues/chart/sources/systems-thinking-field-manual.txt:81–100 (seven questions), :485–527 (stocks), :1144–1158 (delays), :1680–1691 (constraint and Five Focusing Steps), :2022–2073 (traps), :2400–2431 (leverage). It makes intake and decision delay part of production time and requires finding the next constraint after removing one.
- S2 [better-than-training]: A/issues/chart/system-flow/slots/data-pack.md:12–116. I independently reproduced both repos' merged counts and phase totals from issues/log.jsonl, then clipped the W1 cohort's intervals to W1. Details and corrections below.
- S3 [practitioner]: DORA research team, [Visibility of work in the value stream](https://dora.dev/capabilities/work-visibility-in-value-stream/). Map the complete path, separate lead time from uninterrupted process time, and measure usable handoffs. This changes my recommendation from more worker tuning to measuring and releasing intake.
- S4 [practitioner]: Nicholas Carlini, Anthropic, [Building a C compiler with a team of parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler), 2026-02-05. His 16-agent experiment found test feedback essential and parallel workers ineffective when all faced the same indivisible task. This supports preserving independent proof and fixing real dependencies, not adding agents or weakening gates. His sampling mechanism is not a recommendation here.
- S5 [practitioner]: DORA research team, [Working in small batches](https://dora.dev/capabilities/working-in-small-batches/). Independently useful changes shorten feedback and contain AI-related instability. This supports keeping independently reviewed leaves even when their merge verification is shared. It does not establish an optimal batch size for these repos.
- S6 [practitioner]: Donella Meadows, [Leverage Points](https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/), 1999. Information, rules and goals can outperform parameter changes. The ranking below uses her numbering, with lower numbers higher leverage.

Research synthesis: S3 and S4 agree that output volume without usable feedback is insufficient. S5 favors small independently testable changes, whereas shared verification can lower fixed merge cost. Keep leaf boundaries and gates, and share only already-approved integration work. Neither research nor these short observational windows prove a capacity forecast. No model swap, cap, slowdown, skill deletion or rule-count reduction is proposed.

## Q1. What the system does over time

The path is GitHub seed → chart investigation/operator decisions/proofs → approved contract → prerequisite wait → plan and criterion tests → implementation → review/repair → verified integration → main and source closure. Small direct changes take chart → door implementation → B review → verified main instead. Sources: [better-than-training] A/skills/chart-issues/SKILL.md:39–57,104–114; A/src/routing.ts:27–54; F/issues/config.yaml:8–12.

Framework lifecycle throughput rose from 101/7 = 14.4 merges/day to 31/day. Plan-done→merge median fell 5.8→3.2 hours and merge dwell median 72.3→20.7 minutes. It drained existing work, with zero W1 handoffs and zero open leaves at the live snapshot. This is a successful backlog drain, not evidence of sustainable 31/day production. [S2:59–105]
Akrogon fell from 54/7 = 7.7 lifecycle merges/day to one, but direct changes bypass that lifecycle log. Do not interpret this as a sevenfold productivity collapse. Its W1 lifecycle sample is one run-units leaf. [S2:17–55,106; A/issues/log.jsonl:894–895; A/skills/chart-issues/SKILL.md:104–114]
The system now supplies integration capacity faster than it supplies new approved framework work. Its historical rework remains substantial. The data does not yet establish what fraction survives the latest fixes. [Inference from S2 and Q4]

## Q2. Stocks and their flows

| Stock | Count and inflow | Outflow and interpretation |
|---|---|---|
| Mirrored open seeds | Framework 57, akrogon 2. Seed arrival rate not established by this pack. | Charting does not itself close a seed. Delivery or confirmed duplicate disposition does. Do not treat 57 as 57 uncharted jobs. |
| Charts awaiting an ending | I counted 15 framework CHART.md files without an ending marker, versus pack's 16. | Handoff/direct landing/hold ends a chart record, but a hold does not deliver its seed. Counts are not interchangeable with ready work. |
| Framework lifecycle work | Handoffs W0 80/7 = 11.4/day, W1 zero. | Merges 14.4/day then 31/day, live open leaves zero. Handoff-minus-merge is −21 in W0 and −31 in W1, a partial balance excluding other entries/exits. |
| Akrogon lifecycle work | Handoffs W0 36/7 = 5.1/day, W1 one. Live open leaf: stacked-turn. | Merges 54 then one. Direct-route inflow/outflow is a separate stream, absent from these totals. |
| Work sent back for repair | Framework W0 85/101, W1 24/31 merged leaves visited repair. | Repair returns work toward merge or A's fix. These are cohort visits, not the count currently waiting in repair. |

Evidence [better-than-training]: S2:8–9,28,55,85,97–106; live files under each issues/seeds, issues/open and issues/chart. Exact GitHub identity search found **29/57 framework seeds already referenced in chart Markdown outside slots**. The remaining 28 are merely not found by that search, not proven uncharted.
Concrete distinctions: F/issues/chart/shared-contracts/CHART.md:8–18 has taken forks and no fog; product-facts-intake/CHART.md:8–12 still has an open choice; checkout-event-owner/CHART.md:17–23 is explicitly held while INTAKE.md:7 names still-mirrored #112. These require different actions.

## Q3. Feedback loops

- R1, repair amplification: weak or mismatched boundary proof → escaped defect → repair plus repeated integration → longer branch lifetime → more integration change to absorb. W1 24/31 repair visitors and 15 merge→fix/failed moves across nine leaves are observations consistent with this loop, not proof of every causal arrow. [S2:80–87; S4]
- R2, maintenance feeding itself: failures produce seeds and factory improvements, improvements occupy the chart door, product intake waits, and pressure invites another optimization pass. Present evidence is zero framework handoffs, 57 open seeds and several recent factory direct landings. Resource displacement is a hypothesis, not measured door utilization. [S2:97–106; A/issues/chart/overnight-recs/CHART.md:15–18]
- B1, product quality: goal = brief criteria and no regression; sensor = independent review, planned boundary proofs, exact-tree verify; correction = B repair/A fix and rejected merge. Sensor sees tested behavior, not all customer outcomes. A green helper test cannot prove an unobserved consumer state. [A/skills/plan-issue/SKILL.md:61–69; A/src/verify.ts:63–81; S4]
- B2, prerequisite safety: goal = consumers receive landed producers and required inputs; sensor = dependency/input state; correction = wait, then dispatch. It sees availability, not whether the original dependency was necessary. Keep real dependencies. [A/src/next.ts:784–807]
- B3, human authorization: goal = intended scope, authorized effects and sufficient proof; sensor = chart forks, fog, readiness and operator answers; correction = clarify or hold. An ending marker alone cannot tell whether the customer got the result. [A/skills/chart-issues/SKILL.md:47–57,104–114; S3]

## Q4. Delays

- Framework median implementation dwell barely changed, 87.4→84.0 minutes; check.fix rose 48.0→92.7 minutes among visitors. Review rose 7.9→11.9 minutes. These are phase residence times, not CPU or agent-active times. [S2:63–84]
- Check-start waits fell from median 8.2 minutes in the instrumented tail of W0 to zero in W1. Totals 90.9→0.4 hours cover unequal observation durations and concurrent waits. They cannot be added to phase savings. [S2:91–96]
- Dependency delays are material: the pack traces examples of 18, 27 and 35 hours before planning. Actual planning mostly takes 10–45 minutes. Do not call these planning execution costs. [S2:101–102; B2]
- The W1 cohort's reported 60.91 hours in check.fix includes time before W1. Clipping every interval to the window gives **37.03 hours**, versus 33.79 implementation, 13.44 review, 12.08 repair and 10.45 merge. They remain overlapping leaf-hours, not elapsed factory hours. [Computed from F/issues/log.jsonl]
- Two check.fix visits contribute 14.32 of those 37.03 hours: backlink-audit-spine 6.90 and technical-pack-selection 7.42. Their earlier problems included invalid capture boundaries and recapture ordering, not simply slow tests. [F/issues/log.jsonl:2704,2707,2757–2758; closed/backlink-audit-run/run-unblock/backlink-audit-spine/review-B.md:8–20; closed/backlink-audit-run/service-coverage/technical-pack-selection/review-B.md:51–61]
- Recorded framework W1 merge-scope verifies: 25 terminal runs, 18 green, seven red, median 5.65 minutes. These are different from 45 merge attempts and 15 red phase exits. [Computed from F/issues/verify-runs.jsonl:1–66; S2:86,90]

## Q5. Binding constraint now and next

Now: supply of authorized, executable framework work. No worker optimization can complete an unhanded contract. It is not yet proven whether missing decisions, handoff preparation or door attention dominates that supply constraint. [Q2; S1:1680–1691]
Next, once supply resumes: likely rework and real dependency chains. Exact current service capacity is unknown. Merge batching is already being implemented and should not be proposed again; further merge tuning cannot help an empty merge queue. [Q4; S2:115]
Five Focusing Steps: identify the supply gap; exploit already-settled authorized work; direct attention to its missing handoff steps; add capacity only if those steps are shown to require it; then remeasure after releases. Here “subordinate” means choosing useful work, not imposing worker caps or delaying checks. [S1:1688–1691; inference]

## Q6. Traps now or within six months

- T1, wrong goal: celebrating faster leaf merges while open source issues age, or treating direct work as zero output. Countermeasure I1/I3. Current measurement boundary already permits this error. [Q1–Q2; S1:2060–2073]
- T2, shifting the burden: repeated door intervention and factory tuning replace routine delivery and repair ownership. This is a risk, not established addiction. I1/I2 remove avoidable attention demands. [R2; S1:2042–2053]
- T3, rule beating/drifting goals: making checks cheaper by removing meaningful coverage or letting a repair author create its only acceptance oracle. Preserve independent planned proof, red-first regression evidence and exact-head integration. [A/skills/check-issue/SKILL.md:79–91; S4]
- T4, delayed overcorrection: judging fixes immediately from cohorts largely exposed to old rules and adding another layer. Report exposure dates before deciding another intervention. [Q4; S1:1144–1158]
- T5, commons pressure: renewed inflow can contend for browsers, disk and outside services. No current evidence justifies a cap. Investigate repeated resource-specific failures and remove shared mutable fixtures where proven, rather than infer saturation from load or phase dwell. [S1:2029–2035; F/issues/config.yaml:3,8–12]

## Q7. Top interventions, highest leverage first

### I1. Make the door's next outcome an approved source delivered, starting with settled work. Level 3, goal.

Bottleneck: 57 mirrored framework seeds, zero W1 handoffs, zero live leaves. Start by separating delivered/held/open-choice/ready candidates using existing provenance, then finish authorized contracts. Shared-contracts is a candidate to inspect, not proof that every grant and handoff approval is ready. The current settled-chart release rule already exists. Execute it rather than add another rule. [S2:97–106; A/skills/chart-issues/SKILL.md:47; F/issues/chart/shared-contracts/CHART.md:8–18]
Estimated gain: **0–24 hours per eligible seed** if this prevents one further day of avoidable pre-handoff waiting. Arithmetic is one avoided day, not a measured average or a 57-seed forecast. Genuine human prerequisites retain their full delay. The observed Oct 10 decisions show aging, not five days of avoidable work.
Quality: keep all probes, grants, B handoff review and final verify. Stability at six months: old approvals and overlapping seed identities could produce duplicate or stale contracts, so check existing source ownership and current preconditions at handoff.
Complexity: remove manual repeat triage and unnecessary waiting behind unrelated charts; add no scheduler, buffer target, rule or code file. Evidence: operator S1, practitioner S3/S5, repository paths above. This is an operational priority change.

### I2. Resolve the contradictory owner for an already-planned live repair. Level 5, rules.

Concrete remaining defect: A/skills/check-issue/SKILL.md:79 first says B replays exact planned live proofs and keeps such product repairs, then ends by assigning product defects needing a live rerun to A. One paragraph sends the same class of repair both ways. Qualify the latter clause so exact, already-authorized planned proof stays with B. New/widened live actions, missing cases/recordings and changed expectations retain A's path.
Bottleneck evidence: backlink-audit-spine explicitly handed its repair to A because it required a live recapture, then returned for B re-check; its fix visit lasted 6.90 hours. Technical-pack-selection also handed live recapture to A, but had a separate plan correction, so it would still need A. [F/issues/closed/backlink-audit-run/run-unblock/backlink-audit-spine/review-B.md:88–117; F/issues/closed/backlink-audit-run/service-coverage/technical-pack-selection/review-B.md:105–108; Q4]
Estimated gain: **about 0.20 hours per otherwise B-repairable leaf**, using W1 median re-review residence 11.9/60 as a rough avoided-pass proxy. Actual re-check-specific median is unknown. Do not claim the whole 6.90 hours: repair, recapture and checks still run. Gain is zero if another A-only change remains.
Quality: B must pass acceptance proof written before its repair by another seat. A still authors missing acceptance cases. Genuine recapture provenance and cleanup remain required. Stability: confusing “planned” with permission to expand targets would be unsafe, so preserve exact command, identity, grant and scope boundaries.
Complexity: repair one contradictory qualifier, unchanged rule count, no new phase, guard or file. Evidence: operator S1, repository :79/:83/:91, practitioner S4 for preserving trustworthy autonomous feedback. This is not the dropped rule-consolidation project.

### I3. Use one source-to-main view of existing records for the next comparison. Level 6, information.

Bottleneck: current evidence cannot measure seed-to-merged time, conflates mirrored seeds with uncharted work, misses direct landings, and calls the whole W1 period “after the fixes.” Join existing GitHub identities, chart decisions/ending, leaf phase events and direct landed SHAs. Show current age and waits as well as completed cohorts. Separate wall time, summed leaf-hours and machine check time. Do this in the existing chart report first, without a new telemetry service.
Estimated direct gain: **0 hours per leaf**. This is decision support, not an execution speedup. Any later savings belong to the intervention it correctly selects and must not be counted twice.
Quality: retain raw records and unknown timestamps; do not close seeds based on a marker or match alone. Stability: reopened sources, one source owning several leaves and abandoned charts require explicit ownership joins rather than filename guesses.
Complexity: replace ad hoc incompatible counts with one derived table in the existing report, no new lifecycle state, writer or daemon. Evidence: S3/S6, A/src/verify.ts:116,174–183, A/skills/chart-issues/SKILL.md:111–114 and Q2/Q4. It is useful alongside I1, not a prerequisite that holds up delivery.

## Data limits and unexplained points

- F1: “After all fixes” is false for most W1 exposure. The G1/G2 commit on main is dated 2026-10-15 06:15:52Z, only 14 minutes before the cutoff, and stacked-turn is still open. Source: A git commit 63e2479 and S2:115. No completed post-G1/G2 cohort establishes its effect yet.
- F2: The handoff medians cover only 8/31 framework W1 completions and 72/101 W0 completions. Subtracting 15.6−3.2 hours is not a valid median waiting-time estimate, especially across these different samples. First tracked state commit can also lag manual handoff. [S2:7,61,76–77]
- F3: The “zero merge checks” timing count is not absence of verification. Verify scope is recorded separately while checkedRun receives caller fields; F/issues/verify-runs.jsonl:66 records a real green merge verify. Use verify records for that measure. [A/src/verify.ts:116,155–183; A/src/run-check.ts:210–215]
- F4: I count 15 unended framework chart files, not 16. The pack's snapshot and mine may differ. More importantly, ending markers and open seed mirrors cannot establish ready backlog, source arrival rates or customer completion. [Q2]
- F5: Non-zero check exits include intentional red-first proof. The 247/786 count is not a 31% product defect rate. Similarly, successful verify reruns are not independent changes. [S2:94; A/skills/plan-issue/SKILL.md:69]
- F6: Stock snapshots, direct-route elapsed times, active work versus stopped/manual dwell, and post-merge escaped defects are incomplete. The current evidence supports fixing intake flow and the concrete ownership contradiction. It does not support a quantified whole-factory speedup or another general test-speed redesign.
