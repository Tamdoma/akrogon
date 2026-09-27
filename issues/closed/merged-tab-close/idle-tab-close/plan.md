# Plan: idle-tab-close

Direct synthesis (debate: no). Source: brief.md + design.md + live `src/next.ts`, `src/phase.ts`, `tests/next.test.ts`, `tests/fake-herdr.ts`.

## Decisions

- D1: Extract `closeMergedTab(leaf: Leaf): Promise<void>` in `src/next.ts` from the current tab-close lines. No-op when `leaf.state.tab` is undefined or no live pane still carries that tab; otherwise run `herdr tab close <tab>`. Never throws for an already-gone tab.
- D2: `cleanupMerged` calls `closeMergedTab` before the `issues/open` guard. Worktree removal and branch deletion stay behind the guard unchanged.
- D3: Pane-hook branch (`input === undefined && hookPane !== undefined`): after the existing `dispatchLeaf` + `dispatchDependents`-on-`completed` (order unchanged), rediscover the leaf by slug via `discover(owner.repo, invocation)` and close when all hold: rediscovered leaf exists, `phase === 'merged'`, `hookPane === rediscovered.state.pane.A`, and event is not `pane_agent_status_changed` with `blocked` or `unknown`. Rediscovery by slug (not `owner.leaf.path`) because `completeOwner` can rename the owner into `issues/closed/`.
- D4: Event filter relies on the existing early return for `working` status at the top of `nextCommand`; everything else reaching the hook branch (`idle`/`done`, `pane_exited`, `pane_closed`, bare `HERDR_PANE_ID` with no event) is close-eligible for seat A. Seat B and non-owner panes never close. The `tab_closed` branch is unchanged: it dispatches again and `closeMergedTab` is a no-op there since no live pane carries the tab.
- D5: Hook close errors go through `report(invocation, repo.name, leaf.path, error, slug)` like `cleanupRepos` (exit 1 with a JSON report, no throw past the lock). `completeOwner` closure errors keep today's path (reported inside `dispatchLeaf`, nonzero exit, `offline` text unchanged).
- D6: Tests run the real CLI via `tests/helpers.ts` + `tests/fake-herdr.ts` with real `HERDR_PLUGIN_EVENT_JSON` / `HERDR_PANE_ID` env. No new mocks. The `tab_closed` follow-up is driven explicitly because the fake emits no hook on `tab close`.
- D7: `skills/merge-issue/SKILL.md` drops the `herdr tab close "$HERDR_TAB_ID"` last step; skill + guide text state the command rule (hook closes merged tabs on seat-A idle/exit, sweeps close any remainder, worktree/branch wait for the owner move).

## Read-first

`docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `skills/AREA.md`, `learnings/LESSONS.md`, `src/next.ts` (hook branch, `cleanupMerged`), `src/phase.ts` (`completeOwner`), `src/pull.ts` (`closeSources`), `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/next.test.ts`, `skills/merge-issue/SKILL.md`, `docs/guide/merge.md`, `docs/guide/limits.md`, `docs/guide/problems.md`.

## Needed interfaces

- New: `closeMergedTab(leaf: Leaf): Promise<void>` (D1).
- Existing, unchanged signatures: `discover(repo, invocation): Inventory`, `dispatchLeaf(...)`, `dispatchDependents(...)`, `cleanupMerged(repo, leaf)`, `completeOwner(repo, leaf, justMerged)`, `panes()`, `command(argv)`, `report(invocation, repo, path, error, slug?)`, `hookEventSchema` (`pane_agent_status_changed` / `pane_exited` / `pane_closed` / `tab_closed`).
- Test surface: `next(f, args, env)`, `database(f)`, `calls(f)`, `leaf(f, slug, phase, extra, container)`, `saveState`/`readState`, fake `gh` fixture for closure failure.

## Acceptance criteria

- C1 (brief 1): merged leaf under `issues/open/` with unfinished epic sibling; seat-A pane reports `idle` via hook env; tab gone from fake db, one `tab close` call, worktree + branch kept.
- C2 (brief 2): same leaf keeps tab on seat-A `blocked`/`unknown`, on seat-B `idle`/exit; unmerged leaf going `idle` keeps tab; existing `completing a leaf via pane_hook starts only same-repo dependents` (seat-B `pane_exited`) keeps expected tabs `['first','second']`.
- C3 (brief 3): `next --resume` and `next --all` on the sibling-waiting merged leaf close its tab, keep worktree + branch; update `startup retains completed issue resources while an epic sibling remains unfinished` to expect this.
- C4 (brief 4): update `startup retries closure ...` test (rename title to state the tab closes while worktree/branch are retained on the failed pass); failed pass closes tab, keeps worktree + branch; later successful retry closes source, removes worktree + branch.
- C5 (brief 5): merged leaf with tab already gone: no `tab close` call, no tab error; explicitly drive the following `tab_closed` hook; success pass exits 0; closure-failure pass keeps nonzero exit + `offline` error.
- C6 (brief 6): closure failed during `phase merged`, then succeeds on seat-A idle hook: owner moves to `issues/closed/`, hook still closes tab, no failure on moved path.
- C7 (brief 7): merge-issue skill has no self-close step; states command closes tab on seat idle after `merged`, sweeps remove worktree/branch after the folder move.
- C8 (brief 8): `docs/guide/merge.md`, `limits.md`, `problems.md` state hook passes close merged tabs and only cleanup passes delete worktrees/branches; grep of `skills/` + `docs/` for `tab close` / `closes its tab` finds no text saying the merge seat closes its own tab.
- C9 (brief 9): `bun run format`, `bun run typecheck`, `bun test` pass.

## Checklist (ordered)

1. `src/next.ts`: add `closeMergedTab` (D1); call it before the guard in `cleanupMerged` (D2); add hook-branch close after dependants dispatch with rediscovery + seat/event filter + `report` on error (D3-D5). Covers C1-C6.
2. `tests/next.test.ts`: new hook close test (seat-A `idle`, C1); negative matrix test (seat-A `blocked`/`unknown`, seat-B `idle`/`pane_exited`, unmerged idle, C2); update epic-sibling test for `--resume` + `--all` (C3); update + rename closure-retry test (C4); idempotent + explicit `tab_closed` test incl. exit codes (C5); hook-retry-after-failed-closure test with owner move (C6). Keep the `pane_hook` dependents expectation at `['first','second']` (C2).
3. `skills/merge-issue/SKILL.md` (agent doc): delete the `herdr tab close "$HERDR_TAB_ID"` last act; rewrite the two touched lines so the command owns tab close on idle and sweeps own worktree/branch removal. Covers C7.
4. `docs/guide/merge.md` (human doc): replace the merge-seat-closes-tab sentence with the command rule. Covers C8.
5. `docs/guide/limits.md` (human doc): update the cleanup-vs-idle-events bullet so hook passes close merged tabs and only sweeps delete worktrees/branches. Covers C8.
6. `docs/guide/problems.md` (human doc): update the completed-worktree answer to match the rule. Covers C8.
7. Run `bun run format`, `bun run typecheck`, `bun test`; run the grep from C8. Covers C9.

Dependencies: none. Base: origin/main at 17fa33a or later.

## Verification

- `bun test tests/next.test.ts -t 'startup retains completed issue resources'` (updated, C3).
- `bun test tests/next.test.ts -t 'startup retries closure'` (renamed, C4).
- `bun test tests/next.test.ts -t 'completing a leaf via pane_hook'` (unchanged expectation, C2).
- New tests by title for C1, C2, C5, C6.
- `grep -rn 'tab close\|closes its tab' skills/ docs/` shows no merge-seat self-close text (C8).
- Full: `bun run format`, `bun run typecheck`, `bun test` (C9).

## Open limitation

If Herdr never delivers a seat-A idle/exit event and no sweep runs, the merged tab stays open until the next cleanup pass; the hook close also sees only the live pane listing at that moment.

## Credentials

None named by the brief or design; no env presence check required.
