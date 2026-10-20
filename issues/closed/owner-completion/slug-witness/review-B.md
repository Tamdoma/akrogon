# Review B: slug-witness

Date: 2026-10-19
Base: abfee125b4ab68bec34bd73325c077c12c74fc47
Reviewed head: c57794661a683bb5ee849f797cca10ee931a3ad5
Verdict: ready

## Findings

No Fixes, Nits or operator actions.

Reviewed the entire three-file diff against the brief, design, plan and implementation report. Debate is disabled, so no positions or rebuttal artifacts were expected. No peer review was read.

`closeSources` now uses the triggering leaf's slug without reading its worktree. Both callers in `completeOwner` pass that same leaf, including the remaining shared sources at epic completion. Source closure still precedes packing and rename. Empty-source behavior, error propagation, CLOSED handling and exact-comment retry deduplication are unchanged. The `next` merged branch reaches this completion path without requiring a recorded worktree.

The CLI fixture creates a merged sourced leaf without a worktree field, checks the actual fake-gh close arguments, drains the expected operations and verifies the owner moved to the closed store. Epic tests cover distinct child issues and attribute shared sources to the completing leaf. Existing retry, partial-comment and failure-ordering assertions remain.

Read `docs/reference-index.md`, the relevant area descriptions, `docs/guide/merge.md` and the merge/broadcast skill references. No documented behavior changed. No AREA.md or lesson file is changed. Searches under src, tests and skills found no remaining description of a completion comment as merged plus a commit. Remaining merged templates describe timing counts or dates.

## Test-Change trailers

Commit 4b4a9160c35b38eac60f7d3808fd5a71c96a55e3:

- `Test-Change: tests/phase.test.ts slug-witness: source-close comment becomes delivered by <slug> per design close-witness 1a`
- `Test-Change: tests/next.test.ts slug-witness: source-close comment becomes delivered by <slug> per design close-witness 1a`

Both paths match src/test-files.ts. The binding close-witness decision explicitly replaces the old comment expectations and the old worktree-refusal expectation. The removed HEAD reads and placeholder substitution served those replaced expectations. No unrelated expectation was removed, and no runner or planned test was disabled.

## Verification

Read the following preserved logs with `akrogon log`. Paths below are relative to this leaf.

- Criterion 1: red `check crit1-next-retry: 1 implementation/check-crit1-next-retry-1792425039866-2960873.log` shows the real `next stuck` invocation failing with `Sourced completion requires a worktree`. Green `check crit1-next-retry: 0 implementation/check-crit1-next-retry-1792425138483-3051842.log` passes the same criterion.
- Phase caller: `check crit1-phase-sourced: 0 implementation/check-crit1-phase-sourced-1792425140099-3058881.log`.
- Criterion 2: `check crit2-epic: 0 implementation/check-crit2-epic-1792425142354-3060979.log` runs both planned epic cases. Combining the two planned filters preserves their scope.
- Criterion 3: `check crit3-no-merged-comment: 0 implementation/check-crit3-no-merged-comment-1792425144021-3063637.log`, corroborated by review searches.
- Required checks from `akrogon verify` on the reviewed head: `check format: 0 implementation/check-format-1792425158668-3143082.log`, `check test: 0 implementation/check-test-1792425331997-3143082.log` (1053 pass, zero fail), and `check typecheck: 0 implementation/check-typecheck-1792425334289-3143082.log`.

All green evidence follows the final test/helper changes and the product commit. No code changed during review, and no missing proof or specific concern justified repeating completed checks. Git worktree is clean. Real GitHub mutation is outside this pass, as the locked design specifies the existing fake-gh CLI boundary and chart-time live evidence.

## Merge 2026-10-19

Attempt: 260a8cd3-7033-43b2-b5e5-edc693a807e4. Applied top and tested head: c57794661a683bb5ee849f797cca10ee931a3ad5. Worktree clean; no rebase or repair needed. Both reviews are ready. Read both owner-completion leaf briefs before landing.

`akrogon verify --attempt 260a8cd3-7033-43b2-b5e5-edc693a807e4` exited 0:

```text
reuse receipt 3cfc9461-174c-4653-bb9c-14db2d6918f3 tree=236020d0b8609d704adf3006b14710b3bb76d8e8
```

The unchanged tree reuses the green receipt documented above (format, 1053 passing tests, typecheck). No merge_checks or advisory commands are configured.

Merge guard: `check merge-guard: 0 implementation/check-merge-guard-1792425454775-103876.log`; read back with `akrogon log`, result `ok`.

Landing command exited 0:

```text
moved merged
deployed abfee125b4ab..c57794661a68; deployed c57794661a68
```

The command pushed and moved the leaf to merged. No issue/epic completion line was emitted, so no broadcast was due.
