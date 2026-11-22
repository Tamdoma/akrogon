# Fork notes brief: red-exit

You are a consultant to chart door A (hc terminal t2z2). Write blind notes on one fork. Do not read `red-exit-A.md`, `red-exit-B.md`, `red-exit-C.md` or `red-exit-merged.md` in this folder until yours is written.

## Permitted context

- Intake: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/INTAKE.md`
- The fork, its questions and carries: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/forks/red-exit.md` (`## Question` and `### Carries`)
- Locks: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/forks/signposts.md` `## Taken`
- The merged map: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/map-merged.md`
- Related history paths named in the carries, the akrogon source under `/home/ivan/Work/infra/akrogon/src/` and skills under `/home/ivan/Work/infra/akrogon/skills/`, and framework ledgers under `/home/ivan/Work/infra/tamdoma/framework/issues/`.

## Task

For each of Q1-Q5, write the five-part note defined in `/home/ivan/.claude/skills/chart-issues/assets/questions.md` section `## Blind peer exchange` (the paragraph beginning "For the opening map"): your pick with reason and cost, each rejected option with reason, evidence with tier, source and date, pitfalls with what removes each, and any question the fork does not ask. Name for each pick the consumers (file and function) whose behavior changes. Weigh against the locks: speed from first entry, no new red on main, no second full suite, token cost does not grow.

## Return

- slot B: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/red-exit-B.md`
- slot C: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/red-exit-C.md`

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule.

Edit only your return file. Run nothing that changes leaf state, pushes or starts a test suite.

## Report

When the return file is written, run: `hc send t2z2 "done <your slot letter>: <your return path>"`
