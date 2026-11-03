# Fork notes brief: quick-red (seat B, C or D, named in your prompt)

You are a consultant seat in the chart-issues door for akrogon at `/home/ivan/Work/infra/akrogon`, chart `issues/chart/suite-repeats/`. Work blind: do not read `slots/quick-red-A.md`, any other seat's `quick-red-*.md`, or `forks/quick-red.md` `## Findings`. Read only; change nothing in any repo; run no `akrogon next`, `phase`, `verify` or anything that writes. You may run read-only commands, `git log/show`, and scratch scripts outside the repo. Write your return file once when finished.

Return file (absolute):

- B: `/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/slots/quick-red-B.md`
- C: `/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/slots/quick-red-C.md`
- D: `/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/slots/quick-red-D.md`

## Reading rule

Read process text (skills, docs, chart files) by named section for the step you are answering: locate the section first, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source is allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text. Code may be cited by path:line.

## Intake and scope

`/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/INTAKE.md` (whole file: operator words, history, measurements). Autopilot is on: A picks, but your independent view is what this exchange is for.

## Question and carries

`/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/forks/quick-red.md` `## Question` and `### Carries`.

## Surfaces

- `src/verify.ts`: `runOnce` sequential loop and member blocker, `reuseSource`, `greenEntry`, `verifyCommands`; `src/config.ts` `full` and check order; `src/admission.ts` (`full` line); `src/flaky.ts` (reused and blocked entries).
- Seat process text that reads verify output after a red: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` (check.fix and check.repair sections), `skills/merge-issue/SKILL.md`.
- History: `git show fbac86c6`, `git show 6a054950`; `issues/chart/verify-waste/forks/receipts.md`.
- Data: `issues/verify-runs.jsonl` (format, typecheck and test entries; `reused`, `blocked`), `issues/timings.jsonl`. Split before and after 2026-10-26, when suite-time landed.
- Other repos: `/home/ivan/Work/infra/tamdoma/framework/issues/config.yaml`, `/home/ivan/Work/infra/tamdoma/framework/issues/verify-runs.jsonl` if present.

## Return

Blind notes per question (Q1, Q2, Q3), each with five parts: your pick with its reason and cost; each rejected option with its reason; evidence with tier, source and date; pitfalls with what removes each (over the work's lifetime, not only now); any question you would ask that the fork does not. Prefer removing code to adding it. Compact markdown, cite path:line.
