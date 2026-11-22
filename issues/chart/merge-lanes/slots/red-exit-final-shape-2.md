# red-exit final shape, corrected after the first check

Corrections from red-exit-final-check-B.md (X1-X5) and red-exit-final-check-C.md (1-4) are marked [fix]. Items not marked are unchanged from red-exit-final-shape.md.

1. As before, and [fix C4] the exit record also holds the evicted top (the tested top for a red exit) so a no-edit return is read from the record.
2. Push: unchanged (B's standing dissent kept).
3. As before, and [fix X1] a red B judges main-caused that the cover does not reach (nameless, or no base pass found it) takes the existing operator-only `failed` stop naming the main red, never `check.fix`. [fix X2] The second red on the same unit goes to `check.fix` only after item 8's base pass ran and found that unit green on main.
4. [fix B wording] The receipt skip applies to red exits only: `check.repair -> merge` skips the leaf receipt when HEAD equals the exit record's top.
5. [fix X5, C1] A flip under 5a: a named unit red on a leaf's merge run and green on its next merge run, with the leaf's own commits unchanged, and no base run or covered landing failing that unit between the two runs. The verify-runs row records at run time what "own commits unchanged" needs (git objects of an evicted top may be gone); the field is open for the plan.
6. Unchanged.
7. As before, and [fix C2] the cover is accepted through `requireGreenReceipt` (`knownRedReceipt`), so `landGates` and `landPush` pass a covered head, reading stored `failures` first as `newRedUnits` does.
8. [fix X3, C3, X4] Trigger: the leaf returned from `check.repair` with no edit (HEAD equals the exit record's top), every failing unit on this run is a named title, at least one of them also failed on the leaf's previous red exit (read from `merge-attempts.jsonl` and that attempt's red run in `verify-runs.jsonl`), and none of them is already covered. Then the land run runs one base pass in that turn through the existing known-red branch of `verify`. This is a named exception to lock 5a: the red leaf holds the line for one more suite, once per main-red unit, so that every later leaf is covered.
9. Unchanged.

## Check asked

Only the [fix] lines: is any wrong, unbuildable, or against a lock in forks/signposts.md `## Taken`? "None" is a valid answer. One short pass.
