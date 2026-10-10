# Slot B review: red-batch-culprit

Date: 2026-10-10
Phase: check.review
Base: `2595d71097880793bb369c26248b657663a45aa0`
Reviewed head: `b56407c7f2d0631db477be9fe5d9a81c962b2a52`
Verdict: **ready**

## Scope and findings

Reviewed the brief, locked design, plan, implementation report, complete base-to-head diff, affected merge guide and phase contracts, restore helpers, transition guards, attempt records and test-file citation rule. Debate is off, so there are no B position or rebuttal artifacts. No peer review was read.

No Fixes, Nits or operator actions.

The culprit branch checks membership and the saved culprit head before restoring branches. The checks mirror the merge-to-check.fix transition: recorded B seat, worktree cleanliness, issue-file exclusion and existing-test citations. The solo holder uses live HEAD. The subsequent transition rereads state after the batch is cleared, preserves merge_stamp, increments fix_rounds and applies the existing cap. Restore helpers keep their existing dirty nonculprit behavior and solo-holder exception. Ejection sets no new batch_limit. Default split behavior is unchanged.

The changed documented behavior matches the implementation: base-red hold first, attributed culprit ejection second, otherwise the existing split. The merge skill writes command, arguments, base/top, logs, attributed diff and restored head into the culprit review before dispatch. The existing hold and red-command replay instructions remain. No AREA.md files changed or were deleted.

## Verification

- Fresh boundary run: `bun test tests/culprit.test.ts tests/command-reference.test.ts tests/docs-links.test.ts --timeout=30000` completed with 12 pass, 0 fail and 1391 assertions.
- Criterion 1: member ejection test checks saved branch heads, surviving phases, unchanged merge_stamp, incremented fix_rounds, cleared record, exactly one ejected attempt and survivor-only rebuild.
- Criterion 2: at-cap test checks the shared failed/attempts outcome.
- Criterion 3: holder ejection test checks holder transition and restored surviving members.
- Criterion 4: refusal test checks stale/missing attempt, outsider/departed member, dirty culprit and invalid flag combinations without batch, branch, worktree-status or attempt-log changes. Separate test covers absence of a batch record. Saved-head issue/citation checks were also traced against the actual transition helpers.
- Criterion 5: reused unchanged implementation full-suite evidence covering batch-merge and merge-attempts split tests.
- Criterion 6: command reference and documentation-link tests passed in the fresh run; reviewed the changed guide, README, state/files documentation and skill against the live CLI.
- Criterion 7: reused report evidence for format, typecheck, changed tests (31 pass) and full suite. Inspected `/tmp/red-batch-culprit-full.log`: terminal result is 636 pass, 0 fail, 6834 assertions, 33 files, 49.40 seconds. Report records restoration of unrelated formatter drift in src/status.ts. Worktree remained clean during review.
- New-behavior deliberate-break evidence: report records removing appendAttempt making the member test fail with expected length 1 / actual 0, followed by restoration and passing tests.

No additional full-suite rerun was needed: code and head are unchanged, the recorded run completed, and focused reruns resolved the review concern about the ejection boundary.

## Test-Change trailers

`b56407c7f2d0631db477be9fe5d9a81c962b2a52`:

`Test-Change: tests/command-reference.test.ts added --culprit <slug> to the phase contract for the new flag; no existing expectation changed`

The changed existing test path matches src/test-files.ts. Its source is brief criterion 6 and the actual new phase option in src/akrogon.ts. The trailer's final phrase is imprecise because the contract expectation is extended, but its cited flag addition correctly explains that extension and preserves all prior options. The new tests/culprit.test.ts requires no trailer. No other existing tests changed.

## Phase recording

The first `akrogon phase red-batch-culprit merge --slot B --verdict ready` attempt was refused by requireClean because `?? tests/probe.test.ts` appeared after verification. Reviewed HEAD remains unchanged. This file was not created, read or modified by B and was left untouched. The review verdict remains ready.

A second identical phase command was also refused for the same untracked file. No verdict was recorded and no phase moved. Resume by recording the saved verdict once the file owner cleans up the probe. No operator-access blocker or code Fix is established by this temporary worktree condition.

Resumed check.review at unchanged head b56407c7f2d0631db477be9fe5d9a81c962b2a52. The phase command now completed with `recorded`: B ready is recorded, and the command is waiting for the other initial review. No repeated review or test run was needed.

## 2026-10-10 check.repair

Reviewed both initial review files at b56407c7f2d0631db477be9fe5d9a81c962b2a52. Repaired A's F1, the sole Fix. No items are handed to A and no operator actions remain.

- Test commit: `9d6c7d0` adds CLI calls with `--verdict ready` and `--reason oops` to the existing refusal test, checking nonzero exit and unchanged batch, branch heads, worktree status and attempt log. Existing assertions are preserved. The commit carries its required Test-Change trailer citing review-A F1.
- Fail-before: `bun test tests/culprit.test.ts -t 'refused --culprit calls' --timeout=30000` exited 1, with 0 pass / 1 fail. The first invalid call exited 0 instead of refusing. Full output: `repair-F1-before.log` beside this review.
- Fix commit: `842ab90` adds two upfront guards rejecting verdict/reason when culprit is present, before repository lookup or writes. No other ending changed.
- Pass-after: the identical command exited 0, with 1 pass / 0 fail and 91 assertions, exercising both invalid flags. Full output: `repair-F1-after.log`.
- `bun run format` exited 0 (`repair-format.log`). It reformatted unrelated pre-existing drift in src/status.ts, which B restored to its prior bytes before committing. Only the F1 diff remains.
- `bun run typecheck` exited 0 (`repair-typecheck.log`).
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` exited 0: 31 pass / 0 fail, 1649 assertions (`repair-changed-test.log`).

A's N1 concerns cosmetic refusal text, and N2 concerns additional solo coverage without a demonstrated failure. Neither is promoted to a Fix. B holds no reusable Nit needing a lessons entry.

- `bun test --timeout=30000` exited 0: 636 pass / 0 fail, 6848 assertions, 33 files, 97.66 seconds (`repair-full-test.log`). The passing member, cap, holder and refusal tests prove criteria 1-4. The passing batch-merge halving and merge-attempts split tests prove criterion 5. Passing command-reference/docs-links tests plus the unchanged, already-reviewed base/culprit/split skill instructions prove criterion 6. All configured checks passed, proving criterion 7. No merge_checks ran.

Final repair head: `842ab90`. Worktree clean. F1 resolved, no remaining Fixes, no handoff and no operator action. Requested destination: merge.

Phase result: `akrogon phase red-batch-culprit merge --slot B` exited 0 and printed `moved merge`.

## 2026-10-10 merge: solo attempt f1d7042a-ad6b-4074-b3c6-eba2dcb97bd5

Prior reviewed/repaired head: `842ab903eea598448954869b397e981e85816bce`.
Old base: `2595d71097880793bb369c26248b657663a45aa0`.
Fetched rebase target and refreshed AKROGON_BASE: `8479286067c37946df39ea9f3cb6070248ef4725`.
Resolved head: `3d223c853b51ffcc9a826ce0a4a9f3a20d60da9a`.

Fetched origin and rebased onto origin/main. The sole conflict was docs/guide/merge.md's red-ending paragraph. Resolution preserves the newly landed hold-fix solo-turn sentence and adds the leaf's evidence-copy/culprit-ejection narrative before the existing unattributed split. No assertion or fixture was changed by conflict resolution. Other commits rebased without changes.

`git range-diff 2595d71097880793bb369c26248b657663a45aa0..842ab903eea598448954869b397e981e85816bce 8479286067c37946df39ea9f3cb6070248ef4725..3d223c853b51ffcc9a826ce0a4a9f3a20d60da9a` is recorded in `merge-range-diff.log` beside this review. It shows unchanged feature/test/fix commits and only the merged documentation context on the docs commit.

`bun run format` completed with exit 0 (`merge-format.log`). Restored only its unrelated src/status.ts whitespace rewrite, preserving that file's prior content. No scoped outstanding change needed a commit. All configured checks are running on the rebased head, with no merge_covers, merge_checks or advisory commands.

Merge checks completed at the resolved head:

- `bun run typecheck`: exit 0 (`merge-typecheck.log`).
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with the refreshed base: exit 0, 31 pass / 0 fail, 1744 assertions (`merge-changed-test.log`).
- `bun test --timeout=30000`: exit 0 (`merge-full-test.log`), terminal summary:

```text

 642 pass
 0 fail
 7003 expect() calls
Ran 642 tests across 33 files. [53.48s]
```

Completion context gathered: all eight merge-throughput leaf briefs. This attempt carries no members. No direct push was run by B.

`akrogon phase red-batch-culprit merged --slot B --check --attempt f1d7042a-ad6b-4074-b3c6-eba2dcb97bd5` exited 0 and printed `ok`. The same command without `--check` exited 0 and printed `moved merged`. No issue-complete or epic-complete line was printed, so this leaf merge does not trigger a broadcast.
