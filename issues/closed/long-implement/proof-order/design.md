# Design: proof-order

## Binding decisions, verbatim

### proof-tail (issues/chart/long-implement/forks/proof-tail.md)
Operator 2026-10-01, verbatim: "1a | 2a".
- Q1 1a: after the last pick, A runs the leaf's `checks` commands and every proof needing no live or slow result before the first slow run. While a slow run is in flight, A may start a unit or repair, in a worker worktree, that does not consume its result, edits nothing the run reads and does not share its fixture. A lands it only after the run returns, then reruns the changed stages and their consumers (standing-design rerun rule). Applies in implement and check.fix. Foreclosed: 1b, no change.
- Q2 2a: A waits on a slow command's actual exit and status instead of fixed sleep-and-tail polls, and reads the exit status, never a quiet log, as the result. The wording names the behavior and no harness command. Foreclosed: 2b, no change.
- Off route, agreed by A, B and C: a count cap of one repair then `failed` (9 different defects, a failed pass restarts with them, and C R1 shows the leaf's own one-attempt note was ignored), a required stage-reuse map (already exists, C R3), continuing past a failure in a chained live run (stranded the gate 4 times, C R4), and keeping the fixture into check.fix (a contract change, C 3b).

### wave-plan Q1 (issues/chart/long-implement/forks/wave-plan.md)
- Q1 1a: the no-clock lock stays. Fix the cause, and accept that a leaf with a long real dependency chain can still run over 2h. Foreclosed: 1b, a phase ceiling that ends `failed`.

### Excluded binding decisions
- wave-plan Q2 belongs to wave-table. stall-notice 1a writes no text.

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

This leaf changes skill prose only. No auth, backend, secret, browser flow, outside call or chain stage is involved. Rule 2 reuses the standing slow-run rerun rule (rerun every changed stage plus every consumer) rather than restating a new one. Rule 3 names behavior, not a harness command, so no operation proof applies. The cheapest sufficient proof is reading the changed sentences against criteria 1-3; a wording test would be a vanity test. Blocking `checks` prove formatting of the edited markdown, which no smaller test proves.

## Leaf architecture
Owned: `skills/implement-issue/SKILL.md` (the implement-end proof paragraph at line 54, including its opening, and the check.fix after-repair paragraph), `skills/implement-issue/worker-protocol.md` (line 11's before-wave commit clause and closing clause "every worker worktree is gone before criterion proof, checks and `akrogon phase`", and line 25's clause "criterion proof and every `checks` command belong to A after the final worker") (B,C).
Interpretation beside the binding text: "before the first slow run" covers every ready `checks` command whatever its own size, and a slow run is any live run or a proof plan.md sizes hours or unknown (plan-issue/SKILL.md:57) (A,B,C). Checks needing a slow run's output keep the standing blocked-check rule (B). "Lands it only after the run returns" includes pending lane commits and cherry-picks, and an overlap wave starts from committed HEAD (B). Overlap needs a worker worktree, so it applies in delegated mode only and not on the final allowed repair round, where A repairs itself (C). "Waits on actual exit" includes waiting again when one wait returns before exit, because one tool call may not outlast the command (C).
Shared-file note: wave-table edits the wave sentences of the same two files. No ordering between the leaves; whichever merges second rebases onto the other's text. Held disagreement: C (D1) asked for proof-order blocked-by wave-table (shared physical line worker-protocol.md:11). A kept them parallel: file overlap is not a dependency, and "shared test resource" already exists at brief-template.md:21.
Excluded: `src/`, other skills, any clock, timeout, count or retry limit, any named harness wait tool, keeping a live fixture across phases, any file under `issues/`.
Dependencies: none.
