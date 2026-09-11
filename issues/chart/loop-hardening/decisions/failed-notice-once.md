# How is a failed leaf notified once?

## Question
How does the failure notification stop repeating on every sweep?

### Carries
`tests/next.test.ts:148-173` expects notification failure to stay visible.

## Findings
(both) `next.ts:314` notifies on every dispatch of a failed leaf. (B) transition-only notification loses the notice on a crash or herdr failure; state is saved before later effects. (A) originally proposed transition-only; withdrawn.

## Resolution
Operator 2026-09-11: `5a`. State records successful notification delivery for the current failure episode; a sweep notifies only when that record is absent and sets it only after herdr succeeds; the record clears when the leaf leaves `failed`. Foreclosed: notifying inside the transition with no record.
