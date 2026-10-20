# bound-unit

## Question

What does the bound count (attempts, sessions) and who sets it per leaf?

### Carries

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: issues/chart/paid-proof-bounds/slots/map-merged.md
- limit-mechanism Taken (operator 2026-10-19, 1a 2a): issues/chart/paid-proof-bounds/forks/limit-mechanism.md
- fresh-run-need Taken (operator 2026-10-19, 1a 2a): issues/chart/paid-proof-bounds/forks/fresh-run-need.md. Its 2a settles open leaves with `grants: []`: no sweep, they stop at the next paid launch.

## Findings

Merged notes: slots/bound-unit-merged.md. Rebuttals: slots/bound-unit-rebuttal-B.md, slots/bound-unit-rebuttal-C.md.

- B and C count paid session starts, failed starts and resumes included, in one leaf-lifetime total. A runner's maximum fan-out is charged before launch, so splitting cannot dodge the total. A's runs-with-fan-out wording plus a separate "other" line is a second allowance (C rebuttal).
- All: the door drafts the total at charting, the operator approves before the first paid call, and the handoff shows used and remaining. There is no schema change. shapes.md's `bounds: <limits on use>` placeholder gains the total, the fan-out and the counting source.
- Sharing: one launch owner at a time with review seats launching nothing (A,B), or plan-set reserves per seat (C). Two blind review seats run at once in check.review.
- Refunds: none (B), because the runner's session count does not prove nested children were all counted. Or return the unused reserve when the count is exact (C).
- Raising: the operator approves the old-to-new total, and the door records it. No seat raises its own.

## Taken

- Operator 2026-10-19: dropped with the limit-mechanism shrink ("I don't want to overcomplicate the system"). No unit, owner or refund rule; the grant's free-text `bounds` stays as today.
