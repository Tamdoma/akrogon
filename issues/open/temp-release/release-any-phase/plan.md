# Plan: release-any-phase

Scope: `reconcile` stops the loaded slice of any leaf whose recorded tab is proven gone (no longer finished-only), keeps leaf temp when the unit inventory is unreadable, and every dispatch path takes the global lock so a pass never sees a half-made dispatch. `debate: no`; this plan synthesizes the brief and locked design directly.

## Decisions

- D1 — Drop the `finished(leaf)` gate in the per-repo slice step (src/reconcile.ts). `sliceKeepReason` gains the unfinished rule: own slice, live run record and the existing tab checks stay; a leaf with `state.tab === undefined` that is not finished keeps its slice with reason `unfinished leaf` — a vanished tab cannot be proven when none was recorded. Finished leaves with no tab still stop (returns null).
- D2 — `reconcileHost` drops its `!finished → continue` and feeds every leaf-matched slice through `sliceKeepReason`, unchanged: `view` stays `panes` (null, unfetched) for leaves with no recorded tab and `await livePanes()` when a tab exists, so a no-tab leaf never forces a pane fetch. The `livePanes()` result may be null; `sliceKeepReason` turns that into `pane list unavailable`.
- D3 — `reconcileNeedsPanes` requests the pane inventory for every leaf with a recorded tab whose slice is loaded (or whose inventory is unreadable), whatever the phase — closing the tabbed/no-temp gap (src/reconcile.ts the `finishedLeaves` block). Unfinished leaves with no tab still need no panes.
- D4 — Leaf temp (src/reconcile.ts scratch-root branch): when `loadedSlices === null` the leaf's temp is kept with reason `unit list unavailable` for every phase, replacing the silent fall-through to `dropChecked`. The `live === null` → `pane list unavailable`, live-tab/pane-inside, and busy-slice keeps are unchanged; unfinished leaves keep reporting nothing when the tab is live (the existing silent path is preserved, per `an unfinished leaf temp is ... kept silently while its tab lives`). `unfinished leaf` is added to `unitInUse` in src/leftovers.ts so the new keep does not surface as a leftover.
- D5 — Manual merge dispatch takes the global lock: `dispatchMergeLeaf` wraps the manual `dispatchLeaf` call in `withLock(resolve(globalHome(), '.lock'))` exactly as the automatic branch does (src/next.ts:1160-1177). With the lock inside `dispatchMergeLeaf`, callers (`mergeTurn`, `mergePass` from `nextCommand`/`mergeWake`/`unpausePass`) need no change.
- D6 — Second dispatch path found outside the global lock (the design's open question): `reconcileBatch`'s post-lock loop calls `closeMergedTab` and `dispatchDependents` (→ `sweep` → `dispatchLeaf`) after releasing the lock (src/next.ts:999-1003). Wrap that loop in `withLock(globalHome()/.lock)` with a pause re-check inside, mirroring the earlier `reconcileBatch` lock block. Result: every `dispatchLeaf`/`dispatchSlot`/`allocate` path runs under the global lock; reconcile runs only inside it, so a pass observes a dispatch either before tab creation or after seat adoption — never between.
- D7 — Test seam: tests/fake-busctl.ts gains an opt-in `FAKE_SYSTEMCTL_DB` upsert — when set, `StartTransientUnit` writes the target slice into the fake unit list (active, cgroup under the fake cgroup root), mirroring a real slice becoming loaded when a unit starts inside it. No change when the var is unset, so every existing fixture is untouched.
- D8 — All new criterion tests live in one new file `tests/release-any-phase.test.ts` (a tests/-area `*-release` test file is unprecedented; the named-file convention is a new file per feature leaf, e.g. `keep-rule.test.ts`). New file ⇒ no `Test-Change` trailer needed for it (it is an added path, recorded in `frozen`).

## Read-first list

- `src/reconcile.ts` — `sliceKeepReason`, the per-repo slice loop, `reconcileNeedsPanes`, the leaf-temp branch, `reconcileHost` leaf-match block.
- `src/next.ts` — `dispatchLeaf`/`allocate` (tab record at `saveState(leaf.path, tabState)`, seat adoption in `box`), `dispatchMergeLeaf`, `reconcileBatch` post-lock loop, `nextCommand`'s single `withLock` wrapping dispatch + reconcile, `tab_closed` hook path.
- `src/admission.ts` — `liveRuns`, `withAdmissionLock` (per-slice, distinct from the global `withLock` in `src/state.ts`).
- `src/scope.ts` — `leafSlice`, `ownSlices`, `cgroupRoot`.
- `src/state.ts` — `withLock`, `readState`/`saveState`, `allLeaves`.
- `src/leftovers.ts` — `unitInUse` reason list.
- `tests/helpers.ts` (`fixture`, `fakeHerdr`, `cli`, `leaf`, `leafTempRoot`, `holding`), `tests/fake-herdr.ts` (`paneListStdout: 'unavailable'` seam, tab/pane DB), `tests/fake-systemctl.ts` (unit DB + call log), `tests/fake-busctl.ts`, `tests/fake-proc.ts`.
- `tests/leaf-slices.test.ts` — established patterns: fake-systemctl DB seeding, cgroup-root fakes, systemctl wrapper scripts that gate on marker files, `spawnCaptured`/`cli` passes, kept-report assertions.
- `tests/reconcile.test.ts` — leaf temp fixtures (`leafTemp` hashing under `AKROGON_LEAF_TEMP_ROOT`), `closeTab` helper.
- `tests/next.test.ts` — merge-dispatch fixtures (`holding(f)` + `merge_stamp` on a merge-phase leaf), `tab_closed` hook invocation via `HERDR_PLUGIN_EVENT_JSON`.
- `src/stop.ts` — `stopped.yaml` shape (`{ 'repo/slug': true }`) used to keep unfinished leaves undispatched in tests.
- `docs/guide/limits.md`, `README.md` — prose describing the finished-only slice rule that must be updated.

## Interfaces used (all exist)

- `reconcile(repo, leaves, live)`, `reconcileHost(repos, live, panesOnce)`, `reconcileNeedsPanes(repo, leaves)`, `sliceKeepReason` — src/reconcile.ts.
- `withLock(resolve(globalHome(), '.lock'), fn)` — src/state.ts.
- `leafSlice({name}, slug)`, `ownSlices()`, `cgroupRoot()` — src/scope.ts.
- `leafTemp(repo, slug)`, `readRepo('repo', f.root)` — src/config.ts.
- Fake seams: `FAKE_HERDR` db (`paneListStdout`, tabs/panes), `FAKE_SYSTEMCTL_DB`/`FAKE_SYSTEMCTL_LOG`, `FAKE_BUSCTL_HOME`, `AKROGON_PROC_ROOT`, `AKROGON_CGROUP_ROOT`, `AKROGON_LEAF_TEMP_ROOT`, `HERDR_PLUGIN_EVENT_JSON`, `stopped.yaml` under `AKROGON_HOME`.

New seam (D7): `FAKE_SYSTEMCTL_DB` read inside tests/fake-busctl.ts — optional, additive.

## File/criterion checklist

Every done-criterion maps to a test in `tests/release-any-phase.test.ts` driven through `next`/`phase` CLI passes against the fakes. Temp paths resolve via `leafTemp(readRepo('repo', f.root), slug)` under `AKROGON_LEAF_TEMP_ROOT`.

| Criterion | Test (name substring) | Red today? | Deliberate break it guards |
|---|---|---|---|
| 1 | `unfinished leaf slice stops on gone tab` | Yes — slice row remains in FAKE_SYSTEMCTL_DB, temp survives | none needed (red on today's code) |
| 2 | `live run record keeps unfinished slice` | Yes — `unfinished leaf`/report entries; slice is silently skipped today | restore `finished` gate → red |
| 3 | `live tab keeps unfinished slice and temp` + `pane list unavailable keeps unfinished slice and temp` | Yes — no kept entries; slice skipped | restore `finished` gate → red |
| 4 | `no recorded tab keeps unfinished slice` | Yes — no kept entry, slice skipped | remove `tab===undefined` keep → red |
| 5 | `unreadable unit list keeps leaf temp` (merged/failed/implement leaves) | Yes — temp deleted today | remove `loadedSlices===null` keep → red |
| 6 | `host step applies the unfinished-leaf slice rule` | Yes — host skips unfinished matches | restore host `!finished` continue → red |
| 7 | `manual merge dispatch holds the global lock` | Yes — concurrent pass deletes the temp mid-dispatch | remove the `dispatchMergeLeaf` manual lock → red |
| 8 | `tab_closed re-dispatch lands seats in the kept slice` | Yes — no `live tab` kept entry on the re-dispatched slice | restore `finished` gate → red |
| 9 | `failed leaf with live tab keeps tab slice temp` | No — tab-keep path already exists | remove `tabLive` keep in `sliceKeepReason` → red |

Deliberate-break proofs (three cover all green-by-accident assertions):
- B1: re-add `if (!finished(leaf)) continue;` in the per-repo slice loop → criteria 2, 3, 8 red.
- B2: drop the `unfinished leaf` keep for `tab === undefined` → criterion 4 red.
- B3: drop the `loadedSlices === null` temp keep → criterion 5 red.
- B4: re-add `match !== undefined && !finished(match.leaf) → continue` in `reconcileHost` → criterion 6 red.
- B5: revert the `dispatchMergeLeaf` manual `withLock` → criterion 7 red.
- B6: remove `tabLive`/`live` keeps → criterion 9 red.

## Waves

- Wave 1, U1 — `src/reconcile.ts`, `src/leftovers.ts`, `src/next.ts`, `tests/fake-busctl.ts`: D1-D7. One unit because criterion 7's planned test only goes green when both the lock change and the slice keep rule land in the same worktree.
- Wave 1, U2 — `README.md`, `src/AREA.md`: update the finished-only slice description to the any-phase rule and the unreadable-inventory temp keep. Disjoint paths, no shared test resource, no dependency on U1.

(Amended at implement: the original three-way split put `src/next.ts` in its own unit, but a worker could never verify criterion 7 without U1's keep rule. Code units merged.)

The test file is planned and committed by this pass (plan.synthesis); implementers verify with the committed tests, not new ones.

## Verification

Each criterion's proof runs its named test through the leaf's runner, one `akrogon run-check` per test (regex filter `-t`), from the worktree:

```
akrogon run-check --name <cN> -- bun test tests/release-any-phase.test.ts -t '<substring>' --timeout=30000
```

Boundary observed: the real `next`/`phase` CLI run in a subprocess against fake herdr/systemctl/busctl/proc roots; assertions read the fake systemctl call log + unit DB, the herdr DB, the on-disk temp path, `state.yaml`, and the reconcile/kept reports under `AKROGON_HOME`. A red/green test observes the consumer-visible outcome (slice stopped/kept, temp present/gone, lock ordering), never a helper artifact.

- C1: before — slice loaded + temp present; after one `next --all` — `stop <slice>` in the log, unit row gone, temp dir gone. Size: seconds. Rerun: any reconcile slice-rule or temp-branch edit.
- C2: live run record seeded under `runs/`; slice kept with reason `live run record`, temp kept (`slice holds a running unit`). Seconds.
- C3: live tab in the herdr DB, leaf temp absent → kept `live tab`, slice loaded, `pane` calls observed in `.calls` (proves needsPanes fetched). Second case: `paneListStdout: 'unavailable'` → kept `pane list unavailable`, slice loaded, temp kept. Seconds.
- C4: no tab, loaded busy slice → kept `unfinished leaf`, no `stop` call. Seconds.
- C5: systemctl wrapper exits 5 on `list-units` → each leaf's temp kept with `unit list unavailable`. Seconds.
- C6: two loaded slices matching unfinished leaves (one live tab, one no tab) → `reconcile-host.json` kept entries `live tab`/`unfinished leaf`. Seconds.
- C7: herdr wrapper blocks `tab create` after the marker file; a second `next --all` spawned while dispatch parks; after releasing the gate both exits are 0, the recorded tab is the new live one, seats adopted (busctl.calls slice entries), temp exists, and the last reconcile report keeps the slice. Seconds to ~15 s. Rerun: any dispatch or lock-order edit.
- C8: `tab_closed` hook pass on a stopped slice re-dispatches the leaf (new tab, seats in the same `leafSlice` name per busctl.calls); the following `next --all` keeps the slice with `live tab`. Seconds.
- C9: failed leaf, live tab → kept `live tab`, tab still in the herdr DB, temp present. Seconds.

Whole-file check: `akrogon run-check --name release-any-phase-tests -- bun test tests/release-any-phase.test.ts --timeout=30000`. The leaf's `checks` gate (`format`, `test`, `typecheck`) unchanged.

## Planned-test run evidence

`check release-any-phase: 1 .../implementation/check-release-any-phase-1792112067520-1113053.log` — whole file on today's code: 9 fail, 1 pass. Each criterion test is red on its own assertion:

- C1: `stop akrogon-l…slice` absent from the systemctl log, temp still on disk (line 141).
- C2: no `live run record` kept entry (line 186).
- C3a: no `live tab` kept entry for the temped slice (line 226); the untemped leaf's pane fetch also fails.
- C3b: no `pane list unavailable` kept entry (line 256).
- C4: no `unfinished leaf` kept entry (line 277).
- C5: no `unit list unavailable` kept entry; temps deleted (line 319).
- C6: no `live tab` entry in reconcile-host.json (line 354).
- C7: the unlocked concurrent pass dispatched a second tab and adopted extra seats (`busctlCalls` 3 vs 2, line 424).
- C8: no `stop <slice>` in the hook pass log — the dead-tab slice was never stopped pre-dispatch (line 458).
- C9 (only green): red shown under the deliberate break removing `tabLive` from `sliceKeepReason` — `check c9-break: 1 .../implementation/check-c9-break-1792112107228-1135026.log` (stop call appeared). Break reverted; `git diff` clean.

## Notes for review

- Brief vs design: no conflict.
- Open question answered: `reconcileBatch`'s post-lock `closeMergedTab`/`dispatchDependents` loop is the only other dispatch path outside the global lock (D6); every other `dispatchLeaf` call site is already inside `withLock`.
- Limitation kept: a leaf whose tab id was recorded but never created (crashed between `saveState` ordering edge) still reads as "tab gone" — same proof rule as today, unchanged.
