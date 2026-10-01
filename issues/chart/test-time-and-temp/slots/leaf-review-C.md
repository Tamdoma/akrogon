# Leaf review, slot C

Reviewed 2026-10-01 as the receiving implementer. Draft paths are relative to the scratchpad `drafts/` folder. Five disagreements, all on leaf-temp-dir. base-red: no disagreements.

## D1. Catch-up cleanup would run `git worktree prune` once per merged leaf on every sweep

- Draft: `leaf-temp/leaf-temp-dir/design.md:35` says `cleanupMerged` "does the same" (delete, then prune), with no condition on the folder existing.
- Code: `cleanupRepos` calls `cleanupMerged` for every merged leaf (`src/next.ts:642-651`), and `discover` reads `issues/closed` too (`src/state.ts:105`). Merged leaves today: framework 234, akrogon 83. Every `akrogon next`, `--all` and `--resume` would spawn that many `git worktree prune` processes for folders deleted long ago.
- Replacement for the sentence "`cleanupMerged` (`src/next.ts:559-566`) does the same before the `issues/open` early return, only when no live pane belongs to the leaf's tab.":

  > `cleanupMerged` (`src/next.ts:559-566`) does the same before the `issues/open` early return, only when the temp folder exists and no live pane belonged to the leaf's tab before `closeMergedTab` ran. A leaf whose folder is already gone costs one `existsSync` and no git call.

## D2. "No live panes" must be judged before `closeMergedTab`, or the catch-up becomes the foreclosed option

- Draft: `design.md:35` "only when no live pane belongs to the leaf's tab", and `brief.md:13` "leaves it while the tab still has live panes".
- Code: `cleanupMerged` first calls `closeMergedTab`, which closes the tab (`src/next.ts:552-560`). Checked after that call, the tab never has live panes, so deletion follows the close command directly. `forks/leaf-temp.md:38` forecloses "delete right after the tab-close command".
- The D1 replacement text covers the design. Replacement for `brief.md:13` (criterion 4):

  > 4. A test shows a sweep (`akrogon next` without an event in a repo) deletes a merged leaf's temp folder when its tab had no live panes at the start of the sweep, including while the leaf is still under `issues/open`; when the tab still had live panes, the sweep closes the tab and leaves the folder.

## D3. The `tab_closed` branch has no `report()` path

- Draft: `design.md:35` "errors propagate to the existing `report()`".
- Code: the `tab_closed` branch (`src/next.ts:721-731`) has no try/catch. Only `cleanupRepos` (`:645-650`) and `dispatchLeaf` wrap errors into `report()`. A thrown `rmSync` or prune error there would abort the hook run with a raw exception.
- Replacement for "Deletion is `rmSync(path, { recursive: true, force: true })`; errors propagate to the existing `report()`.":

  > Deletion is `rmSync(path, { recursive: true, force: true })`. In `cleanupMerged` errors reach the existing `report()` through `cleanupRepos`. The `tab_closed` branch wraps its deletion in the same `try`/`report(invocation, repo.name, leaf.path, error, slug)` form `cleanupRepos` uses (`src/next.ts:645-650`); the next sweep retries.

## D4. Stale line reference

- Draft: `design.md:35` cites the `tab_closed` branch as `src/next.ts:728-738`.
- Code: the branch is `src/next.ts:721-731`. Lines 732-755 are the hook-pane branch, which must not get the deletion.
- Replacement: `src/next.ts:721-731`.

## D5. Criterion 1 asks for two things a single dispatch cannot show

- Draft: `brief.md:10` "the leaf tab create and both pane splits carry `--env TMPDIR=...`, and the folder exists with mode 0700 before the first herdr call that uses it".
- Code, splits: a fresh dispatch creates the tab (its first pane is seat A) and makes one split (`src/next.ts:321-338`). Two splits happen only when an existing tab has lost both recorded panes.
- Code, ordering: `tests/fake-herdr.ts:36` records only argv, so "before the first herdr call" needs a new fake feature for no user-visible gain. The design already fixes the order ("before building `placement`").
- Replacement for criterion 1:

  > 1. A test in `tests/next.test.ts` dispatching a leaf through the fake herdr shows the tab create and every pane split call carry `--env TMPDIR=<leaf temp folder>`, and after the dispatch the folder exists with mode 0700.

## Checked, no disagreement

- Path length: 17 + 10 + 1 + 20 + 1 + 12 = 61 bytes, under 62.
- Criteria 8 (leaf-temp) and 5 (base-red) cite only `format`, `test`, `typecheck`, which are the destination's blocking `checks`.
- No owned surface touches `issues/`. The `issues/` mentions are provenance only.
- base-red interfaces: `check.review -> failed` is legal (`src/routing.ts`), `failed` requires `--reason` (`src/phase.ts:193`), review seats already use `failed --slot` (`skills/check-issue/SKILL.md:25`), and the cited skill lines (34, 48, 62; 49, 51; 55-59) match.
- Guide line references `merge.md:33`, `problems.md:53`, `limits.md:10` match.
- Both `state.yaml` files parse against `stateSchema` (`src/state.ts:34-44`) and start at `plan.positions` for debate yes.
