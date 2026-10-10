# Design: batch-limit-repo

## Binding decisions, verbatim

### batch-size (issues/chart/merge-throughput/forks/batch-size.md)

Operator 2026-10-10, verbatim: "1a | 2a | 3a |"

- Q2 2a: repo `batch_limit` in `issues/config.yaml`, integer >= 1, counts the whole stack including holder, default 4. Followers = min(batch_limit - 1, holder state batch_limit) when the holder has a split limit, else batch_limit - 1. The per-leaf state key stays for the fallback split only and resets when the holder leaves merge. Replaces first-package Q2 2a sizing; its solo-clear-after-clean-run rule stays. Foreclosed: 2b default 8 (longer red runs, more conflicts; raise later from attempt records).
- Correction, operator 2026-10-10 at handoff review, verbatim: "1a | debate - no |". Q1 1a: a member that conflicts while its stack builds is excluded from that attempt only (the attempt record keeps the slug) and may be carried by the next attempt; the per-leaf `solo` mark goes away; the holder-conflict solo attempt is unchanged. Replaces first-package Q2's solo-clear rule, which had no code event (B,C). Reason: a conflict with one stack should not exclude a leaf for its whole stay in merge. Foreclosed: 1b drop the rule. The door split (batch-limit-repo without prerequisite, red-batch-culprit for `--culprit`) was approved in the same review.

Excluded here: Q1 culprit, Q3 counting and the leaf-split bullet belong to red-batch-culprit; this leaf ships the Q2 cap. Door split 2026-10-10 (pending handoff review): the cap and solo clear need no prerequisite, so they are their own leaf.

### first-package (issues/chart/merge-throughput/forks/first-package.md)

Operator 2026-10-09, verbatim: "1a | 2a - Is this gonna increase the speed of merging? | 3a"

- Q2 2a: one batch limit per repo, kept across holders, starts at 2, halves on red, floor 1, no growth step; a conflict `solo` mark clears after that leaf's clean run. Reason: ends whole-queue first batches with no data needed. Foreclosed: 2b growth step (needs attempt data), 2c no change. Sizing revised 2026-10-10 by [batch-size](batch-size.md) Q2 2a; the solo-clear rule is replaced by batch-size correction 2026-10-10 (per-attempt exclusion).

Excluded here: Sizing is replaced by batch-size Q2 2a and the solo-clear rule by the batch-size correction of 2026-10-10 (per-attempt exclusion); kept for history, not binding.

### Not binding here
- red-main-hold: not binding here, owned by another leaf of merge-throughput.
- bounce-counting: not binding here, owned by another leaf of merge-throughput.
- queue-order: not binding here, owned by another leaf of merge-throughput.
- attempt-records: not binding here, owned by another leaf of merge-throughput.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Code-only leaf in the akrogon CLI. No auth, secrets, browser or outside calls (except where named). Each done-criterion is proven by the cheapest real-boundary test: a `bun test` case driving the command or function against a temp git repo and the fake herdr (tests/fake-herdr.ts, tests/helpers.ts), as the existing batch-merge and phase tests do. New behavior shows one deliberate break turning its test red. No live model run. Long-running `akrogon next` processes keep old code until the operator restarts them at handoff (red-main-hold sequencing lock).

## Leaf architecture

Owned: src/config.ts (repo schema + effective config print), src/next.ts:1008-1042 follower slice, the member-conflict exclusion at src/next.ts:1165-1187 and its removal of the per-leaf `solo` write (unknown state keys are dropped by readState, src/state.ts:104) (A,B,C), docs/guide/setup.md, docs/guide/merge.md. Interface: `batch_limit` repo key, default 4. The per-leaf state key `batch_limit` keeps its meaning (follower count after today's split) and still resets when the holder leaves merge (src/phase.ts:154). Excluded: the split itself (src/phase.ts:788-798) is unchanged; `--culprit` belongs to red-batch-culprit.
