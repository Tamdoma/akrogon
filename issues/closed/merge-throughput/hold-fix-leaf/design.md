# Design: hold-fix-leaf

## Binding decisions, verbatim

### red-main-hold (issues/chart/merge-throughput/forks/red-main-hold.md)

Operator 2026-10-09, verbatim: "1a | 2a | 3a"

- Q2 2a: operator pushes a fix to main, or names one fix leaf in the hold that may take the merge turn during the hold (selection and phase authorization override, solo attempt, full gate, merge_stamp untouched, valid only while the hold exists). Foreclosed: 2b push only; holder-B fix-forward (unreachable without a solo continuation).

Excluded here: Q1, Q3 and the settled hold mechanics are delivered by red-main-hold; this leaf builds on its hold record.

### Not binding here
- first-package: not binding here, owned by another leaf of merge-throughput.
- bounce-counting: not binding here, owned by another leaf of merge-throughput.
- queue-order: not binding here, owned by another leaf of merge-throughput.
- attempt-records: not binding here, owned by another leaf of merge-throughput.
- batch-size: not binding here, owned by another leaf of merge-throughput.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Code-only leaf in the akrogon CLI. No auth, secrets, browser or outside calls (except where named). Each done-criterion is proven by the cheapest real-boundary test: a `bun test` case driving the command or function against a temp git repo and the fake herdr (tests/fake-herdr.ts, tests/helpers.ts), as the existing batch-merge and phase tests do. New behavior shows one deliberate break turning its test red. No live model run. Long-running `akrogon next` processes keep old code until the operator restarts them at handoff (red-main-hold sequencing lock).

## Leaf architecture

Owned: `akrogon hold-fix` command, the `fix` field on the hold record (type owned by red-main-hold, this leaf sets it), selection override in mergeTurn, authorization override in src/phase.ts holder check, status line, docs. Excluded: auto-created fix leaves (no owner), auto-revert.
