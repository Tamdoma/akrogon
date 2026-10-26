# Opening map brief, slot C, chart git-calls

You are consultant slot C for the chart door (slot A) in the akrogon repo at /home/ivan/Work/infra/akrogon. Work independently. Do not read other slots' files under this chart's slots/ folder except the ones named below. Make no code edits, commits or phase moves. Scratch measurements are allowed in your own detached worktree under /home/ivan/.akrogon/worktrees/akrogon/ and must be removed when done.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. Code under src/ and tests/ is the subject of this work, so read it as needed.

## Intake

- /home/ivan/Work/infra/akrogon/issues/chart/git-calls/INTAKE.md (scope, operator words, agent findings).
- /home/ivan/Work/infra/akrogon/issues/chart/git-calls/CHART.md (destination).
- Census measured by A today: /home/ivan/Work/infra/akrogon/issues/chart/git-calls/slots/census-A.md. Treat it as data; re-measure anything you doubt.

## Why now

The operator chose this chart to fix the last load failure from chart suite-time: tests/next.test.ts "a leaf re-entering merge queues behind the two leaves stamped earlier" still fails at its 15 s cap in about 1 of 4 runs when two full suites run at once on a busy host. Operator words today: "o2, consult with both conultants on this, and fix it on autopilot. Do proper testing." O2 was: "Run the git-calls chart. It cuts the repeated git calls inside akrogon. That speeds up every test and the real tool, not just this one."

## Locks

- The overall workflow stays as it is today; backend stack may be replaced when that improves things without changing the workflow or making things worse (operator 2026-10-25, INTAKE.md).
- No per-test timeout raises, no --retry, no test.serial, no removing tests (chart suite-time forks).
- The re-entering test keeps its causal sequence unless equivalent coverage is shown (B's F29, issues/chart/suite-time/slots/load-tests-rebuttal-B.md).
- Already landed: fake herdr prebuilt as a bytecode bundle per test worker (083d3048), suite-root leak fixed (02dc5f91).

## Live surfaces

src/shell.ts (herdr and git spawn helpers), src/config.ts (commonDirectory), src/next.ts, src/phase.ts, tests/helpers.ts, tests/fake-herdr.ts, tests/fake-busctl.ts, tests/isolation.ts, tests/next.test.ts.

## Task

Map the territory for this destination: the material forks that change the outcome, the questions a practitioner would ask, and the pitfalls over the work's lifetime, including what each option could break or invite later. For each fork give your pick with reason and cost, rejected options with reasons, evidence with tier (operator, practitioner, better-than-training, model-knowledge), source and date, pitfalls with what removes each, and questions the chart does not yet ask. Propose a split into independently checkable leaves, and the done-criteria and proof you would require ("proper testing"). Keep it compact.

Return: write your map to /home/ivan/Work/infra/akrogon/issues/chart/git-calls/slots/map-C.md and end your turn.
