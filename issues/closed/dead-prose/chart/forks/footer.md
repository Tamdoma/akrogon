# Fork: footer

## Question
What stays of the footer block in the eight skills?

## Carries
broadcast:50-54, chart:59-63, check:54-60, implement:62-68, init:79-83, merge:52-58, plan:59-68, seed:63-67 and their 'two lines' intros.

## Findings
- repo (both): dispatch reads state.yaml (src/next.ts:530); no code reads the footer.
- (B) R2: deleting `Last operation:` loses the one visible result line; deleting only `Next:` leaves dangling intro sentences that must be rewritten.

## Taken
Operator answer (2026-09-14): `19` keep both `Last operation:` and `Next:` in all eight skills, for manual mode when the operator or someone else runs a phase by hand. Forecloses 19a and 19b. The scrambled-context paragraph is not covered by this answer.
Operator answer (2026-09-14): `31a` delete the scrambled-context paragraph in the five skills that carry it, keep the two footer lines. Forecloses keeping the paragraph.
