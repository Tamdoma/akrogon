# Brief: pass-refresh

## What
Every A pass meets current main at its start and again before its final proof, so a sibling's merge is found and fixed before review instead of at merge.

In `skills/implement-issue/SKILL.md`:
- At the start of `implement` and of every `check.fix`, before the first unit or repair, A refreshes: it fetches the configured remote, rebases the leaf branch onto the current `<remote>/<default_branch>` and refreshes `AKROGON_BASE` from `akrogon config`.
- After the last unit or repair, with every worker worktree removed, A commits its outstanding scoped work, never stashing or discarding it, and refreshes again before the final proof (done-criteria proof, changed tests, every `checks` command), so the handed-off head is proven on the main it will meet. (A,B)
- Conflicts are resolved inside the rebase, keeping both true sides under the merge-issue solo rule, as the merge-origin `check.fix` does today (`:78`). When resolving needs a plan correction, A makes it under plan-not-cap's plan-correction rule and resolves the conflict by it. `plan.md` lives in the registered checkout, outside the worktree, so the rebase stays in progress meanwhile. Such a conflict never ends the pass `failed`. (A,B,C)
- A fetch failure, or another refresh error that leaves no conflict to resolve, is recorded with its original error in `implementation/report.md`. A aborts a rebase only if one is in progress, and the pass ends without a phase move, so the next dispatch prompts A again (`src/next.ts:632-641`). The re-prompted pass resumes at that refresh instead of redoing committed work, and compares any red check again. A never proceeds on an old tip. (A,B,C)
- A comparison record holds only for the head and pass it was written in (`src/compare.ts:116-145`). After a refresh or a later commit, a red check is rerun and compared on the new head, never carried over (A,C).
- `implementation/report.md` records each refresh that moves the branch (prior and new base, prior and new head). A report handed off from `check.fix` also records the prior reviewed base and head and the handed-off base and head. (A,B,C)
- The merge-origin `check.fix` (today `:78`) keeps its replay of the recorded commands, its green-replay rule and its base-run rule, and uses this refresh for its fetch and rebase.

In `skills/check-issue/SKILL.md` (today `:67`): on re-check after a `check.fix` whose report records a refresh, B computes `git range-diff <prior reviewed base>..<prior reviewed head> <handed-off base>..<handed-off head>` itself from the recorded SHAs and reviews as repair the commits it shows added or changed, conflict resolutions included. Main's commits are not reviewed as repair. (A,B,C)

Merge reds keep going to A's `check.fix` (`src/phase.ts:1081`, `:1108`) (B,C). No `src/` change.

Consumes from plan-not-cap (blocked-by): the plan-correction rule in `skills/implement-issue/SKILL.md` that this leaf's conflict sentence names.

Owned: `skills/implement-issue/SKILL.md` (the `implement` handoff paragraph today `:63`, the start of the `implement` section, the `check.fix` section today `:74-80`), `skills/check-issue/SKILL.md` (the re-check sentence today `:67`), and lines in `docs/guide/` that say a leaf meets current main only at merge.

## Why
Tamdoma/akrogon#80–#85 night, framework 2026-10-11: root-influence landed at 07:25 with a new root-state check, and recording-consumers had added a required `dispose` method. check-scratch and formspark-build-wiring learned of both only at their own merge (07:37, 07:44), after review, because a leaf meets current main only at merge (`src/next.ts:334`, `src/batch.ts:89-133`). Each return from merge cost 16–33 minutes, 9–15 of them A's repair. Those two waited hours in the merge queue behind a repo-wide hold, which known-red-merge retires; this leaf catches a sibling's change at A's next pass boundary for the leaves still in implement or check.fix. The operator chose this in chart night-flow, fork sibling-breaks, answer 1a.

## Done-criteria
1. `skills/implement-issue/SKILL.md` requires the refresh at the start of `implement` and of every `check.fix`, and again before the final proof once every worker worktree is removed and outstanding work is committed, with the conflict rule, the report record, the failed-refresh stop and the resume above.
2. The merge-origin `check.fix` text keeps its replay of recorded commands and its green-replay rule, and states its fetch and rebase once, through the shared refresh.
3. `skills/check-issue/SKILL.md` tells B to compute the range-diff from the recorded prior reviewed and handed-off base and head after a refreshed `check.fix`, and to review as repair only what it shows added or changed.
4. A sweep of `skills/` and `docs/` by meaning finds no line saying a leaf meets current main only at merge, or that only a merge-origin `check.fix` rebases. Hits outside scope are listed in the report.
