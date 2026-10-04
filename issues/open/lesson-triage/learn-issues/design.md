# Design: learn-issues

## Binding decisions, verbatim

### adopt (issues/chart/retro-concepts/forks/adopt.md)
Operator, 2026-10-05: `1a | 2a`, corrected by "The only problem is, it becomes a distraction from the main chart that I want to pursue.", then "1a - but the name should be better and contain "issues" or "issue", to make it consistent with the rest of the stack", then "continue, reping C. I like the skill name."

1. Lesson triage moves to its own small operator-invoked skill, run only when the operator starts it, with no chart, map, pull or handoff. chart-issues stops offering a lesson prune at open and keeps reading LESSONS.md as a resource. The skill sorts each active lesson into already guarded (remove the line), checkable (offer a seed) or stays (default). A line counts as already guarded only when the guard covers the lesson's mechanism everywhere it can recur, verified on the relevant code path, with the guard's file:line cited. A fix in one place with the pattern still reachable elsewhere is checkable. Reason: the open-time offer distracts from the chart being opened, and a separate skill keeps chart-issues single-purpose. Foreclosed: a door pass with a note, removal only, keeping today's offer, triage at open, scheduled run, lifecycle seat.
2. A checkable lesson becomes an offered `/seed-issue` line the operator accepts or declines. Reason: keeps charts on their destination and lets a later chart weigh the check's per-pass cost. Foreclosed: a fork in the current chart.
3. Name: `learn-issues`.
4. X1 The skill edits `learnings/LESSONS.md` at the registered repo root from `akrogon config`, never a worktree copy.
5. X2 An already-guarded removal is an applied lesson: remove the active line and date its history file with the guard's file:line, without rewriting the historical case (skills/implement-issue/SKILL.md:31).
6. X3 The skill does not depend on LESSONS.md header text. Other registered repos' headers are out of scope.
7. X4 An offered seed line names the lesson and the reachable case, never the check to build (skills/seed-issue/SKILL.md:26).
8. Operator, 2026-10-05: "one more thing, make sure to see if Matt Pockock's retro ideas are good material for the skill on what needs to be done. So you can put them in without mentioning him. But only if some of those ideas are good enough to be a part of the skill, in the context of what we're actually doing inside of akrogon." Taken in (A,B,C): the fixed-pattern test for checkable, a guard counts only when it is reached from blocking `checks` or the command path, and each lesson's history and current mechanism are read before sorting. Left out (A,B,C): session-log reading, navigation, tool economy, information access, steering size, reviewer-owned standards, building checks directly, and treating a missing hook or CI job as a finding. No-op removal of lines whose referent is gone (A,C) would be a fourth outcome and is not added; the operator can delete such a line by hand. The skill text carries no attribution.
9. (C) Already-guarded removals happen after the sorted list is shown, without a further question; the uncommitted diff is the operator's review.

Off route for this leaf: a retro skill or phase, a lesson class field, CODING_STANDARDS.md, session-log reading, scheduled triage, triage in a lifecycle seat.

## Standing design
/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

Interpretation: the leaf changes skill prose and docs only, with no runtime code. No vanity tests: no test asserts skill wording (learnings/LESSONS.md, 2026-10-01 prose-assertion lesson). The cheapest sufficient proof is the existing docs link test in `checks` (tests/docs-links.test.ts) for the new README link, plus criterion 5's recorded dry walk for the sorting rule. Auth, backend, secrets, chain and end-to-end lines do not apply.

## Leaf architecture
Owned surfaces:
- `skills/learn-issues/SKILL.md` (new). Style matches the other skills: frontmatter `name` and `description`, short plain sections. Steps: resolve the registered root from `akrogon config` (`repo` key into `repos`), which works from the root, a subdirectory or a worktree, and stop with a message when it reports `repo: none` (proof in forks/adopt.md); read `learnings/LESSONS.md`, the repo's `checks` and `merge_checks`; for each active line, read its history file, trace the mechanism and any guard's call site, and decide one outcome; show the sorted list grouped as already guarded, checkable, stays with file:line evidence; apply already-guarded removals and history dating without a further question; print seed lines for checkable ones; leave all edits uncommitted for the operator. (A,B,C)
- `skills/chart-issues/SKILL.md`: the open sentence at :29 drops "and offer a lesson prune at open". The rest of the sentence stays.
- `learnings/LESSONS.md`: header line 5 only.
- `docs/reference-index.md:5`, `README.md` skill table (near :182-190, linked rows), `docs/guide/cheat.md` skill table (near :116-126, plain names) and the operator-invoked sentence at :128, `docs/guide/learn.md:18`, `skills/AREA.md` key files. (C)

Exclusions: no edit to any lesson line or history file content, no edit under `issues/`, no change to `src/` or the installer (skills are discovered from the folder, src/install.ts:12-21), no other repo.

Dependencies: none.
