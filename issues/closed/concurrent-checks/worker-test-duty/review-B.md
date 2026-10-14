# Review B: worker-test-duty

Date: 2026-10-13
Phase: check.review (initial, blind)
Base: a7c911522773d29d7d2be5b30cce6788268aea50
Reviewed head: 419f930c8d656630a35c8a41ae93faa73b70a952
Verdict: ready

## Findings

No Fixes, Nits or operator actions.

The complete four-file diff implements D1–D4 without changing code, tests, dependencies or runner configuration. D5's prose-review proof and D6's unchanged guide/config guidance match the locked design. Debate is off, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read.

## Criterion verification

| Criterion | Evidence | Result |
| --- | --- | --- |
| 1 | Reviewed base...head diff and live brief-template.md sections 2 and 7. Commands name unit-targeted tests, include the none-named rule, and no longer supply test_changed or AKROGON_BASE. | Pass |
| 2 | Reviewed worker-protocol.md Launch and return / Failure ownership and implement-issue/SKILL.md implementation rules. Workers receive targeted commands only. A runs resolved changed tests after each pick and final checks after workers land. The implementation skill also requires checks before handoff and after repair. | Pass |
| 3 | Compared the wait-on-exit addition with readiness.yaml and the registered chart's long-run-path.md. It carries the specified fresh TMPDIR directory, nohup whole-command launch, log/exit/pid files, running/incomplete distinction and no timeout/restart rule. | Pass |
| 4 | Reviewed the added sentence in check-issue/SKILL.md's failed-checks paragraph. Targeted output proves its exercised outcome without replacing mandatory checks. | Pass |
| 5 | Read implementation/compare-test-head.yaml and implementation/test-check-head-retry.log: the required test command completed at reviewed head with 889 pass, 0 fail, 9044 assertions, 206.65 seconds. First-run timing failures were followed by the same-command green retry. | Pass |

Reviewed diff command: `git diff a7c911522773d29d7d2be5b30cce6788268aea50...HEAD`. Independent `git diff --check` passed and the worktree was clean.

## Required checks and evidence

Reused current implementation evidence rather than repeating completed checks for a prose-only diff. The plan's test command matches the configured printed check, including locked install, own-modules guard and `bun test --timeout=30000`. The report and logs show no skipped, filtered or disabled planned suite tests.

- Format: implementation/check-format-1791907338159-2108032.log, reported green at final head, all files unchanged.
- Typecheck: implementation/check-typecheck-1791907358963-2140653.log, reported green at final head, `tsc --noEmit`.
- Changed tests: implementation/check-test_changed-1791907311652-2086619.log, green after the final pick, four changed Markdown files and no affected test files.
- Test: implementation/test-check-head-retry.log and compare-test-head.yaml, same required command, terminal green result above. Existing red-docs, docs-links and base-run tests are included in the full suite. The workers' standalone 5000ms base-run timeout is not substituted for this required 30000ms suite result.

No tests, helpers or fixtures changed after the evidence runs. No merge_checks are configured. No additional run was needed for missing evidence or a concrete concern.

## Documentation and scope

Read docs/reference-index.md, skills/AREA.md, docs/guide/phases.md's implementation/review sections, the affected seat files and the registered chart's worker-duty, long-run-path and evidence fork decisions. The guide already assigns changed tests and phase-end checks to A. init-akrogon's test_changed references configure the runner rather than delegate it to workers. The added shell form matches the locked interim design; orphan cleanup and detached run machinery remain explicitly excluded.

No AREA.md is in the diff. No lesson is removed and no reusable Nit remains to record. No new tests or wording assertions were added.

## Test-Change trailers

None in base..HEAD (commits e5ee5b3d643f0b04f0634fa5a8d3fcc913321f27 and 419f930c8d656630a35c8a41ae93faa73b70a952). All changed paths are skill Markdown and none match src/test-files.ts, so no trailers are required.

## check.repair — 2026-10-13

Input: both initial reviews of 419f930c8d656630a35c8a41ae93faa73b70a952. Review A records F1; review B records no Fixes. No operator actions are open.

### Handed to A

- F1 (review A): plan correction required. The plan's change list omits the Standalone paragraph and skills/AREA.md, and its Docs section concludes there are no further worker-command statements to change. The design's owned-file list also omits skills/AREA.md. A must resolve these missing steps and the ownership constraint before correcting the two worker-duty references. B does not edit plan.md or design.md.

Before evidence: skills/AREA.md says “Worker returns include changed-test evidence”; implement-issue/SKILL.md's Standalone paragraph says “derive changed-test commands from the checkout” and “check the report and changed-test evidence”. Review A requests targeted-command/evidence wording at those locations. The existing targeted-only worker rule and A's resolved changed-tests duty must remain intact.

No doable Fix remains for B under the plan-correction rule. No code or documentation edits, repair commits or new tests were made. HEAD remains 419f930c8d656630a35c8a41ae93faa73b70a952 and git status is clean. Existing verification remains recorded above; no checks were rerun because no repair was made. Destination requested: check.fix for A's F1 plan correction and repair.

## Re-check — 2026-10-13

Prior reviewed base: a7c911522773d29d7d2be5b30cce6788268aea50
Prior reviewed head: 419f930c8d656630a35c8a41ae93faa73b70a952
Handed-off head: d9ab2361dfc033f8b90b778686548832615a7dad
Verdict: fix

Scope: repair commit d9ab236 only, inspected with `git diff 419f930..HEAD` and `git log 419f930..HEAD --format=full`. No branch-moving refresh is recorded, so no range-diff is needed. This was not a red merge ending, so merge replay evidence is not applicable.

F1: resolved. The plan correction explicitly adds both missing steps, skills/AREA.md now describes targeted-test evidence, and the Standalone paragraph derives targeted commands and reviews targeted-test evidence. No additional behavioral defect was introduced by the two-line repair. All paths named by the changed AREA file exist, listed from the repository root in one shell command; its scripts/observe.ts and scripts/log-tail.ts shorthand resolves under the named skills/watch-issues directory. `git diff --check 419f930..HEAD` passes and the worktree is clean. No Test-Change trailers occur in the repair range and none are required for its two Markdown files.

### F2 — Fix: repair verification does not establish criterion 5

Source: the required whole-suite test check run at repaired head d9ab236, documented in implementation/report.md and the three completed check logs. This is a verification gap introduced by the repair handoff, not a claim that the Markdown repair causes the timing failures.

Consequence today: approval would accept a failed required check using an incomplete comparison. The first repaired-head run has 178 failures, the retry has 222 failures plus one error, and base has 522 failures plus 39 errors. compare-test-fix.yaml contains only 157 known-red units. The report calls the remaining 372 units inconsistent, but neither leaf run was green. A green whole-command retry is required for the inconsistent disposition; otherwise each failing unit needs its actual outcomes recorded. Only known-red units allow continuation, and the leaf's own done-criterion cannot be waived as known-red.

Concrete omitted units, confirmed in the logs and absent from compare-test-fix.yaml:

- `a failed published holder receives one recovery notice across repeated passes`: first run passes (test-check-fix-first-run.log:61), retry times out (test-check-fix-retry.log:74), base passes (base-b2249ebc-7744-4506-972d-b247c99a95b8.log:71).
- `a member culprit ejects to check.fix and the next batch carries only the survivors`: first run passes (test-check-fix-first-run.log:233), retry times out (test-check-fix-retry.log:241), base passes (base-b2249ebc-7744-4506-972d-b247c99a95b8.log:393).

Criterion/check hit: brief criterion 5, “The repo's test check passes,” and the failed-check/comparison rule requiring every failing unit to have an admissible disposition. The earlier green run at 419f930 does not satisfy the plan's any-branch-commit rerun trigger for criterion 5 at d9ab236.

Required correction: A must supply passing required test-check evidence for the repair and correct the comparison/report so omitted failures and runtime errors are not presented as cleared. Do not change expectations or tests to hide host-load timeouts. Existing complete red runs were inspected rather than repeated by B; no new retry or base run was started in this re-check.

No Nits or operator actions. F1 remains closed. F2 is the only outstanding Fix.

## check.repair — F2 — 2026-10-13

Input: B's latest re-check of d9ab2361dfc033f8b90b778686548832615a7dad. F1 is closed; F2 is the only outstanding Fix. No operator actions are open.

### Handed to A

- F2: verification work judged too large for B's repair pass. The previous test/check comparison consumed 982.42 + 1453.40 + 3333.76 seconds (about 96 minutes). Correcting the report alone cannot establish brief criterion 5. A must obtain passing required test-check evidence at the handed-off head and correct the incomplete comparison/report without omitting failures or runtime errors. This is existing proof machinery with unsuccessful evidence, not missing machinery requiring a failed stop. No product-code repair or expectation change is identified.

No doable code/document Fix remains for B. No branch files, tests or expectations were changed, no repair commits were made and no verification run was started. HEAD remains d9ab2361dfc033f8b90b778686548832615a7dad and the worktree is clean. The completed red evidence and concrete omitted units remain recorded in F2 above. Destination requested: check.fix for A's verification and evidence correction.

## Re-check round 2 — 2026-10-13

Prior reviewed base: a7c911522773d29d7d2be5b30cce6788268aea50
Prior reviewed head and handed-off head: d9ab2361dfc033f8b90b778686548832615a7dad
Verdict: ready

F1 remains resolved. F2 is resolved by current passing evidence: implementation/test-check-fix2-green.log records the required whole-suite test check at d9ab236 with 889 pass, 0 fail, 9044 assertions and 187.84 seconds. It includes locked installation and the complete 49-file suite. The report's round-2 entry identifies this run as criterion-5 proof and no longer relies on the incomplete historical comparison to waive the check. Earlier logs remain historical red evidence, not proof of readiness.

Read the refreshed required-check logs: check-format-1791919727282-2712659.log reports unchanged files; check-typecheck-1791919935555-3654210.log runs tsc --noEmit; check-test_changed-1791919943206-134781.log records five Markdown changes, no affected test files and zero failures. The report records all three checks green at the unchanged repaired head.

`git diff d9ab236..HEAD` is empty, HEAD is unchanged, `git status --short` is empty and `git diff --check d9ab236..HEAD` passes. No new tests, helpers, fixtures, trailers or branch-moving refresh exist to review. No range-diff or red-merge replay applies. Reused the new completed evidence without rerunning checks.

No outstanding Fixes, Nits or operator actions. No reusable Nit requires a lesson entry. Destination requested: merge.

## Merge attempt a6d39480-5dc0-48c6-b682-df12a04166e4 — 2026-10-13

Applied stack base: a7c911522773d29d7d2be5b30cce6788268aea50
Recorded top and tested HEAD: d9ab2361dfc033f8b90b778686548832615a7dad
Carried members: none. No fetch, rebase or commit performed.

Checks invoked at the recorded top:

- Format: `akrogon run-check --name format -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun run format'\'''` — exit 0, implementation/merge-format.log, no rewrites.
- Typecheck: `akrogon run-check --name typecheck -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun run typecheck'\'''` — exit 0, implementation/merge-typecheck.log.
- Changed tests: `akrogon run-check --name test_changed -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\'': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'\'''` — exit 0, implementation/merge-test-changed.log, five Markdown changes and no affected tests.
- Test: `akrogon run-check --name test -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun test --timeout=30000'\'''` — started once, result pending, implementation/merge-test.log. Recorded process IDs: invoking shell 588549, run-check 588601, test runner 589335.

merge_covers, merge_checks and advisory are empty. The concurrent-checks owner still has memory-start-check and run-units open, so this single-member landing cannot close that owner.

First merge test run completed: exit 1, 888 pass / 1 fail, 9044 assertions, 277.27 seconds. The only failure is tests/next.test.ts's `named target equivalence: owner name matches folder path from root, subfolder and worktree`, a 60000ms timeout. The stack changes only five skill Markdown files; neither this test nor its code/helpers/configuration changed, so no plausible leaf cause is identified. Wrote implementation/merge-test-comparison.json before the one same-command, same-scope retry. Retry is running once with output to implementation/merge-test-retry.log; no base run has been started.

Retry completed: exit 0, 889 pass / 0 fail, 9044 assertions, 147.72 seconds. The named-target unit passes on retry, so the first failure is inconsistent; no base run is needed. Finalized implementation/merge-test-comparison.json with the attempt, exact command, base/top context, complete first-run log and green retry log. The record's units list is empty because no failing units remain to waive as known-red; the timed-out unit and its outcomes are recorded above. All four required checks passed; no advisory failures or Nits. HEAD still equals recorded top d9ab236 and the worktree is clean.

`akrogon phase worker-test-duty merged --slot B --check --attempt a6d39480-5dc0-48c6-b682-df12a04166e4 --compare implementation/merge-test-comparison.json` completed with exit 0 and `ok`, recording the tested top. The subsequent same-attempt `merged` call completed with exit 0 and `moved merged`. No issue/epic completion line was printed, so no broadcast is due. The command warned that the inconsistent comparison is not a green red-entry-resolution record and skipped self-update because the registered checkout diverged from origin/main (three commits behind); neither warning reversed the successful merge. No checkout synchronization or unrelated cleanup was performed.
