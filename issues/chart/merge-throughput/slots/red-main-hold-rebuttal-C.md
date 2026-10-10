# Rebuttal: red-main-hold merged, slot C

Disagreements only. Code cites are origin/main at 2e78945.

## D1 clear rule
- Green proof (line 5) has no runner. akrogon never runs checks itself (test-runs heavy-run-slot) and no phase prompts a seat to run a gate with no leaf, so the "proof" is some leaf's merge run on the new main, which is clear-on-move with one extra bookkeeping step. B's issues-only case is answered by A's synthesis (line 6), not by a proof run.
- Guard location (line 15, "mergeTurn entry src/next.ts:962") is wrong for both clear rules, including my own notes. The clear test needs the fetched tracking ref, and the fetch is at `src/next.ts:996`. The guard belongs right after it, beside the pause re-check at 997, and inside the locked build at 1010. Placing it at 962 either skips the fetch (hold never clears) or forces a second fetch. Lines 964-995 are safe to run before the guard once the hold command has cleared the holder's batch record, because no other leaf carries one (`src/batch.ts:38-40`).
- A's synthesis compares two shas with `git diff` in `repo.root` (`src/batch.ts:15-25`), so the hold file must store the sha, not only "main moved"; line 6 should say so.

## D2 who repairs
- Fix-forward by holder B (line 10, A and C) is unreachable as written. merge-issue:65 ends the pass at the `check.fix` call, the hold command clears the batch record, and the next holder prompt comes only after the hold clears. B's objection (merge-issue:41, 43: nothing commits on an applied top) also holds before the command runs. Fix-forward survives only if the hold command itself prints a solo continuation (`merge turn held on <sha>: <command>` then `attempt=<id> solo`) and merge-issue says B may continue in the solo form; the merged file must pick that or drop the option.
- Fix leaf (line 11): I withdraw "waits like any leaf". `akrogon phase <fix-slug> merged` is refused for a non-holder at `src/phase.ts:770-777`, so an operator fix leaf cannot land during a hold without B's authorization override. The override should be scoped to one slug named in the hold file, valid only while the hold exists, and should not touch `merge_stamp`; that keeps queue order with the ordering fork.
- Net: with the hold, the paths are operator push (line 9) and named fix leaf (line 11). Fix-forward is a third only with the solo continuation above.

## Missing from the merged file
- Hold plus pause: operator unpauses expecting dispatch, the turn stays held. The unpause pass must print the hold line and `akrogon status` must show both annotations (`src/status.ts:382` shape).
- Order against bounce-counting: if bounce-counting lands first it spends `fix_rounds` on base-red bounces. bounce-counting's own "depends on this fork" line should be restated here as a sequencing lock.
- Stale processes: a `next` or `phase` process started before the hold lands keeps pre-hold code and can rebuild a stack on red main. Restart step at handoff, as carried from the map.
- B's evidence record (line 16) has no home. No attempt records exist (seed 66) and `src/log.ts:9-22` has only an optional `failure`. Put the fields in the hold file; do not widen the log schema in this fork.
