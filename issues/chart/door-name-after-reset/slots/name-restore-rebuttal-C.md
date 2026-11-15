# Rebuttal on name-restore, slot C

Read: slots/name-restore-merged.md, slots/map-A.md. Nothing else.

No disagreement on Q1, Q3, Q4 or the order (2a). I drop my `herdr.tab` label lookup: tab membership through `docGet` gives the same tab with one input less (P7).

Two points I still dispute. Both are inside 2a and the stand-in line, not against them.

## D1. The stand-in must run `/rename` as a turn, not "with no turn"

The merged pitfall line says the stand-in appends `custom-title` "with no turn (C)". That was my map, written before the probes. P4 and P6 show the opposite: hc counted the rename as a turn (status working, then done, turn 2 in P6).

If the stand-in stays turn-free, the test never exercises the wait that 2a depends on. A helper that types `/clear` without waiting would pass the test and glue inputs on a real door.

Change: on `/rename <name>` the claude stand-in reports working, appends `custom-title`, reports idle, and logs a `turnEnd`. The T2 assertion "nothing received while busy" then proves the wait.

## D2. "Waits for that short turn to end" needs a stated condition and a stated timeout result

2a does not say what the wait checks or what happens at its bound.

- Condition: the helper's existing `idle` predicate is true before the rename turn starts, because A is idle when the send goes in. `waitFor` begins with a snapshot of the terminal, so a wait on `idle` alone can return at once on the old state. P6 did not hit this because `hc wait` ran by hand after the answer. The wait must tie to the turn the send answered: idle and `turn` greater than the `turn` in the send's answer, or the equivalent the plan picks after reading how hc counts it.
- Timeout: if the rename turn is still open at the bound, typing `/clear` is the glue case the merged notes call worse than a missing name. 3a lists skip reasons but not this one. State it: the wait running out is not a `skipped` that proceeds. Either the helper stops there like `wait-turn-end: turn open`, or the plan shows that `/clear` typed into an open rename turn is safe. I pick the stop: it reuses the existing rule that nothing is typed into an open turn, and a rename that hangs means A's terminal is not in a known state.

This is a narrow exception to signpost 5a ("a logged skip on failure"). 5a covers failing to set the name. It does not cover typing the reset into a terminal that is still working.
