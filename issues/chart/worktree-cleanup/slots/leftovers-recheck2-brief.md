# Slot B second re-check: `akrogon leftovers`

Your re-check is at issues/chart/worktree-cleanup/slots/leftovers-recheck-B.md. Updated diff: issues/chart/worktree-cleanup/slots/leftovers-review.diff. Do not edit any file except your return file.

- F3 repaired: `readKept` (src/reconcile.ts) reads directly, returns [] only on ENOENT, rethrows other read errors, and wraps JSON/schema errors with the report path. tests/status.test.ts covers malformed JSON and a permission-denied folder, both naming the report.
- F1 held by A: `state.batch` is hidden again for every case. Reason: a failed batch holder is already on the board as a failed leaf with a `Failed:` line, and a notification names `akrogon phase <slug> merge`. The person acts on that leaf, not on the path, and the next pass after that command removes the path. Splitting reconcile's reasons adds a moving part for a case the board already shows. Comment in src/leftovers.ts says this.

Return only new defects in the F3 repair, or evidence that the F1 reasoning is false (for example, a failed batch holder that the board does not show). Write to issues/chart/worktree-cleanup/slots/leftovers-recheck2-B.md, or `No findings.` if none.
