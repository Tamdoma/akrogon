# Final-shape check, slot C

## worker-stash: defect

S1. The brief-template reset line conflicts outside delegated leaf workers. Brief-template section 2 requires a standalone brief to commit its tests first, then its code, and standalone work has no cherry-pick. "Reset to `<start HEAD>` and commit once" would collapse those two commits and destroy that order. The worker is also never given the start HEAD: no brief section records the HEAD its worktree was created at. Smallest correction: scope the single-commit reset to delegated leaf worker worktrees, have section 4 record the creation HEAD, and let the stash ban stand alone for standalone briefs.

## trailer-message: defect

T1. The stated refusal wording ("last paragraph") drops a phrase existing tests contract on: two cases in tests/phase.test.ts, one per guard, assert stderr contains "final trailer block". An implementer following the final shape turns both red, then must edit existing tests the leaf did not plan to touch. Smallest correction: keep the words, for example "the final trailer block, the commit message's last paragraph".

## installed-transfer: defects

I1. "Everything else in Transfer unchanged" conflicts with qualifying plan-issue. Lesson-rule Transfer and learn-issues Sort both say "one live review step", and plan-issue is a writer step, so half of Q6 is inoperable unless that wording changes too. Smallest correction: name the change ("review step" becomes "step") in the lesson-rule copies and Sort, and state that the new citation format also replaces the `<file:line>` form in learn-issues Apply, not only in lesson-rule.

I2. The Q4 rewrite has no home. Sort has five outcomes, none of them rewrite, and the Files line gives Apply only the add-at-step skip. An implementer must guess where contradicted lessons sort, what Apply tells the pass to do, and what history line a rewrite appends. Smallest correction: attach the rewrite to the Transfer bullet in Sort (fully carried transfers, contradicted or partly covered gets a proposed rewrite), add the matching Apply action, and fix the history append's shape in those words.

No other [changed] line breaks a mechanism or conflicts with signposts ## Taken.
