# Fork: resolution evidence

## Question
What does A record after resolving a conflict, and does anyone check the resolution before the push?

## Carries
merge-issue:31-33 evidence lines in review-A.md; check-issue:43 baseline wording.

## Findings
- repo, tree-preflight and fetch-deadline review-A: after repair A already records rebase target, prior reviewed head, repaired head and a `git range-diff` of the reviewed patch against the rebased one. Changes: the same three lines serve as A's own resolution record.
- Astra section 3: verification after a changed rebase target is the part to keep. Changes: the full checks after resolution stay the gate.
- model-knowledge, no stronger source: a second reviewer for a union-of-hunks resolution costs the contribution the leaf is trying to save.

## Taken
Operator answer (2026-09-14): `13a`. A records the rebase target, the prior reviewed head, the resolved head and a `git range-diff` in review-A.md before the push; green checks are the gate, no second reviewer. Foreclosed: B re-checking the resolution.
