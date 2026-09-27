# Chart: merged-tab-close

## Destination
A merged leaf's Herdr tab closes without relying on the merge seat, including while the leaf waits in `issues/open/` for unmerged siblings. Skill and guide text match the command.

## Forks taken
- [tab-close-rule](forks/tab-close-rule.md): close every merged leaf's tab, on its own pane-idle hook and on cleanup passes; worktree and branch unchanged

## Open forks

## Fog

## Off route
- Early worktree and branch removal for merged leaves still in `issues/open/`. `closeSources` reads the leaf worktree HEAD (`src/pull.ts:185-189` on origin/main), and `completeOwner` retries closure with earlier merged siblings, so removing worktrees early risks breaking the closure retry. The report asks only about the tab.
- Making the merge seat more reliable after compaction. A skill instruction can always be skipped. The command-side close removes the need.

Handed off 2026-09-27
