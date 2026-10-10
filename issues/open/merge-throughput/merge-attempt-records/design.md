# Design: merge-attempt-records

## Binding decisions, verbatim

### attempt-records (issues/chart/merge-throughput/forks/attempt-records.md)

Operator 2026-10-10, verbatim: "1a - will this be per repo where Akrogon is active? | 2a |"

- Q1 1a: new `issues/merge-attempts.jsonl` in each registered repo, written by the command beside `issues/log.jsonl` and handled the same way (normal merging, per lessons-merge-conflicts union-rollout Q3 3a; the round's "merges line by line" wording was wrong and is corrected here). log.jsonl and its readers unchanged. Foreclosed: 1b fields on log lines.
- Q2 2a: one line per merge attempt end, command-written: attempt id, repo, holder, members, built_on, tested top, outcome (merged | red | split | held | reuse), start (batch created) and end time. Foreclosed: 2b seat-reported per-command durations.

### Not binding here
- first-package: not binding here, owned by another leaf of merge-throughput.
- red-main-hold: not binding here, owned by another leaf of merge-throughput.
- bounce-counting: not binding here, owned by another leaf of merge-throughput.
- queue-order: not binding here, owned by another leaf of merge-throughput.
- batch-size: not binding here, owned by another leaf of merge-throughput.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Code-only leaf in the akrogon CLI. No auth, secrets, browser or outside calls (except where named). Each done-criterion is proven by the cheapest real-boundary test: a `bun test` case driving the command or function against a temp git repo and the fake herdr (tests/fake-herdr.ts, tests/helpers.ts), as the existing batch-merge and phase tests do. New behavior shows one deliberate break turning its test red. No live model run. Long-running `akrogon next` processes keep old code until the operator restarts them at handoff (red-main-hold sequencing lock).

## Leaf architecture

Owned: src/state.ts batchSchema `started` and its write at batch creation (src/next.ts:1031), a new writer next to src/log.ts (logMove pattern, same lock), calls at each attempt end in src/phase.ts (green push, red transition, split, reuse at the eventual landing push, never at restack) and in the recovery paths of src/next.ts:895-940, docs (A,B,C). Interface for dependents: one exported append function taking the attempt fields and outcome; red-main-hold calls it with `held`, red-batch-culprit with `ejected` and `culprit`. Excluded: per-command durations (foreclosed), any change to log.jsonl. Old batch records without `started` (in-flight at upgrade) write start as absent rather than guessed: the schema allows that one case.
