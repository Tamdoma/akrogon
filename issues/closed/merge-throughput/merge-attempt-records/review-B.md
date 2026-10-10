# Review B: merge-attempt-records

Date: 2026-10-10
Base: `2e78945849eed87c42abd56f224909f4d2050b36`
Reviewed head: `52bd80eeb5877182d8dfc726d936a3d62af3ef79`
Verdict: **fix**

## F1 — Failed unlanded holders lose their attempt record

Fix location: `src/next.ts:948-951`, `reconcileBatch` unlanded discard.

Realistic source: a merge holder with an applied batch fails before its candidate lands. The supported `akrogon phase <holder> failed --slot B --reason <reason>` transition preserves its batch and invokes recovery. `reconcileBatch` deliberately handles non-merge holders, including failed holders (also exercised by existing failed-holder recovery tests in `tests/batch-dispatch.test.ts`).

Trace: with an applied, unlanded holder+2-member batch, run `phase hold failed --slot B --reason "push interrupted before landing"`. The command returns code 0 and `moved failed`. Recovery clears the batch, but `attemptLines` returns `[]`: the newly added `fresh.state.phase === 'merge'` condition excludes the failed holder. Because the batch is cleared, later recovery cannot write the missing line.

Consequence today: failed, discarded attempts disappear from the attempt history, undercounting red outcomes and losing their timing and members. Hits brief criterion 3 (unlanded batch discarded by recovery appends one `red` line), D3's discard coverage, and the brief's attempt-level measurement goal.

Repair: write `red` for an unrecorded failed-holder discard as well, while retaining suppression for attempts already recorded by a prior ending. Add a CLI regression covering this failure transition and assert exactly one line after recovery and repeated `next`.

## Verification

- Read brief, plan including implementation refinements, design, implementation report, changed files, relevant phase/recovery/state/log contracts, the files guide, sync eligibility, and test-file citation rule. Debate is disabled, so absent positions/rebuttal files are expected.
- `bun test tests/merge-attempts.test.ts --timeout=30000`: **7 pass, 0 fail**, 60 assertions. Covers green batch, landed recovery, solo red, batch split, refused-push reuse, merge-phase discard, and stale/non-holder refusals.
- Additional temporary CLI probe reused the new test's batch fixture and added the real failed transition described in F1. Result: **0 pass, 1 fail**, expected one attempt line, received zero. The phase and cleared-batch assertions passed. Probe and dependency symlink were removed after review. This failure is directly caused by the changed discard condition, so a base comparison is unnecessary.
- Implementation report records blocking checks: format pass, full tests 610 pass/0 fail, typecheck clean, changed tests 489 pass/0 fail. No code changed during review. These checks were not repeated beyond the focused tests and specific concern above.
- New test file only. `Test-Change:` trailers in `origin/main..HEAD`: **none**. No existing test file or assertion was modified or deleted, so none is required under `src/test-files.ts`.
- `docs/guide/files.md` documents the new file and all fields. Sync already includes eligible issue files, so this path is covered. No `AREA.md` changed.
- No operator action, credential requirement, or reusable Nit recorded.

## 2026-10-10 check.repair

Reviewed both initial reviews. A recorded no Fixes. Repaired B's F1 with no handoff or operator action remaining.

- Test commit: `0dfbd8a` adds the supported failed-holder CLI transition regression in `tests/merge-attempts.test.ts`. Before repair: `bun test tests/merge-attempts.test.ts --test-name-pattern='failed unlanded holder' --timeout=30000` exited 1, with 0 pass / 1 fail. The failed phase and cleared batch assertions passed; the attempt count failed with expected 1, received 0. Existing expectations were unchanged. The commit includes the required `Test-Change:` trailer citing F1 and the supported failure transition.
- Fix commit: `d763e37` extends the unrecorded discard condition to failed holders. The existing merge-phase case stays covered, and check.fix replay remains excluded.
- After repair: `bun test tests/merge-attempts.test.ts --timeout=30000` exited 0, **8 pass / 0 fail**, 69 assertions. The new test proves one red line with the original attempt and both members, plus unchanged lines after two `next` recovery passes.

### Required proof

1. Green holder+2 members and landed-candidate recovery: both attempt tests pass, including one-line outcomes, member list and the green start/end assertion.
2. Solo red, batch split and refused-push reuse: existing CLI tests pass, preserving exactly-one assertions and no append at restack.
3. Unlanded recovery discard: both merge-phase and failed-holder cases pass; the latter includes repeated recovery.
4. Existing log bytes and move-line schema: green attempt test passes; full phase/next suites also pass. No log writer or reader changed.
5. Stale attempt and non-holder refusals: test passes with no attempt file written.
6. Guide field verification: `docs/guide/files.md:55-73` still documents the new file and all fields. No schema or guide change in repair.
7. All blocking checks pass on repaired head:
   - `bun run format`: exit 0. It rewrote known pre-existing drift in untouched `src/status.ts`; only that formatting change was restored, keeping repair scope minimal.
   - `bun run typecheck`: exit 0.
   - `bun test --timeout=30000`: exit 0, **611 pass / 0 fail**, 30 files, 51.45s.
   - `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, **490 pass / 0 fail**, 15 files, 46.47s; base `2e78945849eed87c42abd56f224909f4d2050b36`.

Repaired head: `d763e37`. Worktree clean after both commits. No merge_checks run, no temporary repair files created, and no reusable Nit held by B. Ready for merge.

## 2026-10-10 merge

Attempt: `097327b9-ce67-4ef1-bb1a-2e8ca0bc3249`. Applied top and tested HEAD: `547063c52e068702aaa9e77117b749e9d1341275`. Refreshed base from config: `808a90e14b3b1a53b998127c58a08a02f9ab1b8c`. No members carried, no fetch/rebase/commit by B.

All configured checks ran on the applied top:
- `bun run format`: exit 0; restored only its known pre-existing rewrite of untouched `src/status.ts`, leaving the recorded top clean.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, **615 pass / 0 fail**, 31 files, 50.57s.
- `bun test --changed=808a90e14b3b1a53b998127c58a08a02f9ab1b8c --timeout=30000` with refreshed AKROGON_BASE: exit 0, **494 pass / 0 fail**, 16 files, 44.81s.

No merge_covers, merge_checks or advisory commands configured. `akrogon phase merge-attempt-records merged --slot B --check --attempt 097327b9-ce67-4ef1-bb1a-2e8ca0bc3249` returned `ok`. No completion owner can close in this batch: merge-throughput retains batch-limit-repo, red-main-hold, hold-fix-leaf, merge-bounce-rounds and red-batch-culprit unmerged, so no completion briefs or broadcast are due unless the command reports a completion.

Landing command exited 0 and printed `moved merged`, with no completion line. Authenticated remote read-back (`git ls-remote origin refs/heads/main`) confirmed `547063c52e068702aaa9e77117b749e9d1341275` on main, and state is `merged`. No broadcast required.
