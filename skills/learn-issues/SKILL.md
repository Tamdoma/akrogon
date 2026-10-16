---
name: learn-issues
description: Sort the registered repo's active lessons into stopped, checkable, transfer or stays; remove stopped lines, prepare transfers for operator approval, print seed lines for checkable ones. Operator-invoked only.
---

Re-read this file and its references only after compaction; never re-read an unchanged file already read in this thread.

# Learn issues

Needs the installed `akrogon` command. Runs only when the operator starts it: no lifecycle phase, chart, map, handoff, `akrogon pull` or commit.

## Scope

`akrogon config` names the target. `repo: none`: report the checkout as unregistered and stop. Otherwise the target is `learnings/LESSONS.md` under the registered root `repos.<repo>`, never a worktree copy, and its `checks` and `merge_checks` are the blocking checks. Inspect and edit only active lesson lines and the evidence that sorts them.

## Sort

Per active line: read its history file for the failure and its mechanism (read recorded check or verify log paths with `akrogon log <path>`), trace that mechanism through current code and checks, then pick one outcome.

- **Stopped**: the mechanism is stopped everywhere it can recur, by one of the [lesson rule](../lesson-rule.md)'s Retire exits: it was removed, a reader or writer refuses it loudly at the point of use before the lesson's harmful effect, or command code, an `akrogon phase` guard or a blocking check runs on the relevant path and covers it. An uncalled guard, one fixed or deleted site with the pattern reachable elsewhere, or a failure after the harm is not stopped.
- **Checkable**: a command could detect the mechanism as a fixed pattern (banned call, schema shape, path rule, required state before a step), and the mechanism is still reachable and not stopped.
- **Transfer**: a judgment lesson whose case is reached by one live review step in this repo, a skill or check step that runs on the path where the case happened. A judgment lesson whose step lives in another repo stays and names that repo and step.
- **Stays**: default; judgment calls with no qualifying step, unproved coverage, missing evidence.

## Apply

Print the list grouped by outcome with file:line evidence per line, then act without asking:

- Stopped: delete the line; append `Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>` to its history file, case untouched.
- Transfer: add the lesson as one instruction at that step, delete the line and append `Transferred <YYYY-MM-DD> to <file:line>, approved by <who>` to its history file, case untouched, with `<who>` the registered checkout's `git config user.name`. The transfer completes only when the operator approves the diff; a declined transfer is reverted and the line stays.
- Checkable: print one runnable `/seed-issue` line naming the lesson and the reachable case, never the fix; the operator decides whether to run it. File nothing.

Leave all edits uncommitted; the diff is the operator's review.

## Printed footer

End every pass with this, printed, not saved:

```text
Last operation: removed <n> stopped lines, prepared <n> transfers, printed <n> seed lines, <n> stay
Next: none, awaiting operator review of the uncommitted diff
```
