# Draft review repairs

## Question
Q1. A guard leaf's lesson-line removal is undone by the union merge attribute when main gained a neighbouring lesson line. What keeps the removal?
Q2. seed-issue searches for related reports but always creates one. Should it post nothing and return the existing report when the search finds one covering the same failure?

### Carries
- lesson-lifecycle Taken 4a: the guard leaf removes its line in the same diff.
- promotion-trigger binding: duplicate search before filing (seed-issue's existing search).
- Operator bar (stock-flow): no new component, pass, command, state or format.

## Findings
- C measured 2026-10-10 (slots/leaf-review-C.md F1), A reproduced 2026-10-10: base L1 L2 L3, leaf removes L2, main adds L2b after L2; `git rebase main` drops the leaf commit as "patch contents already upstream" and LESSONS.md keeps L2. Non-adjacent additions keep the removal. Framework prepends new lessons at the top, so adjacency is common. The attribute is written by `akrogon init` (src/init.ts:68-74); dropping it brings back conflicts on concurrent lesson writes. (A,C)
- C's least-cost shape: the merge seat, which already rebases and runs checks in the worktree (skills/merge-issue/SKILL.md:41), re-checks each history file with an Applied entry in the leaf diff and removes its line again before push. (C)
- B F1: seed-issue's lookups (skills/seed-issue/SKILL.md:56) never stop creation (:68), so the lesson rule cannot get a matched existing link by following seed-issue. (B)
- Other draft repairs with no operator choice are recorded in slots/leaf-review-B.md and -C.md and applied to the drafts.

## Taken
Operator 2026-10-10: "1a | 2a |"

- 1a: before push, the merge path checks each lesson whose history file gained an Applied entry in the pushed range and removes its LESSONS.md line again if the union merge brought it back. Applies in both merge modes (solo rebase by B, and stack top built by the command, where B commits nothing, so the planner places the step where the stack is built or checked). Foreclosed: dropping merge=union.
- 2a: when seed-issue's lookup finds a report covering the same failure, it posts nothing and prints that report's URL as the outcome, for every run including manual ones. Foreclosed: a lesson-only mode.
- Final-shape corrections 2026-10-10 (slots/leaf-final-check-B.md, -C.md), restatements of taken decisions: owner test checks the current repo first so shared names (package.json, learnings/LESSONS.md) route as today (B,C); criteria name observable link results, test files moved to designs (B,C); the writer uses only learn-issues' fixed-pattern clause, leaving coverage to charting per promotion-trigger 1a (B).
