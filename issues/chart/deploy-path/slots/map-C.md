# Map C: lifecycle as a system (akrogon, 2026-10-10)

Measured from issues/log.jsonl (akrogon, 663 rows, 136 leaves) and framework issues/log.jsonl (2307 rows, 346 leaves). Method: rows sorted per slug; phase duration = time from the row that entered a phase to the row that left it; LEAF_TOTAL = first row to `merged`. Script was mine, not committed.

## 0. One fact that changes the whole picture

F0. The deployed command is stale. `~/.local/bin/akrogon` resolves to `/home/ivan/Work/infra/akrogon/src/akrogon.ts`, and that checkout is `main...origin/main [behind 52]`. `src/attempts.ts` and `src/hold.ts` do not exist locally. So every merge-throughput leaf merged today (red-main-hold, bounce-counting, queue-order, attempt-records, batch-limit, culprit eject; akrogon log 06:44 to 08:36Z) and lesson-guards' two merged leaves are not running for any consumer. Framework still runs the 10-07 behaviour. The fix is a `git pull` (docs/guide/install.md:39), but nothing in the lifecycle does it. This is a missing flow between "merged" and "in effect" (see B5 below).

## 1. Do the four reports still stand, and who owns them

### #63 clean merge gate
- Stands as a class: skills/merge-issue/SKILL.md:41,51 still run checks on HEAD in the leaf worktree, no clean-tree step (grep "untracked|git clean" empty).
- Owned in full by chart/clean-merge-gate, leaf merge-clean-worktree (implement, A busy since 09:13Z). Lock 1a removes empty untracked folders only (forks/gate-tree.md).
- Residual: lock covers the one seen mechanism (empty folders). Untracked files and ignored build output in the holder worktree still hide failures. Off route says "foreclosed by gate-tree 1b". Seen once, so leaving it is defensible. Note it, do not reopen.

### #69 load flakes
- Stands as an unproven hypothesis. flake-cause.md measured active leaves near the 5 flakes at 2, 6, 6, 5, 2 (mean 4.0 vs 3.6 at clean merges). That is weak evidence for load. My concurrency sample (open leaves per 2 h, 10-07 to 10-09) peaked at 19 with 12 to 18 typical during the bounce-heavy 10-08, so the host was busy then, but the flake count (7 of 34 bounces, 20%) is small next to DEFECT and red-base bounces.
- Owned in part: akrogon leaf merge-attempt-pressure (PSI per attempt, implement) and framework chart merge-gate fork load-flakes (fix each flake in the test). No capacity limit until PSI shows stall. Correct call. Nothing to add.

### #73 lessons to guards
- Stood on 10-09. Partly resolved today: seed-owner-routing and lesson-write-rule merged (on origin/main only, see F0), guard-retires-lesson in implement. The stock remains: akrogon LESSONS.md 20 active, 3 Applied of 45 histories; framework 145 active per the brief. The one-time `/learn-issues` backlog pass is an operator step still pending (lesson-guards CHART.md:24).
- Owned in full by chart/lesson-guards. Remaining pitfall: the loop is now "lesson -> seed" and relies on charting to turn seeds into guards. That drains the lesson stock into the seed stock. Whether seeds then drain depends on chart throughput, which is operator time (see B4).

### #75 proof wall-time
- Half stands. Framework worktree issues/worktrees/formspark-build-wiring: runner commit 88adda0fc (10-10 11:23) made the 13 cases concurrent, pool of 10 consumer roots, per-session CALL_LOG (run-formspark-build-wiring-proof.ts:20-21, :72-83, :839-899). The serial loop and shared CALL_LOG claims are gone. plan.md:82,90 still say "~8 sessions, sequentially" (stale, plan edited 09:53).
- What still stands: no duration budget anywhere (plan.md, brief.md, CHART.md, shapes.md:286 "no count, size or duration trigger"; plan-issue SKILL.md:61 Size = seconds|minutes|hours|unknown). No measured per-case time exists (.temp logs hold two single-case lines, no timing; SESSION_TIMEOUT_MS 30 min at session-trace.ts:12). The 60 min STALL_MS notice is unchanged (src/next.ts:222-253) and fires only from a `next` pass.
- Not owned. But note the instance was fixed by the operator steering the seat, in under 2 hours. The systemic question is whether a budget rule is worth a leaf (see fork Q1).

## 2. Systems map

### Stocks (framework numbers unless marked)
- S1 open leaves: peak 19 (10-08 18:00), now 1. max_active 20 (akrogon config.yaml:1), default 3.
- S2 merge queue (leaves in `merge`): 0 until 10-07 12:00, then 6 to 14 for 36 hours (peak 14 at 10-08 15:00), drained to 0 by 10-09 06:00.
- S3 bounces in repair (merge -> check.fix): 99 of 444 merge exits (22%). 49 bounces on 29 leaves since 10-07. finished-site-review 5, six leaves at 3.
- S4 lessons: framework 145 active, akrogon 20, about 4 new lines a day, drained by 3 Applied ever.
- S5 seeds (GitHub intake): #63..#75 in 3 days; drained only by chart sessions (operator-invoked).
- S6 landed-but-not-deployed command changes: 52 commits (F0).

### Flows (medians, minutes)
| phase | akrogon n/median/p90 | framework n/median/p90 |
|---|---|---|
| implement | 144 / 8.9 / 30.8 | 363 / 33.0 / 174.7 |
| check.review | 162 / 2.2 / 6.5 | 629 / 3.9 / 13.9 |
| check.fix | 27 / 5.1 / 8.5 | 305 / 13.4 / 76.3 |
| check.repair | 26 / 2.7 / 4.8 | 135 / 4.9 / 12.1 |
| merge (queue wait + gate) | 146 / 1.8 / 4.2 | 444 / 5.6 / 209.3 |
| leaf total to merged | 133 / 19.3 / 61.0 | 344 / 80.3 / 483.1 |

- Framework merge exits that bounced waited median 32 min, p90 277, vs 3.7 / 150 for ones that landed. Bounced leaves wait longer because they re-enter the back of the queue.
- Share of total leaf wall time for framework leaves merged since 10-07 (530 leaf-hours): merge 58%, implement 21%, check.fix 14%, failed 4%, check.review 2%, check.repair 2%. Merge is the constraint. In akrogon (one repo, few parallel leaves) merge is 1.8 min median and never the constraint.
- fix_rounds at merged, framework since 10-07: 0: 19, 1: 31, 2: 11, 3: 1 (62 leaves). Akrogon all-time: 0: 115, 1: 15, 2: 4, 3: 1. Framework is 3x bouncier.
- Merge attempts per framework leaf: 1: 269, 2: 59, 3: 9, 4: 6, 6: 1.
- `failed` rows: 25, 21 of them `blocked` (operator action needed), 4 `attempts`. Failed phase p90 143 min, max 927: an operator-wait stock.

### Loops
- B1 seat capacity: open leaves -> seats busy -> allocate returns null at max_active (src/next.ts:361). Delay none. Only limits leaf count, not check processes (#69).
- B2 merge turn: one holder per repo (docs/guide/merge.md:5). Merge rate is fixed at roughly 1 gate run per `framework:verify` runtime. Queue grows whenever implement+check output rate exceeds it. Batching (stack of holder + members) is the relief valve: one run lands several leaves. Working-tree batch cap is per-leaf state only; origin/main adds repo batch_limit 4.
- R1 bounce amplifier: a red gate bounces the holder to check.fix, the leaf re-queues at the back, its repair runs under full seat load, the gate re-runs. With a batch, a split halves the batch and re-runs. Each bounce consumes one gate run (the scarce resource in B2) and produces zero merges. 22% of framework merge exits were bounces, so roughly a fifth of gate runs are wasted, and more when batches split.
- R2 red-main cascade: a red main (from #63 class or any bad merge) bounces every following holder (finished-site-review 5 bounces, 3 `failed` rows "hooks:selftest red on base 2ccc3953" on 10-09 02:08 to 02:49). Delay: until operator fixes main. red-main-hold on origin/main breaks this. Not deployed (F0).
- R3 load flakes: more open leaves -> more concurrent suites -> higher flake chance in the gate -> bounces -> more leaves stuck in check.fix (still open, still running suites) -> more load. Weak evidence (#69). PSI records will measure the gain of this loop.
- R4 repeat classes: a failure class recurs -> lesson written -> nobody reads it -> same class bounces again. 12 of 34 bounces 10-07..08 were DEFECT, several in known classes. lesson-guards converts this to lesson -> seed -> chart -> guard, which is a B loop with a long delay (operator charting).
- B3 fix_rounds cap: 3 rounds then failed (src/phase.ts:302). On working tree only check.repair -> check.fix counts, so merge bounces are unbounded (finished-site-review bounced 5 times). origin/main counts merge bounces too. Not deployed.
- B4 operator throttle: charting, learn-issues, blocked `failed` leaves, `git pull` of the command, Discord broadcast reading. All drains with the operator as the sole pump. S5 and S6 grow while the operator is busy. This is the slowest balancing loop and the real ceiling on "more autonomy".
- B5 deploy gap (new): akrogon merged -> origin/main -> (manual pull) -> in effect. Delay unbounded. Today: 8 throughput fixes landed, none active. Any measurement of their effect from framework logs before a pull would be false.
- R5 proof breadth (from #75): brief criterion "real dispatch of every blueprint path" -> cases grow with paths -> proof runtime grows -> rerun trigger "every change" reruns all -> each harness fix lengthens the loop. Bounded now by the pool of 10 roots, not by a rule.

### Stock-flow verdict
The constraint is the merge gate (B2) and the thing eating its capacity is R1 plus R2. Every merge-throughput lock attacks exactly that (hold, bounce cap, culprit eject, batch limit, attempt records). The design is right. The gap is that none of it is running (F0), so the next 36-hour busy window on framework will look like 10-08 again unless the operator pulls.

## 3. Leverage points

L1. Deploy the landed command (pull akrogon main). Changes: S6 drains to 0; R2, B3, batch-size take effect. Loop: B5. Could break: nothing new, those leaves passed their gates. Could invite later: silent drift again. Remove the class by making the merge of an akrogon leaf update the installed checkout (a post-merge step in the merge turn when the repo is akrogon itself, or a `preflight` warning when the installed checkout is behind origin). Evidence: measured (git status, F0). Tier: primary.

L2. Measure before adding capacity controls. merge-attempts.jsonl with PSI (both leaves in implement) gives attempt duration, outcome, culprit and stall per attempt. The 58% merge share above is queue wait plus gate; attempt records split them. Loop: B2, R3. Could break: nothing. Invite: measuring without acting. Tier: primary (code on origin/main).

L3. Make bounces cheaper, not rarer only. A bounce costs one full `framework:verify` run plus the repair's full checks. Fail-fast (framework merge-gate open fork) and "repair reruns only the rejected command" (bounce-repair-proof, landed) cut the cost per bounce. Loop: R1. Could break: a repair that passes the one rejected command but breaks another, caught at the next gate (acceptable, the gate still runs). Tier: operator material (framework fork) plus primary.

L4. Dispatch order already fixed (dependents-first, landed). No further queue reorder needed. Do not add priorities or ageing. Tier: primary.

L5. #75 as a rule: require a numeric size when Size is "hours" (plan-issue SKILL.md:61) and let `next` compare busy time with it. Small change, but the payoff is one notice per long leaf. The instance was already solved by steering the seat. The cheaper systemic change is in R5 itself: shapes.md audit could require that a live-run proof names its concurrency and a rerun trigger narrower than "every change". Tier: model knowledge, no stronger source found (searches "proof duration", "wall time budget" in akrogon issues returned none, per #75).

L6. Lower max_active on framework from 20 to about 8 to 10 while PSI data is collected. Peak open leaves was 19 while the merge queue sat at 14, meaning seats were mostly waiting on merge, not producing. Fewer seats cost little throughput when merge is the constraint and cut R3 load. Loop: B1 vs B2 balance. Could break: nothing (leaves wait in merge anyway). Invite: operator forgets to raise it. Rejected by A,B,C in merge-load-flakes until load is traced; I disagree on cost grounds, not flake grounds. Tier: measured (queue depth vs open leaves).

L7. Operator pump (B4): the single biggest delay. Two cheap reductions: run the pending `/learn-issues` backlog pass once per repo (already an operator step), and let `blocked` failures print the exact operator command (blocked-report landed 10-08). No new leaf.

Not recommended: a check-process scheduler (#69 "heavy-run slot"), a second merge turn per repo, auto-charting of seeds. Each adds state or removes a human check that currently catches wrong charts.

## 4. Forks for the operator

Q1. Chart #75 at all? Options: (a) no leaf, close as fixed by steering and by the parallel pool (88adda0fc), leave plan-issue as is; (b) one akrogon leaf: Size "hours" requires a number and the stall notice uses it; (c) plan-issue audit rule only (no code). Recommend (a) now, reopen on a second instance. Pitfall: a budget rule invites seats to pad estimates. Removed by measuring (attempt-style records for proofs) rather than budgeting.

Q2. Who pulls akrogon? Options: (a) operator pulls now and after each akrogon merge batch; (b) merge turn of the akrogon repo fast-forwards the installed checkout after push; (c) `akrogon next` refuses or warns when the installed checkout is behind origin. Recommend (b) plus (c). Pitfall of (b): pulling under a running seat changes the command mid-leaf. Removed by (c) warning instead of auto-pull while any leaf is busy.

Q3. max_active on framework during measurement: keep 20 or drop to 10? Affects L6 and the PSI data quality (less load, fewer flakes, less signal). Decide one or the other, not mid-way.

Q4. Lesson backlog: run `/learn-issues` on both repos now (pending operator step) or wait until guard-retires-lesson lands and is deployed? Waiting keeps the loop open another day; running now is safe (edits uncommitted).

Pitfalls over the work's lifetime:
- P1 measuring framework behaviour before the pull and attributing it to the new locks. Removed by Q2.
- P2 merged leaves lingering in issues/open (lesson-guards two merged leaves still under open, merge-throughput closed folder untracked). Removed by committing the "add issues" state before the next chart.
- P3 plan.md stale vs runner (formspark-build-wiring plan.md:90 says sequential). Only matters if someone reads the plan to estimate. Removed by the plan's rerun trigger pointing at the runner, not a case count.

## 5. Already handed off today: wrong or redundant?

- Nothing redundant. The three charts cover disjoint mechanisms: clean tree (#63), load evidence (#69), lesson routing (#73).
- One ordering error: all of today's locks are being judged "landed" while the installed command is 52 commits behind. Until the pull, merge-load-flakes' PSI leaf has no merge-attempts.jsonl to append to on the consumer (file absent in both repos), and lesson-guards' routing is inactive.
- gate-tree 1b (fresh checkout per gate) was foreclosed. That is fine for cost, but the residual class (untracked files, ignored outputs) stays. Record it as a known gap in the chart's Off route rather than "foreclosed", so a second instance reopens cleanly.
- merge-load-flakes Off route rejects lowering max_active. See L6: the data says seats mostly waited on merge during the busy window, so a lower cap costs less than the rejection assumes.
