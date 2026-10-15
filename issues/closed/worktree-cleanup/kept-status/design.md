# Design: kept-status

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

Owned surfaces: `statusCommand` in `src/status.ts` (plain branch), reading `readKept` / `keptReportPath` from `src/reconcile.ts`.

State read: `<globalHome>/reconcile/<repo>.json` written by `writeKeptReport` on each reconcile pass. Status never calls `reconcile`.

Exclusions: the host-wide report `<globalHome>/reconcile-host.json` and its status lines belong to store-sweep; what reconcile keeps belongs to scratch-copy-removal and store-sweep.

Open for the plan: placement of the kept lines in the plain layout (after each repo's leaf rows), and wording of the label.
