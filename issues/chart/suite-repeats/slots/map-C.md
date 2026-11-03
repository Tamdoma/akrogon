# Map C: where akrogon leaf time goes, and what to remove

The post's method works here and the data already exists. The result is the opposite of the post's: checks are not the main cost. Seat turns and repeat loops are. The largest cuts are deleting one or two full-verify points per leaf and deleting the format gate as a check, not making any single run faster.

## 1. Measurements

Window: `issues/timings.jsonl` 2026-10-12T23:41Z to 2026-10-29T08:22Z, 10,501 events, 234 slugs. Merged cohort: 71 leaves whose first visit is in the window and which reached `merged` in `issues/log.jsonl`. Commands run: `akrogon config`, `akrogon timing --cohort --since 2026-10-12T00:00:00Z`, `akrogon timing --flow --since 2026-10-12`, `akrogon timing <slug>`, `akrogon flaky`, and read-only Python over `issues/timings.jsonl`, `issues/log.jsonl`, `issues/verify-runs.jsonl`, `issues/merge-attempts.jsonl` replicating the visit pairing in `src/timing-report.ts:68-90`. Check durations are `duration_ms` sums and double-count parallel runs, so they overstate wall share.

Visit wall by phase, closed visits (includes seat time, checks, and in-visit idle):

| Phase | n | Sum | Median | p90 |
|---|---|---|---|---|
| plan.synthesis | 71 | 52.3h | 14.6m | 86.5m |
| implement | 73 | 41.1h | 14.5m | 77.8m |
| check.fix | 45 | 16.2h | 10.6m | 45.9m |
| check.review | 115 | 6.3h | 2.3m | 6.0m |
| check.repair | 66 | 5.5h | 4.0m | 12.4m |
| merge | 72 | 3.2h | 1.1m | 5.0m |

F1. Per merged leaf: median visit wall 53.5m, mean 107m. Median all-check duration sum 10.7m, canonical `test`+`typecheck`+`format` 8.3m. Checks are about 15 to 20% of a typical leaf, and less of wall time because worker checks overlap. About 80% is prompted seat time. Time before the first prompt is near zero for every phase except plan.synthesis (F3).

F2. Check cost is one command. Of 4,508 `check_end` events, 2,053 distinct names, 1,669 run once, 56% under 1s (6.5m total). The 494 runs over 60s are 89% of all check time. By name: `test` n=459, sum 1,046.6m, median 129.7s, 144 red; `format` n=376, sum 14.5m, median 2.0s, 71 red; `typecheck` n=358, sum 14.2m, median 2.1s, 6 red; `setup` n=330, median 0.06s. Since the `suite-time` change on 2026-10-26 (`bun test --timeout=30000 --parallel=4 --no-isolate`, first seen in verify receipts that day), full-style `test` runs (60s+) median 70s and whole verify runs median 71s, down from 171s for verifies since 2026-10-20. Use the post-Oct-26 numbers as "now".

F3. Queue wait is calendar time before planning, not seat or CPU time. Plan visits start a median 0.07m before their first prompt, but 17 of 70 wait over 10m and the sum is 33.6h, 87% from 10 leaves. Every long case has a `prerequisite` wait event (run-units 366m behind memory-start-check, release-rollback 332m behind release-deploy, watch-session and session-reads 289m behind session-routing). This matches `system-speed` Findings F2 in its CHART.md.

F4. The admission line is not a current cost. `check_start.wait_ms` (`src/run-check.ts:356-358`, set from `src/admission.ts:229-273`) sums 520.5m, but 519.5m of it is 37 runs on 2026-10-13/14, before the per-repo line change noted at `src/admission.ts:225-228`. Since 2026-10-20: 2,086 starts, 0.2m total wait, none over 60s. Full tests (60s+) run at concurrency 1 in 298 of 346 cases, 2 in 44, 3 in 4.

F5. Full verify repeats per phase. `issues/verify-runs.jsonl`: 330 runs, 305 completed, median wall 2.5m, total 13.4h; leaf scope 225 (141 green, 84 red), merge scope 80 (61 green, 19 red). Per leaf: median 4 verify runs, mean 5.1, max 49. Timings agree: median 4 `test` runs per merged leaf, mean 5.8. `test` runs by phase: implement 175, check.repair 68, check.fix 57, merge 45, no phase 50, plan.synthesis 62 (mostly deliberate red-first, 49 red). One sample leaf, peer-pane-anchor, ran the full verify sequence twice inside one implement visit (`akrogon timing peer-pane-anchor`).

F6. Receipt reuse almost never fires. Only 8 of 915 verify command entries carry `reused`, 4 format and 4 typecheck, 0 test. The reuse rule needs the identical tree (`src/verify.ts:203-213`, used at `src/verify.ts:555-575`), and each repair commit and each merge rebase makes a new tree. 63 verify runs repeat an earlier tree+scope and still ran.

F7. Format-only red verifies wasted whole runs. 37 completed verifies failed only on `format`; their walls sum 93m at median 142s, because verify runs its commands in sequence `format, test, typecheck` and a red first command does not stop the rest for akrogon (the blocked path at `src/verify.ts:577-584` only covers merge-scope member commands, and `merge_checks` is empty here). Each also forced a later rerun after formatting. Format reds are 37 of 103 red verifies. Test-only reds are 51.

F8. The review loop runs on most leaves. Cohort log moves: check.review to check.repair 65, to merge 50; check.repair to check.fix 44, to merge 21; check.fix back to check.review 44. Initial dual verdicts since Oct 12 (75 exits with both seats recorded): fix/fix 27, nits/fix 15, ready/ready 13, nits/ready 10, ready/fix 8, fix/ready 2. So 69% of initial reviews open repair, B says fix in 50, A in 29, and A is the only fix vote in 2. Whether A's individual findings inside shared fix verdicts matter is not in this data. Low confidence on A's marginal value.

F9. Merge itself is already fast. `issues/merge-attempts.jsonl`: 103 attempts, 98 merged, 4 red, 1 held, median 2.3m, total 4.8h. `akrogon timing --flow --since 2026-10-12` summary: issues handed off since then median 0.5d filed to merged, same as before at 0.2d on more leaves. `akrogon flaky` prints 108 lines, top count 5, most count 1 at two timestamps (2026-10-24 and 2026-10-26), which reads as load episodes rather than steady flakes. Low confidence.

F10. Data gaps: 26 `check_start` events have no `check_end`, 411 check ends have no phase, `seat_done` exists only for check.review (71), and 25 of 330 verify runs never completed. Conclusions above use medians and large counts, so the gaps change little, but per-leaf accounting for the worst leaves is incomplete (the cohort report itself prints `gaps:` on many leaves).

## 2. The post's nine items, mapped

1. **Queueing for a machine.** Applies twice, both measured small or calendar-only. Test runs queue on the per-repo admission line (`src/admission.ts`, `awaitLineTurn` and `withAdmission`; `full: [test]` in `issues/config.yaml`): 0.2m total wait since Oct 20 (F4). Leaves queue before plan.synthesis on prerequisites: 33.6h calendar, 10 leaves (F3). `max_active: 12` and merge_turn waits (57 wait events) cost under a few minutes per leaf in `akrogon timing --cohort` output.
2. **Slow lint.** Does not apply as runtime. `format` median 2.0s, 14.5m total. It applies as a loop trigger: 71 red format runs and 37 format-only red verifies (F7). Location: `checks.format` in `issues/config.yaml`.
3. **Slow typecheck.** Does not apply. `typecheck` median 2.1s, 14.2m total, 6 red in 358 runs. One ordering defect: verify runs it after the 70s+ test run (`src/verify.ts:549-575` in config order), so a type error is found last.
4. **Unsharded tests, small machines.** Already settled. `bun test --parallel=4 --no-isolate` since Oct 26 per the `suite-time` CHART.md Destination and Forks taken. Host has 32 cores; the akrogon.slice sets CPUWeight 20 and memory bounds, no CPU quota (`systemd/akrogon.slice`). Median full test 70s since Oct 26 (F2). Raising parallel is the `host-test-load` and `suite-time` load-flake trade, not a free win.
5. **Every test file reloads the app.** Partially applies by design. 72 test files, `--no-isolate` with `tests/isolation.ts` preload from `bunfig.toml`, and tests spawn real akrogon subprocesses against temp repos. No per-file timing exists in the data, so the reload share of the 70s is unmeasured. Low confidence.
6. **Slow setup, cache misses, clone cost.** Largely solved, and this is where akrogon differs most from the post. Every printed check is wrapped with a flocked `bun install --frozen-lockfile --backend=copyfile` plus `akrogon guard own-modules` (`src/config.ts:396-415`), and verify additionally makes a fresh sparse worktree and runs setup once (`src/verify.ts:529-544`). Yet `format` runs that include install median 2.0s and verify `setup` medians 0.06s, so install is at most about 2s when the lockfile is unchanged. There is no year-old broken cache here. The repeated install per direct check outside verify is real but worth seconds per leaf.
7. **Jobs that do not run in parallel.** Applies inside verify and between phases. Verify's three commands run in sequence, but test is 95%+ of the time, so parallel verify saves at most about 4s. The real serial cost is the phase chain itself (plan, implement, review, repair, fix, merge), each a separate seat turn, plus one merge turn per repo (`skills/merge-issue/SKILL.md`, `## merge`). Worker waves already run up to 3 at once (`skills/implement-issue/SKILL.md`, `## implement`) and the two review seats already run blind in parallel (`skills/check-issue/SKILL.md`, `## check.review`).
8. **Every PR runs the full suite.** Applies four times over. A leaf runs the full `test` at implement end, after check.repair, after check.fix, and at merge on the rebased top (F5; rules in `skills/implement-issue/SKILL.md` `## implement` and `## check.fix`, `skills/check-issue/SKILL.md` `## check.repair`, `skills/merge-issue/SKILL.md` `### attempt top`). Median 4 full tests and 4 verifies per merged leaf. This is the main check cost and it is a repetition cost, not a single-run cost. Running only affected tests was held in `framework-test-scope` (CHART.md Destination, no forks taken) and whole-suite proof limits were set in `check-reruns` and `test-time-and-temp`; reopening needs those named.
9. **No local checks before push.** Inverted. Local gates are mandatory and receipt-gated (`akrogon verify` before review, before merge, and at merge, `src/verify.ts:459-471`). If anything, akrogon proves the same tree family too many times before push (F5, F6).

## 3. Material forks

D1. **How many full-suite verify points per leaf.** Now four (item 8), median 4 verifies and 4 to 6 full tests per leaf, about 8 to 11 minutes of check time per median leaf and 13.4h of verify wall in 17 days.
- O1 Keep all four. Breaks nothing. Invites continued growth: every leaf adds tests, so each of the four points gets slower for every later leaf (P1 in part 5).
- O2 Full `test` only at merge. Earlier points keep targeted criterion proofs plus format and typecheck, which seats already run per unit. Removes about 2 to 3 full tests per leaf, roughly 4 to 7 minutes at current medians, plus their seat waiting. Risk: a cross-cutting break is found at merge instead of implement end, costing a merge bounce and a check.fix round. Merge red is currently rare (4 of 103 attempts) partly because earlier verifies filter. This reopens `check-reruns` (leaves prove every checks command before review and after repair) and the held `framework-test-scope`. It removes runs, not just tunes them.
- O3 Keep the points, delete the reuse machinery (X1 in part 4). Saves no run time, removes code and one false promise. Risk: none measured, since reuse fired 8 times in 915 and never for test.

D2. **Two blind reviewers on every leaf.** Both seats review the whole diff (`skills/check-issue/SKILL.md`, `## check.review`), either fix vote opens repair, and repair is a separate B turn plus its own full verify (`## check.repair`).
- O1 Keep. Cost: check.review median visit is only 2.3m wall, but it is two full seat turns of reading, and 69% of leaves then pay repair.
- O2 B-only initial review. Deletes A's review turn and the aggregate-verdict wait. Based only on verdict pairs, A alone triggered repair in 2 of 75 cases (F8). Risk: A's findings inside the 27 fix/fix cases are invisible in this data, and A reviewing its own implementation may be where plan-vs-code drift is caught. This needs a findings sample before deciding. Low confidence.
- O3 Keep both reviewers, let B repair in the same turn once both verdicts are in, deleting the separate check.repair prompt and re-read. Saves one seat start and context rebuild per repaired leaf (66 repair visits, median 4.0m). Risk: B repairs findings it has just written with no fresh read, and the phase record loses the repair boundary that re-check scoping uses.

D3. **Format as a blocking check or as an automatic step.** `checks.format` is `prettier --check`; the write form exists only in `package.json` scripts.
- O1 Keep check-only. Cost measured: 37 format-only red verifies, 93m of wasted test time in 17 days, plus 37 rerun verifies.
- O2 Delete format from `checks` and run `prettier --write` on the leaf branch as part of the implement-end and repair-end steps, before the final commit. Removes the gate and the loop entirely; formatting becomes unreviewable noise in diffs, which it already is after a format fix commit. Risk: a formatter version change reformats unrelated files inside a leaf. Bounded by the pinned devDependency in `package.json`.
- O3 Keep the check, stop verify before `test` when format or typecheck is red, reusing the blocked-entry path at `src/verify.ts:577-584` and putting typecheck before test. Saves most of the 93m but keeps a gate whose only fix is mechanical. This is tuning; O2 is the removal.

D4. **Prerequisite chains created at chart time.** 33.6h of pre-plan calendar wait sits in 10 leaves (F3).
- O1 Accept. It is calendar time, not seat or CPU time, and `akrogon timing --flow` still shows 0.5d median issue flow.
- O2 Create dependent leaves just in time, or chart fewer blocked-by edges by merging chained leaves. Removes idle open leaves and stale plans (the reason `system-speed` D5 rejected plan-before-prerequisite-merges). Risk: fewer ready leaves for unattended runs, the `system-speed` F2 problem in the other direction.

D5. **What `akrogon timing` should be.** The cohort mode reports one historical gate: F bounds fixed 2026-10-12 for the leaves-as-chunks decision (`src/timing-report.ts:14-22`, `leaf-speed` CHART.md Forks taken). It does not print the per-phase and per-check split this map needed; that took ad-hoc Python.
- O1 Keep as is and keep doing ad-hoc queries per audit. Zero code, repeated seat time per audit.
- O2 Delete the cohort verdict machinery and print three plain splits from the same data: per phase prompted time, per check name duration, per leaf verify count. Removes the fixed bounds, the 20-leaf sampling and the merge-attempt ejection logic (`src/timing-report.ts:330-392` area). Risk: loses the one comparable number across time unless the new splits are kept stable.
- O3 Add the splits and keep the gate. More code, against the brief's direction.

## 4. Removal candidates

X1. **Verify receipt reuse** (`reuseSource` and `greenEntry`, `src/verify.ts:172-213`, plus the reuse branches in `runOnce`). Evidence: 8 reused entries in 915, none for `test`, because tree identity is the key and every repair or rebase changes the tree (F6). What catches the same failure now: the rerun that already happens in 99% of cases. This reopens part of `verify-waste` (CHART.md Destination: no test CPU on known verdicts). The data says the verdict is almost never known under the current key, so the mechanism costs code, tests and reading time on every verify change and returns about 16 saved seconds in 17 days.

X2. **Merge-slow alarm** (`slowChecked`, `slowEligible`, `decideSlow`, `sendMergeSlowNotice`, `src/verify.ts:178-457`). Evidence: 3 flagged runs in 305 completed verifies, at 70 to 85s against a 72s normal, which is inside normal load spread. It also rewrites `issues/verify-runs.jsonl` under lock and sends herdr notices. What catches the same failure: `issues/timings.jsonl` plus the split in D5 O2, read when someone audits. This reopens `merge-slow-alarm` (handed off recently), so it needs the operator's explicit call.

X3. **Format from `checks`** (D3 O2). Evidence F7. What catches unformatted code: the write step itself before commit; nothing needs to catch it as a defect.

X4. **The cohort F gate in `akrogon timing`** (D5 O2). Evidence: its decision (leaves-as-chunks after 20 measured leaves, `leaf-speed` Forks taken) has had its 20 leaves many times over; 71 merged leaves sit in the same window. The slug report in the same file stays and is the part seats actually cite.

X5. **A's initial review turn** (D2 O2). Evidence is verdict pairs only (F8) and is not enough alone. Listed as a candidate to test with a findings sample, not to delete on this map. Low confidence.

X6. **Per-check install outside verify** (`withSetup`, `src/config.ts:402-415`). Evidence against spending effort: install-inclusive format runs median 2.0s. The guard `akrogon guard own-modules` in `setupCommand` (`src/config.ts:396-400`) catches a wrong-modules worktree that nothing else names as clearly. Keep. Named here so nobody charts it as a saving.

## 5. Pitfalls over the work's lifetime

P1. **Suite growth taxes every future leaf.** Each leaf must add criterion tests (`skills/plan-issue/SKILL.md`, `## plan.synthesis`) and each leaf pays the full suite about four times (F5). The suite that took about 10s in the `akrogon-slow-phases` era (CHART.md Destination) now medians 70s sharded. Removed by D1 O2, slowed by nothing else on this list.

P2. **Parallel speed buys load flakes, which buy retry and known-red loops.** `akrogon flaky` clusters on two load days (F9); the retry and known-red rules are repeated in `skills/implement-issue/SKILL.md` and `skills/check-issue/SKILL.md` Shared context and in `skills/merge-issue/SKILL.md` `### Shared endings`, and each invocation can add a full base run. The admission line (F4) is the current brake. Raising `--parallel` or `max_active` reopens `host-run-load` and `host-test-load`.

P3. **Lifecycle machinery becomes the work.** `src/verify.ts` is 900 lines and `src/phase.ts` 947, and the closed-leaf list is dominated by leaves about the lifecycle itself (verify-waste, merge-slow-alarm, suite-time, check-reruns in `issues/closed/`). Every guard added here generates future leaves to fix the guard. X1, X2 and X4 shrink the surface that can generate them.

P4. **Timing data silently rots.** 26 unmatched check starts, 411 phase-less check ends, 25 unfinished verify runs (F10). A future audit may not notice and may chart work from noise. Removed by nothing proposed; D5 O2 should print its own gap count, as the slug report already does with `incomplete` lines.

P5. **Optimizing the wrong 20%.** Format, typecheck and setup together are about 29m in 17 days. Any leaf spent speeding them up costs more seat time than it can ever return.

## 6. Practitioner questions this brief does not ask

Q1. What does a leaf cost in tokens per seat and phase? Timings hold no token data. Dual review is cheap in wall (2.3m median) and possibly expensive in tokens; D2 cannot be settled on wall time alone.

Q2. In the last 20 red leaf-scope verifies, what did each catch that targeted proofs plus the merge verify would have missed or caught later at higher cost? That sample settles D1 with evidence instead of principle.

Q3. Why are 37% of leaf verifies red if seats run checks before verify? Format explains 37 of 103 reds; what explains the 51 test-only reds: fresh-checkout differences, uncommitted state, or tests seats did not run in that form?

Q4. Do these akrogon numbers hold for the framework repo, whose checks include slow browser suites? Several held locks (`framework-test-scope`, `verify-waste`) were decided on framework costs. This map measured only akrogon.

Q5. Which target does the operator want cut: calendar days per issue (now 0.5d median), seat wall per leaf (53.5m median), or host CPU? D4 cuts only the first, D1 and D3 cut the second and third, and no option here cuts all three.

The single biggest measured lever is repetition, not speed: four full verifies per leaf, a repair loop on 69% of leaves, and 37 whole verifies burned on formatting. Deleting one verify point and the format gate returns more than any sharding, caching or runner change available in this data.
