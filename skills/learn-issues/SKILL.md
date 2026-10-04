---
name: learn-issues
description: Sort the registered repo's active lessons into guarded, checkable or stays; remove guarded lines, print seed lines for checkable ones. Operator-invoked only.
---

Re-read this file and its references only after compaction; never re-read an unchanged file already read in this thread.

# Learn issues

Needs the installed `akrogon` command. Runs only when the operator starts it: no lifecycle phase, chart, map, handoff, `akrogon pull` or commit.

## Scope

`akrogon config` names the target. `repo: none`: report the checkout as unregistered and stop. Otherwise the target is `learnings/LESSONS.md` under the registered root `repos.<repo>`, never a worktree copy, and its `checks` and `merge_checks` are the blocking checks. Inspect and edit only active lesson lines and the evidence that sorts them.

## Sort

Per active line: read its history file for the failure and its mechanism, trace that mechanism through current code and checks, then pick one outcome.

- **Guarded**: command code, an `akrogon phase` guard or a blocking check runs on the relevant path and covers the mechanism everywhere it can recur. An uncalled guard, or one fixed site with the pattern reachable elsewhere, is not guarded.
- **Checkable**: a command could detect the mechanism as a fixed pattern (banned call, schema shape, path rule, required state before a step), and no running guard covers every reachable case.
- **Stays**: default; judgment calls, unproved coverage, missing evidence.

## Apply

Print the list grouped by outcome with file:line evidence per line, then act without asking:

- Guarded: delete the line; append `Applied <YYYY-MM-DD> by <guard file:line>: <what it enforces>` to its history file, case untouched.
- Checkable: print one runnable `/seed-issue` line naming the lesson and the reachable case, never the fix; the operator decides whether to run it. File nothing.

Leave all edits uncommitted; the diff is the operator's review.

## Printed footer

End every pass with this, printed, not saved:

```text
Last operation: removed <n> guarded lines, printed <n> seed lines, <n> stay
Next: none, awaiting operator review of the uncommitted diff
```
