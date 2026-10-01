# leaf-temp final check, slot C

## D1. Q2 2a never runs automatically, so the 7-day sweep becomes the main deleter for merged leaves

The shape deletes in `cleanupMerged` "on the first sweep after the tab is confirmed gone". In the automatic flow, no such sweep runs.

- **Only three callers.** `cleanupMerged` is called only from `cleanupRepos` (`src/next.ts:642-651`). `cleanupRepos` runs only for a bare manual `akrogon next` (`:693`, and only when not hooked), `--all` (`:696-704`) and `--resume` (`:706-724`).
- **Hook events skip it.** Every herdr hook runs `next.sh` with no argument (`plugin/herdr-plugin.toml`, `plugin/next.sh`). With an event set, `selection` is undefined (`src/next.ts:674-677`). The `tab_closed` branch (`:728-738`) and the hook-pane branch (`:739-760`) call `dispatchLeaf` and `closeMergedTab`. Neither calls `cleanupRepos`. `dispatchLeaf` on a merged leaf only runs `completeOwner` (`:520-523`).
- **The normal merge.** The merge seat goes idle, the hook closes its tab (`:744-753`), and `tab.closed` fires `next.sh`, which goes into the `tab_closed` branch. The temp folder survives.
- **When it does run.** Deletion waits for a manual `akrogon next`, a watch-issues `--all` (`skills/watch-issues/SKILL.md:36`, only when several leaves wait) or a herdr restart (`--resume` at startup). The operator keeps the machine on for weeks (#49), so restarts are rare. `docs/guide/merge.md:32` already says "Only those sweeps remove completed worktrees".
- **Result.** For merged leaves, the operator's 7-day `tmp-sweep` loop becomes the real deleter. Up to 7 days of base-run copies at about 66k inodes each pile up per merged leaf. That falls short of the intake's "removed with the leaf".

Fix, same complexity: also delete in the `tab_closed` branch when the owning leaf is merged. That event is the confirmation that the panes are gone. Same `rmSync(leafTemp, {recursive, force})` plus `git worktree prune`, errors through `report()`. `cleanupMerged` stays as the catch-up for missed events.
