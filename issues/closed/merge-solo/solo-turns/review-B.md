# Review B: solo-turns

Date: 2026-10-19. Initial blind check.review. Verdict: **fix**.

Base: `e522c1865538294dc1f65a90c7bcb5309a667513`.
Reviewed head: `71d022710db27ca397bdd450e574a5144f5ac2c2`.
The worktree is clean. Debate is off and there are no positions-B.md or rebuttal-B.md artifacts. No peer review was read.

## Fixes

### F1. Remove the prose blacklist test

`tests/solo-turns.test.ts:98-109` tests documentation vocabulary rather than merge behavior. It rejects every occurrence of `member` or `members` in both skills and src/AREA.md, even when the text describes another subsystem correctly. The actual source is existing archive documentation: base src/AREA.md describes a shared archive member and verifying each member through locate/readMember. This leaf changes those correct archive terms to `entry` to satisfy the new test even though archive behavior is outside this change. The new test therefore already forces an unrelated documentation edit, and makes ordinary correct documentation fail the required test suite.

Evidence: `check review-prose-source: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-review-prose-source-1792422693071-96452.log`, read back with `akrogon log`, lists the real base archive paragraph and confirms it matches the new test's forbidden-word pattern. The diff shows the corresponding member-to-entry substitution in src/AREA.md.

This violates the supplied Core Principles rule that mechanical checks validate function and the check-issue rule to reject akrogon tests of prose/output wording except literal commands, numbers or fixed references. Criterion 6 requires correct documentation, not a vocabulary ban. Delete this prose test and retain a reviewer check of the documentation's meaning. Do not replace it with different wording assertions. The source/schema checks for the specific symbols explicitly removed by criterion 5 and the command-boundary behavior tests can stay. This is a correction of a test expectation, so repair B must hand F1 to A under the repair exception.

## Verification and criteria

The final verify receipt `4d25854f-564b-4115-b3c0-1602c27f9271` names the reviewed head and tree `712dc6fc07f1231d19d4745547783553d15cf365`, setup 0, and all three configured commands with exit 0. Its run finished after the latest product, helper and test changes. No planned runner or check was filtered, skipped or disabled. No rerun is needed for unchanged code with complete current evidence.

- C1: final full-suite log passes the waiting-leaf independence/own-turn case. The test traces next, holder-only prompt/top, unchanged waiting branch and worktree HEAD, push, then the waiting leaf's independent turn.
- C2: final log passes red-holder handoff with one red attempt and another leaf still waiting. Product now takes the existing holder transition without a stack restart.
- C3: final log passes refused-push holder-only restack, lost push reply recovery, and the existing next-pass candidate recovery/dependent wake cases. The latter retains the crash-recovery guard.
- C4: final log passes old attempt/timing records, empty-members same-attempt resume, and refusal of non-empty/malformed members naming state.yaml. Both timing readers share unchanged schemas. The ZodRealError refinement preserves existing discovery/status contracts and remains a loud refusal.
- C5: the product diff removes member selection, member state, tips, loops and red-member tracking. History schemas retain their optional members fields. Typecheck passes.
- C6: manual review of the two skills, src/AREA.md and the affected operator guide pages confirms holder-only turn, push, restack and red handling. The documentation itself is current. F1 concerns the extra prose test.

Read back with `akrogon log`:

- Format: `/home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-format-1792422423684-3857322.log`, all matched files formatted.
- Tests: `/home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-test-1792422572621-3857322.log`, 1053 pass, 0 fail, 64 files.
- Typecheck: `/home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-typecheck-1792422574809-3857322.log`, tsc --noEmit.
- Planning red proof: `check-c1c2c3c4b-red-1792420992807-1897814.log`, real prior member selection makes the new independence, red, restack, lost-push and empty-list cases fail. This supplies the planned deliberate break for C1.
- Compatibility break proofs: `check-c4a-break-attempts-1792420986004-1897475.log` and `check-c4a-break-timing-1792420986142-1897580.log`, each makes the history guard red when old members are rejected. The original C4 refusal/source/doc red log `check-c4c5c6-red-1792420968176-1896580.log` was also read.

One command listed every path named in the changed src/AREA.md from the repository root. All exist: `check review-area-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-review-area-paths-1792422661071-94656.log`, read back with `akrogon log`. The reference index still points to this area. No lesson removal is in the diff.

The design's deployment prerequisite must still be checked at merge time across registered repositories, as the implementation report says. It is not an unfulfilled check.review action.

## Test-Change trailers

Listed from base..HEAD, judged against their cited source and the changed-file rule in src/test-files.ts:

- `7f349b4f`: `tests/batch-dispatch.test.ts` cites operator 1a and brief C1-C3 for deleting member-only tests/helpers and rewriting holder-turn scenarios. Accepted. Existing holder regression guards remain.
- `1d1e652c`: `tests/batch-dispatch.test.ts`, `tests/batch-merge.test.ts`, `tests/dependents-first.test.ts`, `tests/helpers.ts`, `tests/hold-retired.test.ts`, `tests/merge-attempts.test.ts`, `tests/phase.test.ts`, `tests/receipt-gates.test.ts`, `tests/reconcile.test.ts`, `tests/timing.test.ts`, `tests/verify.test.ts` each cite brief C5 / plan D1-D9 for removing members fixture literals. Accepted. The hold-retired removal is from a historical attempt fixture rather than a state batch, but it removes no assertion, the held-outcome guard remains, and legacy members retain separate history coverage.
- `1d1e652c`: `tests/batch.test.ts` cites brief C5 for refusing the removed schema key and deleting member-shape cases. Accepted. Empty-list normalization is separately exercised through readState at the CLI boundary.
- `1d1e652c`: `tests/next.test.ts` cites brief C1 for removing members= from mergeText. Accepted, because that prompt field is removed by the requested behavior.

There are no other Test-Change trailers in the range. The new solo-turns test file is still subject to the prose-test rule in F1 regardless of its trailer status.

## Nits and operator actions

None.

## Submission

`akrogon phase solo-turns check.repair --slot B --verdict fix` returned `recorded`. B's verdict is saved and awaits the other initial verdict. This does not prove movement to check.repair. Evidence: `check review-submit: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-review-submit-1792422737365-101126.log`.

## check.repair — 2026-10-19

Read both initial reviews against their common reviewed head, `71d022710db27ca397bdd450e574a5144f5ac2c2`. Review A has no Fixes. Review B has only F1. The current head is unchanged and the worktree is clean. No operator actions are open and no missing proof machinery was reported.

B repaired no code and made no commits because the sole Fix meets the test-expectation exception. No proof inputs changed, so the existing green verification remains current. No checks were rerun for this handoff.

### Handed to A

- F1: delete the documentation prose-blacklist test in `tests/solo-turns.test.ts:98-109`, retaining manual verification of criterion 6. This corrects a test expectation, which check-issue's check.repair rule explicitly assigns to A. Do not replace it with another prose-wording test. The unrelated archive terminology edit in src/AREA.md may be restored as part of this correction.

Handoff result: `moved check.fix`. Evidence: `check repair-handoff: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-repair-handoff-1792422846827-135433.log`, read back with `akrogon log`.

## Re-check after check.fix — 2026-10-19

Verdict: **ready**. F1 is resolved. No new Fixes, Nits or operator actions.

Prior reviewed base/head: `e522c1865538294dc1f65a90c7bcb5309a667513` / `71d022710db27ca397bdd450e574a5144f5ac2c2`.
Handed-off base/reviewed repair head: `e522c1865538294dc1f65a90c7bcb5309a667513` / `abfee125b4ab68bec34bd73325c077c12c74fc47`.

Computed `git range-diff e522c1865538294dc1f65a90c7bcb5309a667513..71d022710db27ca397bdd450e574a5144f5ac2c2 e522c1865538294dc1f65a90c7bcb5309a667513..abfee125b4ab68bec34bd73325c077c12c74fc47` myself. All seven prior commits are unchanged. Only 4dd9de4d and abfee125 are added. No rebase or conflict resolution occurred. Reviewed those two commits only. Evidence: `check recheck-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-recheck-diff-1792423073520-613126.log`, read back with `akrogon log`.

4dd9de4d removes the complete documentation-vocabulary test without adding another wording assertion. It retains the three source/schema/history/refusal tests. Its trailer is `Test-Change: tests/solo-turns.test.ts review-B F1: deleted 'merge docs describe the holder alone', a prose word ban that flagged correct archive "member" text in src/AREA.md`. Accepted against F1 and the real archive paragraph identified in the initial review. All earlier trailers remain unchanged and retain their initial judgment.

abfee125 restores the archive-member terminology from the base. This changes no documented behavior. The holder-only buildStack description and area/index links remain correct. One command listed every repository path named in src/AREA.md, and all exist: `check recheck-area-paths: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-recheck-area-paths-1792423073666-613257.log`, read back through `akrogon log`. Criterion 6 remains satisfied by manual review. The plan now records that proof and the reason for deleting the invalid test.

Current verification receipt `1d2d525a-c3e3-435c-bc83-8dbb60c24e5b` names abfee125 and tree `9fe5c0bb2f2037f7cd5341ae3a1e329b2fb9140c`, with setup 0 and every configured check exit 0. The run completed after both repair commits. Read these logs with `akrogon log`:

- `implementation/check-c4-c5-solo-1792422890749-149322.log`: 3 pass, 0 fail for the remaining tests in tests/solo-turns.test.ts.
- `implementation/check-format-1792422892934-149522.log`: all matched files formatted.
- `implementation/check-test-1792423044779-149522.log`: 1052 pass, 0 fail across 64 files, including the holder-only merge, red handoff, refused push, lost push, empty-list resume and history/refusal cases.
- `implementation/check-typecheck-1792423047001-149522.log`: tsc --noEmit, exit 0 in the receipt.

No other test or runner was changed, filtered or disabled. The one-test count reduction is exactly F1's deletion. No rerun is necessary with current complete evidence and an unchanged clean worktree. This handoff did not originate from a red merge ending, so rejected-merge rerun evidence is not applicable. The design's deployment-state read remains a merge-time prerequisite.

Submission: `akrogon phase solo-turns merge --slot B --verdict ready` returned `moved merge` (exit 0). Its subsequent dispatch reported Herdr `server_not_running` for `herdr pane list`. The phase move succeeded, but the automatic merge-seat wake did not. Evidence: `check recheck-submit: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-recheck-submit-1792423112384-624432.log`, read back with `akrogon log`.

## Merge — 2026-10-19

Attempt `d0f07f8b-d0cd-44c3-9b15-da0ba11a06b2`, applied top and clean worktree HEAD `abfee125b4ab68bec34bd73325c077c12c74fc47`, built on `e522c1865538294dc1f65a90c7bcb5309a667513`. The installed command's batch carries an empty members list, with no other leaf carried.

`akrogon verify --attempt d0f07f8b-d0cd-44c3-9b15-da0ba11a06b2` exited 0 and printed `reuse receipt 1d2d525a-c3e3-435c-bc83-8dbb60c24e5b tree=9fe5c0bb2f2037f7cd5341ae3a1e329b2fb9140c`. The reused receipt's format, test and typecheck logs were read during the re-check above: all green, 1052 pass and 0 fail. No integration or code change occurred. `akrogon phase solo-turns merged --slot B --check --attempt d0f07f8b-d0cd-44c3-9b15-da0ba11a06b2` exited 0 and printed `ok`.

The deployment prerequisite scan covers all 11 registered repositories, 896 states, one batch (this holder with zero members), zero blocked records. Its evidence is recorded in implementation/report.md. Gathered merge-solo/ISSUE.md and both leaf briefs before landing. green-merge remains unfinished, so this leaf alone does not complete the issue.

Landing exited 0: `moved merged`, then `deployed e522c1865538..abfee125b4ab; deployed abfee125b4ab`. Remote read-back confirms refs/heads/main is abfee125, leaf phase is merged with the batch cleared, and attempt history has one merged line for this attempt. Evidence: `check merge-landed: 0 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/solo-turns/implementation/check-merge-landed-1792423186582-630506.log`, read back with `akrogon log`. No issue/epic completion line was printed, so no completion broadcast is due.
