# Proof tail

## Question
Q1. How should A's slow proof loop (live runs, about 6 of 47 long phases) shorten: start every independent unit or repair while a slow proof command runs (C), bound proof repair to one repair and one rerun before `failed` (B), or no change?

### Carries
See wave-plan.md carries. leaf-run-stalls red-criterion 2a: an unmeetable criterion ends the pass `failed`.

## Findings
../slots/map-merged.md M6, K3 and corrections M6, K3.

## Findings
Blind round A, B and C: ../slots/proof-tail-A.md, -B.md, -C.md, merged in ../slots/proof-tail-merged.md, rebuttals in ../slots/proof-tail-rebuttal-B.md and -C.md.

## Taken
Operator 2026-10-01, verbatim: "1a | 2a".
- Q1 1a: after the last pick, A runs the leaf's `checks` commands and every proof needing no live or slow result before the first slow run. While a slow run is in flight, A may start a unit or repair, in a worker worktree, that does not consume its result, edits nothing the run reads and does not share its fixture. A lands it only after the run returns, then reruns the changed stages and their consumers (standing-design rerun rule). Applies in implement and check.fix. Foreclosed: 1b, no change.
- Q2 2a: A waits on a slow command's actual exit and status instead of fixed sleep-and-tail polls, and reads the exit status, never a quiet log, as the result. The wording names the behavior and no harness command. Foreclosed: 2b, no change.
- Off route, agreed by A, B and C: a count cap of one repair then `failed` (9 different defects, a failed pass restarts with them, and C R1 shows the leaf's own one-attempt note was ignored), a required stage-reuse map (already exists, C R3), continuing past a failure in a chained live run (stranded the gate 4 times, C R4), and keeping the fixture into check.fix (a contract change, C 3b).
