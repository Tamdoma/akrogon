# Chart: suite-repeats

## Destination

A leaf runs the full test suite only where the run can change a verdict: merge accepts the leaf's green receipt for the same tree and command set through one shared receipt rule, a red quick check skips the slow test, and B's check.repair verify runs only on the move into merge. Every check still blocks every merge.

Route: lifecycle

## Forks taken

- [merge-reuse](forks/merge-reuse.md): merge accepts a same-tree leaf row; one row rule (scope-free, whole row) decides green and known-red for verify and every gate.
- [quick-red](forks/quick-red.md): a red non-`full` check blocks `full` checks in the pass; `reuseSource` deleted; known-red skips a base pass on an already-green base tree.
- [repair-verify](forks/repair-verify.md): B's check.repair verify runs only on the move into merge; proof reruns stay.

## Open forks

none

## Fog

none

## Off route

- Test-suite internals (map X5: fixture template, prebundled CLI, next.test.ts split, session-routing sleeps): not in the handed work (operator message 5 scoped to X1-X3).
- Timing reader `reasonAt` fix and cohort gate (map X6): not in the handed work.
- A's round-0 review, merge-slow-alarm, Test-Change trailer gate, solo implement, `--name test` admission (map X4, X7-X10): not in the handed work.

## Pending steps

none

## Mode record

- mode 2026-11-01T12:09:08Z w8:pNP 6fae401d-8a9c-4738-8769-5fa2827e9f67: on, handed [suite-repeats: X1 merge reuse, X2 quick-red skip, X3 repair verify], consultants B w8:pXV (codex), C w8:pXS (pi), D w8:pXT (agy)
- mode 2026-11-01T13:05:11Z w8:pNP 6fae401d-8a9c-4738-8769-5fa2827e9f67: off, every handed chart handed off

## Autopilot

- switch-on: INTAKE.md `## Source: operator 2026-11-01 w8:pNP` message 6
- consultant: B w8:pXV codex, C w8:pXS pi, D w8:pXT agy
- route: lifecycle
- handed off: suite-repeats/merge-receipt-reuse, suite-repeats/quick-red-skip, suite-repeats/repair-verify-merge (issues/open/suite-repeats, `akrogon status` shows all three in plan.synthesis, no blocked-by)
- recorded only: `akrogon flaky` lists 15 test entries from 2026-10-17..24 (merge-flow holder-exit tests among them); `akrogon status` shows no open leaves
- friction: `herdr agent wait --until idle` timed out on consultants whose status read `done` after a finished turn; waits with `--until idle --until done` passed.
- usage: USAGE.md (chart-usage.ts outcome partial: A unmeasured, D unmeasured, B 81248 and C 89221 output tokens at 2026-11-01T13:05:11Z)

Handed off 2026-11-01
