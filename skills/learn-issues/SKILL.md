---
name: learn-issues
description: Triage the registered repo's active lessons into already guarded, checkable or stays, removing covered lines and offering seed lines for the rest. Operator-invoked only.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt.

# Learn issues

Dependency: the installed `akrogon` command. This is an operator-invoked pass, not a lifecycle phase: it runs only when the operator starts it, writes no chart, territory map or handoff, runs no `akrogon pull`, and leaves its edits for the operator to commit.

## Target

Run `akrogon config` and read the `repo` key; `repos.<name>` is the registered repo's root. The triage target is `<registered root>/learnings/LESSONS.md` — the real file at the registered root, never a worktree copy. When `akrogon config` reports `repo: none`, stop and tell the operator the current checkout is unregistered.

Read the repo's `checks` and `merge_checks` from the same `akrogon config` output; they are the blocking-check surface.

## Evidence

Before sorting any active line, read the line's linked history file for the observed failure, then check that mechanism against current code on the relevant path and against `checks` and `merge_checks`.

## Outcomes

Each active line sorts into exactly one outcome.

- **Already guarded**: a guard in command code, an `akrogon phase` guard or a blocking `checks` command is called on the relevant path and covers the lesson's whole mechanism everywhere it can recur. Remove the active line and date the line's history file with the guard's file:line, without rewriting the historical case.
- **Checkable**: the mechanism is a fixed pattern a command can detect — a banned call or schema shape, a path or file-location rule, a required state before a step — and no running guard covers every reachable case yet. A check that exists but is not reached from blocking `checks` or the command path counts as not covering. Print one ready-to-run `/seed-issue` line naming the lesson and the reachable case, never the check to build. The operator runs it or not; the skill files nothing itself.
- **Stays**: the default, for judgment calls, unproved coverage and missing evidence.

The skill works only from active lessons and the evidence needed to sort them; it audits no other instructions, tooling or docs.

## Apply and report

Show the sorted list grouped as already guarded, checkable and stays, each entry with its file:line evidence, then remove the already-guarded lines without a further question. The uncommitted diff is the operator's review.

## Printed footer

End each pass with the actual result, printed rather than saved:

```text
Last operation: <removed <n> already-guarded lines, offered <n> seed lines, <n> stay>
Next: none <awaiting operator review of the uncommitted diff>
```
