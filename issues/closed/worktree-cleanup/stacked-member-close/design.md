# Design: stacked-member-close

## Binding decisions, verbatim

### After-merge remainder
From [after-merge-remainder.md](../../../chart/worktree-cleanup/forks/after-merge-remainder.md).

Operator, 2026-10-15 (Round 2): `1a | 2a | 3a | 4a | 5 - these need to be deleted and the akrogon folder and what it produces always needs to be clean. You have to check that it's not gonna mess something up, but I want all folders to be clean of junk and leftover files |`

- Q1 (stacked members) → 2a. Reason: the direct close existed until 6640ab5 and was lost when 9e4c093 restored stacking. Binding: when a stacked merge finishes, the merge path closes every merged member's tab and dispatches its dependents, as `closableMembers` did; a test covers a stacked merge whose member tabs close at once. Duplicate dispatch is harmless (already-started leaves are skipped). Foreclosed: relying only on the herdr hook chain.
- Q1 (dirty member worktree) → 3a. Reason: a leaf's own worktree is where seats work; uncommitted files may be real edits. Binding: kept as `uncommitted changes` and shown by Q2. Foreclosed: force-removing a merged leaf's own dirty worktree.
- Q2 → 4a. Binding: plain `akrogon status` prints each kept path and reason per repo, including with no open leaves, only for paths that still exist, labelled as the last cleanup's result; status never runs reconcile; a test covers status with no open leaves and one kept entry.
- Q3 → operator free text: unregistered folders "need to be deleted", and akrogon's folders and outputs must always be clean, after checking deletion cannot break anything. Foreclosed: keep-and-report for junk. Mechanism and scope moved to [store-hygiene](store-hygiene.md).

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: each done-criterion is proven by the cheapest test at the real boundary, here a reconcile, status or merge invocation over a temporary repo, temporary store and temporary leaf temp root set through the existing environment overrides (`HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_HOME`) and the existing test fixtures. A fix of a proven bug shows its test failing before and passing after; new behaviour shows one deliberate break turning its test red. No new test machinery: no runner, pool or fixture factory is built. No live model or outside call is part of any criterion. Secrets, auth and UI lines of the standing design do not apply.

## Leaf architecture

Owned surfaces: `reconcileBatch` in `src/next.ts`, run by `mergePass` inside `mergeWake` after `akrogon phase` returns, under the global lock; `dispatchDependents`; `closeMergedTab` in `src/reconcile.ts` as the existing tab-close call (proof P5). (C,D)

Where the close goes (C,D): as before 6640ab5, `reconcileBatch` collects the holder's merged `batch.members` (the old `closableMembers`) before it clears `holder.state.batch`, then after `dispatchDependents` closes each member's tab. Today it skips members already `merged` (the `phase !== 'merge'` check) because `batchPush` and `finishPush` in `src/phase.ts` moved them first, so the collection must read merged members. Member completion is reached from `batchPush` (normal push), `finishPush` (push result recovery) and `reconcileBatch` (next-pass recovery); every route ends in `reconcileBatch` with the members merged. (B,C,D)

State changed and its consumers: a member's tab closing fires herdr `tab_closed`, which runs `reconcile` for that repo (`src/next.ts` hook path); that pass then removes the member's worktree under existing rules. The holder seat must keep running: only member tabs are closed, never the holder's, and nothing here stops a slice (finished-leaf-processes stops slices from reconcile, outside the merge).

Reference: `git show 6640ab5~1:src/next.ts`, `closableMembers` and its call in `reconcileBatch`.

Exclusions: worktree removal (existing reconcile rules and scratch-copy-removal), kept display (kept-status).

Test path: criterion 1 runs through the command path that calls `mergeWake` (the CLI), not `phaseCommand` alone, which skips `mergeWake`. (D)
