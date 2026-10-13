# Design: timing-readout

## Binding decisions, verbatim

### Measure and revisit (/home/ivan/Work/infra/akrogon/issues/chart/leaf-speed/forks/measure-and-revisit.md)

Operator 2026-10-12, Q1: `1a` (via reply 2 above, "I would still like to create stopwatches"). Operator 2026-10-12, reshaped Q2: `1a |`.

Q1: separate append-only timing record and read-only `akrogon timing` command. Records prompt delivered/failed per slot and phase visit, first-seat completion, check start and finish (name, exit, duration, log path, install/lock time, merge attempt id), merge batch members, waiting-reason changes (pause, prerequisite, operator hold). Expected-event inventory flags missing records. Reader splits each phase into waiting by kind, prompted time and check time. Reason: the only option that measures the estimated 55 to 60 min fixed cost. Foreclosed: copying `prompted_at` into `log.jsonl`, mixed events in `log.jsonl`, transcript reconstruction.

Q2: the timing record is also the merit test for leaves-as-chunks. Cohort: first 20 framework leaves whose first plan prompt follows the marker (timing record landed, loop fixes active), first-implement-exit diff at most 600 lines, failed and stuck leaves included, a leaf not merged 24 h after its first plan prompt counts over 45 min. Fixed cost F = first plan prompt to merged minus implement prompted time. Pass: median F <= 35 min, at least 15 of 20 at F <= 45 min, at most 2 merge ejections, at least 18 of 20 merged. Fail keeps leaves-as-chunks closed without a further report. Pass: A presents the numbers and the operator decides a small trial. Reason: the bar is fixed before results. Foreclosed: B's p90 gate (rests on two leaves), no gate, permanent close now.

### Fix order: loop first or leaves-as-chunks (/home/ivan/Work/infra/akrogon/issues/chart/leaf-speed/forks/fix-order.md)

Operator 2026-10-12: `1a`

Fix the loop first: remove duplicate checks, keep #87, cut merge-time failures that are not the leaf's fault, log when passes start. One agent builds the whole leaf only where its chunks must run one after another. Measure 20 leaves, then decide leaves-as-chunks with real numbers.

Reason: logs put the lost hours after implement, and leaves-as-chunks would multiply per-leaf overhead while it is high.

Foreclosed: 1b leaves-as-chunks now. 1c removing chunks only.

### Exclusions
- [chained-units](/home/ivan/Work/infra/akrogon/issues/chart/leaf-speed/forks/chained-units.md): not this leaf.
- Writing events belongs to timing-events.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md
Interpretation: proof is `bun test` over fixture `timings.jsonl`, `log.jsonl` and `merge-attempts.jsonl` files in a temporary repo, calling the real command. Gate thresholds are constants in one place with the fork path in a comment. No live run.

## Leaf architecture
Owned: `src/timing-report.ts`, the `timing` subcommand in `akrogon.ts`, `docs/guide` entry for the command. Consumes `readTimings` and `visitOf` from `src/timing.ts` (timing-events). Excluded: `akrogon status` changes, writing events, automatic action on a gate result.
