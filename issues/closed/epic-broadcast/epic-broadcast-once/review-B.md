# Review B: epic-broadcast-once

Phase: `check.review` (initial review). Date: 2026-09-30.
Base: `147dcb33c8c5ae826cff3b74be212d120e0ba913`.
Reviewed head: `6ea82d10769354c75411bc43e951d6a98bb36fef`.
Verdict: **fix**. Requested destination: `check.fix`.

## Findings

**F1 — Fix: test the completion contract without requiring unrelated status wording.**

`tests/phase.test.ts:178,181,195-196,617,653` introduces whole-stdout comparisons against `moved merged` or `moved merged\n<completion line>`. These check incidental progress wording and the ordering of all output, beyond the completion interface defined by C1, C2 and C5. The check-issue rule explicitly rejects “akrogon tests of prose/output wording” except literal commands, numbers and fixed references. Exact matching of `issue complete <owner>` and `epic complete <owner>` is justified because the merge skill consumes those lines. Exact matching of the unrelated progress message is not.

Concrete maintainability defect: changing the informational progress line at `src/phase.ts:115` from `moved merged` to `phase merged`, or adding an informational line, would fail these new assertions even with identical exit codes, completion lines, states, source closure and folder moves. This follows directly from the comparisons. No source mutation was performed during review.

Repair only the new assertions: check successful command exit codes, isolate the completion lines, and assert their absence or exact value and count. Retain the state, move and source-closure assertions. Restore the removed exit-code assertion for the concurrent inner merges at line 178. No production change is needed for this finding.

## Verification

- **V1:** Read the brief, design, plan, implementation report, ponytail guidance and affected documentation before reviewing the eight-file diff. No B debate artifacts exist because `debate: no`. No peer review was read.
- **V2:** Ran `bun test tests/phase.test.ts` at the reviewed head: 37 pass, 0 fail, 316 assertions, 6.08 seconds. These exercise real CLI subprocesses, concurrent merges, terminal retries, both recovery scopes and unchanged source closure. GitHub is stubbed only at the external boundary.
- **V3:** Reused the implementation report's evidence at the same head: format and typecheck passed, full `bun test` passed with 339 tests and 3,932 assertions, and all three configured changed-test runs passed. No source or integration change warrants repeating those checks. `git diff --check` passed and the worktree is clean.
- **V4:** Traced `completeOwner`, both recovery callers and `withLock`. The print is gated by owner completion and `justMerged`, source closure order is unchanged, and recovery remains silent. C2 is exercised with a standalone completion owner, as permitted by its wording. No additional concurrency defect was found.

## Documentation and scope

The changed documented behavior matches the implementation: standalone completion prints `issue complete`, epic completion prints `epic complete`, and inner issues stay silent. Both skills gather the owner's briefs before the move and gate broadcasting on either completion line. The guides and README agree. The remaining `issue complete` substring in `docs/guide/chart.md:203` concerns source closure, not broadcasting. No `AREA.md` changed, and the reference index and affected area pointers were followed.

The diff stays within the eight planned files. The minimal production change follows the existing lock and closure flow. Silent recovery is the plan's explicit L1 exclusion, not a new finding. No new reusable lesson beyond the existing test-wording rule was identified.

## Repair round 1 re-check

Date: 2026-09-30. Repair base (prior reviewed head): `6ea82d10769354c75411bc43e951d6a98bb36fef`.
Reviewed repair head: `14e045cf44daf5edf3413ba681fd5b66410b62ba`.
Verdict: **ready**. Requested destination: `merge`.

**F1 — Resolved.** Reviewed only the repair diff, which changes `tests/phase.test.ts`. The assertions no longer require `moved merged` or whole-stdout ordering. Inner merges assert successful exit codes and absence of both completion markers. Final epic and concurrent standalone merges assert the completion lines' exact values and count. The final epic invocation now also asserts success. Existing state, move and source-closure assertions remain intact. No defect introduced by the repair was found.

Ran `bun test tests/phase.test.ts` at the repair head: 37 pass, 0 fail, 321 assertions, 6.39 seconds. `git diff --check` passed and the worktree is clean. Reused the repair report's same-head format, typecheck and full-suite evidence: 339 pass, 0 fail, 3,937 assertions, plus its green changed-test run. The report also records a reverted progress-wording mutation under which both repaired completion tests passed. No documentation or index changed in the repair.

## Merge verification

Date: 2026-09-30. Fetched `origin` and rebased onto `origin/main` at `147dcb33c8c5ae826cff3b74be212d120e0ba913`. Rebase reported already up to date, with no conflicts. Prior reviewed and integrated head both remain `14e045cf44daf5edf3413ba681fd5b66410b62ba`. Refreshed `AKROGON_BASE` from `akrogon config`: `147dcb33c8c5ae826cff3b74be212d120e0ba913`.

- **V5:** `bun run format` passed, with all files unchanged.
- **V6:** `bun run typecheck` passed, exit 0.
- **V7:** `bun test` passed: 339 tests, 0 failures, 3,937 assertions, 83.77 seconds.
- **V8:** Ran the configured `test_changed` command with the refreshed `AKROGON_BASE`; passed: 37 tests, 0 failures, 321 assertions, 6.11 seconds.

No advisory commands are configured. `git diff --check` passed and the worktree remains clean. The completion owner's only leaf brief was gathered before the completion move.

Fast-forward push `git push origin HEAD:main` succeeded, exit 0: `147dcb3..14e045c HEAD -> main`. The pushed head is `14e045cf44daf5edf3413ba681fd5b66410b62ba`.

## Completion blocker

`akrogon phase epic-broadcast-once merged --slot B` committed the leaf's `merged` state and printed `moved merged`, then exited 1 during source closure. Both built-in attempts to run `gh issue close -R Tamdoma/akrogon 42 --comment "merged 14e045cf44daf5edf3413ba681fd5b66410b62ba"` failed with `GraphQL: Resource not accessible by personal access token (addComment)`.

The code is pushed and the persisted phase is `merged`. The completion owner's folder remains in the open store. No `issue complete` or `epic complete` line printed, so the broadcast skill was not invoked.

Operator action: give the active GitHub credential permission to add comments and close issues in `Tamdoma/akrogon`, then run `akrogon next epic-broadcast-once` from `/home/ivan/Work/infra/akrogon` to retry owner completion. The planned L1 limitation applies: recovery completes silently and does not trigger a broadcast. A stop into `failed` cannot replace the already committed terminal `merged` state.
