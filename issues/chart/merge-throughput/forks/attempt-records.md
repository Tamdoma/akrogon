# Attempt records

## Question
Q1. Which fields does each merge attempt write to log.jsonl, and does it include gate wall time?

### Carries
- lessons-merge-conflicts: log.jsonl union by line order (issues/chart/lessons-merge-conflicts/CHART.md).

## Findings
- Attempt id, members, outcome green/red/split/reuse, gate time (A,B,C). Split path writes no log record today; the record must be appended at src/phase.ts:788-798 (C rebuttal). Does not by itself prove host load (B rebuttal F5).

## Taken
Operator 2026-10-10, verbatim: "1a - will this be per repo where Akrogon is active? | 2a |"

- Q1 1a: new `issues/merge-attempts.jsonl` in each registered repo, written by the command beside `issues/log.jsonl` and handled the same way (normal merging, per lessons-merge-conflicts union-rollout Q3 3a; the round's "merges line by line" wording was wrong and is corrected here). log.jsonl and its readers unchanged. Foreclosed: 1b fields on log lines.
- Q2 2a: one line per merge attempt end, command-written: attempt id, repo, holder, members, built_on, tested top, outcome (merged | red | split | held | reuse), start (batch created) and end time. Foreclosed: 2b seat-reported per-command durations.
