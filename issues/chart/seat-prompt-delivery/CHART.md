# Chart: a seat prompt is delivered once per pass and its failure is legible

## Destination
One `akrogon next` pass makes at most one delivery attempt per seat and returns; a retryable herdr failure is recorded with its code, message, target pane and session, and the next manual pass retries after observing the pane fresh. An ambiguous `timeout` is checked against the seat's session file before it counts as undelivered. Three failed passes move the leaf to `failed` with a reason that carries the last recorded error. A non-retryable herdr error on a seat fails the leaf with `seat <slot> unreachable: <code> <message>` instead of throwing out of the pass. No clock, no watcher, no automatic pass.

## Forks taken
- `forks/delivery-retry.md`: Q1-A, Q2-A, Q3-A (operator 2026-09-19).

## Fog
None.

## Off route
- The seat side: why a live pi pane rejected three prompts in 22 seconds. No same-version reproduction; a herdr or pi transport fix waits for one. No fallback input path (`pane run`, `send-keys`) in akrogon.
- A longer `--timeout` so herdr's stall code is observable: changes only what the record says, not the outcome; left as is.
- The log line's caller identity (`src/log.ts:12-15`): the failure record carries the target identity; the log format is unchanged.

## Territory findings
See `slots/map-merged.md` and `forks/delivery-retry.md`.
