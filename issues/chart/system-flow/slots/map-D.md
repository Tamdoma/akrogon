# Map D: seed to merged, both repos and the chart door (blind)

Windows as in the data pack (W0 week before, W1 last 24 h). I recomputed framework log.jsonl, timings.jsonl, verify-runs.jsonl and merge-attempts.jsonl myself; where my number differs from the pack I say so. Read dates: all sources read 2026-10-15.

## Q1 What the system does over time

It runs in batch-and-drain cycles paced by the operator. Charts are handed off in bursts (17 on 10-07, 6 on 10-13, 1-3 on other days; CHART.md markers) and merges follow in bursts (25 on 10-05, 25 on 10-08, 33 on 10-14, 2-6 on the days between; framework log.jsonl `to=merged` per day). Between bursts the factory idles: W1 inflow 0, open leaves 0, 57 seeds waiting. The purpose it serves in practice is "drain whatever the operator charts in one sitting", not "convert reports to merged code continuously". Inside a leaf the dominant behavior is rework: 24/31 W1 leaves took the review-repair-fix loop at least once, 2.2 review visits per leaf.

## Q2 Stocks, with inflows and outflows

| Stock | Level now | Inflow | Outflow | Source |
|---|---|---|---|---|
| Seeds (GitHub reports) | 57, filed 09-30 to 10-14 | 6-12/day (A) | charting: W0 80 handoffs (11.4/day), W1 0 | data-pack, issues/seeds |
| Charts open | 17 not ended | door sessions | handoff same day to 3 days (81 ended, median 0 days) | CHART.md markers |
| Open leaves | 0 | handoffs | plan start; W1 merged 31 (31/day) | issues/open empty |
| Blocked leaves (prerequisite) | 0 now; 15 at the 10-13 12:12 snapshot | chart chains | prerequisite merged; next touch after median 18 h | timings `wait reason=prerequisite` |
| Leaves in rework (check.fix+repair+failed) | 0 now; W1 79.5 h of 206 h lifecycle dwell (39%) | Fix verdicts, merge reds | fix passes 48 min median loop | log.jsonl dwell |
| Merge queue | W1 51 waits, median 2 min, total 5.1 h | check green | B merge turn 14 min/visit | timings `wait reason=merge_turn` |
| Rules in skills | akrogon skills 858 lines, chart assets 370; edited 12-29 commits/day since 10-01 | incidents | learn-issues pruning | wc, git log |

The seed stock is the biggest and is draining at zero. Every downstream stock is empty.

## Q3 Loops

Balancing:
- B1 review loop. Goal: criteria met. Sensor: A and B blind review plus leaf checks. Correction: B repairs, A fixes. W1: first review sent 23/31 to repair, 7 clean; 38 review-to-repair loops, median 48 min, 61 h total. Sensor sees a proxy when the plan's criteria are the proxy (G2 landed 10-14, no W1 signal yet).
- B2 merge verify. Goal: main green. Sensor: full verify on the stacked tree. Correction: check.fix. W1: 13 merge-to-check.fix moves, 15 red loops, median 42 min, 17.8 h total; of 7 merge-scope trees that went red in verify-runs.jsonl, 1 flipped green on the same tree. The sensor mostly sees real reds (n=7, low confidence).
- B3 watcher. Goal: no idle leaf. Sensor: 20 min tick. Correction: next/recover. failed dwell fell 58.8 h (W0) to 5.7 h (W1); it never recovers human prerequisites (watch-issues:40), so that gap stays open until the operator looks.
- B4 chart door. Goal: a contract the implementer never guesses on. Sensor: the operator plus peers plus audit. Correction: another grilling round. Its delay is operator presence, measured in days.
Reinforcing:
- R1 load: every check runs at once (789 check runs, 27.8 CPU hours, max 8 concurrent in W1). Verify red 20/31 at 2-4 concurrent vs 25/68 at 0-1, duration 8.9 vs 6.4 min. Confounded (reds cluster in check.fix retries); weak, watch it.
- R2 rules: each incident adds a rule; longer skills, more contradictions, more repair rounds, more rules. Skills changed every day since 10-01.
- R3 batch-and-drain: idle factory invites a big charting session, the burst fills the merge queue (W0 waits up to 123 min, all in bursts), reds pile up, the operator recovers, then idles again.

## Q4 Delays

- Seed filed to charted: days (57 waiting; no filing date in seed files, body dates median 8.3 days, low confidence).
- Chart open to handed off: 0-3 days by date markers; real door work per chart unknown from data.
- Handoff to first plan move: W1 n=8 with git record, median 7.5 h, four at 12-15.5 h; the pack's 15.6 h handoff-to-merged vs 3.2 h plan-to-merged says the same.
- Prerequisite chains: the 15 blocked leaves on 10-13 were next touched after median 18 h (max 35 h). That is one timestamp, so it is a snapshot not 15 waits.
- Inside the lifecycle: W1 implement 84 min median per leaf, review-repair-fix loop 48 min median, merge turn 2 min median wait, merge red loop 42 min, watcher 20 min.
- Information delay: rules landed 10-14 and 10-15 (D1, G1, G2, stacked-turn) cannot show in W1; timings.jsonl starts 10-12 23:48 and verify-runs 10-14 17:46, so W0 has no comparable wait or verify data.

## Q5 Binding constraint

Now: the charting door. The factory showed at least 31 merged/day in W1 and gets 0-11 handoffs/day in. Per Goldratt the next steps are exploit (door time only on charting, never on recovering stops), subordinate (seats must not create operator work) and elevate (direct route, cheaper handoff). Next after it: the rework loop (39% of lifecycle dwell, three leaves carry 49% of it) and prerequisite chains (half of lead time for dependents). Then merge serialization in bursts, which stacked-turn addresses.

## Q6 Traps (module 11)

- Shifting the burden to the intervenor, active: the operator charts, selects forks, answers consult rounds and recovers human stops; the system's own ability to take a seed to a leaf is nil.
- Seeking the wrong goal, active: merged per day reads 31 while seed-to-merged is days; a green verify is the goal signal, not the product working (grep and doc proxies, overnight-recs rebuttal-E).
- Drift to low performance, active: 84% (W0) and 77% (W1) repair rate accepted as normal; 2.2 review visits per leaf is the baseline.
- Fixes that fail, likely: fix-round cap removed (57e6523) with nothing bounding the loop (fix_rounds config read by nothing in src); W1 technical-pack-selection 41.9 h, 21 moves, 5 fix rounds. Check lock removed; R1 above.
- Rule beating, likely: tests written to satisfy the reviewer, not the criterion. D1's red-against-deliberate-break is the guard; watch it.
- Escalation of rules (R2), likely within six months: 858 skill lines, edited daily.

## Q7 Leverage ladder (module 12, 1 highest)

3 goals: measure seed-to-merged lead time, not merged/day. 5 rules: chart continuously in ones, direct route for settled single-outcome seeds, consult rounds only on forks that survive the door's own research. 6 information: `akrogon status` shows seeds waiting, blocked leaves with their prerequisite, loops per leaf. 8 balancing loops: B1 sensor quality (landed 10-14, measure first). 9 delays: prerequisite chains (no new mechanism, see I3). 10 structure: stacked-turn (in flight), delete dead structure (I4). 12 parameters: nothing; the operator said no caps.

## Interventions

I1 Feed the constraint: chart continuously, one seed at a time, direct route first (lever 5, plus 3).
- Bottleneck: door outflow 0 in W1 against factory capacity of 31/day; 57 seeds waiting; chart bursts of 17 (10-07) then 2-3/day.
- Gain, estimate: seed-to-merged from about a week to under two days for settled seeds. Derived from seed age (median 8.3 days, low confidence) against lifecycle 3.2 h median plus one door sitting. Throughput: inflow from 11.4/day to whatever the operator's door hours allow; each door hour not spent on recovery or consult rounds is a charted seed.
- How: the door opens on one seed, maps, hands off or lands direct, closes. Settled charts leave at once (D4 landed). Peer consult rounds (blind, rebuttal, draft review) only for a fork the door's research leaves open; a single-destination chart with no fork skips them. Replace "drain" sessions with a daily pass of fixed length.
- Quality: handoff audit (shapes.md:289) and readiness checks unchanged; the direct route refusals (chart-issues:92-96) unchanged.
- Stability, six months: smaller charts mean more leaves per seed and more prerequisite chains; guard with the existing rule that only an actual dependency orders work (chart-issues:45).
- Complexity: removes drain batching and the default peer round; adds nothing.
- Evidence: Goldratt five focusing steps (practitioner, tocinstitute.org/five-focusing-steps.html); Reinertsen on queue size as the leading indicator and batch size U-curve (practitioner, ardalis.com/principles-of-product-development-flow-book-review); manual 1761-1766 pace upstream to the constraint, 640-641 which flow is cheaper to move.

I2 Shrink the rework loop by its cause, not by a new rule (lever 8 and 6).
- Bottleneck: W1 check.fix 60.9 h, repair 12.9 h, failed 5.7 h, merge red loops 17.8 h; 24/31 leaves repaired; 38 loops at 48 min median. Three leaves (technical-pack-selection, flaky-test-fixes, page-speed-ranking) hold 49% of rework hours.
- Cause split of W1 Fix findings: 101 Fix findings over 31 leaves, 8 leaves with none: product defect 33, test or proof machinery 25, merge red 19 (several caused by main moving under the leaf, not leaf code), criterion missed or misread 15, style or report rules 9. In 11 leaves A said ready or nits where B said fix. Source: classification of issues/closed/*/review-{A,B}.md, 23 of 101 marked low confidence. The big three leaves show the pattern: a machinery Fix (C3) reopened across rounds, then merge reds (promotion-script review-B.md:361,513,572,268,441,604; flaky-test-fixes :44,453,577,779-781; technical-pack-selection :199,224,262,332).
- Gain, estimate: clean first review from 23% to 50% removes about 0.9 h per leaf (92 h rework x 0.35 / 31) and shortens every prerequisite chain by the same.
- How: no new reviewer or rule. Half the Fixes are test machinery and merge reds, the classes D1 (red against a deliberate break), G1 and G2 target; they landed 10-14 and 10-15, so measure W2 before adding anything. Merge reds from main moving under a long leaf are a lead-time symptom, not a review gap: shorter leaves (I1) remove them. Add one information flow: the timing report prints per chart the first-review outcome and loop count of its leaves, so the door sees which chart shapes produce clean leaves. A leaf past three loops is shown to the operator by `akrogon status`, not stopped (no cap).
- Quality: review and verify unchanged. Stability: none added; a chart that keeps producing repair loops is the signal to fix the chart shape.
- Complexity: adds two printed fields; removes nothing.
- Evidence: DORA 2025, AI amplifies existing rework and change failure (practitioner, blog.google/technology/developers/dora-report-2025); Chen et al. arXiv 2602.07900 on agent-generated tests as weak oracles (research, read 10-14); manual 768-769 a loop closes the gap its sensor can see.

I3 Prerequisite chains: measure, do not mechanize (lever 6).
- Bottleneck: handoff to first plan move median 7.5 h (n=8), 18 h at the 10-13 snapshot (n=15), against 3.2 h lifecycle.
- Gain, estimate: zero direct hours; the chain wait is the prerequisite's lead time, which I2 shortens. Planning the dependent against an unmerged head would save at most the prerequisite's merge dwell (21 min median) and adds rebase risk; rejected.
- How: `akrogon status` and the timing report show each blocked leaf with its prerequisite and the wait so far; the door sees chain depth at handoff.
- Quality and stability: none changed. Complexity: one printed line.
- Evidence: manual 1710-1712 speeding upstream stages only piles work in front of the bottleneck; mergeQueue already orders prerequisites first (src/turn.ts:98).

I4 Delete dead structure from the 10-14 rewrites (lever 10, remove code).
- `fix_rounds` in both configs is read by nothing in src since 57e6523; only chart-issues:117 uses it as the direct-route bound. red-records.jsonl has no writer or reader since dc2e2b0 (src/red-record.ts deleted). Outcomes held, reuse, ejected, split have no writer since 6640ab5 but stay in the attempts schema and timing-report.ts:355. `scope: base` in the timing schema has no producer.
- Gain: 0 h per leaf. It removes signals that mislead (the data pack reports ejected and held as live outcomes; the pack's scope=merge rows are empty by construction because merge verify logs as name=verify scope=leaf).
- Stability: lower; fewer paths that reports and seats can misread. Complexity: removes a schema enum, a dead file, a config key's src reference; adds nothing.
- Evidence: this code (src/attempts.ts:8, src/timing.ts:17, src/config.ts:44), git log for the three commits.

## Data that looks wrong or unexplained

- All 15 `prerequisite` waits share one timestamp (10-13 12:12:30, right after `repo_pause off`). They are a snapshot; the 316 h "total wait" in the pack is time-to-next-touch, not 15 recorded waits.
- merge-attempts W1 shows 7 ejected although no code writes ejected after 6640ab5; they were written the same day before the commit landed.
- verify-runs.jsonl exists only from 10-14 17:46 (66 runs), so merge red classification rests on 7 red trees.
- 57 check_start events have no check_end; exit codes 143, 137 and 127 appear on 4 runs (kills, command not found).
- Seeds carry no filing date and are untracked with one shared mtime; seed age is from body dates.
- The pack's akrogon W1 row (1 leaf, implement 411 min) is n=1; the day's akrogon work went by the direct route and is not in log.jsonl.
- A leaf can loop review-fix without bound: fix_rounds is dead, and only the watcher's two-unproductive-cycles rule or a seat's own stop ends it. W1 max was 5 rounds.
- Checks per leaf in W1: median 19, max 152 runs (slug checkout); 27.8 CPU hours in a 24 h window.
