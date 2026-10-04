# Final check C: adopt

## Name
`learn-issues`. It matches `learnings/` and the guide's Learn page (docs/guide/learn.md:1), so the operator finds the skill from the surface it edits. `retro-issues` would contradict the chart's own Off route line "A retro skill" (CHART.md:14) and import a word no other surface uses. `distill-issues` points at nothing in the repo.

## Defects in the shape

X1. Missing: which checkout the skill edits. `learnings/LESSONS.md` is tracked, so every leaf worktree has its own copy. Seats write lessons to the registered checkout (skills/check-issue/SKILL.md:59, skills/merge-issue/SKILL.md:35). The shape says "no pull" but names no root. The skill must resolve the registered repo root the way the door does, from `akrogon config` (skills/chart-issues/SKILL.md:23), or a run from a worktree edits a copy nobody reads.

X2. Contradiction on the history file. The shape says "history file kept". The existing rule for an applied lesson is "removes its active line and dates its history file without rewriting the historical case" (skills/implement-issue/SKILL.md:31). An already-guarded removal is an applied lesson, so the skill should date the history file and record the guard's file:line there. Otherwise two skills remove lines under two different rules, and the cited guard is lost once the line is gone.

X3. The `LESSONS.md:5` edit reaches akrogon only. Init scaffolds just `# Lessons\n` (src/init.ts:50, asserted at tests/init.test.ts:23), so each registered repo owns its header. Not checked: whether the other registered repos (8 per lessons-merge-conflicts/CHART.md:7) carry "pruned at chart open". The skill must not depend on the header text, and the leaf should say those headers are out of scope or name an operator step.

X4. Seed wording. `/seed-issue` files unverified intake "without diagnosis, recommended fixes or planning metadata" (skills/seed-issue/SKILL.md:26). The shape's "describing the gap" is right. The skill text must say the offered line names the lesson and the reachable case, not the check to build.

## Checked, no defect
- Install and its test read the skills folder dynamically (src/install.ts:12-14, tests/install.test.ts:60), so a tenth folder breaks nothing.
- New README and cheat rows are covered by tests/docs-links.test.ts. tests/command-reference.test.ts checks commands only (:74-75).
- skills/AREA.md is 31 lines, so one more key-file line stays under the 40-line cap (skills/init-akrogon/SKILL.md:60).
- The listed doc surfaces are complete: no other tracked file outside `issues/` and `learnings/` says "nine" or mentions the open-time prune.
