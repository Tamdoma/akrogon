# merge-red-exit after N3: slot B review

2026-11-21. Added and changed lines only. Code at akrogon `4f5e3fd2`. Ledger counts are mine, framework `issues/verify-runs.jsonl` and `timings.jsonl`, read 2026-11-21.

- P1. Criterion 9 says the leaf "gets one base pass". Most of the time the existing known-red branch runs none, so the criterion cannot pass as written.
  - Evidence: `src/verify.ts` `verify` runs the base pass only when `greenRun(repo, baseTree, ...)` finds no whole-green row for main's tree at the merge-base. The design's Base pass line says so, the criterion and the What do not.
  - Size: in 238 of 269 attempts since 11-14 (88%) main's tip already held a green merge row. In the 11-15 to 11-17 main-red streak it was 0 of 22, so the pass does run in the case Taken 8 is for.
  - Fix: word it as a base verdict. "When main's tree at the merge-base already holds a whole-green row, no suite runs, the units count as green on main and the leaf exits to `check.repair`. Otherwise one base pass runs." Same change in the What. Each branch needs its own test case.
- P2. B cannot see the base verdict, and criterion 10 makes B's next move depend on it.
  - Evidence: criterion 10 sends a second red to `check.fix` "only after criterion 9's base pass found that unit green on main when its trigger holds". The exit record's literal fields are reason, red run id or refusal text or base, and the evicted top. None says whether the trigger held or what main showed.
  - Fix: when the trigger held, the exit record names the base run, or the green row that stood in for it. Add this to criterion 9 and to Literal interfaces. The record's existing "base" means the conflict base, so the new field needs another name.
- P3. The Base pass line gives the wrong reason the returning leaf lands.
  - Evidence: `verify` with known-red set ends in `knownRedReceipt`, which accepts a head when a base run with `compares` equal to that head run and `sha` equal to the merge-base fails the same names. That is today's two-log rule. It passes the returning leaf with no cover involved, and `recordTested` passes it the same way. main-red-cover's cover is what lands the later leaves.
  - Fix: say the returning leaf lands by the existing known-red receipt, and the base row opens the cover for later leaves. Add that `verify` reuses the recorded red head run (`redRun`), so the turn holds one extra suite, not two.
- P4. The interpretation still says "criterion 8 is read by the reviewing seat, not tested". Criterion 8 is now the tested slot-run refusal. The read one is criterion 10. Fix: change the number.
- P5. `## Held disagreements` lacks C's dissent on Taken 8 (also trigger when two consecutive distinct leaves fail the same uncovered named title). It sits inside the verbatim block and is unanswered by the operator. Fix: add the entry, per shapes.md `## Leaf files`.

Checked and fine: the trigger's `holder.head` test (after a red exit the leaf branch is the evicted top, which is the red run's `sha`), `blocked-by: [main-red-cover]`, the N3 answer in the binding block, lock 2a.
