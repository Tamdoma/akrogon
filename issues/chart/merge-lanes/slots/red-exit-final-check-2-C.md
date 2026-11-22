# Final-shape check 2: red-exit (slot C)

Checked all `[fix]` lines in `slots/red-exit-final-shape-2.md` against `src/` (2026-11-21). Items 1, 3, 4, 5 and 7 are sound and buildable. Three concrete defects remain in **item 8 `[fix X3, C3, X4]`**:

1. **Unbuildable no-edit check inside `land`**: Item 8 checks `"HEAD equals the exit record's top"` when the returning leaf's `land` run fails, which fails on two counts:
   - Item 1 clears the exit record when leaving `check.repair`, so no exit record exists by the time `land` runs.
   - `mergeTurn` (`src/next.ts:1013,1025`) rebases onto the new `origin/main` and runs `applyTop` *before* `launchLand` (`:1029`), so `HEAD` inside `land` is the newly rebased `top`, not the previous evicted `top` whenever `main` moved.
   - **Fix**: compare `batch.holder.head` (the pre-rebase branch head already saved at `src/next.ts:996`) against the leaf's previous red merge run's `sha` (and confirm via `log.jsonl` that the last move into `merge` was `check.repair -> merge`).

2. **Broken schema join (`merge-attempts.jsonl` -> `verify-runs.jsonl`)**: Item 8 specifies `"read from merge-attempts.jsonl and that attempt's red run in verify-runs.jsonl"`. Neither ledger holds the join key: `appendAttempt` (`src/attempts.ts:79-97`) writes no `red` run id and `tested_top` is only set on green runs in `recordTested` (`src/phase.ts:695`), while `verifyRunSchema` (`src/verify.ts:53-92`) writes no `attempt` field.
   - **Fix**: either look up the leaf's latest completed red `merge`-scope non-`compares` run directly in `verify-runs.jsonl` (matching `run.leaf === slug` and `batch.holder.head === run.sha` as in #1), or add the red run id to `attemptRecordSchema` (`src/attempts.ts`).

3. **Wrong coverage guard (`"and none of them is already covered"`) blocks a second simultaneous main red**: If unit `A` is already covered on main and a second unit `B` breaks on main, a returning leaf failing `{A, B}` has one covered unit (`A`), so `"none of them is already covered"` is false and `land` never runs the base pass for `B`.
   - **Fix**: trigger when every failing unit is a named title and **at least one uncovered failing unit** also failed on the leaf's previous red exit.
