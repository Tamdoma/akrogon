# Brief: red-batch-culprit

## What
A red merge run that B can attribute to the holder or one carried member from evidence ends with `akrogon phase <holder> check.fix --slot B --attempt <id> --culprit <slug>`. The command refuses a stale attempt and a slug that is not the holder or a batch member, preflights every check the restore and the culprit's transition will run, against the culprit's saved head (or a solo holder's HEAD), and refuses the whole call before any write when one would fail (A,B), then restores every member (culprit included) and the holder to saved heads (restoreHolder's solo exception kept), clears the batch record, and moves only the culprit merge -> check.fix, keeping its merge_stamp. Before calling `--culprit`, B writes the finding (exact command, arguments, tested base and top, logs, attributed diff, restored head from the saved member head) into the culprit's own review-B.md, so the repair input exists before dispatch (A,B). It appends one attempt line with outcome `ejected` and the culprit slug. The next merge turn rebuilds from the queue with the existing build. merge-issue's red ending order becomes: `--red-on-base` first, then `--culprit` when B names a leaf from evidence, else today's split unchanged.

## Why
With today's split (keep the holder, halve followers) every batch size lands at or below solo at the measured pass rate: one red run per halving, the holder retested even when it is the bad leaf, green followers' runs thrown away (#62, #68; simulation in issues/chart/merge-throughput/slots/batch-size-merged.md).

## Done-criteria
1. A red batch of holder H and members M1, M2 ended with `--culprit M1` leaves H and M2 in merge at their saved heads, M1 in check.fix at its saved head with its merge_stamp unchanged and fix_rounds one higher, no batch record, and one attempt line `ejected` naming M1.
2. A culprit already at the fix_rounds cap gets the shared cap outcome instead of check.fix; the cases above start below the cap (A,B).
3. `--culprit H` on the same batch leaves M1 and M2 in merge at saved heads and moves H to check.fix.
4. `--culprit` with a stale attempt, with a slug outside the batch, or whose culprit transition would fail its checks (e.g. a dirty culprit worktree) is refused with no state, branch or record change.
5. A red batch ended without `--culprit` still splits as today.
6. `skills/merge-issue/SKILL.md` red ending states the order base, culprit, split and the evidence B copies into the culprit's review; the command reference and docs/guide/merge.md document `--culprit`.
7. The blocking `checks` pass.
