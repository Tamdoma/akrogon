# Parallel Merge

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Several leaves finish close together and there is no merger tab and no parking. Is one merge at a time inside the leaf's own tab, rebase and fast-forward, conflicts fixed by the implementer in its worktree, enough? What serializes two merges that start in the same second? When does a leaf need renewed verification after a sibling merges? What ends an issue when the merge landed but push or broadcast failed?

Coverage pass 2026-09-08 adds: who merges and broadcasts, the intake has slot A doing both (intake 127).

Reshape 2026-09-08 after # Debate Count, # Turn Within Phase, # Driver State: a merge is the leaf's `merge` phase entered by `akrogon phase` compare-and-set, and a merged leaf closes its tab and starts what it unblocked up to `max_active`; what still needs an answer is the serializer between two leaves entering `merge` together.

From # Skill Rewrite 2026-09-08, operator-locked: leaves run parallel unless the planner names a dependency; overlapping files allowed; the merger rebases on main, resolves, reruns config checks; merge and conflict resolution happen inside the leaf tab by one of its own agents, no separate merge machinery. Open here: which agent merges, and the case where two leaves each pass review and break each other after merge (first one is already in).

## Findings

### Slot A research 2026-09-08

Serializer: a branch push only fast-forwards, so the remote ref update is a compare-and-swap; the loser fetches, rebases, reruns checks, pushes again (git-push docs, tier 2). "Branches must be current" gives the same guarantee as a merge queue with far less complexity for a handful of merges (Modern Git Academy, Aug 2026, tier 2); a 5 percent flaky check can stall a whole queue (Tenki 2026-02-25, tier 2). Anthropic's parallel-Claude compiler project used no queue: each agent merged upstream itself before pushing, conflicts frequent and handled (Anthropic Engineering 2026-02-05, tier 1). With three or more agents retries compound (Heaslip, ITNEXT, Jul 2026, tier 1, page 403), bounded here by `max_active`. Never force: bare `--force-with-lease` is defeated by any background fetch (git docs, tier 2); claude-code#32476 2026-03-09 force-pushed another contributor's branch (tier 1).

Semantic conflicts: textual conflict rate between concurrent agent PRs 19.8 percent same-agent, 41.7 percent cross-agent, semantic not measured (Xu et al. arXiv 2607.04697, 2026-07-07, tier 2); 27.67 percent across 107K agent PRs (AgenticFlict arXiv 2604.03551, 2026-04-04, tier 2). Three green PRs, one broken product; fix is merge sequentially and test after each (Piaggio, Autonoma, Apr 2026, tier 1). Green CI does not prove three changes right together (Mikhalev 2026-07-30, tier 1). Rebase remaining branches after each landing, tests after merge (Augment guide 2026-06-18, tier 2). Broken-main rate on small teams with queues 0.77 percent (Mergify 2026-07-27, tier 2). Nothing endorses skipping checks after rebase.

Who resolves: the authoring agent in Anthropic's project (tier 1); Cursor Origin surfaces conflicts to the human, mechanical ones automated, behavioural taken by a person (Learn Cursor 2026-08-22, tier 2; Mikhalev tier 1). No 2026 source measures author versus separate merger.

Post-merge failure: landed means the merge sha is an ancestor of remote main; a push rejection leaves nothing landed; notifications are at-least-once with check-before-send (gh cli#13345 2026-05-04, tier 1; slot A reasoning, tier 3). The July 28 merge skill let a failed push not block local cleanup (merge-issue/SKILL.md:85).

Slot A view: no local main branch, the leaf pushes its rebased branch to origin main fast-forward only, so the push is the merge and the serializer; merged is set only after the push succeeds; conflict or red checks after rebase go back through the existing check.fix round (B fixes in the rebased worktree, A re-checks the repair diff, then merge again), so no new review path; a break found on main by a later leaf is fixed forward inside that leaf's check.fix; broadcast is best effort after merged and never blocks it.

### Slot B research 2026-09-08 (blind)

Wilson Lin, Cursor, 2026-07-20 (tier 1): workers overwrote competing changes, Cursor added an independent conflict resolver, reversing its 2026-01-14 finding that removing the integrator helped; long-held coordination locks caused bottlenecks (2026-01-14). Fowler 2024-01-18 (tier 1): integration is reaching the shared repository; revert a broken integration unless the fix is obvious. Uber SubmitQueue 2025-06-23 (tier 1): test combinations before mainline. GitHub merge queue docs (tier 2). Featonby AWS (tier 1, undated): retrying side effects needs knowledge of the earlier outcome. July 28 merge skill: failed push and broadcast non-blocking.

Slot B questions: slot A owns merging and conflict resolution (intake 127); serializer as a short OS lock around a local main update, alternative remote push fast-forward as the integration point; peer review only of substantive conflict repairs, clean rebase gets checks only; failure after rebase repaired by the later leaf's pair in its worktree; failure found after both landed handled by tested revert, forward fix when obvious; merged only after the commit is on remote main; broadcast failure never blocks completion, bounded retries, failure recorded. Challenge: short lock may cause repeated lost races at high contention; checks plus selective review cannot guarantee behaviour preservation; revert ownership after tab close and a phase update failing after a successful push need handling in # Repeat Safety.

### Operator answers round 1, 2026-09-08

1-A slot A merges, cheap writer broadcasts. Open: 2 (plain restatement asked), 3, 4, 5.

### Operator answers round 2, 2026-09-08

2-A push is the merge, no local main, no lock, merged after the push succeeds. 4-A forward fix by the discovering leaf, with the operator's worry: too many fails reaching status; asks whether slot B gets one extra try before failed without new complexity. 5-A broadcast never blocks. Open: 3 (plain restatement asked).

### Operator answers round 3, 2026-09-08

4-yes: at fix round three slot B repairs itself, no worker, before failed. Steering sentence in check.fix, no counter. Open: 3, operator asks when the return to check.fix happens relative to other work.

### Operator answers round 4, 2026-09-08

3-A conflict or red checks after rebase return through check.fix with findings written by slot A. All questions lettered. Challenge carried: a successful push followed by a failed phase write is handled in # Repeat Safety.

## Taken

Slot A merges inside the leaf's tab: rebase the leaf branch on current `origin/main`, rerun the config checks, push fast-forward only to `origin main`. There is no local main branch, no lock and no queue; git's refusal of a non-fast-forward push is the serializer, and the loser rebases, rechecks and pushes again. The leaf is `merged` only after the push succeeds; then the cheap writer broadcasts with one retry, failure recorded in the leaf folder, never blocking. A rebase conflict or red checks after rebase: slot A writes findings as a reviewer would (conflicting files or pasted failing output, rebased-on commit), moves the leaf to `check.fix`; slot B repairs in the same worktree, slot A re-checks the repair diff, then merges again; fix rounds count as usual, and at round three slot B repairs itself with no worker before `failed`. A break on main found later by another leaf's full suite is fixed forward by that leaf in its own `check.fix`, failing tests as acceptance criteria, no revert step.

Why: the push already does what a lock or queue would, and reusing check.fix gives conflict resolutions a second reader with no new phase, file or counter; 2026 evidence (Piaggio, Mikhalev, Lin) says the danger is untested combinations and resolvers discarding the other side's intent, which checks-after-rebase and the re-check cover.

Forecloses: a merger tab or process, a local main checkout, file locks, force pushes, a revert step, broadcast as a completion condition.

Reshape 2026-09-08 after # Config Shape: "round three" reads as "the last allowed round" of `fix_rounds`.

### Operator explanations 2026-09-08 (chat, recorded for handoff)

Merge sequence. Review passes. Slot A runs `akrogon phase <slug> merge`, then in the leaf worktree: fetch, rebase the leaf branch onto `origin/main`, run every command under `checks`, push the branch to `origin main` fast-forward only. Never force. If the push is rejected because main moved, repeat from fetch. A rejected push lands nothing. A lost network reply may still have landed: check whether the leaf head is an ancestor of `origin/main` before repeating. After the push succeeds, `akrogon phase <slug> merged`; the tab closes; the cheap writer runs broadcast-issue once with one retry; a broadcast failure is written into the leaf folder and never reopens the leaf.

Conflict or red checks after rebase, step by step. 1. Slot A writes findings into the same file the reviewer uses: the conflicting files, or the failing command output pasted, plus one line naming the commit the branch is now rebased on. 2. Slot A runs `akrogon phase <slug> check.fix`; fix_rounds plus one. 3. `akrogon next` prompts slot B in the same tab with implement-issue, phase check.fix; B reads the findings file, repairs in the same worktree, runs its checks, runs `akrogon phase <slug> check.review`. 4. Slot A re-checks only the repair diff, gives `--verdict`, and on ready returns to merge. Same cap as any repair; on the last allowed round B repairs itself without a worker; at the cap the leaf is `failed` with A's diagnosis paragraph. The whole loop stays in one tab and one worktree; other leaves are in other tabs and are not involved.

Main broken after two green leaves both landed. The leaf that discovers it, through its own full suite after rebase, fixes it forward in its own check.fix with the failing tests as acceptance criteria. No revert step. The checker's existing rule against weakening a failing test applies.

From # Repeat Safety 2026-09-09: the broadcast after merge is per issue, not per leaf; the merge skill sends only when `akrogon phase <slug> merged` reports the issue's last leaf merged.

From # Status View 2026-09-09: the carried "broadcast failure visible in status" is retired; Repeat Safety records no broadcast outcome, so status has nothing to show.

From # Index Levels 2026-09-09: area index files make parallel doc updates different-file merges; a same-line conflict is resolved at merge by keeping both true entries and rechecking pointers.
