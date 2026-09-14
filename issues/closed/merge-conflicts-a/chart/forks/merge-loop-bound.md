# Fork: merge loop bound

## Question
Once `fix_rounds` ignores merge → check.fix, what bounds a leaf that keeps returning to merge red?

## Carries
phase.ts:36 and :138, tests/phase.test.ts:91-93, phases.html:63, setup.html:67, state.html:85.

## Findings
- better-than-training, GitHub and GitLab queue docs: neither caps re-queues after a failed merge group; the author decides. Changes: no external precedent for a merge-side cap.
- repo: merge → check.fix repeated at most three times on one leaf (tree-preflight, all conflicts); red-check repeats never exceeded two in the framework. Changes: with conflicts handled by A the observed maximum is two.
- repo, tests/phase.test.ts:91-93: the test named `conflict` asserts the counter rises on merge → check.fix and must flip.

## Taken
- repo, measured 2026-09-14 over all three logs since 2026-09-11: 137 merged leaves, 25 merge → check.fix trips. 23 were rebase conflicts, 1 was red checks after a clean rebase (akrogon discord-chunk-report, merged on the next attempt), 1 has no review record (framework manifest-lint). Repeats on one leaf: conflicts only (3, 2, 2). A red-check trip has never repeated.

## Taken
Operator answer (2026-09-14): `14a`. `fix_rounds` rises only on check.review → check.fix; no merge-side counter or cap. Measured basis: one red-check trip in 137 merges, never repeated. Foreclosed: a `merge_rounds` field.
