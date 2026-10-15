# Chart: merge-green-rate (akrogon)

Route: direct
Operator: "o1, do it now. Let slot b be your reviewer as if you were doing an actual lifecycle run." Also: "Look also at all duplicated test lists across the board. So we're not just fixing the symptoms but the root cause in the entire system."
B pane: w8:pPT (codex gpt-6.1-sol).

## Scope
Raise the merge green rate by removing the cause of repeat reds, not each red.
- L1: the rule that made leaves append their proofs to `checks` (standing-design.md, shapes.md).
- L2a: check.repair -> merge requires a green leaf receipt (src/phase.ts).
- L2b: a repair reruns the reproducing command, not the whole rejected command.
- L3: `akrogon flaky`, a read-only list of commands red then green on the same tree.
Framework half: /home/ivan/Work/infra/tamdoma/framework/issues/chart/merge-green-rate/.

## Evidence
slots/reds.md, slots/answer-{B,D,E}.md, slots/consult-brief.md, slots/plan-review-B-1.md.

## Open forks
none

## Fog
none

## Off route
- Stored red-cause field: B's judgment stays in review files.
- attempts.ts outcome values: history records and timing-report parse them.

## Pending steps
none

## Direct attempt
- branch: merge-green-rate
- worktree: /home/ivan/.akrogon/worktrees/akrogon/merge-green-rate
- base: ff8f6e11b766a1422d2f9048f0f7a161728fef19 (rebase: no change)
- head: dba0c5c4890fc480a194e5cd43a1554b1e2abe10
- rounds used / fix_rounds: 1 / 8
- push attempts: 1 / 2
- done: L1, L2a, L2b, L3, copied-list rule; B ready (slots/review-B-2.md); verify green; guards passed; broadcast delivered
- not done: none
- trigger: none
- review files: slots/plan-review-B-1.md (plan), slots/review-B-1.md (fix), slots/review-B-2.md
- landed SHA: dba0c5c4890fc480a194e5cd43a1554b1e2abe10
Closed 2026-10-15
