# Chart: factory-wins

## Destination

Two small defects found by the factory survey are gone: `akrogon <verb> --help` prints that verb's declared flags and a mistyped flag or a wrong `timing --since` form prints one plain line, with no stack trace (W1); the verify-survival test waits for the pass service to finish before it asserts, so it no longer flips (W2).

Route: lifecycle (direct refused: more than one outcome). Handoff review approved by the operator 2026-11-10 ("1a"); leaf review by slot B in slots/leaf-review-B.md, one correction adopted (cli-help owns the guard and run-check usage strings). Written to issues/open/factory-quick-fixes: cli-help, survival-test-wait.

## Forks taken

- [signposts](forks/signposts.md): 1a 2c 3a 4a 5b 6a 7a; needs row N1 (paid run cap) pending
- [split](forks/split.md): 1a 2a 4a, and neither the usage record nor the fresh implement session is charted; charts in order factory-wins (quick fixes), dispatch-flake, shared-rules, round-rewrites
- [contracts](forks/contracts.md): 1a 2a 3a; help built from declared flags, the transcript-read change dropped, the implement-issue reference change moved to shared-rules

## Open forks

## Fog

none

## Off route

- W3 dependent-dispatch flip: charted in `issues/chart/dispatch-flake`.
- W7, W8 shared rules and step-scoped reading: charted in `issues/chart/shared-rules`.
- W9 question rounds: charted in `issues/chart/round-rewrites`.
- W4 transcript reads: dropped on the measured cost (contracts question 2).
- W5 implement-issue references: built in `issues/chart/shared-rules` (contracts question 3).
- W6 flaky-list outflow: listed in slots/map-merged.md, not charted; no reporting defect or repeated reading cost is measured (slot B RB3, A conceded).
- W10 seat usage record: listed, not charted; no decision needs it today (split question 3).
- W11 fresh implement session: dropped as a quality fix (split question 3).
- E1 who may edit tests and E2 testing the next leaf while one merges: earlier decisions, closed unless the operator names one (signpost 7a).

## Pending steps

none

## Mode record

Handed off 2026-11-10
