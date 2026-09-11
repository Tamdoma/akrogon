# What happens when repo caps add up to more than the global cap?

## Question
With global 6 and repos at 4 and 4, the global still wins and the later repo in registration order gets squeezed. Is that silent, or does `akrogon config` or `next` warn?

### Carries
Operator lock: global stays the ceiling, no new machinery.

## Findings
A warning needs every repo's config read at dispatch, which `activeCount` already does, so it is cheap. But it fires on every sweep and the situation is a valid choice, not an error.

## Resolution
Operator: `1a`, 2026-09-11. Silent. Reason: the global cap is the ceiling by definition and repo shares summing past it is a valid setup, so nothing is built. Foreclosed: a note from `akrogon config` or `next` when the sum exceeds the global.
