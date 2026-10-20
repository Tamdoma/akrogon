# Design: twin-guard

## Binding decisions, verbatim

### owner-reuse (chart issues/chart/owner-completion/forks/owner-reuse.md)

Operator 2026-10-19: "1a |" (answered the plain-language rewrite of round 1 after "elid").

- 1a: no owner name reuse. A later group gets a fresh name (example `satellite-plan-fit-2`), chosen by the chart writer, never by akrogon.

Binding avoidance mechanisms: akrogon refuses to dispatch any leaf under an open owner whose top-level name also exists under `issues/closed` or `issues/parked`, decided by folder existence (an empty folder counts), with an error naming the conflicting folder (A,B,C); the refusal covers only that owner's leaves, so other work keeps dispatching (A); one rule in one place, and any `status` display reuses it rather than copying it (B,C); explicit dispatch of a closed leaf by its `issues/closed/...` path keeps working (C); the `completeOwner` destination throw stays as the last guard (A,B,C); the test pinning twin-friendly dispatch (`tests/next.test.ts` "closed owner name does not block an open same-name owner") flips (A,B,C). The live twin is repaired once under fork stuck-repair, which must account for the 708 + 49 recorded log paths carrying the owner name (A,B,C rebuttals).

Reason: the owner name is the only identity for completion (`completeOwner` packs and renames the whole folder once) and for evidence (`locate` maps a log path to open|closed|parked/<owner>; `readLog` falls back to the first existing owner dir's archive). Foreclosed: appending into the closed owner at completion (new code for two index files, crash-safe move and a log-lookup window), moving the closed owner back to open, overwriting or silently renaming at completion, and leaving the refusal as door prose (it was written anyway).

Exclusions: close-witness 1a (source comment `delivered by <slug>`) belongs to leaf `slug-witness`. stuck-repair (the live framework twin) is done by the door on framework main, 2026-10-19; this leaf repairs no data.

### Standing design

Installed path: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md.

Interpretation for this leaf: the proof is the existing CLI test fixture driving `akrogon next` against a temporary repo, the real boundary, through the repo's `test` check. Criterion 1 is a bug fix, so its test is shown red before the change. Criteria 3 and 4 are the consequential negatives of the placement, written now (B,C). The flipped test's first half, and its exit-code-0 expectations, are false under the locked decision and are rewritten with that reason; its closed-path dispatch half is kept as criterion 5 (C T4). No machinery is built.

## Leaf architecture

Owned surfaces: `src/turn.ts` (`Block`, `blockDetail`, `eligibility`), `src/next.ts` (`dispatchLeaf`'s handling of a block, and the stderr report), the one twin predicate wherever the plan places it, and `tests/next.test.ts`.

Placement (B,C): the twin is a third `Block` kind beside `deps` and `inputs`, computed by one predicate and returned by both `blockDetail` (dispatch) and `eligibility` (merge-queue membership). Leaves are not removed from `discover`'s inventory. Mirroring duplicate-slug exclusion in `discover` is foreclosed: that inventory also feeds `unmergedDeps` (dependents of a merged twin leaf would read it as `unreadable` and block forever), `reconcile` (no worktree or tab cleanup), `activeCount` (an `unreadable` increment would hold capacity slots), `paneOwners`, and `reconcileBatch` (C T1, B F18).

Interface: a twin is an open leaf whose top-level owner name (first segment under `issues/open`) also exists as any entry under `issues/closed/` or `issues/parked/`; detection is filesystem existence, not leaf states. The refusal text names the open owner folder and the conflicting folder.

Settled consumers:
- `mergeQueue` (`src/turn.ts`) filters on `eligibility`, so both holder selections in `mergeTurn` (the `discover` pass and the locked `allLeaves` re-check) agree and a twin never heads the queue (B F17, C T3).
- `dispatchLeaf` (`src/next.ts`) checks the twin first, before its `merged` and `failed` branches and before deps and inputs, and the twin kind comes first inside `blockDetail` and `eligibility`, so a twin leaf in any phase gets the twin refusal and never another error (C F2). The refusal is never thrown: it goes through the existing `report` path keyed by the open owner folder (`report` de-duplicates by path), so it prints once per owner per pass and adds to `invocation.skipped`, which makes `nextCommand` exit 1. This one branch serves both `next <slug>` and `next --all`, because both reach `dispatchLeaf` with `picked=true` through `sweep` (B F20, C F1). The leaf stays in the inventory, so `resolveName` / `selectLeaves` still find it and no missing-leaf error appears (B F19, C T2).
- Every phase is refused, including `merge` (B F16, C T3). `reconcileBatch` stays unchanged and needs no twin case (B F21): a twin can only appear when new leaves are written into an open owner whose name already sits in closed or parked, because completion moves the only open copy and park/unpark refuse an existing destination (`src/park.ts` `already exists under`). With this guard such leaves never run, so no twin batch is ever recorded. The one live twin was repaired before this leaf, so no older twin batch exists.
- `unmergedDeps`, `reconcile`, `activeCount`, `paneOwners`, `reconcileBatch`: unchanged, because the inventory is unchanged.
- `completeOwner` (`src/phase.ts`) keeps its destination refusal unchanged. `allLeaves` (`src/state.ts`) and `akrogon phase` are unchanged.
- `akrogon status` (`src/status.ts` `scanRepo`) is excluded; if it ever shows the refusal, it reuses the same predicate, never a copy.

Open for the plan: where the predicate lives and how `eligibility`, which receives no `Repo`, derives the owner name from the leaf path.

Exclusions: `shapes.md` Preflight prose stays (the door still checks proposed names before writing). No auto-rename, no name suggestion in the error.
