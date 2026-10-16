# Sub-brief 1: release-any-phase code units (D1-D7)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/release-any-phase-u1
Leaf branch HEAD: 9eda855. Tests are already planned and committed in `tests/release-any-phase.test.ts`; they are red on this HEAD. You write and edit no test except the fixture seam in step 4.

## 1. Goal

Make reconcile release resources of unfinished leaves: a loaded `akrogon-l*` slice of any leaf (not just merged/failed) whose recorded tab is proven gone is stopped, unless it is the pass's own slice or a live run record names it; an unfinished leaf with no recorded tab is never stopped; a leaf temp is kept when the unit inventory is unreadable; every dispatch path holds the global lock so no pass acts on a half-made dispatch. Plan decisions D1-D7 in `plan.md` (leaf folder: `/home/ivan/Work/infra/akrogon/issues/open/temp-release/release-any-phase`).

## 2. Acceptance criteria

- A1: `bun test tests/release-any-phase.test.ts --timeout=30000` passes all 10 tests.
- A2: `bun run typecheck` is clean on the files you changed.
- A3: `bunx prettier --check src tests` is clean on the files you changed.
- A4: No `stop` call for a slice reaches the fake systemctl log for a kept slice; kept reasons recorded in the reconcile reports are exactly `live run record`, `live tab`, `pane list unavailable`, `unfinished leaf`, `own slice` as applicable.
- A5: The manual merge dispatch test shows the concurrent `next --all` blocked until dispatch completed: one new tab, exactly two seat-adoption busctl calls into the slice, temp kept.

## 3. Read-first list

- `src/reconcile.ts` — `sliceKeepReason` (~line 160), the per-repo slice loop (~line 470-500), `reconcileNeedsPanes` (~line 397-420), the leaf-temp branch in the scratch-root walk (~line 951-973), `reconcileHost` leaf-match block (~line 1045-1070).
- `src/next.ts` — `dispatchMergeLeaf` (~line 1160-1177), `reconcileBatch` post-lock `closeMergedTab`/`dispatchDependents` loop (~line 999-1003), `allocate` (~line 428-567) to see where the tab is recorded (`saveState(leaf.path, tabState)`) vs seats adopted (`box(first)`, `box(second)`).
- `src/state.ts` — `withLock` signature.
- `src/leftovers.ts` — `unitInUse` list.
- `tests/fake-busctl.ts` — the whole file is short; `FAKE_SYSTEMCTL_DB`/`FAKE_SYSTEMCTL_LOG` handling exists in `tests/fake-systemctl.ts` as the pattern to copy for the new seam.
- `tests/release-any-phase.test.ts` — the committed planned tests; their helper names show exactly what the code must do.
- `tests/leaf-slices.test.ts` — wrapper-script pattern for a gated `systemctl`/`herdr` binary (the `continue-stop` test) if you need it for reasoning.
- Skill folder `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

In `src/reconcile.ts`:

1. `sliceKeepReason` — add, before the `leaf.state.tab !== undefined` block: `if (leaf.state.tab === undefined && !finished(leaf)) return 'unfinished leaf';`. Everything else unchanged (finished leaves with no tab still stop).
2. Per-repo slice loop in `reconcile` — delete `if (!finished(leaf)) continue;` so every leaf's loaded slice goes through `sliceKeepReason`.
3. `reconcileHost` — delete `if (match !== undefined && !finished(match.leaf)) continue;` so every leaf-matched slice goes through the existing `sliceKeepReason` call with the current `view` selection (`match.leaf.state.tab === undefined ? panes : await livePanes()`).
4. `reconcileNeedsPanes` — replace the `finishedLeaves` tail. Keep `if (leaves.some((leaf) => leaf.state.phase === 'merged' || leaf.state.phase === 'failed') && leaves.some((leaf) => leaf.state.tab !== undefined)) return true;` semantics (a finished leaf with a recorded tab always needs panes: closeTab path). Then the candidate rule: a slice-stop candidate is `finished(leaf) || leaf.state.tab !== undefined`; if any such candidate exists, `loaded === null` returns true and otherwise `candidates.some((leaf) => loaded.has(leafSlice(repo, leaf.state.slug)))` decides. Read the current tail (lines ~405-420) and reshape minimally.
5. Leaf-temp branch in `reconcile` — inside `kept.length === keptBefore`, before the slice-busy check, add `loadedSlices === null → keep(dir, 'unit list unavailable', '<one-line clears text>')`. Keep the existing `done` gates and silent unfinished paths exactly as they are.

In `src/leftovers.ts`: add `'unfinished leaf'` to `unitInUse` (it is a keep while the leaf is in flight, like `live tab`).

In `src/next.ts`:

6. `dispatchMergeLeaf` — wrap the manual call in the global lock identically to the automatic branch:
```ts
if (!isAutomatic) {
  await withLock(resolve(globalHome(), '.lock'), async () => {
    await dispatchLeaf(global, repo, leaf, false, invocation, mergeContext, false, attempt);
  });
  return;
}
```
7. `reconcileBatch` post-lock loop (~line 999-1003) — wrap the `for (const leaf of [...moved, ...closable])` loop (and its existing pause guard) in `withLock(resolve(globalHome(), '.lock'), ...)` so `closeMergedTab` and `dispatchDependents` run under the lock. Keep the `isAutomatic && isPaused` semantics (re-check inside the lock).

In `tests/fake-busctl.ts` (test seam, D7): after the existing `busctl.calls` append, when `process.env.FAKE_SYSTEMCTL_DB` is set, read that JSON file (`{ units: [{unit, sub, cgroup?}] }`), upsert `{ unit: <call.slice>, sub: 'active' }` with no `cgroup` if absent, and write it back — mirroring a slice becoming loaded when a unit starts inside it. Do nothing when the var is unset. This file is matched by `src/test-files.ts` (a `fake-*` helper under `tests/`): your commit must carry a `Test-Change: tests/fake-busctl.ts <source and reason>` trailer.

Do not touch `tests/release-any-phase.test.ts` or any other test file.

## 5. Do-not, reasons and exceptions

- Do not change `sliceKeepReason`'s existing keep reasons, the `stoppedSlices` bookkeeping, or the `finished` helper name — other callers rely on them. Exception: none; return a mismatch if a criterion cannot go green without it.
- Do not add locking anywhere else: `dispatchLeaf`'s other callers already run inside `withLock`; `reconcile`'s callers all run inside it too (verify by reading `nextCommand`, `tab_closed` branch, `unpausePass` before trusting this). Exception: if you find a third dispatch path outside the lock, return a mismatch with the call site instead of fixing it.
- Do not touch the leaf temp's `done` gates, `livePaneInside`/`dropChecked` order, or the worktree-removal rules.
- Do not write or edit tests; a planned test that stays red after your code is correct is a mismatch returned to A, with the failing output.
- A `Test-Change:` trailer is required on any commit touching `tests/fake-busctl.ts` (see section 4); it is not required for `src/*` edits.

Reasons restated: the test file is A's evidence contract and `fake-busctl.ts` is governed by the trailer rule; out-of-scope edits and extra locking both create review debt and races the plan did not authorize.

## 6. Ordered steps

1. `cd /home/ivan/.akrogon/worktrees/akrogon/release-any-phase-u1 && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'`.
2. Read the read-first files; then edit `src/reconcile.ts` (items 1-5), `src/leftovers.ts`, `src/next.ts` (items 6-7), `tests/fake-busctl.ts` (item 4's seam).
3. Run `bun test tests/release-any-phase.test.ts --timeout=30000` through `akrogon run-check` (section 7) and repair your code until green; each failure tells you which criterion is still unmet.
4. Run typecheck and prettier (section 7); fix what they flag in your files only.
5. Commit with `git -c user.name=akrogon -c user.email=akrogon@localhost commit`; the `tests/fake-busctl.ts` change needs the `Test-Change:` trailer described above.

Advisory size: 4 files, under 30 turns.

## 7. Commands

From the worktree (`/home/ivan/.akrogon/worktrees/akrogon/release-any-phase-u1`):

- Targeted tests: `akrogon run-check --name u1-tests -- bun test tests/release-any-phase.test.ts --timeout=30000`
- Typecheck: `bun run typecheck`
- Format check: `bunx prettier --check src/reconcile.ts src/next.ts src/leftovers.ts tests/fake-busctl.ts`

Never `akrogon verify`, never the full `bun test` suite.

## 8. Done-when, evidence and report

Done when all 10 tests in `tests/release-any-phase.test.ts` pass, typecheck and prettier are clean, and the work is committed on the worktree HEAD. Report cites the `check u1-tests: 0 <path>` line, lists changed files and reasons, notes any test that passed only after multiple attempts, and flags unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
