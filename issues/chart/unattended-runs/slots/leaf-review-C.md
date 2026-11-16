# Leaf review, slot C

## count-silent-turns

D1 (criteria 4 and 5 cannot pass as designed for a gone terminal). The design gates the `lost` charge and the `seat_lost` row on `allocation.seats[slot]` naming a recorded seat. `allocate` in src/next.ts builds those seats from `leafSeats` in src/reconcile.ts, whose `owned` only finds a seat inside the hc terminal listing. A terminal already missing from hc gives `allocation.seats[slot]` undefined, so the replacement charges nothing and writes no row, while criterion 4 covers a seat whose terminal is missing and criterion 5 demands the `gone: true` row for exactly that case. The recorded seat the criteria mean sits in state, and `dispatchSlot` already loads it as `recorded` through `readState`. The charge and row have to key on `recorded.seat[slot]`, with address, and turn when known, taken from state for the gone case.

Nothing else in this leaf.

## refuse-failed-runs

D1 (criterion 1 against `verify`, bypass paths exist today). The design owns src/verify.ts only "if the plan finds a verify path that bypasses `checkedRun`". Two such paths are in `verify` in src/verify.ts now. A reusable green receipt through `greenRun` returns 0 with a reuse line and no `checkedRun` call at all, so a verify invocation on a failed leaf can exit 0 and print no refusal. A live pass found through `livePass` is joined through `waitPass` with the same effect for that invocation. Criterion 1 as written covers a verify stage for a failed leaf with no such exception, so either the criterion needs to scope itself to stages that launch, with reuse and join named as limits, or src/verify.ts is owned outright and the refusal is also decided in `verify` before reuse and join.

D2 (wrong seam claim). The design says older akrogon releases reading a timings file with `check_refused` rows "drop them (strict union)". `readTimings` in src/timing.ts strict parses every line inside one try and returns an empty list on any failure, so an older release drops all timings for that repo, including the visit and wait rows src/next.ts derives state from. The seam statement in the leaf report has to say that, since the same applies to count-silent-turns' `seat_lost` kind.

Nothing else in this leaf.

## claude-seat-no-questions

None.

## blocked-seat-notice

None.

## door-reads-live-address

D1 (criterion 4 claims repo health). Criterion 4 makes the repo's format, test and typecheck checks pass as a leaf outcome. Those checks cover the whole destination, so pre-existing reds and known flaky tests outside this leaf's three text files would fail this leaf through nothing it owns. Implement already owes `akrogon verify` outside the criteria. The criterion should leave the leaf judged on its text alone, as criteria 1 to 3 already do.

Nothing else in this leaf.

## Shared

S1 (#137 has a part with no home, and one wrong owner). The listener boot PATH crash in report #137, whose placement the signposts record as owed, appears in no leaf's What and no owned surface lists src/listen.ts. At the same time Tamdoma/akrogon#137 sits in the `sources` of both count-silent-turns and refuse-failed-runs. refuse-failed-runs delivers nothing for #137 at all, since its whole scope is the run-check refusal from #136, and count-silent-turns delivers the attempts half only. As handed off, the epic can complete and close #137 with the PATH crash untouched and nobody owning it. It needs its own small leaf or an explicit off-route limit, and #137 should come out of refuse-failed-runs' sources either way.
