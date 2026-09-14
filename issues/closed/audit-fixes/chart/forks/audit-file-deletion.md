# When muse-audit.md is deleted

## Question
Q4. Is `muse-audit.md` deleted inside the leaf's diff, or by the operator on main after the leaf merges?

### Carries
No existing locks. Note text: "Delete muse-audit.md from the repo root once the leaf merges, it was the input and it is not documentation."

## Findings
(B) "Once the leaf merges" reads as a separate mutation on main after merge, an operator step.
(A) The file sits at the repo root, not under `issues/`, so a leaf branch may delete it. Deleting it in the leaf diff removes a manual step and lands in the same merge.
(both) Neither reading deletes the issue note itself.

## Taken
Operator answer: `4a`, 2026-09-14. Delete `muse-audit.md` in the leaf diff. Reason: same merge, no manual step. Foreclosed: an operator deletion on main after merge.
