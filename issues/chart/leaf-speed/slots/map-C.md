# Territory map C: cut implementation wall-clock and test rounds

Slot C, blind. Window 2026-09-21 to 2026-10-12. All numbers are mine, computed by scripts in `C-work/` (`analyze.py`, `analyze2.py`, `analyze3.py`) from the files cited. Method: in `issues/log.jsonl`, time in a phase = next transition ts minus the ts that entered it, summed per leaf over all visits. That blends seat work and waiting for dispatch. Nothing in the log separates them.

## 1. Per-leaf time by phase

Framework, 239 leaves merged in window (`tamdoma/framework/issues/log.jsonl`, 1,877 rows in window). Minutes, median / p90, summed per leaf:

| Phase | n leaves | med | p90 |
|---|---|---|---|
| implement | 239 | 58 | 218 |
| check.review | 238 | 8 | 22 |
| check.repair | 109 | 7 | 22 |
| check.fix | 149 | 33 | 152 |
| merge | 239 | 21 | 361 |
| failed | 34 | 44 | 394 |
| first log row to merged | 239 | 183 | 683 |

Plan time is not in this table and not in any total below. 230 of 240 framework slugs have `plan.synthesis -> implement` as their first log row. Positions, rebuttal and synthesis work happens before the first timestamp. Every per-leaf cost in this map, and in the watch agent's, is missing plan.

Akrogon, same lifecycle, 106 merged leaves: implement med 12, check+merge med 7, merge med 2.5, total med 23. Lens (4 leaves) and blepsis (7) are too small to use; both sit near akrogon, not framework. The lifecycle shape is not slow. Framework is slow.

By size (lines = insertions+deletions in the `diff` field at first implement exit). Two regimes, split at Oct 1 for reasons in section 5:

| Merged Sep 21-30 | n | implement med | check+merge med | merge med | ejections/leaf |
|---|---|---|---|---|---|
| <200 | 19 | 20 | 8 | 3 | 0 |
| 200-600 | 14 | 27 | 9 | 3 | 0 |
| 600-1500 | 16 | 41 | 13 | 3 | 0 |
| >1500 | 47 | 152 | 50 | 5 | 0.02 |

| Merged Oct 1-12 | n | implement med | check+merge med | merge med | ejections/leaf |
|---|---|---|---|---|---|
| <200 | 31 | 20 | 106 | 62 | 0.48 |
| 200-600 | 25 | 27 | 85 | 44 | 0.48 |
| 600-1500 | 23 | 69 | 175 | 70 | 0.57 |
| >1500 | 64 | 120 | 241 | 126 | 0.81 |

Implement time did not change between regimes at the same size. Everything after implement did.

## 2. Test rounds, fix rounds, ejections

Framework Oct 1-12: 143 merged leaves, 92 `merge -> check.fix` ejections (90) plus `merge -> failed` (counted in my per-leaf total of 92). This matches the watch agent's 92/143 exactly. One ejection loop, from ejection to next entry into merge: med 25 min, p90 100 (n=90). Then merge runs verify again. One review fix loop (`check.review -> check.fix/check.repair` back to review or merge): med 16 min (n=236). `fix_rounds` field per merged leaf, all window: 119 leaves at 0, 90 at 1, 20 at 2, 10 at 3-4. Akrogon: 3 ejections in 106 leaves.

Test rounds have no complete log. From the skills, one clean framework leaf runs: `test_changed` per worker, lane changed tests after each cherry-pick, all 6 `checks` at implement end, all `checks` again after any check.repair and at each check.fix end, `framework:verify` once per merge attempt. An ejection adds a verify replay, another `checks` set, another review, another merge verify. (`skills/implement-issue/{SKILL.md,worker-protocol.md}`, `skills/check-issue/SKILL.md:89`, `skills/merge-issue/SKILL.md:41`.) Partial counts: `check-*.log` files exist for 19 of 185 matched closed framework leaves (run-check landed about Oct 10): med 13 per leaf, max 43 (parallel-selftest, selftest 20 times; backlink-run-identity verify 6 times). Biased subset, low confidence as a rate.

Duplicates inside one `checks` pass (framework `issues/config.yaml`): `parity` and `contracts` run under their own names, again inside `test`, again inside `cheap` (`package.json:164`), and until Oct 12 again inside `test_changed`. One pass ran them three to four times. Flagged Oct 1 in `issues/chart/check-reruns/CHART.md`, still open.

Merge verify itself is not slow. `merge-attempts.jsonl` (from Oct 10 only): 41 framework attempts, med 12 min, p90 19. Akrogon med 3 min. One recorded full verify base run: 7.4 min (`base-runs.jsonl`, Oct 11). Ejection cause classes (defect vs flaky vs red main vs stale base): not classifiable from current logs. `red-records.jsonl` has 8 rows, `base-runs.jsonl` 5, both from Oct 11. I am reporting this as unmeasured instead of guessing.

## 3. Chunk cost

Closed framework leaves matched to log slugs: 185. Sub-briefs (`implementation/brief-N.md`) per leaf: med 4, p90 8. Akrogon med 3. Implement minutes per 1,000 lines fall as brief count rises (med 121 at 0-1 briefs, 31 at 6+), confounded by size. No per-brief tax is visible in aggregate, which neither proves nor disproves one.

Chained vs parallel, weak proxy from plan.md waves vs brief count: 12 leaves look chained, 80 look parallel, 77 plans predate wave tables. Low confidence, but it does not support "most splits form a chain" window-wide.

Per-unit overhead (worktree, cherry-pick, lane tests, seat gap, cold re-read) is in no log. Only measurement: the watch subagent's 4 leaves on Oct 12 (gaps 1-9 min, post-worker seat work 19-30 min, at most 1 boundary defect candidate in 4 leaves). Any per-chunk cost quoted today extrapolates from n=4.

## 4. Idle vs working

Merge queue is the measured idle. Oct 10-12 holders: merge-phase med 21 min vs attempt time med 13. Worst cases are almost pure waiting: root-influence 555 vs 31, recording-consumers 537 vs 51. Up to 14 leaves sat in merge at once while one holder moves. Attempt gaps med 8 min, 10 of 40 over 60. Visits over 4 hours: 63 of 1,637. `failed` waits med 44 min (34 leaves). Implement ran 12 leaves at once at peak. Seats are not the constraint. The merge turn is.

## 5. Did recent fixes move the numbers?

The window has three regimes, and pooling them is the main error to avoid:

1. Sep 21-30: no gate. Pre-Oct 1 framework config (`git show 6dcb22625^:issues/config.yaml`) has no `framework:verify` anywhere. Small-leaf check+merge med 8 min is an ungated leaf, not evidence leaves are cheap at today's gate.
2. Oct 2-9: verify at merge only (config Oct 1-2, Oct 1 `check-reruns` lock), while `test_changed` never ran changed unit tests, so changed-code defects first surfaced at merge. Holder turn and batching landed Oct 5-6 (akrogon 222e906 to 41cab48). Merge-visit med by entry date: Oct 2 19 min, Oct 5 37, Oct 7 172, Oct 8 268. Ejections per merged leaf Oct 5-9: 0.36 to 1.5 daily.
3. Oct 10-12: `merge_covers`, attempt records, batch limit, copyfile setup. Merge-visit med: Oct 9 16, Oct 11 16, Oct 12 7. Ejections per merged leaf: 0.11, 0.4, 0.17.

The improvement started Oct 9-10, before #87. #87 (`test_changed: bun run test:changed`, Oct 12 12:54 UTC per the watch agent) after-sample: 4 merge attempts, 4 merged, 0 ejections; 4 leaves merged after it with check+merge med 33 min. n=4 proves nothing. Two corrections on #87: the old line was not a stub, it ran parity+contracts (same as `test`); and the new line is still uncommitted today (`git diff` on framework `issues/config.yaml` shows it as a working-tree change). A reset loses it.

Batching, the Oct 10 throughput fix, is not batching: 40 of 41 framework attempts carried 0 members, 1 carried 1. `batch_limit: 4` exists, stacks of 4 do not. Merge still pays roughly one verify per leaf.

## 6. Forks

**D1. Where does full verify run?** Options: (a) merge only, today; (b) leaf checks run a real affected-tests selector, merge keeps full verify as confirmation; (c) full verify before review, merge reuses. Pick (b): commit #87, then measure ejection rate over the next 20+ merged leaves. This is test impact analysis at the leaf plus one full run on the exact landed top. What (b) invites: selector misses (mapping in `run-test-changed.ts`) stay silent until merge, so the ejection rate is the guard metric, plus the still-open scheduled full run on main (framework#115, chart `framework-test-scope`). What (c) breaks: verify runs on code that then changes in review and rebase, and runs once per leaf instead of once per batch.

**D2. Make batches real, or drop the idea?** Options: (a) form batches deliberately (short hold so waiting leaves accumulate, or dispatch holder only with members when a queue exists); (b) accept solo attempts. Pick (a), after D1. Verify is 12 min per attempt; at batch 4 that is the single largest cut in test rounds available, and members skip their own merge checks entirely (`docs/guide/merge.md`). What it invites: first leaf waits longer, red-batch attribution cost (culprit naming already exists), and one bad member can hold three good ones for one attempt. First find out why members are empty. I did not trace that in `src/`; it is the first investigation.

**D3. Chunks, leaves-as-chunks, or parallel-only units?** Options: (a) status quo; (b) units only where parallel, chained units merged into one brief; (c) chunk-sized leaves from the chart. Pick (b) now; (c) only after D1+D2 hold small-leaf check+merge under about 45 min (Oct 12: 33 min at n=4, not yet evidence). Under (c) today each ex-chunk pays plan (unmeasured), two-seat review, and a place in a merge turn that already queued 14 deep. Chained ex-chunks serialize there and get slower. What (b) invites: worker runs near 2 hours against an unverified model context window (watch subagent could not find swe-2-max's; 200k compaction is assumed). Trial (b) on a few chained leaves, compare implement time and fix rounds, then lock. Akrogon-slow-phases took this fork the other way Oct 2, "look again after the fast suite lands." Akrogon's landed. Framework's has not.

**D4. Dedupe framework `checks`.** Options: (a) leave config; (b) make each name run distinct work: drop `test` or point it at real tests, let `cheap` own parity+contracts. Pick (b). It deletes repeated rounds inside every pass at implement end, repair end and fix end, with no lifecycle change. Risk: some proof or plan names a check that disappears; rename carefully. This is a framework-repo decision, flagged off-route in the akrogon check-reruns chart since Oct 1.

**D5. Log pass start and plan start.** Options: (a) keep transition-only log; (b) write one row when a pass is prompted and when a leaf is created. Pick (b). Every speed question in this map hit the same wall: phase time blends work and queue, and plan is invisible. `prompted_at` already exists in state.yaml. Without this, the next chart re-derives medians that cannot answer its own question.

**D6. Review depth by leaf size.** Options: (a) two seats and up to 8 fix rounds for every leaf; (b) lighter review under some size. Pick (a) for now. Data does not indict review for small leaves: review med 8 min summed, small-leaf fix rounds low. The cost is in fix loops on big leaves (check.fix med 33, p90 152) and ejections, both downstream of D1. Revisit only with per-finding data, which does not exist in log form.

## 7. Practitioner questions

- Q1. "Is your merge queue testing the combination that will land, and batching to amortize it?" GitHub's merge queue does both (https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue, accessed 2026-10-12). Akrogon does the combination. Batching is D2, currently size 1.
- Q2. "What selects tests before the expensive gate?" Google's test impact analysis picks tests by dependency on the change, full runs later (https://testing.googleblog.com/2019/11/test-impact-analysis-at-google.html, 2019, low confidence on exact date). That is D1(b). Its failure mode, selection misses, is what the ejection rate measures.
- Q3. "What is the fixed cost per batch?" DORA's small-batches capability: smaller changes flow faster only when per-change overhead is low (https://dora.dev/capabilities/working-in-small-batches/, accessed 2026-10-12). Leaves-as-chunks against a 106 min October fixed cost fails that test today. Hence D3's order.
- Q4. "Why pay a full land cycle between dependent pieces?" Stacked diffs review small dependent changes without landing each first (https://sapling-scm.com/docs/introduction/stacked-diffs, accessed 2026-10-12). Middle option nobody has charted: chained leaves reviewed as one stack, one verify to land. Fog, not a recommendation.

## 8. Pitfalls

- P1. #87 config lost before it is ever measured. It is uncommitted now. Removed by: committing it today.
- P2. Selector misses in `test:changed` trade merge ejections for red main weeks later. Removed by: ejection-rate tracking per week plus the scheduled main verify (#115) actually running with an owner.
- P3. Leaves-as-chunks overloads the single merge turn. Queue depth already hit 14 with today's leaf sizes. Removed by: D2 batching first, and a queue-depth number in `akrogon status` if D3c ever starts.
- P4. Whole-leaf worker runs degrade silently at compaction instead of failing at a cherry-pick. Removed by: size cap for merged chained briefs, and comparing fix rounds on trial leaves (D3).
- P5. Each speed fix lands without a before/after metric, so the next discussion restarts from impressions. This already happened with merge_covers and batching. Removed by: D5 plus one standing weekly readout (ejections per merged leaf, merge-visit med, attempts per merged leaf) from logs that already exist.
- P6. Framework verify keeps growing by accretion (`package.json:164-169` lists are long sequential chains). At some point verify time, not queue, becomes the merge cost. Removed by: stage-level timing in verify output before optimizing blind.

## 9. Contradictions with the watch agent

- F1. Its headline numbers replicate: 143 leaves and 92 ejections since Oct 1 are exact under my method. Its small-leaf check+merge median (132) does not: I get 106. Its fix rounds per leaf (0.65 to 2.4) are roughly double mine (0.13 to 1.2); it likely counted check.fix visits, I used the `fix_rounds` field. Definition, not arithmetic.
- F2. "Per-leaf fixed cost about 2 hours" is an October artifact, not a leaf property. Same-size leaves in late September cost 8 min after implement, because verify ran nowhere. Pooling Oct 1+ also hides that Oct 10-12 is already a different regime from Oct 5-8.
- F3. Chunk overhead 10-20 min and dechunk saving 15-30 min rest on 4 leaves from Oct 12. No log supports a window-wide value, and aggregate data shows no per-brief tax. Treat both as hypotheses for a trial, not inputs to a decision.
- F4. It did not mention that batching carries nobody (40 of 41 attempts solo), that framework `checks` duplicates parity+contracts three to four times per pass, or that plan time is missing from every total including its own 6-hour leaf example. The first two are larger, cheaper wins than dechunking on current evidence.

## Inputs

Read and computed from: all four repos' `issues/log.jsonl`; framework and akrogon `merge-attempts.jsonl`; framework `base-runs.jsonl`, `red-records.jsonl`; both `issues/config.yaml` plus framework config git history; closed `implementation/` brief and check-log counts (185 framework, 106 akrogon); the four lifecycle skills (worker-protocol in full, rest by cited sections); `docs/guide/{phases,merge}.md`; CHART.md of `akrogon-slow-phases`, `test-runs`, `merge-throughput`, `check-reruns`, `long-implement`, `framework-test-scope`; closed briefs `parallel-chunks`, `wave-table`; watch excerpt in full.

Skipped: seat transcripts (the watch subagent's 4-leaf timing is the only per-worker data); `watch-dialog.md` beyond the excerpt; `token-ledger.yaml` (stale Aug 24); `src/` batch code (D2 names it as first investigation); most of `learnings/`.

Most important thing here: do not move chunks up to leaves yet. Commit #87, find out why merge batches are empty, dedupe framework checks, and let 20 leaves prove the new per-leaf cost. Dechunking chained units is a small, safe win whenever you want it. The hours are in the merge turn and in test rounds that repeat or discover too late.
