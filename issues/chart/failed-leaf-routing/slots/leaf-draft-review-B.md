# Disagreements

## F1 · owner-defect-stop broadens the agreed failure class

The brief's What and criterion 1 cover a defect in any other leaf's work. Taken covers another leaf's **merged** work (`issues/chart/failed-leaf-routing/forks/fix-routing.md:17`). An unmerged owner may still be running and able to deliver the prerequisite through the existing dependency path (`src/next.ts:536`). It should not automatically require another fix leaf.

Replace the first sentence of What with:

> The watch recognizes a failed leaf whose reason identifies a defect in another leaf's merged work.

Replace criterion 1 with:

> The Failed on a human prerequisite rule also covers a failure whose reason identifies a defect in another leaf's merged work. Resolve the named owner or owner candidates against the readable leaf inventory. For this failure class, the operator charts a new fix leaf and resumes the failed consumer after the fix merges. Never reopen a merged leaf. A defect attributed to an unmerged owner does not enter this new class. Missing or ambiguous ownership is reported as unresolved rather than assigned by the watch.

## F2 · owner-defect-stop needs one coherent notification rule

Criterion 4 applies the fix-leaf instruction to every failed leaf, including credential and permission failures covered by `skills/watch-issues/SKILL.md:38`. It also defers the richer owner-defect notice until the whole watch can stop. An independent runnable leaf can therefore leave the operator without that routing notice. Conversely, when `failure.delivery` is not shown, the existing Judge rule sends one notification and criterion 4 sends another in the same fire. Taken requires notifying once with the owner and next step (`forks/fix-routing.md:17`). The existing delivery field records the original failure announcement (`src/phase.ts:70`), not delivery of this new routing guidance.

Replace criterion 4 with:

> For a newly recognized merged-owner defect, send one actionable notification naming the failed leaf, its failure phase, the owner or unresolved owner candidates, and its waiting dependents. Send this notice even if independent work prevents stopping. The next step is for the operator to settle any ownership or repair decision, chart a new fix leaf, then resume the consumer with `akrogon phase <slug> <failure.phase>` after that fix merges and the required seats are idle or absent. For credentials, permissions and other human prerequisites, report their actual prerequisite instead of prescribing a fix leaf. Coordinate this notice with the Judge notification so the same failure gets only one notice in this fire. Reuse that notice when applying Stop. If the watch stops, include `/watch-issues` and explain that the operator must start it again. Original `failure.delivery=shown` alone does not establish that routing guidance was sent. Use the existing watch context to avoid repeats and retain the existing allowance for a repeated notice after context loss. Add no persistent state.

Replace criterion 5 with:

> Walk through the edited rules using real observer output from fixture repos. Cover an owner-defect failure with a blocked dependent, the same case with independent runnable work, and a credential failure with a blocked dependent. Cover both shown and unshown original failure delivery. Record the intended notification and stop decision in an OS-temp artifact. Verify one notification per newly recognized failure in the fire, no stop while independent work can run, and no fix-leaf instruction for a credential prerequisite. Record the artifact path in the implementation report.
