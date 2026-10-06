# Handoff review, merged (A with B and C)

Sources: handoff-review-B.md (F1-F15), handoff-review-C.md (S1-S3, N1-N2, T1-T4, B1-B9, R1-R5, X1-X2).

## Taken into the drafts
- check-setup: always `sh -c` both strings with `src/shell.ts:63` `quote` (B F2, C S2); `advisory` composed too (C S1); criterion 1 from any directory in the repo (C S3); implement-issue and check-issue run the locked `setup` before a direct proof outside the printed commands (B F3).
- nits-before-merge: record in check.review before a non-`fix` verdict and in check.repair before the move to `merge`, skipping Nits already written for the leaf (B F4, C N1).
- merge-turn-order: holder selection in a new module importable by next, phase and status (C T1); the guard refuses `merged` (with or without `--check`) and `check.fix` for a non-holder, never `failed` (C T2); `merged --check` is the first step of a merge pass (C T3); fallback order observed in status (C T4); wake after every committed move even when logging or completion then throws (B F5).
- merge-batch: explicit `--attempt <id>` in the holder prompt and every batch call (B F7, C B1, B4); `--check --attempt` records HEAD as the tested top, `merged --attempt` requires HEAD equal to it (C B1); red via `check.fix --attempt` dissolves the batch and keeps the holder in `merge` for a solo pass (B F8, C B2); stack built in disposable git state outside the lock, applied under the lock, an unfinished build is discarded and rebuilt under a new attempt (B F9, C B3); a refused push returns `fresh checks required` with the restacked candidate (B F11); publication candidate recorded before each push and used for reconcile (B F12); members resolved by slug across open and closed folders, record kept until completion work is reconciled (B F14); briefs gathered before the `merged` call (C B6); printed completion lines as criterion (C B5); four missing criteria (C B7); wake and tab close in the `src/akrogon.ts` post-move pass (C B8); tested main in the record (C R1).
- record-only-reuse: reuse fields and pushable top, later refusals compare against the original tested top and main (C R2, B F12); conflicts follow merge-batch and print `rerun` (C R3); printed decision copied by B (C R4); `:(top)` pathspecs (C R5, B F13).

## Resolved by A
- B F10 (correction interface for a carried member's range): taken narrower. The command never resolves or corrects a carried member. A carried member whose rebase conflicts or whose range fails `merged --check` is restored, marked solo and dropped, the stack is rebuilt under a new attempt and needs fresh checks. Its own solo turn repairs it. No new correction interface.
- B F6 (legacy merge leaf with no stamp and no log record): not a blocker. Such a leaf sorts after every stamped or logged leaf, by slug, and `akrogon status` marks it `no merge record`. Held disagreement (B preferred an operator-supplied order).

## Not taken
- B F1 (scenario numbers in criteria): numbers describe the scenario or the observed run count, not a test count, which the shapes rule bans. C X2 agrees.
- C N2 (merge-turn-order blocked-by nits-before-merge): only an actual dependency orders work, never file overlap.
- B F15, C B9: the push proof stays pending until the operator runs it. Handoff is held until then.
