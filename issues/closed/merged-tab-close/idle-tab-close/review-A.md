# Review A: idle-tab-close

Base `17fa33ab58b727534ec542790fd6a6d11bb65de7`, reviewed head `dbd5e45f49f4c190953ee247017443e73017b6c4` on branch `idle-tab-close`. Debate: no (no positions/rebuttal artifacts, expected). Slot A reviewed blind.

## Verification evidence

- `bun run format`: clean.
- `bun run typecheck` (`tsc --noEmit`): clean.
- `bun test`: 306 pass, 0 fail, 3621 expect() calls, 14 files, 92.88s.
- `bun test tests/next.test.ts -t 'tab'`: 23 pass, 0 fail, including all new/updated titles.
- C8 grep `grep -rn 'tab close\|closes its tab' skills/ docs/`: only `skills/merge-issue/SKILL.md:47` and `docs/guide/merge.md:27`, both naming the command as the actor. No text says the merge seat closes its own tab.

## Criteria check

- C1: `a seat-A idle hook closes the merged leaf tab while the worktree and branch stay` — seat-A `idle` via real `HERDR_PLUGIN_EVENT_JSON`/`HERDR_PANE_ID`, tab gone from fake db, exactly one `tab close`, worktree exists, `refs/heads/done` verified. Pass.
- C2: 5-case negative loop (`seat-A blocked`, `seat-A unknown`, `seat-B idle`, `seat-B exited`, `unmerged idle`) each asserts zero `tab close` calls and tab retained; existing `completing a leaf via pane_hook` expectation unchanged at `['first','second']`. Pass.
- C3: `startup retains a merged leaf's worktree and branch while closing its tab` looped over `--resume` and `--all`; tab closed once, worktree + branch kept. Pass.
- C4: `startup retries closure...` renamed; failed pass closes tab once and keeps worktree/branch; retried pass moves owner, removes worktree + branch. Pass.
- C5: `a merged leaf whose tab is already gone...` removes tab + its panes from fake db, asserts no `tab close` call, drives `tab_closed` explicitly (fake emits no hook), failed closure keeps nonzero exit + `offline`, success exits 0. Pass.
- C6: `a merged leaf whose closure failed during phase merged closes its tab on the seat-A idle hook after moving` — owner moves to `issues/closed/`, tab still closed (rediscovery by slug over `discover`, which scans both `issues/open` and `issues/closed`). Pass.
- C7: `skills/merge-issue/SKILL.md` self-close `herdr tab close "$HERDR_TAB_ID"` act removed; `:47` and `:51` state the command closes the tab on idle/exit after `merged` and sweeps own worktree/branch removal. Pass.
- C8: `merge.md:27`, `limits.md:10`, `problems.md:51` all state hook passes close merged tabs and only sweeps delete worktrees/branches. Pass.
- C9: all three configured checks green (evidence above).

## Code review (src/next.ts)

- `closeMergedTab` extracted cleanly: no-op on undefined tab or no live pane carrying it; `z.string().parse` dropped where `stateSchema` already types `tab` as `string`. Same behavior as the removed lines.
- `cleanupMerged` calls `closeMergedTab` before the `issues/open` guard; worktree/branch removal stays guarded. Matches D2.
- Hook branch: close runs after `dispatchLeaf` + `dispatchDependents` (order unchanged), rediscovers by slug (correct — `completeOwner` can rename the owner into `issues/closed/`, phase.ts:172), filters seat A only (`routing.ts:32` makes `merge` slot A only) and excludes `pane_agent_status_changed` with `blocked`/`unknown`. `idle`/`done`, `pane_exited`, `pane_closed`, and bare `HERDR_PANE_ID` all close. Errors route through `report` (JSON stderr, exitCode 1 via `invocation.skipped`), no throw past the lock for `Error` values. Matches D3–D5.
- `tab_closed` branch untouched; `closeMergedTab` is a no-op there since no live pane carries the closed tab. Matches D4.
- No AREA.md changed in the diff; the three AREA files name only paths that exist. Index pointers unaffected.
- No mocks of the unit under test; tests use the real CLI + fake herdr/gh subprocess fixtures per standing design.

## Findings

### Fixes

None.

### Nits

- N1: `docs/guide/problems.md:51` says "Hook passes close the tabs of merged leaves" without the seat-A qualifier the code enforces (`pane.A` only). Functionally harmless for the page's question (a leftover tab does get closed), and `merge.md`/`limits.md` carry the seat wording; listed as a precision nit only.
- N2: Coverage gap, not a defect: no positive test exercises seat-A `pane_exited`/`pane_closed` or bare `HERDR_PANE_ID` (close-eligible per D4); the shared event filter makes all three reduce to the same code path already covered by the `idle` test.

## Verdict

ready
