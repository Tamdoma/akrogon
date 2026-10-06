# Review A: nits-before-merge

Base: 923c6c98fac3f051a54ac27168ea024215652602
Reviewed head: acba808
Diff: 3 files, +3/−5, prose only.

## Criterion check

1. `check.review` gained "Before a verdict that is not `fix`, B records each reusable Nit it still holds…" naming registered-checkout `learnings/LESSONS.md` line + `learnings/history/` file + operator commit. `check.repair` gained "Before its move to `merge`, B records each reusable Nit it still holds, skipping Nits already written for this leaf in `review-B.md`…" with the same target/shape. Met.
2. `skills/merge-issue/SKILL.md` `## merge` Nit paragraph deleted; section opens with "Before pushing". Met.
3. `docs/guide/learn.md` line 9 now names the check skill recording before the move to merge; grep across `docs/` for nit|lesson near merge shows no other page assigning the step to merge. Met.

## Evidence

- `git diff 923c6c9...acba808` read in full; all three edits verified in place.
- `grep -n -i 'nit' skills/merge-issue/SKILL.md` → only the pre-existing "advisory failures as Nits" at line 35.
- `grep -rniE 'nit|lesson' docs/ | grep -i merge` → no stale placement; remaining hits are the `--verdict nits` example and merge-phase descriptions.
- Report's check runs trusted: prose-only diff, `test_changed` reported "no test files are affected", format/typecheck clean. No rerun trigger.

## Findings

### N1 — check.repair recording fires on the `check.fix` branch too

The new sentence sits before the branch "Finish with `akrogon phase <slug> merge --slot B` … or `check.fix`", so a repair ending in a `Handed to A` also records Nits. The criterion names recording before the move to `merge`. Deferred: the consequence is a lesson written earlier than designed for a leaf heading to check.fix — the same accepted-cost class the brief names ("a lesson can be written for a leaf that later fails"), and the end state on the merge path is identical. Promote to Fix if a B seat double-writes or the check.fix path produces observable duplicate lesson lines.

### N2 — dropped clauses from the removed merge text

The deleted merge step carried "without reading the active list as pass input or adding another turn"; the design's leaf architecture lists both among wording rules to keep. The new sentences omit them. Deferred: no concrete consequence today — check.review already states `learnings/LESSONS.md` is not review input, and recording inside an existing check pass adds no separate turn by construction. Promote to Fix if a B seat is observed reading LESSONS.md to judge findings or spawning a separate recording pass.

### N3 — re-check path records nothing

Post-`check.fix` re-check ends ready/nits → `merge` with no recording trigger; Nits first raised there are unrecorded. Deferred: recorded as an open limitation in plan.md and report.md; the brief scopes triggers to check.review and check.repair only. Promote to Fix if a real leaf loses Nits through that path.

## Verdict

nits
