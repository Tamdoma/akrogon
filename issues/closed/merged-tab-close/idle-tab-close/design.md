# Design: idle-tab-close

## Binding decisions, verbatim
### tab-close-rule Q1: Which merged leaves should have their tab closed by the command?
Operator, 2026-09-27: "1a"
A. The command closes the tab of every merged leaf, wherever its folder is. The worktree and branch keep waiting for the owner move. Reason: one rule, and a merged leaf's tab is never needed again. The GitHub closure retry needs the worktree, not the tab. Foreclosed: B (keep the tab while closure is pending).

### tab-close-rule Q2: Which pass closes it?
Operator, 2026-09-27: "2a"
A. The merged leaf's own pane hook closes the tab as soon as the seat goes idle, and the existing cleanup passes also close it. The merge-issue skill drops its "close this tab" step. Reason: the tab closes the moment the merge seat finishes, and the fragile agent step goes away. Foreclosed: B (cleanup passes only, up to a ~20 minute lag).

### Off route (chart)
Early worktree and branch removal is excluded: `closeSources` reads the leaf worktree `HEAD` (`src/pull.ts:185-189`).

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md
- Real invocation: tests run the real CLI through `tests/helpers.ts` and `tests/fake-herdr.ts`. The hook is exercised with the real `HERDR_PLUGIN_EVENT_JSON` and `HERDR_PANE_ID` env inputs. No new mocks.
- Negative and edge cases are required: `blocked` and `unknown` status, an unmerged leaf going idle, a tab already gone, failed closure.
- No auth, secrets or browser flow apply. The artifact is the `bun test` output recorded in the implementation report.

## Leaf architecture
Owned: `src/next.ts` (`cleanupMerged` split, pane-hook branch of `nextCommand`), `tests/next.test.ts`, `skills/merge-issue/SKILL.md`, `docs/guide/merge.md`, `docs/guide/limits.md`, `docs/guide/problems.md`.
Interface:
- `closeMergedTab(leaf: Leaf): Promise<void>` holds the existing tab-close lines from `cleanupMerged` (`src/next.ts:556-557`): close only when live panes still carry `leaf.state.tab`.
- `cleanupMerged` calls `closeMergedTab` before the `issues/open` guard. The worktree and branch lines stay behind the guard.
- In the `HERDR_PANE_ID` hook branch, after `dispatchLeaf`, rediscover the leaf by repo and slug (`discover(owner.repo, invocation)`), not by `owner.leaf.path`, because `completeOwner` can rename the owner into `issues/closed/` (`src/phase.ts:170-174`) (B). If it is `merged`, `hookPane === state.pane.A`, and the event is not `pane_agent_status_changed` with `blocked` or `unknown`, call `closeMergedTab` (both). The existing `dispatchDependents` call on `'completed'` stays.
- The `tab_closed` event that follows re-enters the existing `tab_closed` branch and dispatches the merged leaf again. It adds no tab-close call or tab error. Closure errors from `completeOwner` keep being reported and exiting nonzero as today (`src/next.ts:547-550`) (B).
Excluded: worktree and branch timing, `completeOwner`, `closeSources`, `--all` and `--resume` selection rules, the broadcast-issue skill.
Dependencies: none. Base on origin/main at 17fa33a or later (contains `dispatchDependents` and `--resume`).
