# How does dispatch report records it had to skip?

## Question
When one leaf or repo cannot be read or cleaned, how does `akrogon next` continue and what does the operator see?

### Carries
Standing design: never silently ignore errors. Operator Q6/Q12 direction: no new machinery.

## Findings
(both) `nextCommand` has no boundary; a bad state.yaml, missing blocked-by target, deleted registered path or dirty merged worktree stops the run. (B) `activeCount` and `currentRepo` scan every registration, so unreadable occupancy must not count as zero when admitting work. (B) notification can itself fail and some failures have no slug. (A) hooks hide stderr.

## Resolution
Operator 2026-09-11: `3 whatever you want to do`. A chose the simplest: per-repo and per-leaf boundaries around the work, one structured stderr JSON line per skipped scope with repo, path or slug and the error, nonzero aggregate exit, no desktop notification. Merged-worktree cleanup failures are skipped the same way. A repo with any unreadable leaf counts all its leaves as active for capacity. Foreclosed: a per-run herdr notification summary.
