# Implementation report: merge-receipt-reuse

Serial-solo run (single-unit wave), base `f7ddb693`, head `9cffb8f`.

## Changed files

- `src/verify.ts` — `greenRun`, `redRun`, `reuseSource` drop the scope parameter and filter (scope now only selects the expected list via `verifyCommands`); `requireGreenReceipt` calls `greenRun` and the cross-row stitch is deleted; `knownRedReceipt` judges one eligible head row at a time — at least one red entry, each red entry covered by a linked base run at the merge-base sha failing every extracted name, `blocked` entries need no cover, base exit-0 never covers; `Unit` drops `scope` and `matching` becomes a plain `commands.find`.
- `tests/verify.test.ts` — criterion tests (committed first at `3ffc1d4`): rewritten 5d0b505f reproducer (criteria 1, 4), rewritten stitch test (criterion 3), new merge-only-member test (criterion 2), new leaf-green-resolves-merge-red-notice test (criterion 5); one expectation corrected under the one-row rule — `blocked merge members` now passes known-red because a `blocked` entry never ran on the head and needs no cover.
- `docs/reference/checks.md` — gate sentence now states the one-row/no-stitch/no-scope rule; reuse paragraph names cross-scope acceptance; Known red cover paragraph states the per-row judgment and blocked exemption.
- `src/AREA.md`, `tests/AREA.md` — `src/verify.ts` and `tests/verify.test.ts` lines updated to the one-row rule.

## Commits

- `3ffc1d4` test: one-row receipt rule cases (shown red at plan.synthesis, logs recorded in `plan.md`)
- `d20820f` feat: one completed row rule, scope dropped from receipt and notice lookups
- `9cffb8f` style: prettier on the edits

## Verification

| Proof | Command | Head | Result | Log |
| --- | --- | --- | --- | --- |
| Criteria 1–5 | `bun test tests/verify.test.ts -t 'merge verification accepts\|requireGreenReceipt refuses\|merge-only command\|leaf-scope green'` | `d20820f` | 4 pass / 0 fail (~0.9 s) | `check-criterion-tests-impl2-…-3670146.log` |
| Affected files | `bun test tests/{verify,receipt-gates,flaky,slow-merge}.test.ts --parallel=4 --no-isolate` | `d20820f` | 68 pass / 0 fail (~3.7 s) | `check-receipt-files2-…-3689971.log` |
| Criteria + blocked-member | `bun test tests/verify.test.ts -t '…\|blocked merge member'` | `9cffb8f` | 5 pass / 0 fail (~0.9 s) | `check-criterion-final-…-4020470.log` |
| `akrogon verify` | in leaf worktree | `9cffb8f` | green — format/test/typecheck all 0; test: 1264 pass (68.5 s) | `check-test-1793539396453-4022739.log` |

Earlier `akrogon verify` on `d20820f` was red on `format` only (prettier drift in the two edited files); fixed by `9cffb8f`, verified green on the new head. `test` and `typecheck` were already green in that run.

## Known limitations

- Merge-time flake flips on unchanged trees no longer feed `akrogon flaky`, and merge-scope reuse writes no new merge row so `slowEligible` samples shrink — the brief's stated cost (D1).
- `land.ts` keeps its own `scope === 'merge'` filter (reads a merge row only after a nonzero merge verify, which still writes one); `PassKey` and the member split still carry scope — all per D2, no receipt or notice lookup reads `run.scope` anymore.
