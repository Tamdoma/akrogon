# Brief: idle-tab-close

## What
`akrogon next` closes the Herdr tab of every merged leaf, wherever its folder is:
- on the pane hook of the leaf's merge seat (`state.pane.A`, the only `merge` slot per `src/routing.ts:32`), when the event is `pane_agent_status_changed` with `idle` or `done`, or `pane_exited` or `pane_closed` (both)
- never on an event from seat B or from another pane in the worktree, because B can go idle while A is still broadcasting after `merged` (B)
- on every cleanup pass (manual sweep, `--all`, `--resume`)

Worktree and branch removal keep their current rule and wait until the owner folder leaves `issues/open/`. The merge-issue skill drops its "close this tab" step, and the skill and guide text describe the command's rule.

## Why
Tamdoma/akrogon#30: framework leaf `plan-script` merged at 2026-09-27T01:46:30Z, but its merge seat skipped `herdr tab close` after a compacted session. `cleanupMerged` skips every leaf under `issues/open/` (`src/next.ts:555`), so the tab and two idle panes stayed open for 5+ hours through four `akrogon next --all` runs.

## Done-criteria
1. Pane hook: a merged leaf under `issues/open/` with an unfinished epic sibling. Its seat-A pane reports `idle` through `HERDR_PLUGIN_EVENT_JSON` + `HERDR_PANE_ID`. Afterward the tab is gone from the fake Herdr database, a `tab close` call was made, and the worktree and branch still exist.
2. Negative: the same merged leaf keeps its tab when seat A reports `blocked` or `unknown`, and when seat B reports `idle` or exits (B). An unmerged leaf whose pane goes `idle` keeps its tab. The existing `completing a leaf via pane_hook starts only same-repo dependents` case (`tests/next.test.ts:603-650`, seat-B `pane_exited`) keeps its expected tabs (B).
3. Cleanup pass: `next --resume` and `next --all` on that merged, sibling-waiting leaf close its tab and keep the worktree and branch. Update `tests/next.test.ts` "startup retains completed issue resources while an epic sibling remains unfinished" to expect this (tab closed, worktree and branch kept).
4. Failed closure: update the 2a759dd test "startup retries closure before cleanup and retains failed owners with their worktree branch and tab" so the tab is closed after the failed pass, worktree and branch are kept, and the later successful retry still closes the source and removes the worktree and branch. Rename the test title to match.
5. Idempotent: a merged leaf whose tab is already gone makes no `tab close` call and adds no tab error. The following `tab_closed` hook is exercised explicitly, because `tests/fake-herdr.ts:166-169` emits no hook. When source closure succeeds, that pass exits 0. When closure fails, the existing nonzero exit and `offline` error stay unchanged (B).
6. Hook retry: closure failed during `phase merged`, then succeeds on the seat-A idle hook, which moves the owner to `issues/closed/`. That hook still closes the tab and does not fail on the moved path (B).
7. `skills/merge-issue/SKILL.md`: remove the step that closes the tab with `herdr tab close "$HERDR_TAB_ID"`. SKILL.md:47 and :51 state that the command closes the tab once the seat goes idle after `merged`, and that startup and manual sweeps remove the worktree and branch after the issue folder moves.
8. `docs/guide/merge.md:27`, `docs/guide/limits.md:10` and `docs/guide/problems.md:51` match the rule: hook passes close merged tabs, and only cleanup passes delete worktrees and branches. A grep of `skills/` and `docs/` for `tab close` and "closes its tab" finds no text saying the merge seat closes its own tab.
9. `bun run format`, `bun run typecheck` and `bun test` pass.

## Credentials
None.
