# Review B: repair-verify-merge

Date: 2026-11-01. Phase: check.review. Verdict: **ready**.

Base: `f7ddb69378c47af5feb978380fe1956e0fbfa1e1`.
Reviewed head: `de57a744b69b2a780ef7625cd5d38f3a9784a877`.
Reviewed tree: `e87d167dbbca01e87ea3ce0a2d47fe4ebec9f74b`.

Read the skill and its references, brief, design, plan and implementation report. Reviewed the whole three-file diff against both criteria and plan D1–D4. No peer review was read. No code was edited or committed.

## Findings

No Fixes, Nits, unresolved questions or operator actions.

## Criterion 1: review walk

The changed paragraph keeps the changed-input proof sweep unconditional, including unknown dependencies and reuse of unchanged green proofs. It scopes only `akrogon verify` to the committed-head merge exit and explicitly excludes check.fix and failed. The per-Fix evidence, repair split, receipt rules and merge-check restrictions are unchanged. There is no prose-matching test.

| Case | Historical source | Applying the revised instruction |
| --- | --- | --- |
| W1: pure handoff | `issues/closed/repeat-calls/fewer-repeat-calls/review-B.md`, 2026-10-26 second check.repair, lines 196–208 | No code or proof input changed. Preserve accepted proofs and hand F4's proof correction to A without calling verify. Its historical receipt-reuse call becomes unnecessary. |
| W2: mixed repairs | `issues/closed/killed-run-fixture/abandoned-capture-stop/review-B.md`, 2026-10-28 check.repair, lines 74–111 | Keep each bug's reproduction/fix evidence and rerun the changed-input criterion proofs on B's final head. Hand the missing real-systemd cases to A without the historical full verify. A still verifies its final head before check.review. |
| W3: merge exit | `issues/closed/merge-slow-alarm/slow-merge-notice/review-B.md`, 2026-10-28 check.repair, lines 80–124 | Both fixes are complete and nothing is handed to A. Rerun affected criteria, then verify committed head `76a1da503af9d9108334603f06e053cdf5d93fa8` before merge, as the recorded pass did. |

For a failed exit, the revised clause explicitly runs no verify and does not condition the preceding proof-sweep clause on merge. Existing required early stops and per-Fix evidence paragraphs are untouched.

Walk evidence, read back with `akrogon log`:

- `check review-b-historical-walk: 0 implementation/check-review-b-historical-walk-1793539267948-3895312.log` (W1/W2).
- `check review-b-merge-walk-detail: 0 implementation/check-review-b-merge-walk-detail-1793539287735-4013793.log` (W3 and identical verified/reviewed trees).
- `check review-b-diff: 0 implementation/check-review-b-diff-1793539247194-3767406.log` (complete diff and trailers).

## Criterion 2 and verification

The existing CLI gate test now creates an independent check.repair leaf and moves it to check.fix before any green receipt is written. It asserts exit 0 and the saved phase. The pre-existing merge refusal, unchanged phase after refusal, and receipt-backed successful merge assertions remain intact. `src/phase.ts` still gates only check.repair → merge. No planned check, case, runner, fixture, helper, timeout or filter was removed or disabled. No proof-command correction was made.

Planning's deliberate break added the receipt gate to check.fix and failed exactly at the new exit-0 assertion: `check criterion-2-red: 1 implementation/check-criterion-2-red-1793538966122-3047779.log`. The exact planned command, `bun test tests/receipt-gates.test.ts`, subsequently passed all five cases on the final tree: `check criterion-2-rerun: 0 implementation/check-criterion-2-rerun-1793539030758-3050610.log`. Both logs were read with `akrogon log`.

Receipt `6d6a2d12-bc91-4e56-b12c-32faea54ff00` completed on `331682d92728766d298b78b3df891e6ad06316d8`, whose tree equals the reviewed head's tree. The later amend changed only the trailer. The receipt contains the current configured commands, setup 0 and all checks 0, after the latest test/helper/fixture changes. Read back the receipt and its actual verify logs:

- `check review-b-receipts: 0 implementation/check-review-b-receipts-1793539276782-3958175.log`.
- `check format: 0 implementation/check-format-1793539114280-3362779.log`.
- `check test: 0 implementation/check-test-1793539182578-3362779.log`: 1262 pass, 0 fail across 72 files.
- `check typecheck: 0 implementation/check-typecheck-1793539185003-3362779.log`.

Existing current evidence is sufficient. No redundant checks or merge checks were run during review.

## Test-Change trailers

Complete listing for base..HEAD:

- `ff308510a1501b93e9998c291f98dddd015a7ca5`: `Test-Change: tests/receipt-gates.test.ts repair-verify-merge plan D2: added the check.repair to check.fix ungated-move case to the existing merge gate test; merge-refusal and receipt assertions unchanged`. Accepted against brief criterion 2/design Q2. This adds coverage and retitles the test without changing any old assertion.
- `de57a744b69b2a780ef7625cd5d38f3a9784a877`: `Test-Change: tests/AREA.md repair-verify-merge plan D4: AREA line names the check.repair gate; documentation only, no expectation changed`. Accepted against plan D4 and the existing gate test. The `tests` path segment makes this file match `src/test-files.ts`.

## Docs and paths

Opened the changed behavior's skill page and `docs/reference/checks.md`, `docs/reference/state-and-phases.md`, `docs/examples/autopilot-story.md` and `docs/reference-index.md`. The checks table and state page already scope this receipt gate to check.repair → merge. The story describes both handoff and merge repairs without requiring verify on handoff. No additional docs edit is needed.

One repository-root listing checked every backtick path in the changed `tests/AREA.md`: `check review-b-area-paths: 0 implementation/check-review-b-area-paths-1793539257643-3826007.log`, read with `akrogon log`. All named source/test/doc targets exist. The missing `/var/tmp/akr-<uid>` is an explicitly isolated runtime placeholder, `direct/` is a chart child name, and `issues/config.yaml`/`issues/merge-attempts.jsonl` name registered-checkout runtime files outside this sparse code worktree. These are not broken source pointers and cause no current failure. The changed receipt-gates pointer exists and describes the test correctly.

Worktree and whitespace checks are clean. No reusable Nit is held and no lesson write is required. Requested next phase: merge, verdict ready.

Actual result: `akrogon phase repair-verify-merge merge --slot B --verdict ready` printed `moved merge`, exit 0. Evidence: `check review-b-verdict: 0 implementation/check-review-b-verdict-1793539353330-4188507.log`, read back with `akrogon log`.
