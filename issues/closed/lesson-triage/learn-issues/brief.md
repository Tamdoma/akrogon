# Brief: learn-issues

## What
Add an operator-invoked skill, `skills/learn-issues/SKILL.md`, that goes through the registered repo's `learnings/LESSONS.md` and sorts each active line into one of three outcomes:
- Already guarded: a guard in command code, an `akrogon phase` guard or a blocking `checks` command is called on the relevant path and covers the lesson's whole mechanism everywhere it can recur. The skill removes the active line and dates the line's history file with the guard's file:line, without rewriting the historical case.
- Checkable: the mechanism is a fixed pattern a command can detect (a banned call or schema shape, a path or file-location rule, a required state before a step), and no running guard covers every reachable case yet. A check that exists but is not reached from blocking `checks` or the command path counts as not covering. (A,B,C) The skill prints one ready-to-run `/seed-issue` line naming the lesson and the reachable case, never the check to build. The operator runs it or not. The skill files nothing itself.
- Stays: the default, for judgment calls, unproved coverage and missing evidence. (A,B,C)

Before sorting a line, the skill reads its linked history file for the observed failure and checks that mechanism against current code and the repo's `checks` and `merge_checks`. (B,C) It works only from active lessons and the evidence needed to sort them, and audits no other instructions, tooling or docs. (B)

It shows the sorted list grouped as already guarded, checkable, stays, each with its file:line evidence, then removes the already-guarded lines without a further question. The uncommitted diff is the operator's review. (C) It runs only when the operator starts it, writes no chart, territory map or handoff, runs no `akrogon pull`, and leaves its edits for the operator to commit.

chart-issues stops offering a lesson prune at open and still reads `learnings/LESSONS.md` as a resource. The docs that list the workflows name the new skill.

## Why
Lessons pile up after their mechanism is already enforced, and nothing asks whether a lesson should become a check. For example, part of LESSONS.md:10 (clean worktree before a verdict) is enforced through `requireClean` (src/phase.ts:225-226, 268-271) and the line is still read by every plan and chart open. The open-time prune offer also interrupts the chart the operator opened (chart retro-concepts, fork adopt).

## Done-criteria
1. `skills/learn-issues/SKILL.md` exists with frontmatter `name: learn-issues` and a description saying it is operator-invoked only. It states the three outcomes, their tests and actions, the evidence step and the scope limit as in What. It resolves the target file from the registered root in `akrogon config` rather than the current checkout, stops and tells the operator when `akrogon config` reports `repo: none`, and says it writes no chart, map, pull or handoff.
2. `skills/chart-issues/SKILL.md` no longer offers a lesson prune at open, and its open step still reads `learnings/LESSONS.md` as a resource.
3. `learnings/LESSONS.md` header names `/learn-issues` as the place lines are pruned. No lesson line changes.
4. The workflow count in `docs/reference-index.md` matches the number of skill folders. The `README.md` skill table has a `learn-issues` row linking the skill, and the `docs/guide/cheat.md` skill table has a `learn-issues` row in that table's existing form. The sentence under the cheat table listing operator-invoked skills includes lesson triage. `docs/guide/learn.md` says `/learn-issues` removes a lesson once a running guard covers it and offers a seed when a check could. `skills/AREA.md` lists the skill's key file. (C)
5. The implementation report records a dry walk of the new skill's rules against the current `learnings/LESSONS.md`, without editing lessons or history. It includes the uncommitted-handoff lesson (LESSONS.md:10) and the whitespace-only-input lesson (LESSONS.md:17), records each classification with current file:line evidence, and traces guard invocation and coverage of each lesson's whole mechanism before classifying it as already guarded. Partial deterministic coverage is checkable, and unproved coverage stays. (B)
6. Every configured blocking `checks` command passes, and the new README link resolves to the new skill. (B,C)
