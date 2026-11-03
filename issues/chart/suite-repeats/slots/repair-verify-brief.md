# Fork notes brief: repair-verify (seat B, C or D, named in your prompt)

You are a consultant seat in the chart-issues door for akrogon at `/home/ivan/Work/infra/akrogon`, chart `issues/chart/suite-repeats/`. Work blind: do not read `slots/repair-verify-A.md`, any other seat's `repair-verify-*.md`, or `forks/repair-verify.md` `## Findings`. Read only; change nothing in any repo; run no `akrogon next`, `phase`, `verify` or anything that writes. You may run read-only commands, `git log/show`, and scratch scripts outside the repo. Write your return file once when finished.

Return file (absolute):

- B: `/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/slots/repair-verify-B.md`
- C: `/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/slots/repair-verify-C.md`
- D: `/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/slots/repair-verify-D.md`

## Reading rule

Read process text (skills, docs, chart files) by named section for the step you are answering: locate the section first, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source is allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text. Code may be cited by path:line.

## Intake and scope

`/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/INTAKE.md` (whole file: operator words, history, measurements). Autopilot is on: A picks, but your independent view is what this exchange is for.

## Question and carries

`/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/forks/repair-verify.md` `## Question` and `### Carries`.

## Surfaces

- `skills/check-issue/SKILL.md` `## check.repair`; `skills/implement-issue/SKILL.md` check.fix section and `## Shared context` proof order; `skills/merge-issue/SKILL.md` `## merge`.
- `src/phase.ts` gates (`requireGreenReceipt` callers), `src/routing.ts`.
- History: `git show 278d5499`, `git show fb236ec0`; `issues/chart/green-rate/`, `issues/chart/system-speed/` fork files.
- Data: `issues/timings.jsonl` (check_start/check_end with `phase`, `slot`), `issues/log.jsonl` (phase moves), `issues/verify-runs.jsonl`. Count B verify runs in check.repair followed by a move to check.fix, and how often A then changed the tree. Split before and after 2026-10-26.

## Return

Blind notes per question (Q1, Q2, Q3), each with five parts: your pick with its reason and cost; each rejected option with its reason; evidence with tier, source and date; pitfalls with what removes each (over the work's lifetime, not only now); any question you would ask that the fork does not. Prefer removing code to adding it. Compact markdown, cite path:line.
