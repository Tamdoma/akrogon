---
name: merge-issue
description: Rebase a reviewed leaf onto its configured remote branch, run checks, push fast-forward, and request one broadcast only when the issue completes.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt.

# Merge issue

The prompt is `merge-issue <slug> slot=A phase=merge`; A merges in the existing leaf worktree.

## Shared context

Read `akrogon config` once, locate the unique leaf under the registered repo's authoritative `issues/open/`, and read its plan, `implementation/report.md` and reviews, using configured `remote` and `default_branch` (defaults `origin` and `main`).

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

The command owns state, repair counts and dispatch; a resumed merge inspects the existing rebase, diff and remote ancestry to complete remaining work.

## merge

Turn a Nit A still holds and finds reusable into one line naming mechanism/date/history in the registered checkout's `learnings/LESSONS.md` and a history file with case, evidence and learning, left for the operator to commit, without reading the active list as pass input or adding another turn.

Before pushing, commit scoped outstanding changes, fetch the configured remote, rebase onto `<remote>/<default_branch>`, refresh `AKROGON_BASE` from `akrogon config` after rebase, and run every `checks` command in the worktree, recording evidence in `review-A.md` and advisory failures as Nits.

A local default branch is unnecessary; ordinary git non-fast-forward refusal serializes competing pushes.

On a rebase conflict, resolve it in the worktree keeping both true sides, complete the rebase, and record in `review-A.md` the rebase target, the prior reviewed head, the resolved head and `git range-diff <old-base>..<prior-head> <target>..<resolved-head>` before running the checks, where old-base is the `AKROGON_BASE` value before the post-rebase refresh.

On red checks, append the failing output, the rebase target commit and the rebased head to `review-A.md`, call `akrogon phase <slug> check.fix --slot A`, and finish with the actual result and repair footer.

Same-line index conflicts retain both true entries and recheck pointers; a broken default branch discovered by this leaf is fixed forward with failing tests as criteria.

After green checks, push `HEAD:<default_branch>` to the configured remote fast-forward only, repeating fetch/rebase/checks after a non-fast-forward rejection; for a lost reply, fetch and use `git merge-base --is-ancestor <pushed-head> <remote>/<default_branch>` to establish whether the intended commit landed before trying again.

Other push errors are reported with their cause rather than retried as competing merges, and an unchanged successful check run is reused only when neither code nor integration changed.

Gather the completed issue's briefs before its folder may move, then after confirmed push success run `akrogon phase <slug> merged --slot A`, and only when this invocation prints `issue complete`, run the broadcast-issue skill yourself in this session with that issue context and repo worktree; the broadcast is always sent by the merge slot, never by a subagent or another agent, because the tab closes as soon as this pane goes idle after `merged`.

A failed broadcast is visible but leaves the merge complete, while GitHub closure and completed-folder moves belong to the command.

Finish by printing the footer, then close this tab with `herdr tab close "$HERDR_TAB_ID"` as the very last act; the startup sweep removes the worktree and branch, and closes any tab a merge left open.

## Printed footer

```text
Last operation: <push/check evidence and observed phase result>
Next: <skill> <slug> slot=<A|B> phase=<phase>
```

A repair move names `implement-issue <slug> slot=B phase=check.fix`; completion uses `Next: none merged`, failure uses `Next: none failed`, and another unresolved error names its actual reason without inventing a state move.
