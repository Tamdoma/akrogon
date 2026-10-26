# Slot B independent map

Measured 2026-10-25 in /home/ivan/Work/infra/akrogon at e48585a5. No repository edits.
Scope: one small leaf. Percentages below name their denominator and are estimates until tested.

## Candidates

### C1. Reuse shared checks across leaf and merge verification — PICK
- Waste: identical checks execute again because their receipts have different scopes.
- Current mechanism: src/verify.ts reuseSource requires equal tree, scope, name and command. Both scopes include checks unless merge_covers removes them. greenRun also requires matching scope.
- Recorded baseline: issues/verify-runs.jsonl runs 42a9978a-251a-40b2-b318-ee1a28c7a484 (leaf) and cb279867-cb0d-4478-86fa-8fb8b8ce557d (merge), 2026-10-25.
- Both verify SHA 1deb1fb0d750e3f21154697743aa797ff15dd79d, tree 8d16e57d1e2ee3a99965ed9f430c0b531bacbe37, with identical format, test and typecheck commands, all green and none reused.
- Calculation: parse end-start per run: 197.055 + 200.879 = 397.934 seconds. Join command.log to issues/timings.jsonl check_end.log. Merge command durations sum to 200.576 seconds, including test at 196.636 seconds.
- Expected gain: about 50% of this unchanged-tree leaf-plus-merge verification cycle. Saving 80% of the second run would still save 40.38% of the pair. This is not a claim about total leaf lead time or all historical verifies.
- Wider observation: scanning completed setup-green runs chronologically finds six commands rerun after a green command on the same tree in another scope, including two full tests, costing 413.340 seconds by the timing join.
- Change: allow completed green results for shared checks to supply command entries across scopes. Still produce a merge-scoped receipt and execute any uncovered merge_checks.
- Size: src/verify.ts and tests/verify.test.ts, roughly 30–70 changed lines. Preserve whole-run receipt and known-red scope rules.
- Risk: accidentally accepting a leaf receipt as the merge receipt, skipping merge-only commands, or sharing a command whose result depends on execution context rather than its tree. See R1–R3.

### C2. Remove clock skew from the status overview fixture
- Waste: a correct status result fails its exact-minute assertion, provoking full-suite reruns and review work.
- Mechanism: tests/status.test.ts event() and prompt() each sample Date.now(). The overview fixture records its failed transition before its delivered prompt. src/status.ts clock() floors the difference. A 1 ms later prompt gives floor((23 minutes - 1 ms)/60000) = 22 instead of the expected 23.
- Measurement: scan completed setup-green verify receipts, parse failing test names with src/flaky.ts failedTests(), and join logs to check_end durations. Across 251 completed receipts, 53 have a red test command. The overview test appears in 12, and is the sole failing test in eight. Those eight test executions total 1,502.096 seconds, or 25.03 minutes.
- The eight sole-failure runs span seven trees. All 18 completed test runs on those trees total 3,597.495 seconds. Sole-failure executions account for 41.75% of that affected cohort's test time. This is exposure to avoidable retries, not an established fleet-wide saving.
- Concrete same-tree evidence: run 00a980da-9cdc-422f-bda6-3908a154c15f fails only this assertion after 210.302 seconds. Run 198d0ef4-6f13-4989-a14e-c88881ff2fdd later passes the same SHA 61d2b525e9ed3677a8d1b31fd19ff68de1ac0972 after 227.128 seconds.
- Expected gain: eliminate this fixture's clock-skew false failures, approaching 100% reduction against that narrow quality baseline. A two-run failure/retry cycle plausibly becomes one run, about 50% less verification work when this is the sole failure. Removing all eight would explain only 15.1% of the 53 red test receipts, not 20% fleet-wide.
- Change: derive the compared fixture timestamps from one captured epoch, keeping the exact elapsed-time assertion.
- Size: tests/status.test.ts only, roughly 10–25 lines.
- Risk: globally mocking time would miss subprocess clocks or disturb concurrent tests. Explicit fixture timestamps remove that risk without changing production behavior.

### C3. Run ordinary verification checks concurrently
- Waste: src/verify.ts runOnce awaits format, test and typecheck sequentially. Only merge_checks members currently run concurrently.
- Measurement: for the 45 completed setup-green receipts starting on/after 2026-10-24, join command logs to timing check_end records. Format totals 131.585 s, test 12,927.374 s, typecheck 125.795 s.
- Calculation: sum(sum(command durations) - max(command durations)) / sum(command durations) = 257.380 / 13,184.754 = 1.95% theoretical command-time saving, assuming no additional contention.
- Expected gain: at most about 2% for this measured cohort, below the requested 20%.
- Size: src/verify.ts and tests/verify.test.ts, roughly 40–80 lines using the existing concurrent-stage pattern.
- Risk: shared-worktree checks can interfere and concurrency can slow the dominant test suite. Running every command and collecting every failure must remain intact.

## Pick, cost and proof

D1. Pick C1 because a current, identical-commit pair demonstrates almost one entire redundant verification run. Existing command-level receipt reuse supplies the mechanism. Estimated implementation cost is one leaf, two files, 30–70 changed lines, with no new scheduler or receipt format.

A1. Prove the saving using an isolated fixture with a shared check that records executions. Run leaf verify, then merge verify on the same commit. Before: two shared-check executions. After: one, with the merge receipt naming the reused source. This proves a 50% reduction in shared-check executions for that cycle.
A2. Verify fresh merge-only commands still execute, changed trees/command text rerun, incomplete/setup-failed/red entries cannot lend green evidence, and the merge gate still requires its own scoped receipt. Keep known-red comparisons scoped.
A3. Measure before/after wall time on the same representative commit and host conditions over five paired trials. Require median leaf-plus-merge verify time to fall at least 20%, with the same required checks represented in the receipts. Report execution count and wall time separately.

## Rejected candidates

D2. Defer C2 despite its smaller diff and clear root cause. It improves quality and retry cost for an affected workflow, but the available records do not establish a 20% reduction across all test failures. It is the safer alternative if cross-scope result sharing is intentionally prohibited.
D3. Reject C3 for this request. The measured upper bound is 1.95%, and its contention risk works against the dominant test command.
D4. Do not propose same-scope command reuse as new work. It already exists in src/verify.ts and tests/verify.test.ts. Historical same-scope repeated greens predate that implementation and cannot justify claiming those savings again.

## Evidence lines

Tier definitions: T1 = inspected code or recorded execution data; T2 = calculation or projected result.
F1. T1 | issues/verify-runs.jsonl, runs 42a9978a and cb279867 | 2026-10-25 | identical SHA/tree/checks, leaf then merge, both green, no reused entries.
F2. T1 | issues/timings.jsonl, matching command.log/check_end.log | 2026-10-25 | merge test 196.636 s; merge commands 200.576 s.
F3. T2 | F1 end-start arithmetic | 2026-10-25 | 397.934 s combined; eliminating the full second run would save 50.48%, before retained setup/receipt overhead.
F4. T1 | src/verify.ts reuseSource, greenRun, knownRedReceipt; tests/verify.test.ts test “merge verification selects green and red receipts from its own scope” | inspected 2026-10-25 | command reuse and receipt scope are distinct concerns to preserve.
F5. T1 | issues/closed/herdr-session/evidence.tar.zst, session-routing/implementation/check-test-1792863934178-2543513.log via akrogon log | run 2026-10-24 | sole failure expected 0h 23m, received 0h 22m; 1,129 tests passed.
F6. T1 | tests/status.test.ts event, prompt and overview fixture; src/status.ts clock and cells | inspected 2026-10-25 | independently sampled timestamps plus minute flooring explain F5.
F7. T2 | verify-runs + failedTests + timing-log join | records 2026-10-14..25 | 12 overview failures, eight sole failures, 1,502.096 s; denominator 53 red test receipts, not 90 receipts red on any command.
F8. T2 | same receipt/timing join restricted to 2026-10-24 onward | calculated 2026-10-25 | C3 concurrency ceiling 1.95%.
F9. T1 | akrogon flaky, src/flaky.ts flips | read 2026-10-25 | 56 output rows including one missing-log placeholder, rather than the intake's earlier 19. Flips mean red then green on the same tree, not independent proof of each root cause.

## Pitfalls and what removes each

R1. Erasing receipt scope would weaken merge admission. Preserve greenRun/redRun/knownRedReceipt scope checks and require a merge-scoped record whose shared entries cite their source.
R2. Applying reuse to merge-only checks could skip required integration work. Limit the change to shared checks and prove a fresh merge-only check executes.
R3. Commands can depend on AKROGON_BASE or external state. Audit the shared commands' input assumptions before changing eligibility. Existing same-tree caching already assumes stable relevant inputs; do not claim this map proves that assumption for every registered repo.
R4. Timing totals mix overlapping work if interpreted as elapsed workflow time. Use receipt end-start for the sequential pair, and label summed command durations as execution time.
R5. Historical wasted work may already be fixed. Current code contains member-level reuse and separate whole-run scope gates. C1 addresses only the still-observed cross-scope duplication.

## Questions for the operator

Q1. Must the 20% apply to all akrogon work, or is a repeatable 20% improvement in the named leaf-plus-merge verification cycle sufficient?
Q2. Is a shared check's completed green result allowed to carry into merge on the same tree, while merge still produces its own receipt and runs merge-only checks? If independent fresh execution is required, choose C2 with its narrower quality baseline.
