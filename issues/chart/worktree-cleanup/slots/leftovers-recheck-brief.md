# Slot B re-check: `akrogon leftovers` fixes

Re-check A's repair of your findings in issues/chart/worktree-cleanup/slots/leftovers-review-B.md. Updated full diff: issues/chart/worktree-cleanup/slots/leftovers-review.diff. Do not edit any file except your return file.

A's repairs:
- F1: `state.batch` is no longer hidden, so a failed holder's retained batch shows. A did not add a new reason for a progressing batch: a batch path shows only while a merge batch runs, which is brief.
- F2: A hides `live pane inside` for every case instead of splitting the reason. A live pane means someone is there, and the next pass removes the path after the pane closes, so it is in use, not a leftover. This avoids changing reconcile's reasons.
- F3: `readKept` in src/reconcile.ts returns [] only when the report file is absent and throws otherwise. New test in tests/status.test.ts.
- F4: comment fixed.
- Also: tests/command-reference.test.ts contracts lists `leftovers: ''`.

Return disagreements or new defects only, with file:line evidence and an exact fix, to issues/chart/worktree-cleanup/slots/leftovers-recheck-B.md. Write `No findings.` if none.
