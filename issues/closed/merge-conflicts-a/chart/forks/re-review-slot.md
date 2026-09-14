# Fork: re-review slot

## Question
Who re-reviews a repair that came from merge once `fix_rounds` no longer rises on that move?

## Carries
routing.ts:39 `requiredSlots`, check-issue:43, guide sentences saying "A re-checks".

## Findings
- repo, dry-run audit 2026-09-14: `requiredSlots('check.review', 0)` returns A and B; A-only re-check depended on the counter that merge trips used to raise. One red-check trip in 137 merges.

## Taken
Operator answer (2026-09-14): `16a`. A merge-origin repair with no earlier review fix is re-reviewed by A and B like an initial review; with an earlier review fix, by A alone. No routing change. Foreclosed: a new state signal for A-only.
