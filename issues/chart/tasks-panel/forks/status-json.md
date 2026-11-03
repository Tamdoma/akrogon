# Where the Tasks board gets its data

## Question

Q2: a stable `akrogon status --json` (2a), or the mod reads akrogon's files itself (2b)?

### Carries

none

## Findings

`issues/chart/herdr-panels/slots/map-merged.md`, `map-rebuttal-{B,C,D}.md`. The text command stays: agents read it (23 files, e.g. `skills/watch-issues/SKILL.md:22`).

## Taken

Operator, verbatim: "go, but consult with consultants first. | 2 - 2a"

Settled: akrogon gains `akrogon status --json`; the Tasks board reads only that and shows everything `akrogon status` shows, so the operator never needs to run the command. The text command stays. Foreclosed: the mod parsing akrogon's files (2b).
