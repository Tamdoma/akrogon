# Map: slot A (blind)

## Live surface read

- `src/run-check.ts` `checkedRun`: run root = `mkdtempSync(<leaf temp>/run-)`, `.owner` written, child TMPDIR = run root (`constructedEnv`); `finally` removes the run root unless `refused` (publish refusal keeps it with `refusal.json`, `.owner` removed).
- `src/reconcile.ts` `reconcile` scratch-root loop, per `run-*`: `refusal.json` -> keep (vetoes leaf temp release); no `.owner` -> keep if <60s else `dropUnowned`; invalid `.owner` -> keep; `ownerDead` -> drop; live -> keep "run in progress". After the loop a leaf dir is `dropChecked` whole once its tab and panes are gone and no keep happened; `checkout`/`self-update` dirs are `dropUnowned` when nothing is kept and no repo leaf runs.
- Callers of `checkedRun`: `runCheck`, `src/verify.ts` (setup, serial members, parallel members).
- Prior operator answer, worktree-isolation/check-env design `Outputs` Taken 2026-10-10: "all of the leftovers are always cleaned up unless it's logs or something that we will need in the future... I don't want any gigabytes to be on the disc for no reason." Read then as: default delete, run root removed at run end, reconciler removes run roots whose process is gone, kept set explicit (logs and named evidence to `<leaf>/implementation/`, the writer's job).
- Tests pinning today: tests/run-check.test.ts "run-check TMPDIR is a fresh run root ... removed on success and failure" (failure half changes); tests/reconcile.test.ts "run root with a dead owner pid is removed, live owner kept" (DC3) and the young/dead run-root cases near the scratch tests.

## Forks

1. Keep rule. (a) A red exit (code != 0, not refused) skips the `rmSync` and removes `.owner`; reconcile stops removing run roots one by one when no live owner and no refusal: such a root is left to the leaf temp's existing release, with no keep line and no veto. A killed wrapper's root (dead `.owner`) is covered by the same rule for free. (b) A red exit writes a marker file that reconcile skips; unmarked dead-owner roots still dropped; killed wrapper not covered; one more file kind. (c) Drop per-run roots, TMPDIR = leaf temp: green leftovers pile up for the leaf's life, breaks 10-10 "default delete". Pick a: one rule in each file, fewer branches than today (the 60s gap and dead-owner drop collapse into "leave"), green path untouched.
2. Lifetime. (a) Until the leaf temp's release (tab and panes gone; failed leaves keep their tab, so evidence stays while recovery needs it); checkout/self-update until the existing idle sweep. (b) Latest red root per check name, earlier ones removed: needs a name record and a scan. (c) Age limit: new timer and config. Pick a: no new part; the 10-10 exception "something that we will need in the future" covers a red run's leftovers, and the leaf release bounds them.
3. Callers. (a) Every `checkedRun` caller, one rule, no flag. (b) `run-check` only: a mode flag. Pick a. Cost: a red verify keeps each red member's root until release.
4. Telling the reader. (a) One stderr line on a red exit naming the kept root, before the `check <name>:` line, which stays unchanged. (b) Silent; the child's own printed path is enough for the reported case. Pick a: the run root path is otherwise unknown to the seat when the child prints nothing.

## Pitfalls over the work's lifetime

- P1 Pid reuse: a stale `.owner` whose pid is reused reads "run in progress" and vetoes leaf temp release. Removed for red exits by deleting `.owner` before keeping; a killed wrapper keeps the same risk as today but for longer (until release). Cost noted.
- P2 Disk: a long leaf with many red runs holds every red run's leftovers until release. Well-behaved children clean their own temp, so leftovers are what they chose to keep or leaked. Bounded by the leaf; measured value unknown.
- P3 Kept roots must not veto release (signpost 2): the reconcile branch must call neither `keep` nor `drop`, or `kept.length` changes and the leaf temp sticks.
- P4 Refusal path unchanged: `refusal.json` keep still vetoes; ordering of checks keeps refusal first.
- P5 `abandonedCaptures`, `pack`, owner `.lock` work on holder files, not the run root: untouched.
- P6 Lessons: LESSONS.md lines "run-check drops kept evidence (2026-11-15)" (committed) and "run-check tmpdir drops capture evidence (2026-11-20)" (uncommitted, history file untracked) describe this one mechanism. The stopping leaf retires both; the 11-20 files must be on main before the leaf's base, an operator commit.
- P7 Cross-device: nothing is moved, so the 2026-10-22 EXDEV lesson does not apply.

## Practitioner questions

- Does any consumer read "no run-* dirs exist" as health (tests `scratchRuns`, status, leftovers)? Only the test helper found.
- Is the 60s young-root branch still needed once reconcile never drops a single root? No: it guarded the drop.
