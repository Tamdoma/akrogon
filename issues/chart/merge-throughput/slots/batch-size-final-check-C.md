# batch-size final-shape check, slot C

One error in step 2, order of operations. Code at 2e78945.

- Step 2 says restore, clear the record, then `transition` the culprit. `transition` re-reads state and can refuse after the first two writes: `requireClean` on the culprit's worktree (`src/phase.ts:274-275`), `requireNoIssueFiles` and `requireTestChangeCitations` (276-277), slot and done checks (252-256). A member restored as `dirty-ref` (`src/batch.ts:85-89`, a seat's leftover in that worktree) hits `requireClean`. If it throws, the record is already cleared and no leaf has moved, so the next `mergeTurn` rebuilds the same stack with the culprit in it and the red run repeats. Fix: run `transition(..., checkOnly = true)` on the culprit first, as `batchCheck` does at `src/phase.ts:422`, and refuse the whole call on failure before any restore or state write.
- Same step, member culprit after it has moved: `memberEntries` keeps only members still in `merge` (`src/phase.ts:376-381`). If the order is ever "move first, then restore", the culprit's branch stays at the stack tip. With check-first, restore-all, clear, move, the culprit is restored while still in `merge`, so the shape must state that order explicitly, not "restores the other members".

Everything else matches code and the Taken locks.
