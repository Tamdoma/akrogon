# Slot B debate: separately deliverable improvements

Evidence date: 2026-10-25. No repository edits or full-suite run. O1 file timings are A's measurements supplied in map-merged.md, not fresh measurements by B. Existing O1–O5 references are preserved.

## Disposition of each original option

O1 — KEEP, split into O1a, O1b and O1c below. This is three changes, not one guaranteed 23% improvement. A 40-second reduction is 17.0–21.1% against a 190–235-second suite. The combined change must remove at least 38 seconds at a 190-second baseline, or 47 seconds at a 235-second baseline, to prove 20% speed improvement. Do not count the same saved time again under O3.

O1a — Shorten unnecessary peer-wait fixture budgets.
- Gain/baseline: A measured tests/peer-wait.test.ts at 22.8 s. A target of 3–5 s would improve that file by 78–87%, meeting 20% for this named baseline. Estimated full-suite saving is 18–20 s, roughly 8–10% of 190–235 s. Not yet proven after a change.
- Evidence: tests/peer-wait.test.ts supplies '11' budgets to unproven cases and twice in the carried-exchange case. skills/chart-issues/scripts/peer-wait.ts main derives its deadline from that argument. My targeted two-test run passed: proven idle failure 123.54 ms, unproven budget exhaustion 11,060.77 ms. These are budget costs, not a mandatory ten-second grace sleep.
- Size: one test file, approximately 15–35 lines. Change fixture budget arguments only. No production timing knob.
- Risk/removal: budgets that expire before the subprocess reaches the intended branch would weaken coverage. Retain deliberate grace/budget boundary cases and assert the intended exchange, signal and wait calls. Choose budgets with measured startup headroom.
- Dependencies: none. O3 would reduce how often this saving applies, but every remaining full-suite run still benefits.

O1b — Split the nine serial named-target cases into independent tests.
- Gain/baseline: A measured tests/next.test.ts at 49.2 s, with this one serial test at 29.3 s. Projected file time around 30 s is 39% faster, exceeding 20% for this file. Approximate full-suite contribution is 19 s, or 8–10% of 190–235 s. Projection, not a measured after-result.
- Evidence: tests/next.test.ts “named target equivalence” nests three owners by three cwd choices. Each combination creates and cleans its own named/pathed fixtures. The outer test serializes all nine combinations despite concurrent tests being enabled.
- Size: one test file, approximately 15–40 lines, using parameterized cases without changing assertions or fixture ownership.
- Risk/removal: nine fixtures running together can create more host contention. Keep the existing concurrency limit and prove file wall time, zero new failures and preserved nine-case coverage under representative load. Do not raise suite concurrency as part of this leaf.
- Dependencies: none. Separate from O1a and O1c.

O1c — Compress discovery-timeout test execution, conditionally.
- Gain/baseline: A measured tests/session-routing.test.ts at 10.2 s. Its projected 2.6 s would be 74.5% faster for that file, but only about 3–4% of full-suite wall time. The mechanism and after-time remain unproven.
- Evidence: “a discovery read past the deadline” seeds delayMs:30000; “resolved-session pane discovery” executes sleep 12 and asserts the 10000 ms deadline. src/shell.ts supplies DISCOVERY_DEADLINE_MS to the real subprocess boundary.
- Size: likely 2–3 files and 30–80 lines, depending on the chosen test seam. Higher design cost than O1a/O1b.
- Risk/removal: a production environment override changes real timeout behavior if inherited. Prefer a test-controlled subprocess/clock boundary with production defaults still verified. If a small seam cannot preserve actual timeout-path coverage, drop this sub-option rather than add a public setting just for tests.
- Dependencies: none. Re-measure after O1a/O1b because this may no longer be needed to meet the aggregate target.

O2 — KEEP as a low-priority, narrow optimization; DROP as the broad 20% recommendation.
- Gain/baseline: approximately 50% of the observed unchanged-tree leaf-plus-merge verification pair, so it clears 20% only for that qualifying cycle. Only one completed merge run has earlier green leaf commands on the same tree. Its 200.576 s of shared commands is about 1.87% of 10,746.823 s of completed setup-green merge verification time.
- Evidence/method: issues/verify-runs.jsonl filtered by end present/setup=0, sorted by start; match earlier leaf greens by tree/name/command; join command.log to issues/timings.jsonl check_end.log. Merely counting the two overlapping trees overstates forward reuse because one was verified at merge scope first.
- Size: src/verify.ts and tests/verify.test.ts, approximately 30–70 lines.
- Risk/removal: reuse must not bypass merge receipts, merge-only commands or context-dependent inputs. Preserve whole-run/known-red scope gates, issue the merge-scoped receipt, limit sharing to common checks and audit their input assumptions.
- Dependencies: O3 removes the main duplicated leaf test result and largely removes O2's benefit. O1 lowers its absolute saving. Recalculate before scheduling O2 if either lands.

O3 — KEEP as an explicit policy option, with implementation held for the operator's decision.
- Gain/baseline: completed setup-green verify receipts contain 31,961.890 s of leaf test execution and 10,447.717 s of merge test execution. Leaf tests are 75.36% of this recorded verification test time. Removing that requirement clears 20% on this raw execution-time baseline if work is actually avoided. This is neither CPU accounting nor a net lead-time forecast.
- Evidence/method: join verify-runs.jsonl commands named test to timings.jsonl by log, grouped by receipt scope, not timing scope. The 190 leaf receipts include 39 red test commands; the 61 merge receipts include 14. Timing events label some merge-phase checks scope=leaf, so that field alone is the wrong stage denominator.
- Size: issues/config.yaml, under 10 lines for stage placement. Any requested replacement early-check coverage would be a separate scope decision.
- Risk/removal: failures first discovered at merge consume the serialized merge turn and require repair. There is no evidence here that removes this tradeoff. The operator must accept delayed whole-suite feedback and the reversal of the stored choice before implementation.
- C's run-check objection remains wrong: src/run-check.ts compares raw repo merge_checks commands in bare, sh -c and setup forms. Moving the exact suite command there makes that command refused through run-check. Seats retain narrower reproductions, not the same suite route. The init skill's “Inspect and propose” section also explicitly preserves existing repo choices on repeat setup.
- Dependencies: O3 largely supersedes O2 for test reuse. O1/O4 still improve the remaining merge runs. Net savings need measurement after repair and queue costs, not just deleting recorded leaf seconds.

O4 — KEEP as a small, independent quality fix.
- Gain/baseline: remove the status overview test's clock-skew false failures, plausibly approaching 100% reduction for this specific failure cause. It clears 20% on that narrow quality baseline. It does not establish a 20% fleet-wide gain: eight sole-failure runs are 15.1% of 53 red test receipts.
- Evidence: parse failed test names from completed setup-green receipts using src/flaky.ts failedTests; the overview test appears in 12 red test runs and is the sole failure in eight, totaling 1,502.096 s of test execution. These are observed failed-run costs, not automatically removable CPU time. tests/status.test.ts samples event/prompt Date.now independently; src/status.ts floors elapsed minutes.
- Size: tests/status.test.ts, approximately 10–25 lines. Derive compared timestamps from one epoch while retaining the exact elapsed-time assertion.
- Risk/removal: global time mocks can miss subprocess clocks and interfere with concurrent tests. Explicit fixture timestamps remove the skew without changing production time. Verify deliberate timestamp offsets and repeated targeted runs.
- Dependencies: none. Helps the early suite today and the merge suite if O3 is adopted.

O5 — DROP blanket timeout increases.
- Gain/baseline: zero demonstrated reduction in execution time or underlying failures. The proposed 15–20% reduction in leaf test reds is an estimate, not proof that 20% is reached. Larger timeouts can increase the cost of genuine hangs.
- Size: likely 1–several affected test files and 5–20 lines, but no specific patch is justified by this map.
- Risk/removal: misclassifying regressions as load effects. First remove unnecessary fixture work through O1, fix proved defects such as O4, then investigate any remaining reproducible timeout individually. Do not retain O5 as an automatic follow-up.
- Dependencies: its supposed need changes after O1. O3 only moves its symptoms later.

## Final ranking and additional candidates

D1. Ranked delivery list: (1) O1a, (2) O1b, (3) O4, (4) O1c if a small safe test seam is demonstrated, (5) O2 if its remaining frequency justifies the semantic change. Each is separately deliverable. Measure O1's combined full-suite result after the individual leaves, without claiming that each saves 20% of the whole suite.
D2. O3 is a separate policy decision, not the sixth automatic implementation. If the operator accepts deferred feedback and measured net savings justify it, it becomes the highest raw-compute-saving option. O5 is excluded.
D3. No new candidate outside full-suite test work is added. The inspected records support time and failure attribution here, but not a defensible >=20% gain from a small new change to seat models, prompts, repair rounds or phase waits. Listing one anyway would invent its benefit.
