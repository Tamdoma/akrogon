# Signposts return: slot B

Read: INTAKE.md, `src/run-check.ts` (whole), `src/reconcile.ts` `reconcile` (scratch-root block), `src/AREA.md` run-check and reconcile lines, `learnings/LESSONS.md` two lines. Not read: framework `capture-website.ts`, `src/verify.ts` bodies, `src/config.ts` `leafTemp`.

## Draft questions that need changes

- F1. Q2 option (a) cannot hold as written. `reconcile` drops any `run-*` root whose `.owner` pid is dead (`if (ownerDead(owner)) drop(runRoot)`) and any root without `.owner` after 60s (`dropUnowned`). A run root kept in place after exit is deleted on the next pass unless reconcile learns a new keep rule or the evidence leaves the run root. Re-option Q2 as: (a) kept evidence stays inside the run root and reconcile gains one keep rule, (b) kept evidence leaves the run root before the existing `rmSync` and every temp rule stays byte-for-byte. Q8 below depends on this pick.
- F2. Q2 "only the failed-run path may change" presumes exit status is the trigger. That is a pick, not a limit. See Q6.
- F3. Q1 option (b) is a strawman, so the question settles nothing. The real split is who decides what counts as evidence. See Q6.
- F4. Q3 option (b) is mis-optioned. The real alternative to "akrogon infers" is "akrogon exports a durable evidence dir and drivers opt in", which keeps akrogon as the owner but needs a one-line driver default change. Q3 (a) forces akrogon to keep the whole root, because it cannot tell evidence from junk.
- F5. Q5 is not a direction question. INTAKE "Agent findings" already settles it by the lesson rule. Drop it, or keep only the sub-point that the 11-20 line is an uncommitted operator-side edit a leaf would touch.

## Missing direction questions

- Q6. What triggers a keep? (a) nonzero exit, (b) anything left in the run root at exit, (c) the child opts in (marker file or exported dir). Changes the mechanism, the test shape and whether framework is touched. Note `checkedRun`'s `finally` never runs when the wrapper itself is killed (timeout, SIGKILL), which is a likely end for a paid capture; that case reaches only `reconcile`, so (a) alone does not cover it.
- Q7. Which callers get the behavior? `checkedRun` in `src/run-check.ts` serves `runCheck` and three `src/verify.ts` call sites (setup, serial members, parallel members). (a) `run-check` only, (b) every `checkedRun` caller. A red merge suite's TMPDIR can be large and verify runs members in parallel, so (b) multiplies disk held per red attempt.
- Q8. How long does kept evidence live, and what removes it? (a) until the leaf temp is released (tab gone), no new owner, (b) until the next run of the same check name replaces it, (c) a count or age bound. Evidence cannot settle this; it is the operator's retention preference. For the `checkout` slug there is no leaf, so (a) means "until idle sweep".
- Q9. May a kept run root block leaf temp release? In `reconcile`, any `keep()` on a run root makes `kept.length !== keptBefore`, which skips `dropChecked(dir)` for the whole leaf temp and skips `dropUnowned` for `checkout`/`self-update` (the `refusal.json` keep works this way today). (a) kept evidence never vetoes temp release, (b) it vetoes like a publish refusal until someone clears it. Pick (b) and one failed paid run pins a leaf's temp and shows a `Kept:` line until manual cleanup, which breaks the temp-release chart's contract.
- Q10. Must the path the child printed stay valid? The driver prints an absolute path under the run root and the seat follows that line. (a) keep in place so the printed path works, (b) relocate (holder or a sibling dir) and print a mapping line. (b) under an `issues/` holder also puts paid-session transcripts in the repo tree beside `*.log` files that `pack` folds; say whether that is allowed.
- Q11. Does the reader get told? (a) `run-check` prints one stderr line naming what was kept and where, next to the `check <name>:` line, (b) silent. Small, but it decides whether the two lessons' "evidence gone" failure can recur as "evidence kept but nobody knew".

## Existing precedent worth naming to the operator

- F6. `refusePublish` in `checkedRun` already keeps a run root: it writes `refusal.json`, removes `.owner`, sets `refused` and the `finally` skips `rmSync`. `reconcile` honors it. A failed-run keep can reuse this shape with one marker instead of a new mechanism, subject to Q9.
