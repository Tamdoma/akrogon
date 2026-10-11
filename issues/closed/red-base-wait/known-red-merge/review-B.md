# Review B — known-red-merge

Date: 2026-10-11
Phase: initial check.review, slot B
Base: 2756bd07d31730f90ee539e1261299e2c481b66a
Reviewed head: a96c6d3cd22e07f245aae5f7b6cc82d76a1779fd
Verdict: fix

Read brief, plan, design, implementation report, reference index, changed behavior's merge guide and skill, and the whole implementation diff. Debate is off, so positions-B/rebuttal-B are absent as expected. No peer review was read. No code edits or commits made.

## Fixes

### F1 — Comparison presence bypasses the configuration guard on restack

Location: src/phase.ts:794; tests/merge-compare.test.ts:782-810.
Source: a merge seat stamps a green record for an active red entry, then another merge changes issues/config.yaml before the holder pushes. The non-fast-forward push enters restack. This is the real CLI flow exercised by the existing green-record restack case, which advances the remote with a changed issues/config.yaml and asserts reuse.
Consequence today: the comparisons.length > 0 disjunction makes recordConfigEqual optional. A newly added or changed checks/setup/merge_checks command can be skipped and the stack lands under a check configuration that was never run. The original configuration guard remains mandatory without records, so adding green evidence weakens acceptance.
Contract: D7 adds a red-bearing refusal to today's reuse conditions, it does not remove the configuration condition. The live merge skill:49 and docs/guide/merge.md explicitly require unchanged issues/config.yaml. Design excludes changing existing batching behavior.
Evidence: implementation/review-B-targeted.log passes the existing real-push case that expects this bypass. src/batch.ts:70-76 shows issues/ is excluded by equalOutsideRecordFolders and therefore only recordConfigEqual protects changes here.
Fix: require recordConfigEqual regardless of comparison presence. Correct the new test to advance only ordinary issue/learning records for green-only reuse, and cover configuration changes requiring rerun with records present. The expectation correction belongs to A under the repair rules.

### F2 — An accepted known-red unit can miss the restack rerun gate

Location: src/red-record.ts:278-282 (called by src/phase.ts comparisonsCarryRed/restack).
Source: the supported D5 resolve-then-apply comparison has a known-red unit whose counterpart outcome is pass. The implementation deliberately accepts this input, as documented in report limitations and exercised by tests/merge-compare.test.ts:606-635. After --check, a remote issue-record-only change causes a non-fast-forward push and restack.
Consequence today: hasKnownRed ignores that accepted unit because base.outcome is not fail, so the branch can take reuse and drop its records rather than run fresh checks. The gate also adds a leaf.outcome predicate beyond D7's accepted known-red verdict condition.
Contract: done-criterion 5 and D7 require rerun whenever any accepted record holds a known-red unit. This is a named criterion scenario, not a speculative extra case.
Evidence: implementation/review-B-gate.log records a parsed compared record with known-red/leaf fail/retry fail/base pass and hasKnownRed returning false when C5 requires true. The real acceptance path is established by the passing resolve-then-apply CLI test in implementation/review-B-targeted.log. The probe's temporary files were removed.
Fix: base the reuse exclusion on presence of the accepted known-red verdict, without narrowing by the outcomes. Add the smallest restack proof of the C5 scenario.

### F3 — The merge skill retains the prohibited fix-forward and expectation-edit rules

Location: skills/merge-issue/SKILL.md:57 and Shared endings:75.
Source: a solo merge seat reads this skill after rebasing onto a broken default branch, or discovers an outdated expectation in its own criterion. The paragraph still explicitly instructs B to fix the wrong test in its own commit and fix a broken default branch forward with failing tests as criteria.
Consequence today: the seat repairs unrelated base defects or changes expectations during merge instead of taking the comparison/culprit paths. Shared endings adds comparison handling but leaves the earlier contradictory instructions in force, and never states that own-criterion failures route to that leaf's A or that B corrects no expectation.
Contract: done-criterion 8 and D11 specifically require replacing that unconditional fix-forward clause, routing own-criterion units through --culprit, and forbidding B expectation corrections at merge while retaining the other test-proof-rules clauses.
Evidence: live paragraph at line 57, and rg results for own/criterion/criteria/expectation/fix-forward show no replacement instruction. The merge-skill test passes despite this missing acceptance outcome.
Fix: make the targeted semantic correction to the skill, including the own-criterion culprit/A route. Review the resulting rule by meaning.

### F4 — New document test asserts prose that does not run literally

Location: tests/red-docs.test.ts:59-61.
Source: the configured full/changed test checks execute the new merge-skill document test on every applicable review. It asserts the ordinary wording "rerun", "repo is held", and "the repo is held" instead of limiting mechanical validation to literal commands/schema references.
Consequence today: a meaning-preserving rewrite can fail the mandatory check, while the actual prohibited fix-forward rule in F3 passes. The new test presents word presence as proof of the merge behavior it does not establish.
Contract: check-issue's test-proof rule explicitly rejects akrogon tests of prose/output wording except commands, numbers and fixed references that run literally. Core principle Function over form requires thinking-agent judgment for prose.
Evidence: those new assertions are in the reviewed diff; implementation/review-B-targeted.log reports this test green with F3 still present.
Fix: remove the added prose assertions with this cited source/rule, retain literal CLI/schema contracts, and leave semantic criterion-8 verification to review. This correction of an existing expectation belongs to A.

## Verification

- Dependency setup: flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile' completed, no changes.
- Targeted concern run: bun test tests/merge-compare.test.ts tests/hold-retired.test.ts tests/red-docs.test.ts tests/culprit.test.ts tests/batch-merge.test.ts --timeout=30000. Exit 0, 67 pass, 0 fail, 1090 assertions. Full output: implementation/review-B-targeted.log.
- C5 gate probe: parsed the supported resolve-then-apply record and called the real hasKnownRed helper. Output: implementation/review-B-gate.log. It returned false. This was an explicit concern probe, not a failed configured check or a new committed test.
- Report records full suite 798 pass, changed suite 643 pass, format and typecheck green. Prior planning records the deliberate red implementation baseline. No planned runner was disabled or filtered in this diff. Report's full/changed suites include the planned files. No need to repeat the unchanged full suite for this verdict.
- No red configured check occurred in this review, so no retry/base-run comparison disposition was required.
- Worktree remains clean. No merge_checks configured, no live proof required, no operator action needed.

## AREA paths and docs

One command listed each changed AREA file's named paths and existence from the worktree root. All code/test/skill/index pointers exist. Absent runtime paths: issues/, issues/config.yaml, issues/base-runs.jsonl, issues/red-records.jsonl, issues/merge-attempts.jsonl. These describe the registered checkout's records, excluded from this worktree by sparse checkout, rather than dead source pointers. No dead-pointer Fix.

Read the behavior page docs/guide/merge.md and affected README/guide/skill claims. Hold retirement and historic held-outcome parsing match the plan. Deleted src/hold.ts and tests/hold.test.ts have no remaining AREA/index pointers. F1 and F3 are the material code/document contract mismatches. No lesson line was removed.

## Test-Change trailers in target..HEAD

- d1515ea: tests/pause-status.test.ts — "retired hold assertions removed for the known-red-merge hold retirement". Source: brief C6/C7, old hold behavior intentionally retired. Replacement inertness/status proof in hold-retired.test.ts.
- d1515ea: tests/merge-attempts.test.ts — "held-PSI case converted to a legacy-parse plus red-line case for the hold retirement". Source: C6/C7. Historical held parsing retained; real red ending still asserts pressure deltas.
- d1515ea: tests/command-reference.test.ts — "contract updated for retired verbs and flags". Source: C7 and D9, old advertised commands intentionally removed.
- d1515ea: tests/red-docs.test.ts — "merge-issue contract assertions added". Addition needs no old-expectation source. F4 concerns the new prose assertions.
- d1515ea: tests/hold.test.ts — "deleted; hold retirement and inertness move to tests/hold-retired.test.ts". Source: C6/C7, retired feature; legacy inertness and refusal proofs remain.
- a774ad8: tests/AREA.md — "the known-red-merge doc update renames coverage lines for the new merge-compare and hold-retired tests". Cited planned coverage/docs change. This path matches src/test-files.ts because of the tests segment.
- 7aea9b8: tests/merge-compare.test.ts — "added setup line so real base-run passes guard own-modules, and read closed leaf folders after merged moves them; no existing expectation changed". Real source: own-modules guard and actual CLI completion moving issue folders. Changes are consistent with those live contracts.
- a96c6d3: tests/merge-compare.test.ts — "formatting only; no expectation changed". Confirmed formatting-only commit.

## Nits and operator actions

None. F1-F4 are blocking findings. No additional issue or lesson was created.


## 2026-10-11 check.repair — B

Prior reviewed head: a96c6d3cd22e07f245aae5f7b6cc82d76a1779fd.
Read both initial reviews. No operator actions are open.

### Repaired

- Review-A F2: reproduction commit 72f9e64, fix 7755cc4. Real CLI calls --check with a green record then --check without --compare. Before: comparisons retained; after: absent. Logs: implementation/repair-B-AF2-red.log (exit 1, 1 failed), implementation/repair-B-AF2-green.log (exit 0, 1 passed). No old expectation changed.
- Review-B F2: reproduction commit 628ce17, fix 85126a5. Real CLI accepts the D5 known-red/pass-counterpart record, advances only issues/notes.md on the remote, then pushes. Before: reuse; after: rerun and comparisons dropped. Logs: implementation/repair-B-BF2-red.log (exit 1, 1 failed), implementation/repair-B-BF2-green.log (exit 0, 1 passed). Gate now checks the verdict alone. No old expectation changed.
- Review-B F3: merge skill corrected in its own documentation commit (SHA recorded below). Before line 57 instructed B to correct a wrong test and fix a broken default branch forward. After: B corrects no test expectation, base reds take the comparison path, and own-criterion failures take --culprit to that leaf's A. The prior literal test-proof-rules clauses remain. Verified the actual before/after diff by meaning against C8/D11, no prose assertion added.

### Handed to A

- Review-A F1 / Review-B F1: configuration guard repair and its planted restack fixture expectations must be corrected together. A owns correction of test expectations. Restore mandatory recordConfigEqual and use an issue/learning record-only remote advance for the green-only and known-red distinction (a root main-note file is a code difference and would itself force rerun). Also cover changed check configuration with records present. Cite the live configuration contract in the Test-Change trailer.
- Review-B F4: remove the new prose assertions from red-docs.test.ts, retaining literal commands/schema tokens. A owns correction/deletion of an existing expectation.

No plan/design edit, unrelated repair, live mutation, or lesson removal.


### Final repair verification and handoff

Documentation fix commit: 0d22194.
Handed-off base: 2756bd07d31730f90ee539e1261299e2c481b66a (unchanged).
Handed-off head: 0d22194 (full SHA available in git).

Ran all four printed checks through akrogon run-check with the configured locked setup and own-modules guard:

- format: exit 0, no file changes. implementation/repair-B-format.log.
- typecheck: exit 0. implementation/repair-B-typecheck.log.
- test: exit 0, full suite, including all criterion proof files. implementation/repair-B-test.log.
- test_changed: exit 0, 645 pass / 0 fail across 24 files. implementation/repair-B-test_changed.log.

Proof coverage after repair: C1/C2/C4 use merge-compare CLI binding, refusal, notices and landing tests; C3 uses culprit/batch-merge tests; C5 uses restack cases and the new passing-counterpart reproduction, with the configuration/fixture defect explicitly still handed to A; C6/C7/C9 use hold-retired runtime proofs and sweeps; C8 uses literal contract checks plus semantic before/after review of the corrected skill, with prose assertions explicitly still handed to A. These all ran in the full suite. No planned test or runner was disabled. git diff --check passed and the worktree is clean.

No configured check failed, so no unrelated-red retry or base comparison record was needed. No merge_checks run. Only the two reproduction tests were added. No reusable Nit held by B remains to record before a merge move, and this pass requests check.fix rather than merge because the two A handoffs remain.

Full suite result: 800 pass / 0 fail across 42 files. Full handed-off head: 0d221942ee5ebd91409e60091f80977de1df8b07. Phase command returned `moved check.fix`.


## 2026-10-11 check.review — repair re-check

Verdict: ready.
Prior reviewed base: 2756bd07d31730f90ee539e1261299e2c481b66a.
Prior reviewed head: a96c6d3cd22e07f245aae5f7b6cc82d76a1779fd.
Repair handoff to A: 0d221942ee5ebd91409e60091f80977de1df8b07.
Reviewed head: f7396a46bad9d92856abb999fa06b6f33cba94cd.
Base unchanged. No branch refresh/rebase reported or present, so no range-diff required. This repair came from review, not a red merge ending, so no rejected merge-command replay is required.

Reviewed only the repair diff a96c6d3..f7396a4, including B's committed repairs and A's two subsequent commits. No new blocking defect or Nit introduced by the repair was found.

### Prior findings confirmed resolved

- F1 (both initial reviews): mandatory recordConfigEqual is restored in f7396a4. Existing known-red/green restack fixtures now advance only issues/notes.md, proving the record gate without a configuration change deciding the result. A new real-push regression case requires rerun when configuration changes despite a stamped green record. Report records this case red at 5f91eaf and green at f7396a4.
- F2 (review B): hasKnownRed checks the accepted verdict alone. Passing-counterpart reproduction is green and restack clears records after choosing rerun.
- F3 (review B): semantic inspection confirms the merge skill prohibits B expectation corrections, sends own-criterion failures to the culprit leaf's A, and sends broken-base failures through comparison. The prior other test-proof-rules clauses remain.
- F4 (review B): only the added ordinary-prose assertions were removed. Literal CLI/schema contracts remain in red-docs.test.ts.
- F2 (review A): every --check replaces comparisons, including clearing them when no --compare was supplied. The real CLI repeat-check reproduction is green.

### Evidence

- Re-check command: bun test tests/merge-compare.test.ts tests/red-docs.test.ts --timeout=30000. Exit 0, 30 pass / 0 fail, 180 assertions. Complete log: implementation/recheck-B-targeted.log.
- Latest configured changed check log implementation/check-test_changed-1791717097650-3733442.log: 646 pass / 0 fail, 24 files. Matches A's repaired-head report. The report also records format/typecheck clean and full suite 801 pass / 0 fail across 42 files. No planned command/test was skipped or disabled in the repair.
- git diff --check a96c6d3..HEAD passed; worktree clean.
- No configured check failed, no comparison/base-run retry needed, no live proof or operator action open.

### Repair Test-Change trailers

- 72f9e64, tests/merge-compare.test.ts: review-A F2 repeat --check without --compare source, reproduction addition only. Valid, existing expectations unchanged.
- 628ce17, tests/merge-compare.test.ts: review-B F2 / C5 accepted passing-counterpart known-red source, reproduction addition only. Valid, existing expectations unchanged.
- 5f91eaf, tests/merge-compare.test.ts: fixture correction and configuration regression cite review-B F1 and its live configuration contract. Valid, corrects the planted source error without weakening the acceptance outcome.
- 5f91eaf, tests/red-docs.test.ts: removal cites review-B F4's prose-test rule. Valid, literal contracts retained.

No AREA file changed in the repair. Checked the affected live merge-skill instructions against the repaired code and criterion 8. No additional lesson is required: B holds no reusable Nit. All initial Fixes are resolved and no A handoff remains.


## 2026-10-11 merge — solo attempt 5e3b38af-4e87-4079-9f87-8e83e570e391

Prior reviewed base: 2756bd07d31730f90ee539e1261299e2c481b66a.
Prior reviewed head: f7396a46bad9d92856abb999fa06b6f33cba94cd.
Fetched origin/main and rebased onto target 1a5fbf1291199eb11d40acfaea91081e8c587739.
Resolved head: 30eda51c9c437b1e0e9daee2209c13724d32885b.

Conflicts resolved:
- tests/hold.test.ts: kept the planned deletion. Main's sole change was registering its temporary remote-advance folder for cleanup, a fixture helper change in the retired hold tests. It does not change hold-retirement outcomes C6/C7. Existing deletion trailer cites those outcomes and the replacement hold-retired.test.ts.
- tests/AREA.md: preserved main's reconcile.test.ts pointer and all leaf coverage entries. Both live pointers exist.
- src/status.ts: preserved main's readKept reporting while removing all retired hold marks and readers.

Computed git range-diff 2756bd07d31730f90ee539e1261299e2c481b66a..f7396a46bad9d92856abb999fa06b6f33cba94cd 1a5fbf1291199eb11d40acfaea91081e8c587739..30eda51c9c437b1e0e9daee2209c13724d32885b. Complete evidence: implementation/merge-range-diff.log. Reviewed every changed patch: the three conflict adaptations above and main's preserved post-push tested-base citation argument. Other leaf commits replay unchanged.

Refreshed AKROGON_BASE with akrogon config: 1a5fbf1291199eb11d40acfaea91081e8c587739. Installed-helper retired-lesson re-removal returned none. No lesson commit required. No missing env reported by status, no grant-dependent live proof required. The installed merge skill still has retired hold text; the leaf's reviewed merge contract and explicit brief require the known-red/culprit rule instead. No expectation corrected at merge.


### Merge checks and accepted stamp

Ran the four configured commands against 30eda51c9c437b1e0e9daee2209c13724d32885b, through akrogon run-check, each using flock on akrogon-install.lock for bun install --frozen-lockfile and the own-modules guard before its configured command:
- format: bun run format, exit 0, no changes. implementation/merge-format.log.
- typecheck: bun run typecheck, exit 0. implementation/merge-typecheck.log.
- test: bun test --timeout=30000, exit 0, 828 pass / 0 fail across 43 files. implementation/merge-test.log.
- test_changed: bun test --changed="$AKROGON_BASE" --timeout=30000 with required AKROGON_BASE assertion, exit 0, 672 pass / 0 fail across 25 files. implementation/merge-test_changed.log.

No merge_checks, merge_covers or advisory commands configured. No active repo red entry appeared in status, so no green resolution record was required. No check failed, no retry/base comparison needed.

akrogon phase known-red-merge merged --slot B --check --attempt 5e3b38af-4e87-4079-9f87-8e83e570e391 returned ok. Worktree clean at the tested head. Completion-owner briefs gathered: known-red-leaf and known-red-merge, the two leaves of red-base-wait; the first is already merged. The solo batch has no carried members.

### Landing evidence

akrogon phase known-red-merge merged --slot B --attempt 5e3b38af-4e87-4079-9f87-8e83e570e391 exited 0 and printed `moved merged`, `issue complete red-base-wait`, and `deployed 1a5fbf129119..30eda51c9c43`. Remote read-back (`git ls-remote origin refs/heads/main`) confirms 30eda51c9c437b1e0e9daee2209c13724d32885b landed. Closed leaf state is merged and the worktree is clean.
