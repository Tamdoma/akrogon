# Brief 4: merged-in-open premise (remainder of brief 1)

## 1. Goal

Tighten the `next --resume completes and cleans a merged leaf while its unallocated dependent stays untouched` test so the merged leaf is still in `issues/open` when `--resume` runs, matching plan A4 literally. Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/startup-resume`. Leaf: `startup-resume`.

Binding facts: `akrogon phase <slug> merged` runs owner completion immediately, moving a complete single-leaf issue to `issues/closed` before `--resume` runs. Setting `phase: 'merged'` directly with `saveState` keeps the leaf in `issues/open`, so the resume run itself performs owner completion plus worktree, branch and tab cleanup. The `src/` resume code is already landed and green; this brief changes one test only.

## 2. Numbered acceptance criteria

1. The merged-leaf test reaches the resume run with the leaf still under `issues/open`, asserted by path existence and `phase === 'merged'` before the run.
2. All existing post-resume asserts keep passing: owner moved to `issues/closed/solo`, worktree gone, branch gone, tabs empty, prompts empty, dependent without tab, worktree or attempts.
3. No other test in the file changes behavior; the changed-test command passes.

## 3. Read-first list

- `tests/next.test.ts`: the merged-leaf test and the `merged foreign leaves survive cleanup` test, which sets `phase: 'merged'` directly via `saveState` as the pattern to copy.
- `src/phase.ts` `completeOwner` (why the `phase` command moves early).
- This skill folder's `ponytail.md`.
- Open the index only for a gap in this list.

## 4. Change list and needed interfaces

- `tests/next.test.ts`, the merged-leaf test only: replace the `saveState` to `merge` plus `cli phase merged` pair with one direct `saveState(done, { ...readState(done), phase: 'merged' })` after capturing the worktree; add the criterion 1 asserts before the resume run; keep the prompt-clearing line and every post assert.

## 5. Do-not, reasons and exceptions

- Do not touch any other test, file or assertion. One test owns this premise; anything else widens the blast radius.
- Do not touch `src/`, `plugin/`, `README.md` or `docs/`. They are landed and green.
- Do not reintroduce the `phase` command into this test. It moves the owner early and voids the premise.
- On any conflict between this brief and the plan or live code, return a mismatch naming the conflict, the evidence and the smallest brief correction instead of changing scope. The exception is a revised brief from B authorizing that change.

Reasons restated: one-test scope keeps the change reviewable; landed code stays untouched; the `phase` command ban keeps the premise real; mismatch returns keep scope with B, whose revised brief is the only exception.

## 6. Ordered steps

1. In `tests/next.test.ts`, rework the merge setup to direct `saveState` and add the pre-resume asserts (criteria 1, 2).
2. Run the section 7 command and paste the green output (criterion 3). No red run is owed: brief 1 already demonstrated red for this scenario and the `src/` change is landed.

Advisory size: 1 file, under 6 turns.

## 7. Commands

From `/home/ivan/Work/infra/akrogon/issues/worktrees/startup-resume`, this command only:

```sh
AKROGON_BASE=1a21e22e0056a7e9d6b5e35a5a395b867847a844 bun test --changed=1a21e22e0056a7e9d6b5e35a5a395b867847a844
```

## 8. Done-when, evidence and report

Done when criteria 1 to 3 hold with the green run pasted. Report limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
