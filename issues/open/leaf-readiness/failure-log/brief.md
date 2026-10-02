# Brief: failure-log

## What
Every `issues/log.jsonl` record of a move into `failed` carries the leaf's `failure` object (`cause`, `phase`, `slot`, `reason`, and `delivery` when present) as written to state. Records of other moves carry no `failure` key. `akrogon status` keeps reading the log unchanged.

## Why
All 32 `failed` records in the consumer log have no reason (`src/log.ts:16-31`), so the #52 analysis had to rebuild causes from reports (Tamdoma/akrogon#52). The state already holds the reason and the log drops it.

## Done-criteria
1. `tests/phase.test.ts`: `akrogon phase <slug> failed --reason "<text>" --slot A` appends a log record whose `failure` equals the state's `failure` (`cause: blocked`, phase, slot, reason).
2. `tests/next.test.ts`: an attempts-exhausted stop (`cause: attempts`) appends a record with that `failure`.
3. `tests/phase.test.ts`: a non-failed move appends a record without a `failure` key, and `akrogon status <slug>` still prints its history lines.
