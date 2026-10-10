# Design: bounce-repair-proof

## Binding decisions, verbatim

### first-package (issues/chart/merge-throughput/forks/first-package.md)

Operator 2026-10-09, verbatim: "1a | 2a - Is this gonna increase the speed of merging? | 3a"

- Q1 1a: only a repair after a merge bounce reruns the exact rejected command, in its own seat, before re-review, keeping command, arguments, base and head as evidence. Reopens check-reruns "merge_checks only at merge" for this case only. Reason: smallest change that removes the 42% repeat bounce. Foreclosed: 1b every leaf runs merge_checks before merge (revisit with attempt records), 1c no change.

Excluded here: Q2 sizing and Q3 off-route bullets belong to other leaves or no leaf.

### Not binding here
- red-main-hold: not binding here, owned by another leaf of merge-throughput.
- bounce-counting: not binding here, owned by another leaf of merge-throughput.
- queue-order: not binding here, owned by another leaf of merge-throughput.
- attempt-records: not binding here, owned by another leaf of merge-throughput.
- batch-size: not binding here, owned by another leaf of merge-throughput.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Skill-text leaf. No code path changes, no outside calls. Proof is the existing blocking `checks` (format, test, typecheck) staying green, plus the skill text itself, which B reviews against the binding decision. No vanity tests: add a test only if an existing test already pins skill text (e.g. tests/chart-shapes.test.ts style) and the change breaks it.

## Leaf architecture

Owned: skills/merge-issue/SKILL.md (red ending recording only), skills/implement-issue/SKILL.md (check.fix after merge bounce, the merge_checks exception wording at :63 and :84, :78 input), skills/plan-issue/SKILL.md:63, skills/check-issue/SKILL.md (:85 exception wording, re-review evidence Fix). Excluded: the red-ending order (`--red-on-base`, `--culprit`) belongs to red-main-hold and red-batch-culprit; this leaf edits only the recording sentence of merge-issue:65, and red-batch-culprit owns the final order of that paragraph (A,C). The test-runs base-red rule (implement-issue:38, check-issue:61) is unchanged. The rerun runs in the repair seat, never on the merge turn.
