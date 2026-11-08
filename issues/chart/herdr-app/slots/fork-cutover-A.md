# Fork notes A: cutover

## Q1 drain
- Pick: zero open leaves across every registered repo when the engine leaf merges. Today none exists (2026-11-07), and signpost 6a says the engine leaf is built by the door itself or by hand, not dispatched, so the only rule needed is: no handoff into any repo from the moment the engine leaf starts until it is live and its proof passes. An operator step, written as a Pending step in CHART.md, and the engine leaf's preflight checks `akrogon status` shows no open leaf in any repo before merge. Reason: one cutover, no state migration, nothing running on old herdr when the engine flips (intake: no both-supported period). Cost: other repos wait for the engine leaf.
- Rejected: carrying open leaves over (state migration code for a one-time event, and seats live in old herdr panes the new engine cannot see). Finishing on old herdr (two engines live at once).

## Q2 rollback
- Pick: rollback across the cutover is allowed only until old herdr is removed, as a plain operator choice, with no new refusal code: before removal, a rollback restores a working old engine; after removal, the pre-hc release would call a missing `herdr` and fail loudly. The removal leaf's done-criteria include moving akrogon's rollback point past the cutover (the previous release is a post-hc one), so `rollback` cannot land on a pre-hc release afterwards. Reason: no new code, one ordered step. Cost: needs the removal step to deploy at least two post-hc releases or set the previous link; probe how `rollback` picks "previous".
- Ask: does `rollback` keep only one previous release (then two post-hc deploys are enough)?

## Q3 removal
- Pick: in this order after the 2a proof: akrogon final sweep leaf removes akrogon's own old pieces (plugin, `herdr integration install`, `plugin link`, fake herdr, old code and wording) and adds nothing; herdr-setup leaf has already replaced the old skills (herdr-skill Taken); then operator steps on the machine, from a list the sweep leaf writes: stop old herdr, disable and remove the `herdr-patches*` and `herdr-claude-rules*` units and `omarchy-customizations/herdr/` (that repo's own change), remove `~/.local/bin/herdr` and `~/.config/herdr/`. Source checkouts `herdrdev/` and `herdr-plugins/` stay as archives unless the operator removes them; they are not on any path agents use. Reason: each repo removes its own parts; machine-level deletions are the operator's (they touch things outside any repo).

## Q4 wording
- Pick: `learnings/history/` files stay as written (dated records of what happened; lesson rule treats history as observations). LESSONS.md lines and docs, README and skills are rewritten or removed. The sweep's grep excludes `learnings/history/` and allows `herdr-app`, `herdr-core`, `herdr-setup` and the `herdr` skill.
