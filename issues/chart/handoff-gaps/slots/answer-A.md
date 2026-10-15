# Answer A (door), blind

## Q1 Handoff gap
Class: the design asserts that code downstream of the change keeps working unchanged ("Reuse: reconcile's merged-worktree cleanup", design.md Leaf architecture), while the change breaks an invariant that code relies on (a merged leaf's branch head is an ancestor of main, src/reconcile.ts:213-221 `git branch -d`). Neither the door nor D traced each object the leaf changes (branch, record, phase) to the code that reads it. The removed code (6640ab5^:src/batch.ts:79-153) already held the answer, so a diff read of what 6640ab5 deleted would have surfaced it.
Verdict: half defect, half the plan working. plan-issue :65 says synthesis "resolves implementation choices"; A found it in 25 min and the miss would only leave branches behind (keep(), not data loss). The defect is the false assertion, not the missing answer: a planner trusts "Reuse X" and may not look.
Rule edit (replace, net 0): shapes.md:180-183 Leaf architecture placeholder becomes "owned surfaces, literal interfaces, exclusions, dependencies; for each invariant the change breaks, the code that relies on it and either the decision or `Plan resolves: <question>`; `Reuse` only for code whose inputs the leaf does not change". plan-issue :65 already obliges the planner to answer each `Plan resolves` line; no new plan rule.
Delete instead of add: the design's line refs (`:974-1064` etc.) go stale in hours and invite trust; keep function names, drop line numbers from the design shape (shapes.md:183 "literal interfaces" stays).
Rule count as I read it: standing-design 15 bullets; shapes Leaf files + self-contained paragraph ~5; audit shapes.md:289 ~12; chart-issues Handoff section ~10. About 42 rules. Getting to ~20 needs merging, e.g. the audit paragraph restates brief-shape rules (shapes.md:171 vs :289 criterion rules said twice); one statement each saves ~5.

## Q2 D1
Keep D1. It does not send "non-existing tests" back to A as new work: it sends one missing case of a criterion the plan's red-first tests (plan-issue :69) did not fully cover. Before D1 that leaf stopped `failed` and waited for the watcher or the operator (3 of 11 stops, system-speed CHART.md F4); now it costs one check.fix round (median 0.7 h). B writing it in check.repair was rejected because 3 of the 5 cases needed a live capture B cannot run, and a B-written green test would reach merge unreviewed (overnight-recs rebuttal-B.md F1, rebuttal-E.md).
Upstream cause: plan-issue :69 tests are written from the brief alone, so a criterion with several observable parts gets a test for the first part. Cheapest prevention is in the brief, not a new rule: shapes.md:171 criteria already must be observable; the audit (:289) can merge in "one observable result per criterion" replacing its current criterion restatement (net 0).

## Q3 Stock and flow (framework, since 10-14 12:00, timings.jsonl)
Stocks: seeds 57 (6-12 new/day) -> charts (attended door) -> open leaves 0 now -> blocked leaves (plan wait 12-36 h on 14 backlink leaves: visit plan.synthesis to first action 9-35 h, i.e. waiting on blocked-by) -> active phases -> merge queue -> merged (25 leaves). failed stock: 13 visits, 2.2 h total.
Flows when unblocked: plan 0.2-0.8 h, implement->merged 0.9-2.9 h (11 test-speed leaves); live-run leaves 3-10 h.
Loops:
| Loop | Type | Valid? evidence | Delay | Limit |
|---|---|---|---|---|
| L1 red merge -> check.fix -> merge | balancing | yes, merge-issue red call; 7 of 32 merge visits | ~1 h | foreign flakes (L2b, akrogon flaky) |
| L2 failed -> watcher recover / operator | balancing | yes for transient (watch-issues two-cycle bound); human stops wait | 0.2-hours | operator presence |
| L3 CPU load -> timeouts -> false reds -> reruns -> load | reinforcing | weakened: leaf runs own tests only (D10), merge runs full verify | minutes | concurrent merge verifies |
| L4 merge queue depth -> wait -> more queued | reinforcing | yes, ~7 min/visit turn wait | per visit | stacked-turn (in plan) |
| L5 seeds in vs charting out | inflow | door is attended only | days | operator time; 0 open leaves now |
| L6 blocked-by chains -> serial leaves | delay | 12-36 h plan waits on spine chains | hours/link | chain depth |
| L7 lessons -> more rules -> longer skills -> slower, contradictory seats | reinforcing, slow | learn-issues prunes; skills keep growing (chart-issues SKILL 134 lines) | weeks | pruning discipline |
Top 3 levers:
1. Inflow: the line is idle. Chart seeds in batches; small settled ones take the direct route. Gain: from 0 to max_active leaves busy. Guard: the handoff audit and B review unchanged.
2. Chain depth: split spines so independent leaves don't queue behind one prerequisite; prerequisites go through merge first (stacked-turn helps). Gain: hours per link. Guard: blocked-by only where code is consumed (chart-issues Drain rule already says this).
3. Rule weight (L7): merge duplicated rules in skills to ~20 for the handoff contract; fewer contradictions means fewer repair rounds. Guard: each merge keeps every decision's text.

Picks: Q1 replace Leaf architecture text, net 0 rules, plus merge audit duplicates. Q2 keep D1. Q3 inflow, chain depth, rule weight.
