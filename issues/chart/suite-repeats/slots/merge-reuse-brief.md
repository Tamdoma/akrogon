# Fork notes brief: merge-reuse (seat B, C or D, named in your prompt)

You are a consultant seat in the chart-issues door for akrogon at `/home/ivan/Work/infra/akrogon`, chart `issues/chart/suite-repeats/`. Work blind: do not read `slots/merge-reuse-A.md`, any other seat's `merge-reuse-*.md`, or `forks/merge-reuse.md` `## Findings`. Read only; change nothing in any repo; run no `akrogon next`, `phase`, `verify` or anything that writes. You may run read-only commands, `git log/show`, and scratch scripts outside the repo. Write your return file once when finished.

Return file (absolute):

- B: `/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/slots/merge-reuse-B.md`
- C: `/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/slots/merge-reuse-C.md`
- D: `/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/slots/merge-reuse-D.md`

## Reading rule

Read process text (skills, docs, chart files) by named section for the step you are answering: locate the section first, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source is allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text. Code may be cited by path:line.

## Intake and scope

`/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/INTAKE.md` (whole file: operator words, history, measurements). Autopilot is on: A picks, but your independent view is what this exchange is for.

## Question and carries

`/home/ivan/Work/infra/akrogon/issues/chart/suite-repeats/forks/merge-reuse.md` `## Question` and `### Carries`.

## Surfaces

- `src/verify.ts`: `verifyCommands`, `sameCommands`, `redRun`, `greenRun`, `greenEntry`, `reuseSource`, `knownRedReceipt`, `requireGreenReceipt`, `slowChecked`/`slowEligible`, the `runOnce` loops, the verify entry that prints `reuse receipt`.
- `src/phase.ts`: callers of `requireGreenReceipt` (check.review, check.repair to merge, merge `recordTested` and push).
- Tests touching scope: `git show 5d0b505f`, `git show 9aaed138`, `git show c00246dd`; grep tests for `scope` in verify/merge tests.
- Other consumers of `scope === 'merge'` runs (merge-slow-alarm, flaky record, timing, framework repo config `/home/ivan/Work/infra/tamdoma/framework/issues/config.yaml` `merge_checks`/`merge_covers`).
- Data: `issues/verify-runs.jsonl`, `issues/timings.jsonl`.

## Return

Blind notes per question (Q1, Q2, Q3), each with five parts: your pick with its reason and cost; each rejected option with its reason; evidence with tier, source and date; pitfalls with what removes each (over the work's lifetime, not only now); any question you would ask that the fork does not. Prefer removing code to adding it. Compact markdown, cite path:line.
