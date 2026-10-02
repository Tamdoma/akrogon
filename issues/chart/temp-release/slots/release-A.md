# Release: A independent

## Evidence
- Failed: `announceFailed` keeps the tab and only renames it "<slug> failed" (src/phase.ts:48-84). Seats stay alive for inspection and a retry (`failed -> check.fix`) reuses the tab. A failed leaf with a live tab has not released.
- Park: `akrogon park` refuses an issue with a leaf that has a tab or worktree (src/park.ts:22-26, "Issue has a running leaf"). A parked leaf already has no tab.
- Merged: the hook closes the tab; the `tab_closed` branch deletes scratch only when the owner is merged (src/next.ts:777-790); `cleanupMerged` catch-up deletes when the tab has no live panes (src/next.ts:614-616).
- New tab: allocation empties scratch when no live tab matches (src/next.ts:339-341).

## Recommendation 1a: the tab is the release point
Delete a leaf's scratch whenever its tab is gone, any phase: drop the `phase === 'merged'` condition in the `tab_closed` branch, and make the catch-up pass delete scratch of any leaf whose recorded tab has no live panes (or has no tab). The deletion runs before the redispatch in the same branch, so a new tab never shares the old scratch. Failed leaves free RAM when the operator closes their tab; their seats keep the scratch while they live. One rule, no per-state list.

## Options
- 1a tab gone, any phase (above).
- 1b also delete on the `failed` transition while the tab lives. Cost: deletes files open in live seats; breaks inspect-and-retry.
- 1c merged only (today).

## Pitfalls
- Children that outlive the tab keep RAM through open files; see B on confirming exit.
- Red-on-base log paths vanish with the scratch; names and tails are already in the report.
