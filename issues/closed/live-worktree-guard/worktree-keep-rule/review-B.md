# Review B

Date: 2026-10-16
Phase: check.review
Base: fb60ccdceba56e8c0b28fd9c2d7eae74f2387307
Reviewed head: 310c23c233a95a9f0c54362027047b1c0d3091f8
Verdict: fix

## Findings

### F1 — Missing required deliberate-break proofs for criteria 2 and 4

The design's Standing design interpretation explicitly requires “criteria 2 and 4 show one deliberate break turning their test red.” The implementation report records only the base red run and subsequent green runs. Its criterion proof entries cite those runs, with no deliberate break, reproducing command, or red artifact for either new behavior. The baseline log confirms T2 failed on the old lock display and T3 failed because the old report had no `removed` array. Those establish baseline failures, but do not record the separately required deliberate-break exercise against the implementation.

Source and consequence today: the implementation report used to accept this leaf declares every criterion verified while omitting the design's required sensitivity proof for the new lock handling and removal report. This is a verification gap, not an observed product defect. It hits the design's explicit proof contract for brief criteria 2 and 4 and check-issue's new-behavior proof rule.

Required repair: use the existing T2 and T3 and planned targeted command to demonstrate one deliberate break for each behavior, record each red command and kept log, restore the implementation, and record the corresponding green evidence. No new test, machinery, test expectation change, or widened criterion is needed. This is a missing proof capture that the existing runner can perform.

No other Fixes or Nits. No operator actions.

## Review scope and results

Read the brief, design, complete plan including implementation notes, report, ponytail reference, standing design, reference index, changed code and tests, README cleanup contract, next guide, leftovers filtering and both next/event reconcile call paths. Own positions-B.md and rebuttal-B.md are absent, consistent with this leaf's non-debate plan. No peer review was read.

The lock check precedes leaf and scratch removal in both loops. Git itself refuses a lock acquired after the snapshot. Registered unmanaged worktrees are kept before pane checks. Every successful registered removal through removeWorktree records the snapshot path, optional branch, head and rule. Host reports remain kept-only, old repo reports remain readable, and quiet passes write an empty removed list. Scratch removal and the all-removal prune condition remain intact. Direct-route creation, landing, abandon and lifecycle handoff include the required lock/unlock instructions.

README describes the changed behavior. docs/guide/next.md has no conflicting variant-removal claim. No AREA.md changed, so no changed-area path listing applies. No lesson claims or removals appear in the diff. No code or tests were changed during review, and no tests were skipped, filtered or disabled by the implementation.

## Verification evidence

Read the cited saved logs back with `akrogon log`. The final full run is after the latest test changes and formatting commit, so no duplicate full check run was needed.

- `verify test: 0 implementation/check-test-1792103263669-4093539.log`: 894 pass, 0 fail, including the three keep-rule cases and existing scratch/migration regressions.
- `verify format: 0 implementation/check-format-1792103156965-4093539.log`: all configured files pass Prettier.
- `verify typecheck: 0 implementation/check-typecheck-1792103265558-4093539.log`: `tsc --noEmit` passes.
- `check test: 1 implementation/check-test-1792102399755-1708315.log`: baseline has the five intended failures. Current full green supersedes the implementation's intermediate red checks.
- `check review-context: 0 implementation/check-review-context-1792103301176-271422.log`: clean worktree, exact head, commit messages and changed-file summary.
- `check review-diff: 0 implementation/check-review-diff-1792103303986-272807.log`: complete diff and documented contracts.
- `check review-code: 0 implementation/check-review-code-1792103309138-275276.log`: live removal paths, criterion tests, leftovers consumer and standing design. Read back through `akrogon log`.

## Test-Change trailers

The src/test-files.ts rule matches both changed test paths. All changed existing tests have a relevant trailer.

1. `4302a75`: `Test-Change: tests/reconcile.test.ts rewrite 'store variants survive live or unavailable pane inventories' as 'store variants are kept as unmanaged…' and 'targeted next sweeps unused registered variants' as 'targeted next keeps unused registered variants' — brief criterion 1 makes a registered non-leaf, non-scratch worktree unmanaged, so the old removal expectations contradict the brief. New file tests/keep-rule.test.ts adds criteria 1, 2 and 4 cases (unmanaged keep incl. tab_closed pass, locked keeps with reasons, removed records in the reconcile report).` Accepted: criterion 1 directly contradicts the two old variant expectations.
2. `d27b01b7530e9d50daf1e73d6202b7e2a6c1b9f7`: `Test-Change: tests/keep-rule.test.ts brief criteria 1 and 2, the leftovers command landed on the rebased base so the literal` `akrogon leftovers` `listing is now directly provable. Adds assertions only; no existing expectation changed.` Accepted: adds required leftovers checks on the refreshed base.
3. `310c23c233a95a9f0c54362027047b1c0d3091f8`: `Test-Change: tests/keep-rule.test.ts formatting only, no expectation changed; prettier drift flagged by the format check on the same head.` Accepted: diff is formatting only.


## 2026-10-16 check.repair

Reviewed both initial reviews against the unchanged head `310c23c233a95a9f0c54362027047b1c0d3091f8`. A has no Fixes. B's F1 is the only blocking item. No operator actions are open. No source, tests, fixtures, configuration or proof commands changed, and no code repair or commit was made. Existing green evidence remains applicable. No checks were rerun because this pass hands off the missing captures rather than moving to merge.

Evidence: `check repair-context: 0 implementation/check-repair-context-1792103415635-608791.log` records both reviews, the clean worktree and unchanged head.

### Handed to A

- F1: brief criteria 2 and 4 lack the deliberate-break captures required by the design. The existing runner and helpers can exercise both via `akrogon run-check --name 'test' -- bun test tests/keep-rule.test.ts tests/reconcile.test.ts`, with the configured locked setup first. Use existing T2 for lock handling and T3 for removal reporting, record one deliberate break and red log for each, restore the implementation, and record the green result in `implementation/report.md`. Exception: check-issue's check.repair rule assigns a criterion missing only a case, capture or recording to A. No test expectation correction, new machinery or new test is needed.

No B-held Nits remain. A's nonblocking Nits do not require changes in this repair pass. Next requested phase: check.fix, slot A.


## 2026-10-16 check.review after check.fix

Verdict: ready.
Base: `fb60ccdceba56e8c0b28fd9c2d7eae74f2387307`.
Prior reviewed and current head: `310c23c233a95a9f0c54362027047b1c0d3091f8`.

F1 is resolved. Read the check.fix report and all three new logs through `akrogon log`:

- Criterion 2: removing the candidate-loop lock keep deliberately turns T2 red at the worker's lock-reason assertion. `check test: 1 implementation/check-test-1792103450820-645901.log`, command `akrogon run-check --name 'test' -- bun test tests/keep-rule.test.ts -t "locked worktrees stay"`.
- Criterion 4: removing the removal-record append deliberately turns T3 red because real worktree removals produce an empty report list. `check test: 1 implementation/check-test-1792103461423-652311.log`, command `akrogon run-check --name 'test' -- bun test tests/keep-rule.test.ts -t "reconcile report records"`.
- After restoring both changes, the planned unfiltered command `akrogon run-check --name 'test' -- bun test tests/keep-rule.test.ts tests/reconcile.test.ts` passes all 34 tests. `check test: 0 implementation/check-test-1792103468732-654273.log`.

These are intentional diagnostic failures with their causes documented, followed by the full planned targeted green run. No planned test was disabled or filtered in the acceptance run. Existing full verification evidence (894 tests, formatting and typecheck) remains valid for the unchanged committed tree; the report records verification receipt reuse.

`check recheck-scope: 0 implementation/check-recheck-scope-1792103491644-688582.log` confirms HEAD is unchanged, the worktree is clean, and the repair commit range and diff are empty. Read this log back through `akrogon log`. The check.fix pass added proof records only, with no branch refresh, new commits, test edits, or Test-Change trailers to assess. No range-diff is needed. No documented behavior changed in the repair, and no AREA.md changed.

No new Fixes, B-held Nits, operator actions, or outstanding handoffs remain. No duplicate tests were run during re-check because the saved evidence resolves F1 and no implementation inputs changed. Requested destination: merge, slot B.


## 2026-10-16 merge verification

Attempt: `d0ff2335-3933-436a-aaa9-5ef693de6c8b`. Applied memberless top: `310c23c233a95a9f0c54362027047b1c0d3091f8`, built on `fb60ccdceba56e8c0b28fd9c2d7eae74f2387307`. HEAD matches the recorded top and the worktree is clean. No fetch, rebase or code change was needed.

`akrogon verify --attempt d0ff2335-3933-436a-aaa9-5ef693de6c8b` succeeded by reusing receipt `8c74a762-70ae-4ea5-96c8-7c7a414e93cf` for identical tree `c78e61b5ed306205a12c7d34026546177b7d0f6f`. This covers the previously read green full test, formatting and typecheck logs. No merge checks or advisory commands are configured.

`akrogon phase worktree-keep-rule merged --slot B --check --attempt d0ff2335-3933-436a-aaa9-5ef693de6c8b` returned `ok`, accepting the receipt, top and test trailers. The completion owner is standalone issue `live-worktree-guard`, whose only leaf brief was read before landing. No blockers remain.
