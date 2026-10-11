# Why four-hour leaves are possible: independent analysis B

The measured bottleneck is A rebuilding and debugging acceptance machinery in check.fix. Worker assignment contributed, but the larger failure starts at handoff and proof design: one broad leaf must change many contracts and establish a new live build harness before any of its work can leave the system. A green worker test or proof-case count did not establish the required outcomes.

Read-only snapshot: 2026-10-10, approximately 20:21 UTC. No other system slot was read. Paths below use `F` = `/home/ivan/Work/infra/tamdoma/framework`, `L` = `F/issues/open/formspark-api/formspark-build-wiring`, `W` = `F/issues/worktrees/formspark-build-wiring`, and `K` = `/home/ivan/Work/infra/akrogon`. Log references mean `F/issues/log.jsonl`. Times are elapsed between consecutive records for the same slug, not CPU time, uninterrupted agent work or billed time. Skill and chart rules are their current versions. Their presence now does not prove the same wording governed this leaf when it opened.

## 1. Stocks

- S1. Unaccepted required outcomes, unit: criterion or independently verifiable behavior. Seven criteria include multiple blueprint paths, two-offer preservation, refusals, provider submission and report evidence (`L/brief.md:16-23`). Eight implementation units do not mean eight completed acceptance outcomes (`L/implementation/report.md:3-16`).
- S2. Open defects and missing evidence, unit: finding. Initial review names F1-F6; later repairs introduce F7-F12. This is twelve distinct findings over time, not twelve simultaneously open defects (`L/review-B.md:12-60,228-244,288,307-329`). F3, the real proof gap, survives all three reviews (`:28-36,303,354-366`).
- S3. Unlanded changed code and proof infrastructure, units: changed files, insertions and commits. The first review head records 105 files / 2,291 insertions; round-two return records 112 / 4,475; entry to round three records 114 / 4,508 (log 2308,2370,2372). Counts include fixtures/docs and do not measure complexity directly. Accumulated commits and elapsed minutes are historical cost, not a backlog that another repair removes.
- S4. Work occupying lifecycle seats, unit: active leaf. All eight units and their proof remain one mergeable leaf, routed through A for implement/check.fix and B for repair/recheck (`K/src/routing.ts:29-39,55-56`; `L/plan.md:54-72`). There is no separate discharge of a finished implementation unit into main.

## 2. Inflow and outflow

I1. Handoff supplies the initial behavior and proof obligations (`L/brief.md:4-23`). Planning assigns eight units in four waves, with the proof harness last (`L/plan.md:54-72`). Additional repair work enters from failed criteria, checks, worker-interface mismatches and concrete review findings (`K/skills/implement-issue/worker-protocol.md:13-29`; `K/skills/check-issue/SKILL.md:49-53`). This is not evidence of arbitrary reviewer scope expansion: F3 demands the original criterion; F7/F8 and F10-F12 identify defects introduced in its repair (`L/review-B.md:28-36,228-244,307-329`).

I2. Workers discharge scoped changed-test work to A; A still owns criterion proof and all configured checks. B explicitly hands required live runs and missing planned units back to A (`K/skills/implement-issue/worker-protocol.md:25-27`; `K/skills/check-issue/SKILL.md:75`). A passes back to review only after the required evidence, then review's aggregate verdict gates merge (`K/skills/implement-issue/SKILL.md:63,84`; `K/src/phase.ts:290-305`). A commit alone does not remove an acceptance obligation.

Measured activity: 21 commits during first check.fix, 20 titled `proof:`, over 263.15 minutes. Second check.fix adds 13 commits, all titled `proof:`, over 230.70 minutes. That is about 4.8 and 3.4 commits/hour, respectively. Source: branch committer timestamps within log 2310→2340 and 2344→2370, including `225e64faf`→`4857af300` and `c5ef3c85f`→`d5db8b991`. These are activity rates, not accepted-outcome throughput. F3 remains open at both exits, so its measured accepted outflow is zero for those rounds (`L/review-B.md:220-244,303`). There is insufficient evidence to calculate model-call utilization or defect arrival/closure rates.

## 3. Bottlenecks and comparison

| Phase | Elapsed minutes | Evidence |
|---|---:|---|
| Implement | 135.11 | log 2307→2308 |
| Initial review | 5.26 | 2308→2309 |
| B repair 1 | 6.72 | 2309→2310 |
| A check.fix 1 | 263.15 | 2310→2340 |
| B recheck 2 | 8.93 | 2340→2343 |
| B repair 2 | 9.98 | 2343→2344 |
| A check.fix 2 | 230.70 | 2344→2370 |
| B recheck 3 | 2.63 | 2370→2371 |
| B repair 3 | 5.73 | 2371→2372 |

Completed phases total 668.21 minutes, including 493.85 minutes in A's two check.fix passes, about 74%. Round three was still check.fix in the snapshot (`L/state.yaml:2,20`; log 2372). Review time is not the dominant bottleneck.

The report's first serial case measured about nine minutes, but its 13-case, roughly 100-second result used the wrong proof path (`L/implementation/report.md:34`; `L/review-B.md:32-36`). The intake reports reruns around ten minutes. Neither phase logs nor retained report text provide a complete timestamped list of actual reruns. Commit spacing is not command duration. Do not claim every one of the 263 minutes was spent waiting on ten-minute commands.

Three comparisons from the same day's log:

- C1. formspark-integration: implement 21.09 minutes, review 4.88, repair 6.27 (2302→2305). The sibling's same feature area does not inherently require a four-hour phase.
- C2. site-media-publisher: implement 75.88 minutes; completed check.fix episodes 38.36, 79.83 and 17.32 (2289→2290,2292→2293,2294→2295,2297→2298). Repair cycling occurs elsewhere, but none of these episodes reaches four hours.
- C3. dist-capture-disk: implement 49.61 minutes; check.fix 12.70, 11.08 and 50.25 (2311→2324,2337→2339,2348→2353,2354→2360). Repeated repair is a pattern. The extreme duration here is not demonstrated as universal.

## 4. Reinforcing loops

- R1. Inadequate proof → review demands the real outcome → harness grows → harness defects → another repair. U8 was assigned a scratch prep skill and helper tests, and its worker was forbidden live runs (`L/implementation/brief-8.md:8-22,45-50,72-74`). The brief required real blueprint builds (`L/brief.md:17`). Review F3 exposes that mismatch, then F7/F8 and F10-F12 arise in the replacement harness (`L/review-B.md:28-36,228-244,307-329`). Each iteration increases work before accepted evidence exits.
- R2. Slow proof discovers shared machinery defects → in-branch repair → changed-stage/consumer rerun → more discovery. Reported repairs touch session environment, process exit handling, consumer mutexes, context injection and batch handoffs (`L/implementation/report.md:20-23,55-57`). The standing rule explicitly permits some other-leaf bugs to be fixed in-branch and requires downstream reruns (`/home/ivan/.claude/skills/chart-issues/assets/standing-design.md:15`). The observed sequence supports this loop, but not a precise count of reruns per defect.
- R3. Local green evidence → continued work on remaining cases while acceptance debt persists. The current runner excludes not_run cases when calculating pass (`W/.claude/workflow/scripts/run-formspark-build-wiring-proof.ts:350-362,2207-2227`). Its report at `F/.temp/proof-34b/consumer/.temp/formspark-build-wiring-proof/report.json`, `run_at_utc=2026-10-10T20:00:59.156Z`, says pass=true with only real-site-form run and eighteen cases not run. This is valid subset information, but an unsuitable sensor for whole-leaf completion. The earlier 13/13 claim was also green without the required blueprint path (`L/review-B.md:34`).

## 5. Balancing loops and miscalibration

- B1. Leaf admission targets owned observable outcomes and independently provable prerequisite parts, not a bounded total proof burden (`/home/ivan/.claude/skills/chart-issues/assets/shapes.md:286-288`). This leaf nevertheless bundles contract migration, wiring, blueprints and new live evidence infrastructure (`L/brief.md:4-23`; `L/plan.md:54-72`). Inference: the admission boundary failed to separate changes whose proof infrastructure was not yet dependable.
- B2. Worker sizing targets paths/turns. U8 says 2–3 files and under 60 turns, while done-when is helper tests and script loading, not actual acceptance dispatch (`L/implementation/brief-8.md:60,72-74`). A worker can satisfy that target while the leaf inherits the expensive missing work. Wave concurrency improves coding capacity, not the A-owned final-proof bottleneck (`K/skills/plan-issue/SKILL.md:59-61`; worker protocol `:25`).
- B3. The fix_rounds cap measures phase entries, not attempts within a phase. It checks B-repair/merge→A-fix transitions; the third entry is allowed and a later entry fails (`K/src/phase.ts:307-320,154-157`). Red criterion proof becomes another sub-brief without a phase move; exhausted worker turns become remainder briefs (`K/skills/implement-issue/worker-protocol.md:21,27`). Thus three rounds do not bound minutes or internal repairs. This explains why a correctly enforced cap still permits four-hour passes.
- B4. Review is the effective quality brake, but it acts after expensive proof development. F3 catches missing original outcomes; later rechecks catch real server, label and response-evidence defects (`L/review-B.md:28-36,309-329`). Lowering this bar would release incorrect work. Move fidelity checks earlier instead.
- B5. Proof sizing exists but was misapplied. Planning requires command, failure caught, size and rerun trigger (`K/skills/plan-issue/SKILL.md:61`). Here verification describes prep dispatch, serial sessions and a submission fallback while acceptance requires complete builds and actual built-page delivery (`L/plan.md:82-90`; `L/brief.md:17,21`). Current standing design already requires cheapest sufficient evidence and parallel independent live sessions (`standing-design.md:9-15`). The observed plan does not justify its sequential rule with a named shared resource. File size is not a substitute for proof cost.
- B6. The 60-minute notifier senses recorded busy episodes, not remaining work or phase age, runs only during next, and has no corrective action (`K/src/next.ts:230-260`; `K/src/phase.ts:152-153`). The watch's normal-busy rule can skip next (`K/skills/watch-issues/SKILL.md:36,40`). Repairing that sensor might expose the cost sooner. It cannot remove S1 or shorten a required live build.

## 6. Root cause and highest-leverage changes

Root cause: the leaf is the acceptance and merge boundary, but the assigned proof unit was a smaller, different task from the leaf's acceptance contract. That left A holding a broad implementation plus unresolved evidence infrastructure. Review correctly returned the missing proof. The repair protocol then let A keep growing and debugging that infrastructure inside one phase, with the same acceptance debt and no internal attempt boundary. Eight workers, three fix rounds and a 60-minute notice measure different things from accepted outcome flow. The records support this mechanism in this case, not a claim that every long leaf has the same cause.

- D1. Move the boundary upstream: chart independently provable contract/wiring changes and reusable proof machinery as prerequisite outcomes where they can ship with their own proof. Keep full real build acceptance only on the leaf that owns that integration outcome. Apply the existing split/spine rules rather than inventing size counters (`shapes.md:286-288`; `standing-design.md:14`). Cost: more merge/dependency steps, and splitting can invite partially wired behavior. Keep feature exposure gated until the final integration outcome. Changing the current emitted contract requires operator agreement, not an agent silently relaxing its criteria.
- D2. Change the worker success target: its proof must catch the same failure the leaf criterion names. Before building a large matrix, demonstrate one complete real path with its real output artifacts, then extend coverage or replay unchanged model/outside stages where the approved contract allows it. U8's scratch route and helper-test success must not stand in for the real build (`brief-8.md:12-22,72-74`; review F3 `:32-36`). Label subset passes explicitly and account for missing required outcomes separately. Cost: slower first acceptance-path bring-up, but earlier discovery of the actual bottleneck. It must not turn one representative path into permission to omit explicitly required paths.
- D3. Change the repair rule at the existing boundary: a required proof whose architecture or execution path is wrong returns for plan/scope correction through the existing failed route, rather than automatically becoming another implementation sub-brief until green. Preserve bounded, local repairs with a known cause and cheap independent proof. The current worker rule `:27` and A replay loop (`K/skills/implement-issue/SKILL.md:78`) have no matching internal work limit. Cost: earlier visible failures and an attended correction can delay delivery. An overly strict rule would bounce ordinary bugs, so distinguish replacement of missing proof machinery from repairing a defect in an established path.

These changes reduce admitted work and repeated proof rebuilding. An absolute promise that no leaf can ever last four hours still requires an agreed scope/effort limit or timeout. Existing valid live obligations and external execution variability cannot provide that guarantee by themselves (`L/brief.md:17-21`; `K/skills/plan-issue/SKILL.md:61`). No timeout or new monitor is recommended as the root fix.
