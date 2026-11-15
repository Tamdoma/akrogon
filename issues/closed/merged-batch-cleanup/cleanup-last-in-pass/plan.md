# Plan: cleanup-last-in-pass

Brief: `akrogon next` (every mode) and the unpause pass run `reconcileRepos` after the merge step instead of before it, once per invocation, under the global lock, same repos and `isAutomatic` flag, fresh leaf read. `mergeWake` unchanged. A merged leaf whose batch the pass releases is cleaned by that same pass.

Design locks: cleanup runs last in a pass; the pre-merge call is moved, not duplicated, unless a same-pass dependency is named (none found — see D4); no new state, timer, event or listener change.

## Decisions

- **D1** — `nextCommand`: remove the three `reconcileRepos` calls inside the pre-merge `withLock` (single-leaf, `--all` both branches, `--resume`/`--wake`). After the `for (const { repo, isAutomatic } of touched.values())` merge loop, add `await withLock(resolve(globalHome(), '.lock'), async () => reconcileRepos([...touched.values()].map((entry) => entry.repo), invocation, [...touched.values()].some((entry) => entry.isAutomatic)))`. Every `touched` entry in one invocation shares one `isAutomatic` value (selection/`--all` → false, `--resume`/`--wake` → true), so `.some` restates the flag the old calls carried. The `selection !== undefined || leaves.length > 0` gate already scopes the block, matching today's cleanup scope; the moved call's own `isAutomatic && isPaused` recheck inside `reconcileRepos` honors a pause raised during the merge step.
- **D2** — `unpausePass`: keep the sweep `withLock` unchanged (drop only its `reconcileRepos` line), then `await mergePass(...)` inside `try`, then in `finally` `await withLock(resolve(globalHome(), '.lock'), async () => reconcileRepos([repo], invocation, false))`. `mergePass` internals take the global lock (`reconcileBatch`, `dispatchMergeLeaf`, `mergeTurn`'s batch writes), so cleanup cannot sit inside a lock spanning it; the finally keeps today's guarantee that the one cleanup per invocation runs even when `mergePass` throws (`unpause` today errors after having run cleanup).
- **D3** — `mergeWake` untouched: its `mergePass` still runs no `reconcileRepos`. The design note stands: the `mergeWake` invoked from `phase merged` executes inside the reporting seat's terminal, and `endSeats` has no own-terminal veto, so cleanup there could end the caller mid-command.
- **D4** — No second cleanup call (design "open for the plan" resolved): nothing in the merge step depends on cleanup having run earlier in the same pass. `broadcastPass` reads only broadcast-pending merged leaves whose worktrees `broadcastInProgress` keeps; `mergeTurn`/`reconcileBatch` read `state.batch` and `mergeQueue`, which cleanup never clears for merge-phase leaves (`state.batch` keep, then 'active leaf' keep); `renameTabs` only renames tabs with live seats. One ordering delta exists: a merge-phase leaf whose recorded worktree directory vanished used to have the record cleared before `mergeTurn`'s `ensureWorktree` recreated it. Post-move the record survives into `mergeTurn`; `ensureWorktree` recreates the directory at the same path, or throws the recorded path-vs-store "Worktree path mismatch" when the record differs — a one-pass delay that self-heals when the moved cleanup clears the record, safe because it only skips the merge turn. Not a break, so no pre-merge call is kept.
- **D5** — Doc edit: `docs/use/park-pause-stop.md` line 57 — "runs the cleanup that waited, and runs the merge pass" becomes "runs the merge pass, and the cleanup that waited last." `docs/reference/state-and-phases.md:124` ("the reconcile step in `akrogon next` removes it") names `reconcileBatch`, not pass ordering — unaffected. `src/AREA.md`, `tests/AREA.md`, `docs/reference/commands.md`, `docs/use/run-work.md` state no cleanup-vs-merge ordering — unaffected. Post-edit grep of `reconcile`, `cleanup`, `merge pass` under `docs/` and `src/AREA.md` reports any remaining ordering claim.
- **D6** — Criterion 1 fixture: `dispatchFixture({ window: 'open' })` + `adopt(f.core)` so each seat terminal shows in its leaf tab; seed the merged holder with `commitMove(..., 'merged', null)` (moves the owner folder to `issues/closed`, no broadcast), `batch` = `{...applied, candidate: top, recorded: true}` after pushing `top` to `origin main` and `appendAttempt`. One `next --all` releases the record through `reconcileBatch` and the moved cleanup does the rest.
- **D7** — Criterion 2 fixture: holder in `merge` with `batch` = `{...applied, candidate: top, owner: 'command'}` (land unit absent under `fakeSystemctl`), `top` pushed to `origin main`; every holder seat terminal killed and removed first so no live tab exists. Sibling leaf `waiting` in phase `failed` with only `tab` recorded keeps `issues/open/issue` incomplete (no broadcast, no owner move); `sweep`'s failed branch skips it quietly because `picked`'s throw requires `tab === undefined && worktree === undefined` — `tab` is set, so the pass exits 0. Assertion for "removes nothing more": `readRemoved(repo)` empty after pass 2, holder `state.yaml` byte-identical across pass 2, and the fixture's hc shim log records zero mutating calls (`run`, `send`, `keys`, `kill`, `rm`, `label`) during pass 2.

### Condition checks traced against the decisions

- C1 "the releasing pass itself cleans" — D1/D2 violation = cleanup before merge, which is the base ordering; the criterion test fails on base (recorded below), no temporary edit needed beyond the absent product change.
- C2 "one pass releases, a second removes nothing" — same violation plus reconcile idempotence; the second-pass assertions (`readRemoved` empty, identical state, zero mutating hc calls) fail on base because pass 2 removes the worktree and branch (recorded below).
- C1/C2 "once per invocation" — D1's single post-loop call preserves the old per-invocation count and the single host step; no test needed beyond the criteria.
- C3 "batch kept while fetch unconfirmable" — `reconcileBatch` untouched; the moved cleanup still sees `state.batch` kept while the record stands (existing test 'cleanup retains a merged holder worktree while publication recovery is blocked').
- C3 "live land attempt untouched" — `landAlive` untouched; the moved cleanup still sees `state.batch` (existing 'a live land run is left alone' case).
- C3 "working broadcast seat survives" — `broadcastInProgress` untouched; post-move cleanup sees the same state (existing 'next keeps a working broadcast seat').
- C3 "seat-owned completion clears the batch without closing the tab" — `mergeWake` untouched (D3); the cleared record is released by `mergeWake`'s `mergePass`, and cleanup — wherever it runs — closes the tab on the next `next` pass as today (existing 'a green merge clears the record').
- "cleanup under the global lock" — D1/D2 wrap the moved call in `withLock`; `mergePass` is never run inside that lock (deadlock impossible).
- D4's one-pass-delay edge is traced safe above, not a criterion condition.

## Read-first

- `src/next.ts` — `nextCommand` (~lines 1250-1352), `unpausePass` (~lines 1354-1359), `reconcileRepos` (~1234), `mergePass`/`mergeTurn`/`reconcileBatch` (~780-1010), `broadcastPass` (~938).
- `src/reconcile.ts` — `reconcile` (merged/failed worktree and tab rules, `mergedWorktree` ~line 700, worktree-undefined close path ~line 810), `reconcileHost`, `readRemoved`, `broadcastInProgress`.
- `src/phase.ts` — `commandMerged`, `commitMove`, `completeOwner`, `batchPush` (the `candidate`/`recorded`/`appendAttempt` writes the fixtures mirror).
- `src/state.ts` — `broadcastPending`.
- `tests/batch-dispatch.test.ts` — fixture helpers (`dispatchFixture`, `allocatedLeaf`, `toMerge`, `commitFile`, `idleAll`, `attemptLines`, `leafState`), 'cleanup retains a merged holder worktree while publication recovery is blocked' (the commitMove seeding pattern).
- `tests/hc-fixture.ts` — `adopt`, `hcFixture` window option; `tests/helpers.ts` — `fakeSystemctl`, `leafTempRoot`.
- `docs/use/park-pause-stop.md` line 57.

## Needed interfaces

All existing: `reconcileRepos` (unchanged signature), `withLock`, `globalHome`, `readRemoved`, `appendAttempt`, `commitMove`, `adopt`, `dispatchFixture`, `fakeSystemctl`, `leafTempRoot`, `attemptLines`. No new machinery.

## File/criterion checklist

One wave, one unit (serial-solo: A implements):

- **U1** — `src/next.ts` (D1, D2 edits), `docs/use/park-pause-stop.md` (D5). Tests: `tests/batch-dispatch.test.ts` — 'the pass that releases a merged holder batch cleans up the holder in the same invocation' (criterion 1), 'the releasing pass leaves a merged holder fully cleaned for the next pass' (criterion 2).

Docs affected: `docs/use/park-pause-stop.md` only.

## Criteria proofs

- **C1** — `bun test --timeout=60000 tests/batch-dispatch.test.ts -t 'the pass that releases'` (seconds). Proves: after one invocation, `state.batch`/`state.worktree` undefined, worktree path gone, `git worktree list` lacks it, `refs/heads/holder` gone, `tab.close` issued for the leaf's tab, zero holder terminals (live or finished). Product failure it catches: cleanup stranded the released merged holder (the #132 bug). Rerun trigger: any change to `nextCommand`, `mergePass`/`reconcileBatch`, or `reconcile`. Red on base — `check cleanup-last-c1: 1 .../check-cleanup-last-c1-1794236108418-2654528.log`: `expect(closed.worktree).toBeUndefined()` received the recorded store path.
- **C2** — `bun test --timeout=60000 tests/batch-dispatch.test.ts -t 'the releasing pass'` (seconds). Proves: pass 1 moves the holder to `merged`, appends exactly one `merged` attempt line, clears `batch`, removes worktree, branch and leaf temp; pass 2 leaves `state.yaml` unchanged, `readRemoved` empty, zero mutating hc calls. Product failure it catches: release deferred to a later, unrelated pass. Rerun trigger: same as C1. Red on base — `check cleanup-last-criteria: 1 .../check-cleanup-last-criteria-1794236102205-2647180.log`: `expect(state.worktree).toBeUndefined()` received the recorded store path.
- **C3** — existing tests, unchanged code paths: 'cleanup retains a merged holder worktree while publication recovery is blocked' and 'a green merge clears the record once the holder lands' (`tests/batch-dispatch.test.ts`), 'a live land run is left alone' and 'next keeps a working broadcast seat until it finishes' (`tests/green-merge.test.ts`), 'unpause runs deferred merged cleanup' (`tests/pause-next.test.ts`). Proven green on the base in readiness proof `guards-main-50d925f2` (46+13 pass); rerun under `bun test --timeout=60000 tests/batch-dispatch.test.ts tests/hc-teardown.test.ts tests/pause-next.test.ts` plus `tests/green-merge.test.ts` when `src/next.ts` changes (minutes).
- **Configured** — `format` and `typecheck` from `akrogon config` run before handoff; `test` (whole suite) is not a brief criterion but the leaf touches `next.ts` ordering, so the implement pass runs the configured `test` check once as its own verification, not as a merge gate.

## Known limits (stated by the design, kept)

- L1: a no-broadcast landing that ends through `landedWake` while the land unit still shows active keeps the batch under `landAlive` until a later pass — same gap on the base, unchanged.
- L2: a `mergeWake` that releases another holder's batch leaves that holder's cleanup to the next event, unchanged by design.
- "No recorded seats" (criterion 1) reads as no seat terminals left in hc; `state.seat` refs in `state.yaml` are never cleared by cleanup, on the base or after.
- The merged leaf's loaded slice stops a pass later than its tab close today and after the fix (the slice scan precedes leaf handling inside `reconcile`); unchanged.

## Implementation notes
