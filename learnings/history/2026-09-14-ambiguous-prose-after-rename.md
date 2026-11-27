# Renamed contract leaves ambiguous prose in excluded files

2026-09-14. Leaf plan-is-contract-skills removed the whole-leaf `implementation/brief.md` contract. Review found `docs/guide/in-practice.html:86` and `docs/guide/problems.html:61` still say "fix the brief if the brief was the problem" for a failed leaf. The intake `brief.md` still exists so the sentences are not wrong, but a reader can map "the brief" to the removed file. Both files were in the design's exclusions, so it was recorded as a Nit.

Learning: when a leaf renames or removes a contract file, sweep prose for the old term itself, not only the old path. A dangling-path grep misses sentences that still parse but now point at the wrong referent; report ambiguous hits as Nits when the files are out of scope.

## Case 2026-11-27 (away-pictures check.review, slot B)

`387d6d6f` deleted `tests/budget.test.ts` but left the `tests/AREA.md` line "`tests/budget.test.ts` proves the session-budget reservation ..." in place. The away-pictures review's AREA.md path listing found it missing on base `f6fb1864` and on head `59f72ff1`. The line was outside the leaf's diff, so it stayed a Nit. Learning: the same sweep applies to a deleted test file. Grep the area files for its path when a file is removed.
