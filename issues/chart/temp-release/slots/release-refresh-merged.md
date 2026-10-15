# Release refresh, merged (2026-10-16)

Inputs: release-refresh-A.md, release-refresh-B.md, release-refresh-C.md. B read main at ab3c889; C and A's final checks read main at 74472d3, after store-sweep merged. Facts below cite 74472d3.

## What is delivered on main
- Leaf temp is disk-backed `/var/tmp/akr-<uid>/<4 hex>/<8 hex>`, still derived, 0700, with an absolute override (src/config.ts:262-272) (A,B,C). c698170 (2026-10-14): tmpfs files counted as slice memory and held admission closed overnight (A,B,C). The leaf-path lock `/tmp/akrogon-<uid>/<hash12>` is superseded on place and shape, kept on idea (C). The intake's "free the RAM" now means processes, not files (A,C).
- Seats run in transient scopes inside one slice per leaf (src/scope.ts:13-18) (A).
- worktree-cleanup (#93), all six leaves merged including store-sweep (C; A confirmed after B's read): for merged and failed leaves with tab gone the pass stops the slice (src/reconcile.ts:420-439), then deletes temp only when no pane is inside, no kept run root, the slice holds no running unit, and `dropChecked` finds no same-uid process with cwd or open file inside (src/reconcile.ts:951-973) (C). Unfinished leaves whose tab vanished lose temp under the same vetoes (B,C).
- A failed leaf keeps its tab; akrogon closes tabs only for merged leaves (src/reconcile.ts:308-314; src/phase.ts:104-108 renames it `<slug> failed`) (A,B,C).

## Q1 Release on every outcome
- Delivered by #93 for merged, failed with tab gone, and vanished tab (C; A after 74472d3). B's F3 gaps (stop failure still deleting, no emptiness check) are closed by the slice-holds-running-unit keep and `dropChecked` at 74472d3 (A).
- Residual: a slice stopped this pass skips the `sliceHasProcess` recheck, trusting `systemctl stop` exit 0 (reconcile.ts:966) while `dropChecked` still vetoes on any process using the folder (C). Parked leaves are not in the leaf map; park refuses leaves with a tab or worktree (src/park.ts:23-26), so a parked leaf has no live seats (B,C).
- Pick: no new work; record Q1 as delivered by #93 (A,C). B's pick (one explicit release path for every outcome, extending reconcile and store-sweep guards) is what #93 now is.

## Q2 Failed leaf: close the tab after evidence is saved, or keep it?
- Keep the tab (C, A after measurement). Measured from issues/log.jsonl 2026-09-16..10-16: 116 of 117 failed leaves were recovered (akrogon 16, median 12 min; framework 100, median 19 min), into implement, check.*, merge or plan.synthesis; one is still failed (framework model-run-harness). Recovery resumes the same seats in the same tab (src/phase.ts:162 renames the tab back). Closing the tab would make every recovery a cold restart with fresh seats. Temp is on disk, so a failed tab costs idle seat processes for about 15 minutes, not tmpfs RAM.
- Close after durable evidence and the final seat turn (B, A's first pick). Frees processes sooner; cost: loses the resume vehicle; needs a new "evidence saved" event that does not exist today (B,C).
- `akrogon stop <slug>` already exists for an operator who wants a failed leaf's processes stopped while keeping the question open (src/stop.ts) (C).

## Pitfalls and what removes them
- Escaped process using a folder: `dropChecked` /proc veto, a veto never a kill list (B,C).
- Refused-publication evidence in a run root: kept by reconcile (B).
- Seat writes under TMPDIR while its tab lives: temp deleted only when no tab or pane is inside (C).

## Questions raised
- Q3 (B): reverse the disk-backed root back to `/tmp`? A: no new evidence for it. 5b2f4d0's Chromium hang on disk `/var/tmp` has no recurrence recorded since c698170 (framework `akrogon flaky`: one browser test 2026-10-14, a shutdown case, not a hang).
- Q4 (B,C): tab vanished on an unfinished leaf is treated as release today; a herdr restart would drop every active leaf's temp in one pass. C asks whether status should name it.
- Q5 (C): release only failures with cause `attempts`, keep `blocked`.

## Where slots differ
- Q2: B close after evidence; C keep; A keep after the recovery measurement.
- B treated Q1 as open because it read main before store-sweep merged.
