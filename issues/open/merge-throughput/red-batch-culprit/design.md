# Design: red-batch-culprit

## Binding decisions, verbatim

### batch-size (issues/chart/merge-throughput/forks/batch-size.md)

Operator 2026-10-10, verbatim: "1a | 2a | 3a |"

- Q1 1a: red batch ending order at merge-issue:65 is `--red-on-base <sha>` first, then `--culprit <slug>` when B names the holder or one member from evidence, else today's split unchanged. `akrogon phase <holder> check.fix --slot B --attempt <id> --culprit <slug>` refuses a stale attempt or a slug outside holder plus members, runs the culprit's transition as checkOnly and refuses the whole call before any write on failure, then restores every member (culprit included) and the holder to saved heads (solo-holder exception as restoreHolder), clears the batch record, then moves only the culprit merge -> check.fix. merge_stamp is kept on ejection and refreshed on return to merge (src/phase.ts:152). The finding (exact command, arguments, tested base and top, logs, attributed diff, restored head) is copied into the culprit's own review so its check.fix can rerun the rejected command (first-package 1a). Next mergeTurn rebuilds from the queue with the existing build. Reason: one run per bad leaf instead of one per halving. Foreclosed: 1b unnamed blames holder (no evidence), 1c AIMD plus split (below solo at today's p).
- Q3 3a: a wrong culprit counts like any merge bounce (bounce-counting). No refund. Attempt records gain outcome `ejected` with the culprit slug, so wrong-name rate is measurable. Foreclosed: 3b refund on green rerun.
- Leaf: `batch-limit-repo` becomes `red-batch-culprit`, blocked-by `merge-attempt-records` and `merge-bounce-rounds` (and through it `red-main-hold`).

Excluded here: Q2 cap ships in batch-limit-repo (door split 2026-10-10, pending handoff review).

### bounce-counting (issues/chart/merge-throughput/forks/bounce-counting.md)

Operator 2026-10-10, verbatim: "1a |"

- Q1 1a: every `merge -> check.fix` counts toward `fix_rounds` (src/phase.ts:151) and the cap applies to that origin (src/phase.ts:302); B-only re-review follows from src/routing.ts:54. Lands after red-main-hold. Existing counts unchanged. Reason: mechanical, no judgment to drift. Foreclosed: 1b B-judged attribution, 1c separate counter.

Excluded here: Counting itself is delivered by merge-bounce-rounds; binds here as the reason a wrong culprit costs one round.

### Not binding here
- first-package: not binding here, owned by another leaf of merge-throughput.
- red-main-hold: not binding here, owned by another leaf of merge-throughput.
- queue-order: not binding here, owned by another leaf of merge-throughput.
- attempt-records: not binding here, owned by another leaf of merge-throughput.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Code-only leaf in the akrogon CLI. No auth, secrets, browser or outside calls (except where named). Each done-criterion is proven by the cheapest real-boundary test: a `bun test` case driving the command or function against a temp git repo and the fake herdr (tests/fake-herdr.ts, tests/helpers.ts), as the existing batch-merge and phase tests do. New behavior shows one deliberate break turning its test red. No live model run. Long-running `akrogon next` processes keep old code until the operator restarts them at handoff (red-main-hold sequencing lock).

## Leaf architecture

Owned: src/phase.ts `--culprit` flag and ending (beside the split at :788-798), use of restoreMembers/restoreHolder (src/batch.ts:111-125), the whole-call preflight against saved heads (src/phase.ts:274-283 checks; transition checkOnly alone validates the applied head and skips the cap, so it is not enough) (A,B), the `ejected` attempt append, skills/merge-issue/SKILL.md:65 final paragraph order (base, culprit, split), keeping the sentences red-main-hold and bounce-repair-proof added, and the culprit evidence copy, docs (A,C). Excluded: batch_limit cap (batch-limit-repo), hold mechanics (red-main-hold), bisect (foreclosed).
