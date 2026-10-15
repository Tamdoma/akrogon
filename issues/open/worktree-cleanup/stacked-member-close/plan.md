# Plan: stacked-member-close

## Decisions

- D1 — Restore the `closable` member list in `reconcileBatch` (`src/next.ts`), collected inside the existing lock before `holder.state.batch` is cleared: every leaf in `batch.members` at phase `merged` not already in `moved`. This is `closableMembers` from `git show 6640ab5~1:src/next.ts` minus the `tab !== undefined` filter (the after-lock call already tolerates a missing tab via `closeMergedTab`'s guard). This is the pre-6640ab5 step the brief names; no new mechanism.
- D2 — After the lock, keep the existing `moved` loop, then run the same close-then-dispatch pair for each `closable` member: `closeMergedTab(repo, leaf, await panes())` then `dispatchDependents(global, repo, leaf.state.slug, invocation, isAutomatic)`. Dependent dispatch rides on `dispatchDependents` for members that were already `merged` before the pass because a pass that lost the moves can also have lost the dispatch; `dispatchSlot`'s busy/same-session and `done` guards make a duplicate dispatch start nothing.
- D3 — The holder is never collected: `closable` comes from `batch.members` only, and `moved` only ever holds member slugs. The holder's tab keeps closing on idle as today.
- D4 — Collection must read phase under the lock from `allLeaves(repo)`, after the member-move loop, in every landed branch (`merge`, `failed`, and the already-`merged` holder branch that clears `batch`). In the failed-survivor branch the record is kept, so collection there is deferred to the pass that clears the record; surviving members still in `merge` are moved by that pass anyway.
- D5 — One unit, serial-solo run: product change and planned tests land in `src/next.ts` + `tests/batch-dispatch.test.ts` + `docs/guide/merge.md` on this leaf branch, implemented by A directly.
- D6 — Docs: `docs/guide/merge.md` reconcile paragraph gains one clause stating the landed reconcile closes each merged member's tab and dispatches its dependents. No other doc states this mechanism; limits.md and problems.md already cover hook/sweep close generically and stay unchanged.

## Read first

- `src/next.ts` — `reconcileBatch` (~918), `mergeTurn`/`mergePass`/`mergeWake` (~1014, 1170, 1192), `dispatchDependents` (~1210), `dispatchSlot` dedup guards (~570).
- `src/phase.ts` — `batchPush` (~571) and `finishPush` (~707): the two routes that move members to `merged` before `reconcileBatch` runs.
- `src/reconcile.ts` — `closeMergedTab` (113).
- `git show 6640ab5~1:src/next.ts` — `closableMembers` (~909) and its two collection sites inside the landed branch of `reconcileBatch` (~1014, 1019), the `closable` close loop (~1059).
- `tests/batch-dispatch.test.ts` — dispatchFixture/allocatedLeaf/toMerge/stacked helpers; the "one push" stacked-merge test is the extension point.
- `tests/helpers.ts` + `tests/fake-herdr.ts` — fixture, fake herdr `tab close`/`pane list`, `.calls` log.

## Interfaces

- `closeMergedTab(repo, leaf, live: Pane[] | null)` — closes `leaf.state.tab` only when a live pane carries it; returns false otherwise.
- `dispatchDependents(global, repo, slug, invocation, isAutomatic)` — sweeps open leaves `blocked-by` the member.
- `invocation.dispatched` + `dispatchSlot` `done`/`busy`/`prompted` guards — already-started dependents are skipped (criterion 4).

## Checklist

### Wave 1 (serial-solo, A implements)

**U1 — merged-member close and dispatch in `reconcileBatch`**

- Owns: `src/next.ts` (reconcileBatch), `docs/guide/merge.md` (reconcile paragraph clause).
- Tests used: planned cases in `tests/batch-dispatch.test.ts` (U2's file is shared but the test commit lands before product code; the cases below are written now by the planner).
- Depends on: nothing.

Acceptance evidence per done-criterion:

1. **Normal landed push closes both member tabs and dispatches each member's dependents** — real boundary: `akrogon phase aa merged --slot B --attempt <id>` over a fixture stack {holder aa, members bb, cc} with dependents depb/depcc. Observe fake-herdr `tabs` no longer contains bb/cc tabs and prompts record exactly one `plan-issue` prompt per dependent. Size: minutes. Rerun trigger: any change to `reconcileBatch`, `batchPush`, or `mergePass`. Existing test covers the landing itself; the new assertions extend `a clean waiting leaf stacks under the holder and lands with it in one push` into a two-member variant.
2. **Push reported failed, later fetch confirms landed** — real boundary: same command through a `git` shim that exits 1 for `push` after the real push already applied (simulating a lost response). `finishPush` recovers via ancestry, `mergeWake` reconcile closes member tabs and dispatches dependents. Observe member tabs gone from fake-herdr `tabs` and dependent prompts recorded. Size: minutes. Rerun trigger: changes to `finishPush`, `batchPush` error handling, or `reconcileBatch`.
3. **Holder tab survives** — both tests assert `db.tabs` still contains the holder tab after the merge pass.
4. **Dispatch dedup** — test 1 runs a second `akrogon next --all` after the merge and asserts the dependents' `plan-issue` prompt count stays one each.

Proof commands (run via `akrogon run-check`):

- `akrogon run-check --name 'test' -- bun test tests/batch-dispatch.test.ts` — contains all four criterion cases. (One command proves all criteria; the runner exists at AKROGON_BASE.)

New tests written at planning, shown red against the unfixed code:

- `a landed stack closes each member tab and wakes member dependents at once` — criteria 1, 3, 4. Red output: `expect(database(f).tabs.map((tab) => tab.tab_id)).toEqual([aaTab])` received `["w1:t1", "w1:t5", "w1:t9"]` — both member tabs still open after the merge pass.
- `a push reported lost but landed closes member tabs in the recovery wake` — criteria 2, 3. Red output: `expect(database(f).tabs.map((tab) => tab.tab_id)).toEqual([aaTab])` received `["w1:t1", "w1:t5"]` — the member tab still open after the recovery wake.

Deliberate-break note (post-implementation check, not a planned test): the fix removes the whole missing step rather than guarding it; red evidence is the pre-commit failure of the two new cases above.

## Risks / limitations

- R1 — `dispatchDependents` for an already-`merged` member may find the dependent already allocated; guards skip it, so no double start (brief calls this harmless).
- R2 — A member closed mid-`merged` with a live pane gets `herdr tab close`; `closeMergedTab` checks live panes first, same as the old code.
- R3 — Limitation kept: a member that is already `merged` with no tab is not collected, and nothing else closes it later; that matches the pre-6640ab5 semantics and no criterion covers it.
- R4 — If `reconcileBatch` clears the record while a member is still in `merge` (drifted branch), that member's tab closes only after its own later merge; unchanged from old semantics, no criterion covers it.

## Conflicts

None found between brief and design; design adds the precise insertion point (inside the lock, before `saveState` clears `batch`).

## No new proof machinery needed

Existing `akrogon run-check` + `bun test` + the dispatchFixture/fakeHerdr harness cover every criterion.
