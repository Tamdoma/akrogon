# Report: paid-proof-bounds (direct)

Base b5a877c1c21d952e7ef86579e8eacecbd582aa5f, head e522c1865538294dc1f65a90c7bcb5309a667513, worktree /home/ivan/.akrogon/worktrees/akrogon/paid-proof-bounds.

Changed files:
- skills/plan-issue/SKILL.md, skills/implement-issue/SKILL.md, skills/check-issue/SKILL.md, skills/merge-issue/SKILL.md: the grant reuse sentence no longer reuses "without asking again" or checks only "before mutating". It reuses grants for covered operations within their bounds and checks bounds before each covered operation, paid model launches included. The rerun sentences point to the recorded-output rule.
- skills/chart-issues/SKILL.md: the Take grant covers paid model launches. Handoff and the Autopilot wait list follow.
- skills/chart-issues/assets/standing-design.md: a new recorded-output bullet for every proof with a model or outside stage. The chain-trigger bullet now points to it. The slow/live bullet lost its restart-when-unsure and full-run-when-unsure clauses.
- skills/chart-issues/assets/shapes.md: Preflight refuses an unexplained fresh or full replay criterion.

Commands:
- Edit script asserted each old phrase occurred exactly once: "all edits applied".
- `rg -n "without asking again|live-change grant|before mutating|first mutating proof|a mutating proof call|restarts from a trustworthy point" skills/` on e522c186: no output, exit 1.

Known limitations: wording only, as decided. Seats can still ignore the rule (limit-mechanism 2a). Release copies update through the release flow.
