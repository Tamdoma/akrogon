# Design: timing-events

## Binding decisions, verbatim

### Measure and revisit (/home/ivan/Work/infra/akrogon/issues/chart/leaf-speed/forks/measure-and-revisit.md)

Operator 2026-10-12, Q1: `1a` (via reply 2 above, "I would still like to create stopwatches"). Operator 2026-10-12, reshaped Q2: `1a |`.

Q1: separate append-only timing record and read-only `akrogon timing` command. Records prompt delivered/failed per slot and phase visit, first-seat completion, check start and finish (name, exit, duration, log path, install/lock time, merge attempt id), merge batch members, waiting-reason changes (pause, prerequisite, operator hold). Expected-event inventory flags missing records. Reader splits each phase into waiting by kind, prompted time and check time. Reason: the only option that measures the estimated 55 to 60 min fixed cost. Foreclosed: copying `prompted_at` into `log.jsonl`, mixed events in `log.jsonl`, transcript reconstruction.

Q2: the timing record is also the merit test for leaves-as-chunks. Cohort: first 20 framework leaves whose first plan prompt follows the marker (timing record landed, loop fixes active), first-implement-exit diff at most 600 lines, failed and stuck leaves included, a leaf not merged 24 h after its first plan prompt counts over 45 min. Fixed cost F = first plan prompt to merged minus implement prompted time. Pass: median F <= 35 min, at least 15 of 20 at F <= 45 min, at most 2 merge ejections, at least 18 of 20 merged. Fail keeps leaves-as-chunks closed without a further report. Pass: A presents the numbers and the operator decides a small trial. Reason: the bar is fixed before results. Foreclosed: B's p90 gate (rests on two leaves), no gate, permanent close now.

### Exclusions
- [chained-units](/home/ivan/Work/infra/akrogon/issues/chart/leaf-speed/forks/chained-units.md): not this leaf.
- Gate evaluation and the reader belong to timing-readout.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md
Interpretation: proof is the existing `bun test` suite with temporary registered repos as current tests already build (`tests/`); no new runner. Criterion 5 is the consequential negative case. No live model run.

## Leaf architecture
Owned: a small `src/timing.ts` (zod schema, append, read, visit derivation), call sites in `src/next.ts` (first observation, dispatch, wait reasons, batch record), `src/phase.ts` (`commitMove`, `transition` recorded return), `src/run-check.ts` (events, worker and base scope in `leafTarget`), `src/pause.ts`, `src/park.ts`. `src/turn.ts` stays pure, since status also calls `mergeQueue` (C). `log.jsonl` schema and `src/log.ts` unchanged. `readTimings(root)` and `visitOf(log, slug, phase)` are exported for timing-readout (A,B,C). Excluded: any reader output, `akrogon status` changes, transcript parsing.
