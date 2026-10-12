# Review B: main-step-rules

Date: 2026-10-12. Phase: check.review. Verdict: ready.

Base: `013f7c369f245d58e47aea814f69322bed39d21a`.
Reviewed head: `d637cf40c96d4e758eba5870e07295210be7ba2a`.

## Findings

No Fixes, Nits or operator actions. Read brief, design, plan and implementation report before reviewing the complete diff. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. The held framework-sync disagreement is a resolved design choice, not an additional acceptance criterion.

## Criterion evidence

| Criterion | Evidence and result |
| --- | --- |
| 1 | shapes.md:35-36, :296 and chart-issues/SKILL.md:85 route a needed main step to the door during the pass when its prerequisite exists, with effective config verified at the registered root. Such work cannot enter Off route. |
| 2 | shapes.md:281 explicitly exempts merge-blocked reports from completion ownership, withholding the identity from every closing leaf. It names pull mirroring, the door's edit and verification, and close --by naming delivery. SKILL.md:35 agrees. Traced src/phase.ts:206-224: completion closes the union of applicable sources, so withholding from every closing leaf addresses the actual mechanism. |
| 3 | shapes.md:38-39 gives waiting edits a Pending steps home with exact edit, owner, prerequisite leaf and proving check. docs/guide/chart.md:128 explicitly applies the record to unsourced charts. |
| 4 | init-akrogon/SKILL.md:20 proposes existing repository entry points first, otherwise the runner command, preserves stored entries and retains the generated wrapping. |
| 5 | init-akrogon/SKILL.md:82 requires observing a changed test selected and run against a changed base, or execution of the existing full suite. Exit status alone is explicitly insufficient, and the script may read the base itself. |
| 6 | Opened the affected operator guide at docs/guide/chart.md:128. It matches the immediate-step, merge-blocked-report and unsourced-record outcomes. |
| 7 | git diff --name-only 013f7c3...HEAD lists exactly the four owned prose files. No command, test, state, config or scheduling changes. Working tree clean. |

Concrete workflow readback: an available config edit is made and verified now, an edit requiring the leaf's merged entry point keeps its report open until the later verified edit and explicit close, and an unsourced waiting edit retains its edit/owner/leaf/check record. The fork-rules sentence at shapes.md:95 refers to ruled-out work and does not override the needed-step exception. The adjacent intake rule operates subject to the explicit completion-owner exception.

Followed docs/reference-index.md and skills/AREA.md to the affected skill surfaces. No AREA.md is changed. Searched docs/ and skills/ for operator step on main, Off route and test_changed. All relevant rules agree with the diff. The worker brief's test_changed reference concerns worker proof rather than setup verification and needs no change.

## Verification

Existing final-head evidence is current: the following logs were produced after the final commit, and no code, test, fixture or helper changed afterward.

- checks.format: implementation/check-format-1791810570979-3377539.log. Passed through the configured run-check/setup/flock/own-modules command. Its formatter covers source, tests and chart scripts, not these Markdown files, so prose correctness is established by readback.
- checks.typecheck: implementation/check-typecheck-1791810576205-3377862.log. Configured command passed with tsc --noEmit.
- checks.test: implementation/check-test-1791810651574-3377972.log. Configured bun test --timeout=30000 passed, 843 tests and zero failures.
- checks.test_changed: B ran the configured run-check/setup/flock/own-modules command with the required AKROGON_BASE guard and bun test --changed="$AKROGON_BASE" --timeout=30000. implementation/check-test_changed-1791810742243-3591842.log records exit 0, four changed prose files and no affected test files. This proves the leaf's configured check completed, not setup verification of a selector. No new test is appropriate for this prose-only change under the standing design.

No checks were skipped or filtered relative to the plan. No merge_checks are configured. No red comparisons or additional reruns were required.

## Test-Change trailers

git log 013f7c369f245d58e47aea814f69322bed39d21a..HEAD contains no Test-Change trailers. Inspected src/test-files.ts: none of the four changed paths matches its test-file rule, so none is required. No existing test assertion, fixture or output changed.

## Merge verification: 2026-10-12

Attempt: `e0a35dfc-193c-4696-ab27-676474210356`. Applied top: `d637cf40c96d4e758eba5870e07295210be7ba2a`. Batch base: `013f7c369f245d58e47aea814f69322bed39d21a`. No carried members. No fetch, rebase or code edits performed.

Ran every configured checks command on the recorded top with setup/flock/own-modules wrapping. No merge_covers, merge_checks or advisory commands are configured.

- format passed: implementation/check-format-1791810823630-3594040.log.
- typecheck passed: implementation/check-typecheck-1791810825232-3594131.log.
- test_changed passed: implementation/check-test_changed-1791810825330-3594215.log. Four changed prose files, no affected tests.
- test passed: implementation/check-test-1791810901119-3594316.log, 843 pass, zero failures, 75.67 seconds. Full configured command: akrogon run-check --name test -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun test --timeout=30000'\'''.

HEAD remained the recorded top and the working tree remained clean. `akrogon phase main-step-rules merged --slot B --check --attempt e0a35dfc-193c-4696-ab27-676474210356` returned `ok`. Gathered main-step-carrier/ISSUE.md and its sole leaf brief for the completion broadcast.
