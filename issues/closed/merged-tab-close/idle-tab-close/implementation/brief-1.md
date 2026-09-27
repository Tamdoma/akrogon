# Brief 1: idle-tab-close command + tests

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/idle-tab-close`. Edit only there. Do not commit.

## 1. Goal

Implement plan D1–D5 (`src/next.ts`) and the C1–C6 tests (`tests/next.test.ts`) for leaf `idle-tab-close`: the command closes every merged leaf's Herdr tab on the merge seat's idle/exit hook and on cleanup passes, while worktree/branch removal still waits for the owner folder to leave `issues/open/`.

## 2. Numbered acceptance criteria

- B1.1 (C1): merged leaf under `issues/open/` with an unfinished epic sibling; seat-A pane reports `idle` through real `HERDR_PLUGIN_EVENT_JSON` + `HERDR_PANE_ID`; afterward the tab is gone from the fake db, exactly one `tab close` call was made, worktree and branch still exist.
- B1.2 (C2): the same merged leaf keeps its tab when seat A reports `blocked` or `unknown`, and when seat B reports `idle` or exits; an unmerged leaf whose pane goes `idle` keeps its tab; existing test `completing a leaf via pane_hook starts only same-repo dependents` keeps expected tabs `['first','second']`.
- B1.3 (C3): `next --resume` and `next --all` on the sibling-waiting merged leaf close its tab and keep worktree + branch; update `startup retains completed issue resources while an epic sibling remains unfinished` to expect this (suggest: loop the test over both modes with a fresh fixture each, copying the `for (const path of ...)` pattern already in the file).
- B1.4 (C4): update `startup retries closure before cleanup and retains failed owners with their worktree branch and tab`: after the failed pass the tab is closed, worktree + branch kept, nonzero exit + `offline` error unchanged; later successful retry still closes the source and removes worktree + branch; rename the title to state the tab closes while worktree/branch are retained.
- B1.5 (C5): merged leaf whose tab is already gone makes no `tab close` call and adds no tab error; explicitly drive the following `tab_closed` hook (the fake emits none); success pass exits 0; closure-failure pass keeps nonzero exit + `offline`.
- B1.6 (C6): closure failed during `phase merged`, then succeeds on the seat-A idle hook: owner moves to `issues/closed/`, hook still closes the tab, no failure on the moved path.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/next.ts` (`cleanupMerged`, pane-hook branch, `report`, `discover`, top `working` early-return)
- `src/phase.ts` (`completeOwner` moves owner to `issues/closed/`)
- `tests/next.test.ts` (copy: `startup retries closure...` ~line 1806 with fake `gh` fixture; `startup retains completed issue resources...` ~line 1854; `completing a leaf via ...` loop ~line 603; `exited hooks resolve persisted pane hints` hook-env shape)
- `tests/fake-herdr.ts` (`tab close` removes tab + panes, appends to `.calls`; emits no hook)
- `tests/helpers.ts` (`leaf`, `cli`, `next`, `database`, `calls` usage as in `tests/next.test.ts`)

## 4. Change list and needed interfaces

`src/next.ts` only:

- New `closeMergedTab(leaf: Leaf): Promise<void>`: return when `leaf.state.tab` is undefined; capture the id in a const (closure typecheck), return when no live pane still carries it; else `command(['herdr', 'tab', 'close', tab])`.
- `cleanupMerged`: call `await closeMergedTab(leaf)` first, before the `within(leaf.path, .../issues/open)` guard; keep the worktree/branch lines behind the guard byte-identical. Current body:
```ts
async function cleanupMerged(repo: Repo, leaf: Leaf): Promise<void> {
  if (within(leaf.path, resolve(repo.root, 'issues/open'))) return;
  const members: Pane[] = (await panes()).filter((pane) => pane.tab_id === leaf.state.tab);
  if (members.length > 0) await command(['herdr', 'tab', 'close', z.string().parse(leaf.state.tab)]);
  if (leaf.state.worktree !== undefined && existsSync(leaf.state.worktree)) {
    await command(['git', 'worktree', 'remove', '--force', leaf.state.worktree], repo.root);
    await command(['git', 'branch', '-d', leaf.state.slug], repo.root);
  }
}
```
- Hook branch (`input === undefined && hookPane !== undefined`): keep `dispatchLeaf` then `dispatchDependents`-on-`completed` order; then rediscover by slug via `discover(owner.repo, invocation).leaves.find((l) => l.state.slug === completedSlug)` and close when rediscovered leaf exists, `phase === 'merged'`, `hookPane === rediscovered.state.pane.A`, and `event` is not `pane_agent_status_changed` with `blocked`/`unknown` (undefined event counts as eligible; `working` already early-returns at the top of `nextCommand`). Wrap this step in try/catch routing failures to `report(invocation, owner.repo.name, rediscovered?.path ?? owner.leaf.path, error, completedSlug)`; never throw past the lock. Existing branch ends:
```ts
        const outcome: DispatchOutcome = await dispatchLeaf(global, owner.repo, owner.leaf, false, invocation);
        if (outcome === 'completed') await dispatchDependents(global, owner.repo, completedSlug, invocation);
        return;
```
- `report(invocation, repo: string, path: string, error: Error, slug?: string): void`, `discover(repo, invocation): Inventory` (`leaves: Leaf[]`) — signatures unchanged.
- Leave the `tab_closed` branch untouched.

`tests/next.test.ts` only: new tests for B1.1, B1.2 (fresh fixture per negative sub-case: seat-A `blocked`, seat-A `unknown`, seat-B `idle`, seat-B `pane_exited` with pane removed from db, unmerged idle), B1.5, B1.6; updates for B1.3, B1.4. Real CLI + real hook env only, no new mocks. Hook env shape:
```ts
{ HERDR_PANE_ID: a, HERDR_PLUGIN_EVENT_JSON: JSON.stringify({ event: 'pane_agent_status_changed', data: { type: 'pane_agent_status_changed', pane_id: a, workspace_id: 'w1', agent_status: 'idle' } }) }
```

## 5. Do-not, reasons and exceptions

- Do not change `completeOwner`, `closeSources`, `--all`/`--resume` selection, or the broadcast-issue skill: locked scope, worktree timing must not move (exception: revised brief from B).
- Do not touch the `tab_closed` branch or any doc file: docs are unit 2; the `tab_closed` path needs no new call (exception: revised brief from B).
- Do not add mocks or helpers outside the two files: the suite contract is real CLI + fake-herdr boundary (exception: revised brief from B).
- Do not commit, do not touch `issues/` inside the worktree, do not leave scratch files in the worktree (use `/tmp` for logs): B owns the branch commit and `akrogon phase` refuses `issues/` files on it (no exception).
- Do not change scope or an interface on mismatch: return a mismatch naming the conflicting requirement, actual code, and smallest brief correction (exception: revised brief from B authorizing it).
- Reasons restated: scope stays locked so review checks what the plan promised; the branch stays clean so handoff is not refused; mismatches return to B because only B revises the brief.

## 6. Ordered steps

1. `tests/next.test.ts`: write the B1.1 hook-close test first; run changed tests to show red (no close happens yet).
2. `src/next.ts`: add `closeMergedTab`, rewire `cleanupMerged`, add the hook-branch step; rerun to show B1.1 green.
3. `tests/next.test.ts`: add B1.2 negatives, B1.5 idempotent + explicit `tab_closed`, B1.6 hook-retry-with-move; update B1.3 (both modes) and B1.4 (title + expectations); confirm the `pane_hook` dependents test still expects `['first','second']`.
4. Rerun changed tests; confirm `git status --porcelain` in the worktree shows only `src/next.ts` and `tests/next.test.ts`.

Advisory size: 2 files, under 12 turns.

## 7. Commands

```sh
export AKROGON_BASE=17fa33ab58b727534ec542790fd6a6d11bb65de7
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```
Run from the worktree. This is the only test command; B runs the full suite.

## 8. Done-when, evidence and report

Done when B1.1–B1.6 pass via the command in section 7 with red-then-green shown for B1.1, and the worktree diff touches only the two files. Paste command results. Name limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
