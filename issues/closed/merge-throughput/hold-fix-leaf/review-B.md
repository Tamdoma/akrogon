# Slot B review

Date: 2026-10-10
Base: `3fde73f7197f35ea17ba2ff06c0705c535f9f75e`
Reviewed head: `5be5de7c2ed31b3bd43c7295011625e12d343ae4`
Verdict: **fix**

## F1 — changing the named fix steals an active merge turn

Location: `src/hold.ts:83-86`, `src/hold.ts:95-98`; consumers `src/next.ts:1037-1040` and `src/phase.ts:789-798`.

Real source: the operator uses the newly documented CLI twice during the same hold. With queued leaves `hold` and `fix`, run `hold-fix fix`, `next`, then `hold-fix hold` before the first attempt finishes. All three commands succeed. This is a supported command sequence, with no edited batch records or malformed input. The probe uses the existing heldMergePair fixture and drives the actual CLI against its git remote and fake Herdr.

Trace: `holdFixCommand` accepts the second queued leaf even though the first has an applied batch record. `mergeHolder` ignores that record-first queue priority and returns the new fix. `phase fix merged --check --slot B --attempt <first-id>` now fails with `Merge turn refused for fix: holder is hold`. Another `next` succeeds and leaves **two distinct applied batch records**, both memberless, built on the same base, on `fix` and `hold`.

Consequence today: an already prompted merge seat loses permission to complete its valid attempt, while the command creates and dispatches a second attempt in the same repository. This breaks the single merge turn contract and exposes overlapping merge checks and pushes.

Contract/gap: `docs/guide/merge.md` says a leaf holding a batch record keeps the turn, and `skills/merge-issue/SKILL.md` specifies one turn per registered repo. Plan D5 is titled “records stay first”; the shared resolver does not preserve that invariant when the fix changes. Existing tests cover initial selection and unhold during an attempt, but never a second hold-fix during an attempt.

Repair: preserve the active batch holder across fix renaming, or refuse replacing it while that attempt exists. Add a CLI regression for the command sequence above proving one active record and continued authorization of the first attempt. No plan/design edit is needed to retain the existing single-holder contract.

Evidence: `implementation/review-B-probe.log`. The temporary probe asserted one active batch after the sequence and failed with received length 2. It ran to completion with exit 1. This failure is caused directly by the new resolver and naming command, so no base rerun applies.

## Verification

- Read brief, plan, design, report, ponytail guidance, changed behavior docs, reference index, relevant callers and entire implementation diff. Debate is disabled and there are no leaf positions/rebuttal artifacts.
- `bun test tests/hold.test.ts tests/command-reference.test.ts --timeout=30000`: **21 pass, 0 fail**, 1,556 assertions. Rerun justified by the specific active-holder concern. Reported full checks at implementation head: 636 tests pass, typecheck passes, format passes with unrelated formatter drift restored. Current head adds only the command-reference trailer citation, so broader reruns are unnecessary.
- The report records a deliberate member-skip break making the new scenario fail, then restoration. Existing added tests cover the eight criteria's initial paths, but miss F1.
- No implementation files changed and no review commits created. Probe fixtures cleaned by fixture finally; temporary source and dependency symlink removed. The log is retained in the leaf.

## Test-Change trailers

Read all trailers in base..HEAD against `src/test-files.ts`:

- `1a98f1f`: `tests/hold.test.ts` added hold-fix scenarios, no existing expectation changed. Accurate against the diff.
- `1a3b6ff`: `tests/hold.test.ts` heldMergePair fix leaf loses solo, scenario 1 asserts the applied-stack top prompt. Supported by brief criterion 1 and plan D3: a non-solo fix must take the memberless full stack gate. This changes newly introduced tests, not a past regression expectation.
- `da044f2`: `tests/hold.test.ts` formatting only, no expectation changed. Accurate.
- `5be5de7`: `tests/command-reference.test.ts` added hold-fix contract row, no existing expectation changed. Supported by brief criterion 7 and plan D7.

## Documentation and AREA paths

The command, fix override and status are documented in README, merge/next guides, merge skill and src AREA. The documented active-record holder rule exposes F1 above.

One repository-root listing of paths named by changed `src/AREA.md` found all present: `src/akrogon.ts`, `src/preflight.ts`, `src/config.ts`, `src/init.ts`, `src/phase.ts`, `src/shell.ts`, `src/readiness.ts`, `issues/`, `docs/reference-index.md`, `tests/helpers.ts`. No dead pointers.

## Operator actions

None.

## Nits

None.

## check.repair — 2026-10-10

F1 repaired. Test commit `47a2bf8` adds the real CLI sequence: name fix, start its attempt, rename to hold, run next again, check and merge the original attempt with slot B and its attempt ID. No existing assertion changed. Fix commit `866118d` makes `mergeHolder` return the record-bearing queue head before considering the hold override. This preserves one active attempt through renaming for all three callers, including batch construction and phase authorization.

Fail-before: `bun test tests/hold.test.ts --test-name-pattern='changing the named fix' --timeout=30000` exited 1: the second leaf unexpectedly had an applied batch. Pass-after: identical command exited 0, 1 pass, 10 assertions. Retained outputs: `implementation/F1-before.log`, `implementation/F1-after.log`.

Done-criteria proof:

1. Existing initial-selection CLI scenario passes: memberless applied fix stack, queue head idle.
2. Existing authorization scenario passes; regression additionally checks and pushes the original slot-B attempt after renaming.
3. Existing main-change scenario passes: hold removed and queue head receives the next attempt.
4. Existing no-hold, missing-leaf and non-queue refusals pass without changing records or states.
5. Existing naming scenario asserts the merge stamp unchanged. Attempt state writes in next.ts spread the prior state and only replace batch; the repair adds no writes.
6. Existing unhold-mid-attempt scenario passes with record-based authorization.
7. Status and command-reference tests pass.
8. Format and typecheck exited 0; changed-file suite exited 0, 44 pass, 0 fail. The formatter's unrelated pre-existing src/status.ts phaseColor reflow was restored. Full-suite result recorded below.

No Handed to A items, operator actions or Nits remain. No live credentials needed, no merge_checks run. Worktree changes are limited to src/hold.ts and tests/hold.test.ts.

Full blocking suite `bun test --timeout=30000`: exit 0, **637 pass, 0 fail**, 6,853 assertions across 32 files. Log: `implementation/repair-test.log`. Repair head `866118d`; git status clean. All configured checks and done-criteria proven.

## merge — 2026-10-10

Attempt: `b7407a17-35e7-4a1b-80f7-ac4580ba8296`
Recorded top and actual HEAD: `8479286067c37946df39ea9f3cb6070248ef4725`
Refreshed AKROGON_BASE / built_on: `2595d71097880793bb369c26248b657663a45aa0`
Members: none. Applied stack, no manual fetch, rebase or commits.

Configured checks have no merge_covers exclusions, no merge_checks and no advisory commands. Format exited 0; its only unrelated change was the known phaseColor reflow, restored before checks to keep the recorded top clean. Typecheck exited 0. Changed-file command used refreshed AKROGON_BASE and exited 0: 44 pass, 0 fail, 1,819 assertions across 3 files. Logs retained under implementation/merge-*.log.

Completion-owner inspection: merge-throughput still has batch-limit-repo and red-batch-culprit open; this memberless attempt cannot complete an issue or epic. ISSUE.md and leaf brief already read. No completion broadcast expected.

Full blocking suite exited 0: 637 pass, 0 fail, 6,854 assertions across 32 files. All configured checks green on recorded top.

`merged --check --attempt b7407a17-35e7-4a1b-80f7-ac4580ba8296` exited 0: `ok`. Command-owned push and move `merged --attempt b7407a17-35e7-4a1b-80f7-ac4580ba8296` exited 0: `moved merged`. No issue/epic completion lines, so no broadcast run.
