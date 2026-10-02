# Brief: recovery-keeps-rounds

## What
A move out of `failed` keeps `fix_rounds` instead of setting it to 0 (`src/phase.ts:107-112`), with no exception for a leaf failed by the cap. Recovery still clears pass and delivery bookkeeping as today. `docs/guide/phases.md:73` says recovery keeps the repair count, so at the cap each recovery gives one more repair and a B-only re-check.

## Why
In framework emdash-launch, two recoveries reset the counter (2 to 0, 1 to 0), so A reviewed its own repair again and the cap of 3 never fired across 3 repair rounds and 5 recoveries.

## Done-criteria
1. The reset assertions at `tests/phase.test.ts:105-112` and `:824-837` become assertions that a recovered leaf keeps its `fix_rounds`, including a leaf failed with "fix rounds exhausted" whose count stays at the cap after recovery. The tests assert the stored count only, not which move refuses next, so they hold whether or not `b-repair-phase` has merged. (A,B,C)

Credentials: none. Human prerequisites: none.
