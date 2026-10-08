# Growth merged notes

## Q1 job grows
- Triggers: a locked decision must change, a need eligibility 1a excludes appears, a criterion cannot pass in scope after permitted repairs, a second outcome appears. (A,B,C) Not elapsed time. (B)
- Stop: no further coding or landing; work preserved on the branch; state recorded in the chart; operator chooses before any route change. (A,B,C)
- Preservation: commit WIP to a clean tree (A,C) vs keep worktree as-is, no forced checkpoint commit (B).
- Record: `Held <date>` marker (A,B) vs a `Direct attempt` section in CHART.md with branch, head, base, done/not done, trigger, review paths, and the chart reopened with the trigger as a new fork (C).
- Lifecycle continuation: leaf starts at plan.synthesis and adopts the branch automatically because slug = branch name and `ensureWorktree` reuses an existing worktree/branch (src/next.ts:263-290) (C); leaf may adopt useful commits after checking them against the new plan, no inherited verdict (B); branch as reference only, deleted, leaf builds fresh (A). Whole-diff lifecycle review covers adopted commits (C, check-issue/SKILL.md:39).
- Double execution: slug uniqueness at handoff; last marker authoritative; door never starts a direct attempt while a chart names a live direct branch (C); record the sole successor owner (B).
- Direct worktree path bound to `<worktree_root>/<slug>` so adoption works (C).

## Q2 repair rounds
- One round = B `fix`, door repairs all Fixes in one pass, B re-checks the repair diff. First `fix` counts. (A,B,C)
- Bound = repo `fix_rounds`, no new key. (A,B,C) Count recorded durably in the chart, survives session replacement. (B,C)
- A passing Nth repair lands; exhaustion = stop with open Fixes listed, operator chooses one more round, lifecycle handoff, or abandon. (A,B,C)
- Push rejections counted separately from repair rounds. (A,B,C) Bound: 2 refusals then stop (A,C) vs 0 automatic retries, operator authorizes each new attempt (B).

## Differences
- WIP commit vs keep as-is.
- Held marker vs Direct attempt section.
- Branch adoption automatic (C) / checked adoption (B) / fresh (A).
- Push retry 2 vs 0.
