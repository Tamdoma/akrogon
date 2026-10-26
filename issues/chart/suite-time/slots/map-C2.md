# Slot C map (second run): one inefficiency worth at least 20%

Operator intake: find one small inefficiency in akrogon that improves cost, speed or quality by at least 20%.
All numbers computed 2026-10-25 from issues/timings.jsonl (8,085 events), issues/verify-runs.jsonl (276 runs, 251 completed), issues/log.jsonl (1,225 moves), issues/merge-attempts.jsonl (91), plus live commands noted per line.
Baseline totals for Oct 14-25: verify ran 251 completed runs, 12.1h wall, median 154s. Inside verify, the `test` command took 11.78h of the 12.1h. 90 of 251 runs were red (36%), taking 5.06h. Median verify runs per leaf: 3.5 (52 leaves, excl. direct-route slug `checkout`).

## Candidates

### C1. Verify burns a full suite run on trees already red on a 2-second check
- Waste: verify runs every sequential check past a red one (src/verify.ts `runOnce` sequential loop). `format` (prettier --check, median 2s) went red in 48 of 251 completed verify runs (19%). In those 48 runs the `test` command still ran and burned 2.01h (timings check_end joined to verify command logs). 35 runs were red on format alone: test and typecheck were green, so the whole run's only output was "run prettier".
- Why the evidence is worthless: fixing format changes files, so it makes a new tree. Every result recorded on the format-red tree is discarded by construction. The seat then pays a second full verify on the fixed tree anyway.
- Expected gain: fail-fast removes the 2.01h. That is 40% of all red-run verify time (2.01h of 5.06h), 17% of all verify time (2.01h of 12.1h). Red feedback on those 48 runs drops from ~155s to ~4s.
- Size: src/verify.ts only. Break the sequential loop on first red and record remaining checks as `blocked` with the blocker's exit and log. That recording pattern already exists in the same function for merge_checks members, and gates already treat blocked as not green. Roughly 15 to 25 lines plus tests in tests/verify.test.ts (~40 lines). This repo also reorders issues/config.yaml so typecheck (2s) sits before test (currently after).
- Risk: a tree that is red on format and also on test now shows only the format red. The seat fixes format first and learns about test on the next run, which it has to run regardless. Known-red and flaky extraction already skip blocked entries.

### C2. Leaf-scope verify runs the whole suite, merge-scope runs it again
- Waste: leaf-scope verify took 8.88h of the 11.78h in-verify test time (75%, 190 runs). Merge-scope took 2.90h (61 runs) and runs the identical command set in this repo, because merge_checks is empty. A leaf that passes cleanly still pays the suite at leaf scope and again at merge on the rebased tree.
- Option: leaf scope runs a targeted selection (changed test files plus test files matching changed src modules), merge scope keeps the full suite as the landing gate. Even at half the full-suite cost, leaf targeting saves about 4.4h per 251 runs, roughly 37% of verify test time.
- Size: medium. Needs a selection rule or script, a leaf-scope test command distinct from the merge one, and adjusted receipt expectations. No such selection exists in this repo today. The `test_changed` name appears 28 times in timings, all on Oct 13-14, median 97s, so it was not an effective selector.
- Risk: real. Cross-cutting modules (src/shell.ts, src/next.ts) map poorly to single test files. Breakage then surfaces at merge, where red is more expensive (merge to check.fix was 14 moves all-time, merge attempts since Oct 14 are 53 of 53 merged). Quality gate moves later.

### C3. Peer-wait tests wait out real 11-second budgets
- Waste: in the green verify log of 2026-10-25 (1,167 tests, 196.5s), tests/peer-wait.test.ts summed 199s of per-test time. 16 of its 37 tests took 10s or more, summing 189s. Each passes budget argument '11' and asserts outcome `budget` (tests/peer-wait.test.ts, e.g. lines 208-232 and at least 12 more sites).
- Live check today: `bun test tests/peer-wait.test.ts` alone took 22.6s wall and 3m15s user CPU. The waits poll, they do not sleep idle, so they also compete for CPU with the rest of the suite.
- Expected gain: cutting the test budgets to about 2s where expiry itself is the assertion removes most of that file's 199s summed time, 16% of the whole suite's 1,231s summed per-test time. Wall effect is uncertain because bunfig.toml runs all files concurrently (concurrentTestGlob), so wall gain is plausibly 5 to 15%, not proven 20%.
- Size: tiny. One test file, mostly one repeated literal. Each changed case must still prove it outlived a shorter budget rather than never starting.
- Risk: low. A too-short budget could make slow-start cases pass for the wrong reason.

### C4. Most review visits send the leaf back for repair
- Waste: since Oct 12 (391 log moves, 63 merged), check.review exited to check.repair 57 times and to merge 43 times. check.repair then exited to check.fix 37 times against 20 to merge. 25 of 63 merged leaves (40%) closed with fix_rounds at least 1. Each loop is at least one extra seat prompt (timings: check.repair B prompts 56, check.fix A prompts 40) plus one extra verify (~154s median).
- This is the largest agent-cost pool I found, but I could not classify the Fix reasons from records in this pass. 396 closed review files exist and keyword presence in them is near-universal (test, docs, area, format all appear in over 350), so it carries no signal.
- Expected gain: unknown until Fix reasons are sampled and grouped. Not one small leaf yet.

### C5. Flaky flips are episodic clusters, not steady per-test flakiness
- Measurement: `akrogon flaky` today lists 57 test names, 85 flips total (brief said 19 tests, now stale). But 42 of the 85 flips carry just two green-run end times on 2026-10-24 (31 at 19:57, 11 at 20:08), and all 85 carry only 8 distinct end times. Strict same-tree, same-scope test red-to-green transitions in the ledger: 14. At ~170s per wasted rerun that is roughly 0.7h, about 5% of verify time.
- Concurrency does not explain it in timings: at test start, concurrency 1 had 313 runs (median 144s, 32% fail), concurrency 2 had 68 (median 117s), max observed 4.
- Expected gain from fixing named tests one by one: small and mis-aimed. The pattern is whole runs going red together, mostly on one day (Oct 24 had 43 in-verify test runs, the busiest day).

## Pick

Pick C1: fail-fast the sequential checks in verify on first red, recording the rest as blocked, and put this repo's cheap checks before test in issues/config.yaml.
Reason: it is the only candidate that is one small leaf, removes a whole waste class instead of guarding it, loses no usable evidence (results on a cheap-red tree are always thrown away), and needs no policy change to what counts as proof.
Baseline: Oct 14-25 verify ledger. 90 red runs took 5.06h. Test time burned inside the 48 format-red runs was 2.01h.
Expected: red-run verify time down about 40% (2.01h of 5.06h), all-verify time down about 17%, red feedback on cheap-red trees from ~155s to ~4s.
How the 20% is proven after: take the next 100 or more completed runs appended to issues/verify-runs.jsonl after the change. Join timings check_end to verify command logs the same way as here. Success means test seconds recorded on format-red runs at or near zero, total red-run duration down at least 20% against the 5.06h-per-90-runs baseline rate, and no rise in merge-attempt reds (baseline since Oct 14: 53 of 53 merged). Report the all-verify median too, computed identically (baseline median 154s).
Cost: one leaf. src/verify.ts about 15 to 25 lines, tests/verify.test.ts about 40 lines, issues/config.yaml reorder of two lines, one AREA.md line in src/AREA.md.

## Rejected candidates

- C2 rejected as pick: biggest percentage (roughly 37% of verify test time), but not small, and it weakens leaf-scope proof in exchange for later discovery at merge. It is the right pick only if the operator wants the 20% measured on total verify time and accepts that trade.
- C3 rejected as pick: safe and tiny, but wall-clock gain is unproven because the budgets overlap under concurrent files. Worth folding into any suite-speed leaf later.
- C4 rejected as pick: largest cost pool, no classified cause yet. Needs a sampling pass over closed review Fix items before it can be one leaf.
- C5 rejected as pick: steady-state cost is only about 5% of verify time and the flips cluster by run, not by test. Chasing the 57 names treats a run-level event as 57 test bugs.
- Verify per-command reuse: 83 reuse opportunities exist in the ledger (earlier green entry, same tree, scope, name and command) with 0 recorded `reused` entries. Rejected because the feature already shipped today, 2026-10-25 00:19 (commit fbac86c6, `reuseSource` in src/verify.ts). The ledger history predates it. Note it cannot help C1 anyway: a format fix changes the tree, and reuse keys on tree.
- Duplicate full suites outside verify: 55 outside-verify test runs over 60s took 4.33h, but 43 of them are dated Oct 13-14, before verify became the route. Since Oct 15 there are 12. The pattern already ended.
- Whole-run green receipt reuse across scopes: only 1 leaf-to-merge same-tree pair and 10 runs after an earlier green on the same tree (0.74h) in the whole ledger. Too small.

## Evidence lines

- E1 (tier 1, ledger compute): issues/verify-runs.jsonl plus issues/timings.jsonl joined on command log paths, 2026-10-25. Gives 251 completed runs, 12.1h, test 11.78h, 48 format-red runs, 2.01h test time inside them, 35 format-only reds, 90 red runs at 5.06h, leaf-scope test 8.88h, merge-scope test 2.90h.
- E2 (tier 1, ledger compute): issues/log.jsonl since 2026-10-12, 391 moves. Gives review-to-repair 57, review-to-merge 43, repair-to-fix 37, merged 63 with fix_rounds at least 1 for 25.
- E3 (tier 1, ledger compute): issues/timings.jsonl check_start and check_end pairing, 403 test runs. Gives concurrency at start (max 4) and outside-verify runs by date.
- E4 (tier 2, live command): `akrogon flaky`, 2026-10-25. 57 lines, counts sum to 85, 8 distinct end times. Definition read in src/flaky.ts `flips`: same-tree red then green per failed test name.
- E5 (tier 2, live command): `akrogon timing --cohort --since` and `--flow --since`, 2026-10-25. Cohort prints pass. Used only to confirm waits are small next to work time.
- E6 (tier 2, live run): `bun test tests/peer-wait.test.ts --timeout=30000`, 2026-10-25. 22.6s wall, 3m15s user, 37 pass. Single-file evidence, host shared with other panes.
- E7 (tier 2, live run): `bun test tests/next.test.ts --timeout=30000`, 2026-10-25. 46.4s wall, 246 pass. Confirms summed per-test time is not wall time under concurrent files.
- E8 (tier 2, recorded log): green verify test log of 2026-10-25T07:34 (remove-plan-debate), read via `akrogon log`. 1,167 tests, 196.52s. Per-file sums: next 512s, peer-wait 199s, reconcile 73s of 1,231s total.
- E9 (tier 3, code): src/verify.ts, functions `verifyCommands`, `runOnce` sequential loop, `greenEntry`, `reuseSource`, `completed`; issues/config.yaml checks order format, test, typecheck; bunfig.toml concurrentTestGlob. Read 2026-10-25.
- E10 (tier 3, git history): `git log -S reuseSource -- src/verify.ts` gives fbac86c6 dated 2026-10-25 00:19. Test count by `test(` grep: 626 at ff8f6e11 (2026-10-14) against 929 today, files 48 against 69. Median green in-verify test duration rose 94s (Oct 14) to 221s (Oct 24) by day from E1 joins.
- E11 (tier 1, ledger compute): issues/merge-attempts.jsonl. 91 attempts, 86 merged, 4 red, 1 held. Since Oct 14: 53 of 53 merged. Merge is not where time is lost.
- E12 (tier 1, ledger compute): 25 verify runs have no end and no commands, across Oct 15-24 (6 on Oct 24). Cause not identified in this pass.

## Pitfalls

- P1. Fail-fast could hide a real test red behind a format red for one cycle. What removes it: nothing needed beyond the rerun that already must happen, since the format fix creates a new tree that gets a full verify. Accepted cost, named here so the operator can veto.
- P2. Receipt gates gather per-command greens across completed runs on the same tree (src/verify.ts `requireGreenReceipt` path). A blocked test entry must never read as green. What removes it: blocked entries carry the blocker's nonzero exit, and `greenEntry` requires exit 0. The leaf's tests must pin this (blocked entry on same tree plus green entry from another run on the same tree is valid reuse, blocked alone is not).
- P3. Fail-fast only saves time where config order puts cheap checks first. Other registered repos may order differently. What removes it: keep the change generic (respect declared order) and fix only this repo's order in issues/config.yaml. No repo gets worse than today.
- P4. Small post-change samples will be swamped by cluster days like Oct 24. What removes it: the proof rule above requires at least 100 completed runs and compares rates, not single days.
- P5. The 25 no-end verify runs (E12) could be silently eating suite runs. What removes it: out of scope for the pick. If the operator does not already know the cause (for example seats calling stop-run), it deserves its own seed before it distorts the C1 measurement.
- P6. The suite keeps growing (E10), so absolute durations drift upward while measuring. What removes it: compare per-run medians and per-red-run rates, never raw totals across windows of different lengths.

## Questions for the operator

- Q1. Which baseline do you want the 20% measured on: red-run verify waste and feedback latency (C1, about 40% there, 17% of all verify time), or total verify time (then C2 is the honest pick at roughly 37%, with weaker leaf-scope proof)?
- Q2. Is test evidence on a tree that is already red on format ever used by you or a seat for diagnosis? If yes, C1 loses it by design.
- Q3. Do you want the peer-wait budget cut (C3) folded into the same leaf, or kept as a separate tiny leaf so each measurement stays clean?
- Q4. Are the 25 verify runs with no end (E12) a known stop-run pattern, or should that be seeded as its own observation?
