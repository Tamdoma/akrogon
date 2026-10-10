# Design: dependents-first

## Binding decisions, verbatim

### queue-order (issues/chart/merge-throughput/forks/queue-order.md)

Operator 2026-10-10, verbatim: "1a |"

- Q1 1a: dispatch and next-holder selection both order by the count of unmerged leaves waiting on the candidate through `blocked-by`, directly or transitively, descending; ties by existing order (merge_stamp then slug for the queue). The active holder (a leaf with a batch record) is never displaced; priority picks only the next holder. Reason: replaces the operator's 20 s merge_stamp script (#65). Foreclosed: 1b dispatch only, 1c no change, aging rule (revisit with attempt records).

### Not binding here
- first-package: not binding here, owned by another leaf of merge-throughput.
- red-main-hold: not binding here, owned by another leaf of merge-throughput.
- bounce-counting: not binding here, owned by another leaf of merge-throughput.
- attempt-records: not binding here, owned by another leaf of merge-throughput.
- batch-size: not binding here, owned by another leaf of merge-throughput.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Code-only leaf in the akrogon CLI. No auth, secrets, browser or outside calls (except where named). Each done-criterion is proven by the cheapest real-boundary test: a `bun test` case driving the command or function against a temp git repo and the fake herdr (tests/fake-herdr.ts, tests/helpers.ts), as the existing batch-merge and phase tests do. New behavior shows one deliberate break turning its test red. No live model run. Long-running `akrogon next` processes keep old code until the operator restarts them at handoff (red-main-hold sequencing lock).

## Leaf architecture

Owned: src/turn.ts mergeQueue sort, src/next.ts dispatch ordering, one shared function counting transitive unmerged dependents (used by both, no duplicate), docs. Interface unchanged: QueueEntry place values follow the new order. Excluded: aging rule (foreclosed), any change to merge_stamp writes.
