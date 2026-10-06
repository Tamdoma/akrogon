# merge-order 1d, proposed final shape (for B, C focused check)

Operator correction 2026-10-05, verbatim: "1d" (chosen after A explained batching on top of the merge turn). Q2 (tab while waiting) is still unanswered.

## 1d: merge turn plus batching
1. Turn (unchanged from 1a): one turn per registered repo, held by the earliest leaf in `merge` (stamp in `state.yaml` at the move into `merge`, ties by slug, leaves already in `merge` at ship time ordered by last `to: merge` in `issues/log.jsonl`). The command refuses merge work by a non-holder (merge-pass start and `merged --check`). Fast-forward-only push stays as the backstop for outside pushes.
2. Batch: when the holder starts, the batch is the holder plus every leaf waiting in `merge` for that repo at that moment, in queue order. A one-leaf batch is exactly today's merge.
3. Stack: fetch, then rebase each batch leaf's branch in its own worktree onto the previous leaf's rebased tip (first onto `<remote>/<default_branch>`). Each leaf branch ends at its own position in the stack, so each leaf's own range is `<previous tip>..<its tip>` and, after push, `git merge-base --is-ancestor <its tip> <remote>/<default_branch>` proves it landed.
4. Conflict: a leaf whose rebase conflicts is aborted back to its pre-rebase head, dropped from this batch, and stays in `merge` for a later solo turn, where its own B resolves the conflict as `SKILL.md:41` says today. The batch continues stacking the rest onto the last good tip.
5. Check once: every `checks` then every `merge_checks` runs once in the top leaf's worktree on the top commit. Per-leaf `merged --check` (Test-Change trailers on that leaf's own range) runs for every batch leaf.
6. Green: push the top commit fast-forward. Then the holder's B runs `akrogon phase <slug> merged --slot B` for each batch leaf in stack order, and runs one broadcast for each `issue complete` / `epic complete` that prints. Each leaf's `review-B.md` records the batch members, the top commit tested and the push.
7. Red: no leaf moves. The batch dissolves: each leaf in it keeps its queue place and is merged solo, one at a time, under 1a. A red solo run sends that leaf to `check.fix` as today. No bisection.
8. Non-fast-forward rejection of the top push (an outside push landed): fetch and restack; issues-only moves are decided in forks/issues-only.md.
9. Owner: the holder's B seat builds the stack, runs the checks and moves every batch leaf. Carried leaves' seats are never prompted.

## Open for the check
- Is batch size capped, and at what?
- Does any guard (`requireClean`, `requireNoIssueFiles`, `requireTestChangeCitations` at `src/phase.ts:225-234`, `cleanupMerged` `git branch -d` at `src/next.ts:651`) break when B moves another leaf's phase or rebases another leaf's worktree?
- Is the holder seat the right owner, or should the command build the stack mechanically (rebase-or-drop needs no judgment)?
