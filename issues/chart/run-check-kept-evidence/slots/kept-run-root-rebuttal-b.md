# Rebuttal: kept-run-root (slot B)

Read: slots/kept-run-root-merged.md, `src/reconcile.ts` `dropChecked` (owner-veto part). Probe run: `du -sm /var/tmp/akr-1000/*/*/run-*` and `df /var/tmp`.

## Q1: one disagreement

- D1. Removing `.owner` after writing the marker is a redundant step. The merged design already makes both readers check the marker first: the `reconcile` run-root loop skips a marked root, and `ownerKeeps` returns no veto for it and does not recurse. With those two checks a stale `.owner` is never read, so pid reuse cannot produce a `live owner` veto in `dropChecked`. While the wrapper lives, `.owner` names a live pid, so there is no window to guard either. Consequence if built as merged: an extra `rmSync` in `checkedRun` plus the "marker first, then `.owner` removal" ordering rule and its race pitfall, all guarding a state the marker checks already make unreachable. Build without the removal and drop pitfall lines "Pid reuse" and "Marker/owner race". The mixed-versions line still holds: an older reconcile drops a marked dead-owner root at once instead of after 60s, and never pins it.
- Marker name: none. Either name works as long as it is dotted.

## Q2: none

Nonzero only stands. C's non-empty test is harmless but buys only tidiness.

## Q3: none on the pick, one correction to the cost

- D2. C's "full suites can be large" is not supported on this host. Probe 2026-11-20: the one live run root is 18 MB, the largest whole leaf temp is 76 MB, `/var/tmp` has 680 GB free. All callers with no parameter stands. Consequence of C's variant: a mode flag on `checkedRun` to save tens of MB.

## Q4: I withdraw my bound, and disagree with C's window

- D3. Withdrawn: per-check-name replacement (my K4 b). The same probe answers my own condition: red roots are small against free disk, so no bound before release. This removes the marker's need to carry the check name; the marker can be empty.
- D4. C's 60-minute age window for marked roots under `checkout`/`self-update`. In `reconcile`'s `ownTemps` branch the whole dir goes through `dropUnowned` when nothing inside was kept. Protecting a marked root there needs either a `keep()` call, which prints a `Kept:` line and breaks signpost 2a, or a second silent rule with a timer. Consequence if built: two reconcile rules and a clock where signpost 2 allows one rule. Accept the idle sweep for holder runs and state it in the docs clause. Note A's repro uses `--holder`, so its done-check must read the path before the next idle `reconcile` pass, or use a leaf.

## Q5: none

## Pitfalls: one disagreement

- D5. Killed-wrapper line: keeping both LESSONS.md lines verbatim leaves text that becomes false. Both say run-check removes the run root "on exit" / "at exit" with no qualifier (`learnings/LESSONS.md`, lines dated 2026-11-15 and 2026-11-20). After the fix that holds only for a green exit or a killed wrapper. Consequence: seats read an active lesson that misstates the mechanism and keep passing evidence roots for runs that no longer need them. I have not read the lesson rule's Retire clause, so I do not claim the lines can be retired. If they stay, the leaf rewords them to the remaining path (killed wrapper, `--holder` idle sweep).
- Docs drift: the clause belongs in the `src/AREA.md` run-check line as well as the reconcile line, since `checkedRun` is where the keep happens. Small.
- Other pitfall lines: none.
