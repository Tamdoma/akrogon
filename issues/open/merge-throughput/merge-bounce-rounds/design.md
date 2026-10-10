# Design: merge-bounce-rounds

## Binding decisions, verbatim

### bounce-counting (issues/chart/merge-throughput/forks/bounce-counting.md)

Operator 2026-10-10, verbatim: "1a |"

- Q1 1a: every `merge -> check.fix` counts toward `fix_rounds` (src/phase.ts:151) and the cap applies to that origin (src/phase.ts:302); B-only re-review follows from src/routing.ts:54. Lands after red-main-hold. Existing counts unchanged. Reason: mechanical, no judgment to drift. Foreclosed: 1b B-judged attribution, 1c separate counter.

### red-main-hold (issues/chart/merge-throughput/forks/red-main-hold.md)

Operator 2026-10-09, verbatim: "1a | 2a | 3a"

- Sequencing lock: bounce-counting lands after this hold. Operator restart of long-running akrogon processes at handoff.

Excluded here: Only the sequencing lock binds here.

### Not binding here
- first-package: not binding here, owned by another leaf of merge-throughput.
- queue-order: not binding here, owned by another leaf of merge-throughput.
- attempt-records: not binding here, owned by another leaf of merge-throughput.
- batch-size: not binding here, owned by another leaf of merge-throughput.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Code-only leaf in the akrogon CLI. No auth, secrets, browser or outside calls (except where named). Each done-criterion is proven by the cheapest real-boundary test: a `bun test` case driving the command or function against a temp git repo and the fake herdr (tests/fake-herdr.ts, tests/helpers.ts), as the existing batch-merge and phase tests do. New behavior shows one deliberate break turning its test red. No live model run. Long-running `akrogon next` processes keep old code until the operator restarts them at handoff (red-main-hold sequencing lock).

## Leaf architecture

Owned: src/phase.ts:151 condition and :302 cap origin, docs. Excluded: separate counter, B-judged attribution (foreclosed), refunds for a wrong culprit (batch-size Q3 3a).
