# Coverage rule: proposed final shape (round 1, A's pick 1a 2a 3d, 2026-11-09)

Corrections against the merged notes are marked [corrected].

## Command (Q1, 1a)

`knownRedReceipt` stops refusing a red head entry for `(no test name)`; it still refuses `(log gone)`. Everything else in it stays: the whole eligible head row, exact `name` and `command`, a completed base run linked through `compares` at the current merge-base, base entry red and not blocked, every head name among the base names, blocked head entries skipped, at least one red entry. Results:

- nameless head, nameless red base of the same command: covered (new);
- nameless head, named base: not covered; named head, nameless base: not covered;
- gone log on the head or on the base: not covered;
- named head and base: unchanged.

`failedTests`, `flips`, `newRedUnits`, `verifyRunSchema`, `runOnce` and scheduling do not change. No new configuration, receipt field or output comparison.

## Seat judgment (Q2, 2a)

One rule, stated in the known-red paragraph of skills/implement-issue (Shared context), skills/check-issue (check.review), skills/merge-issue (red verify) and landing step 3 of skills/chart-issues `## Direct route`. A known-red exit 0 counts as passing only when the seat's judgment agrees, and the judgment is runner completeness and causal fit, meaning one of:

- the red command logged a real test name and that name also fails on the base (unchanged); or
- the red command's log names no test on the head and on the base, and the seat, having read both logs whole, finds that the head shows no failure the base lacks, judged in substance and never as exact text, that the command ended by its own verdict and was not killed, timed out or crashed, and that the leaf's diff holds no plausible cause.

[corrected] A command that ended by its own verdict with an ordinary error, a missing input or a load diagnostic is not excluded for naming no tests; only a killed, timed-out or crashed run is. [corrected] When both logs exist but show too little to establish a cause, the seat withholds agreement and the existing blocking path applies.

In both cases the leaf's own done-criteria proofs must pass on their own; a cover never stands in for them.

## Blocked checks (Q3) [corrected: 3d, B's proposal, replaces 3a]

The sentence "A check recorded `blocked` in a verify receipt did not run, so the check named as its blocker is fixed first" gains one exception, in the same four places: when the blocker is a known-red the judgment agrees with (named or nameless), the blocked check stays recorded as not run, is named as not run in the seat's record and never reported as passing, and does not by itself stop the leaf. A done-criterion whose proof is a blocked check cannot be shown, so that leaf stops under its existing rule. A blocked entry never covers on the base (unchanged code). No blocked command is run by the seat or by `--known-red`.

Stated cost: while the base check is red, a leaf can pass review and land without its `full` checks or `merge_checks` having run on it.

## Docs

docs/reference/checks.md `## Known red` and its `verify known-red <sha>: fail` table row, and src/AREA.md's verify paragraph, state the changed command rule.

## Leaf

One leaf under one issue, sources Tamdoma/akrogon#133. Proof: local tests on isolated fixtures through the real verify path, red before and green after for the nameless pair, with the still-true refusals kept.
