# Slot B: final-shape defects

Checked 2026-10-15 against `hygiene-final-shape-draft.md`, the fork Findings, and both related Taken sections. Read-only review. No deletion or process termination.

## F1. Stopping the leaf slice at `phase: merged` can kill the merge command and its unfinished seat

The draft's Q1 stop condition is too early. `src/next.ts:429,503-522` adopts the seat shell into `leafSlice(repo, slug)` before dispatch. `src/next.ts:648-650,664-681` dispatches the merge skill to that seat. Its `akrogon phase … merged` command can therefore run inside the very slice being stopped.

`merged` is not the end of that command's work. `src/phase.ts:154-174` saves the terminal state before completion-owner processing and log writes. `completeOwner` still closes sources and moves the issue folder (`src/phase.ts:214-224`). The stacked path moves members and then the holder (`src/phase.ts:629-634`). After `phaseCommand` returns, the same CLI still calls `mergeWake` (`src/akrogon.ts:85-86`), which runs self-update and the next merge pass (`src/next.ts:1198-1203`). An immediate stop inserted at the state transition, or a concurrent recovery pass using only the merged-state condition, can interrupt these operations.

Moving the stop to the CLI's end is still insufficient for the seat: `skills/merge-issue/SKILL.md:79-83` requires that same merge seat to broadcast completion after the command returns, then finish. The current idle/exit close path is in `src/next.ts:1481-1489`.

Required correction: distinguish the committed merge from completion of the command and seat. Run destructive slice teardown from a controller outside the target slice after the finishing seat has released it. Keep the taken direct close/dispatch for completed stacked members, but do not stop the holder while it is completing the stack or its post-command work. Test a real scoped merge command and a deliberately delayed completion/broadcast step, including a concurrent reconcile, rather than only checking the final phase value.

## F2. “Non-record files in runs/” includes live atomic-write intermediates

The Q1 host-wide cleanup includes non-record files in `runs/`, but the Q2 gates do not protect their actual writer. `src/admission.ts:59-63` writes `<hash>.yaml.<pid>.tmp`, closes it, then renames it to the admission record. Between write and rename, no process needs to hold the temporary file open or have cwd inside it. A second process can delete it under the proposed rules and make the writer's rename fail.

This can happen with no active leaf at all: `run-check --holder …` uses the synthetic `checkout` target (`src/run-check.ts:126-127`), and check admission writes these files independently of a leaf tab (`src/admission.ts:130-153`). The no-running-leaf gate therefore does not close this case.

Required correction: distinguish retired files such as `last-start` from live-writer temporaries. Collect atomic intermediates only after establishing that their writer has ended, or through a publication protocol shared with that writer. Do not treat absence of an open fd as sufficient. Add a concurrency case paused between the write and rename.

## F3. Host-wide kept items have no defined report owner or status reader

Q3 requires reporting every unprovable item in `reconcile/<repo>.json`, but also adds cleanup for items with no registered repo: unregistered repo directories, global `runs/` files, and unmapped legacy scratch. No `<repo>` exists for these items.

The current report API requires a `Repo` and keys by its name (`src/reconcile.ts:22-35`). Plain status enumerates registered repos, filtered to the current repo when applicable (`src/status.ts:370-374,394-409`). Writing an invented host filename alone would not make it visible, and attaching a shared entry to an arbitrary repo risks replacement by that repo's next report write (`src/reconcile.ts:35-40`).

Required correction: define a collision-free host report destination and when plain status reads it, including a run with zero registered repos. Otherwise this new cleanup has retained files that the promised status output cannot show.
