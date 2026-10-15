# Plan: finished-leaf-processes

Debate off (`debate: no`): synthesis from brief, design, and live surfaces.

## Decisions

- D1: One exported `reconcileHost(repos, live, panesOnce)` in `src/reconcile.ts` is the host-wide step. `reconcileRepos` calls it once after its repo loop; the `tab_closed` branch calls it after its per-repo `reconcile`, reusing a cached pane fetcher hoisted into `nextCommand` scope. It walks every loaded `akrogon-l*.slice` and clears failed `akrogon-run-*` units, and writes kept records to `<globalHome>/reconcile-host.json`.
- D2: Slice inventory is `systemctl --user list-units --all 'akrogon-l*.slice' --output=json` (verified on host, systemd 262); failed run units come from `systemctl --user list-units --failed 'akrogon-run-*' --output=json`. Every `systemctl --user` call pins `DBUS_SESSION_BUS_ADDRESS` via `sessionBusAddress()` (the `stopRunUnits` pattern: callers inside `run-check` have the bus cut). Any inventory failure yields an empty inventory: nothing is stopped that pass (conservative).
- D3: A slice step at the top of `reconcile(repo, leaves, live)`, before worktree and leaf-temp checks (design pass-order C): for each open leaf in `merged` or `failed` whose `leafSlice(repo, slug)` is loaded, stop it with `systemctl --user stop <slice>` unless (a) it is the pass's own slice, (b) `live === null` and a tab is recorded, (c) the recorded tab is live in `live`, or (d) a live admission record (`liveRuns()` from `src/admission.ts`) names the slice. A failed stop is kept with its error; a successful stop is recorded in `removed`. Stopping kills leftover processes by design (criterion 1), so no emptiness check here.
- D4: `reconcileHost` applies the same finished rule as D3 to slices matching a leaf record in `issues/closed` of any registered repo (matched via `leafSlice` over `allLeaves(repo)`), and stops a slice matching no leaf record at all only when its cgroupfs subtree holds no process: `systemctl --user show <slice> -p ControlGroup --value` gives the path; every `cgroup.procs` under it must be empty. The cgroupfs root reads `AKROGON_CGROUP_ROOT` (default `/sys/fs/cgroup`), a new `cgroupRoot()` in `src/scope.ts` mirroring `procRoot()`. Live run records and the own-slice guard also protect unmatched slices. Active-leaf slices are kept silently; finished/unmatched keeps are recorded in `reconcile-host.json`.
- D5: `reconcileNeedsPanes(repo, leaves)` becomes async and returns true for a `merged`/`failed` leaf with `tab !== undefined`, or whose slice is present in the loaded inventory; on inventory failure it returns true whenever any finished leaf exists (fetch is conservative). Both call sites gain `await`. This is criteria 3 and 4: a finished leaf with a live tab and no worktree/temp must force the pane fetch, and `live === null` then keeps its slice.
- D6: Own-slice guard (criterion 6): `.slice`-named path segments of `/proc/self/cgroup` read through `procRoot()` (the `callerScope` matchAll pattern); a candidate whose unit name is among them is never stopped. A reconcile pass running inside a finished leaf's slice, and `akrogon phase <slug> merged` inside the holder's slice, are thereby protected — nothing in `phase.ts` or `mergeWake` stops slices (criterion 7 holds because the stop exists only in the reconcile path).
- D7: `startRunGuard` in `src/scope.ts` gains `-p CollectMode=inactive-or-failed` (criterion 8), matching `runUnitArgv`. `reconcileHost` runs `systemctl --user reset-failed <unit>` once per listed failed `akrogon-run-*` unit — proven by-name in readiness P3; a failure is kept as a warning line, not thrown, and the pass continues (criterion 9).
- D8: `status <slug>` prints host kept entries via a `readHostKept()` beside `readKept` (same `Kept: <path> — <reason>` lines), and the docs pick up one line each (D10).
- D9: Test seam: new `tests/fake-systemctl.ts` — a PATH fake like `tests/fake-herdr.ts` reading a JSON db (`FAKE_SYSTEMCTL_DB`), logging argv to `FAKE_SYSTEMCTL_LOG`, serving `list-units` (JSON, filtered to `akrogon-l*`/`akrogon-run-*`), `show -p ControlGroup` (points at the fake `AKROGON_CGROUP_ROOT` subtree), `stop` and `reset-failed` (logged, db-mutating). Real-systemd tests reuse the `spawnReal`/`sysctl` style of `tests/run-units.test.ts` with real `XDG_RUNTIME_DIR`/`DBUS_SESSION_BUS_ADDRESS`, seeding real scopes named `akr-flp-*`/`akrogon-run-flp-*` under `akrogon.slice` or a leaf's real `leafSlice`, all stopped in `finally`. Real-slice stops may clear sibling empty `akrogon-l*` slices on the host — intended product behavior, harmless.

Design's open questions resolved: `leaves` does not include closed leaves (`discover` scans `issues/open` only), so the slice step both lists loaded `akrogon-l*.slice` units (needed regardless for criterion 5) and maps them through `leafSlice` over open plus closed records (D1/D4). The systemctl seam is both: fake on PATH for deterministic call assertions, real user manager for end-to-end proofs, matching existing test seams.

## Read-first

- `src/reconcile.ts` — pass structure, `reconcileNeedsPanes`, `readKept`/`writeKeptReport`, `tabLive`, `livePaneInside`.
- `src/scope.ts` — `leafSlice`, `runUnitArgv` (`CollectMode` precedent), `startRunGuard`, `stopRunUnits` (bus pinning), `procRoot`.
- `src/admission.ts` — `recordSchema` (`slice`, `state`), `liveRuns`, `callerScope` (cgroup parse).
- `src/next.ts` (1313–1330, 1429–1460, 1509–1527) — `reconcileRepos` pane caching, `tab_closed` reconcile call, `unpausePass`.
- `src/stop.ts` (`stopSlice`), `src/phase.ts` (154–179, `completeOwner`) — where slices are deliberately never stopped.
- `tests/run-units.test.ts` (1–140) — `spawnReal`, `sysctl`, `waitInactive`, real-unit naming/cleanup.
- `tests/leaf-stop.test.ts` — fake systemctl argv log pattern, `slice(path)` helper.
- `tests/fake-herdr.ts`, `tests/helpers.ts` — pane db, `paneListStdout`, `dispatchLeaf`/`closeTab`/`holding` fixture pieces.
- `learnings/history/2026-10-13-chrome-escapes-cgroup.md` — a process can live outside the caller's cgroup; stop by owned slice, not by matching.
- `docs/guide/next.md` (~159), `src/AREA.md`, `tests/AREA.md` — doc lines to update.

## Interfaces

- `reconcile.ts`: `export async function reconcileHost(repos: Repo[], live: Pane[] | null, panesOnce: () => Promise<Pane[] | null>): Promise<void>`; `export function readHostKept(): { path: string; reason: string }[]`; `reconcileNeedsPanes` → `Promise<boolean>`.
- `scope.ts`: `export function cgroupRoot(): string` (`AKROGON_CGROUP_ROOT`); `startRunGuard` argv + `CollectMode`.
- `status.ts`: append host kept lines in the leaf view.

## Waves

Every unit touches `src/reconcile.ts` or depends on a unit that does; serial order is forced by shared paths and dependencies. With one unit per wave the run is serial-solo: A implements the plan itself, no workers.

- Wave 1, U1 `src/scope.ts` + `src/admission.ts` use: `cgroupRoot()`, `startRunGuard` `CollectMode`, own-slice `selfSlices` helper. Owns: `src/scope.ts`. Depends on: —.
- Wave 2, U2 `src/reconcile.ts` + `src/next.ts`: slice step in `reconcile`, async `reconcileNeedsPanes` (both call sites + `tab_closed` fetch), `reconcileHost` + `reconcile-host.json`, call sites in `reconcileRepos`/`tab_closed`. Owns: `src/reconcile.ts`, `src/next.ts`. Depends on: U1 (`cgroupRoot`, `selfSlices`).
- Wave 3, U3 `src/status.ts` + docs: `readHostKept` lines in leaf status; `docs/guide/next.md` reconcile line; `src/AREA.md`, `tests/AREA.md` lines. Owns: `src/status.ts`, `docs/guide/next.md`, `src/AREA.md`, `tests/AREA.md`. Depends on: U2 (`readHostKept`).

## Tests (new file `tests/leaf-slices.test.ts`)

Each test maps to done-criteria; commands run through `akrogon run-check` per the synthesis rule. Expected red is recorded below after the run.

| # | Criteria | Test | Red reason before fix |
|---|----------|------|------------------------|
| T1 | 1 | real: merged leaf + failed leaf, tabs closed in fake-herdr, real `sleep` scope in each `leafSlice`; `next --all` on real PATH/bus → each slice inactive, each sleeper gone | slices stay loaded, sleepers alive |
| T2 | 2,3 | real: merged leaf with LIVE tab, no worktree/temp; `next --all` → slice stays active, sleeper alive, and fake-herdr call log shows `pane list` was fetched | slice stopped or pane list never fetched |
| T3 | 2 | real: merged leaf, tab gone, live `run-check` admission (`spawnReal` `akrogon run-check -- sleep`) naming its slice → slice active, sleeper alive | slice stopped, sleeper killed |
| T4 | 4 | fake systemctl: merged leaf with recorded tab + loaded slice; herdr `paneListStdout: 'unavailable'` → no `stop` for its slice in the log | `stop <slice>` logged |
| T5 | 5 | fake systemctl: loaded `akrogon-l<unknown>.slice` with empty fake cgroupfs subtree is stopped; a second unmatched slice with a pid in `cgroup.procs` is not | neither stopped |
| T6 | 6 | real: `next --all` executed inside `systemd-run --scope --slice=<merged leaf's slice>` → exits 0 and the slice stays loaded | pass killed by its own stop |
| T7 | 7 | real: `phase <slug> merged` (`holding(f)` receipt) inside the leaf slice with a sleeper → exit 0, phase `merged`, sleeper alive, slice active | sleeper killed during `merged` |
| T8 | 8 | fake systemd-run: `run-check` → the `*-guard` argv line contains `CollectMode=inactive-or-failed` | property absent |
| T9 | 9 | real: seeded failed `akrogon-run-flp-*` unit under `akrogon.slice`; `next --all` → no longer listed | unit still failed-listed |

## Verification commands

- Per-test: `akrogon run-check --name 'test' -- bun test tests/leaf-slices.test.ts -t '<pattern>'` (bun `-t` name filter; each test self-contained under the 30 s suite timeout).
- Full suite at merge per configured `checks`: existing `format`, `test`, `typecheck` — the brief names no whole-suite criterion; implement/check run the standard checks.

## Criterion → observation map

1. **Merged/failed slice stopped, process gone.** Real boundary: user systemd manager. Before: `is-active` on `leafSlice` is `active` with a live `sleep`; after one `next --all`: `is-active` exits nonzero and `kill -0 <pid>` fails. Catches the F4 bug (slice never stopped). Size: seconds. Rerun: `systemctl --user list-units 'akrogon-l*'` shows a stale loaded slice with a dead leaf.
2. **Live tab or live admission record protects.** Same boundary, negated: sleep pid survives the pass in both variants. Catches over-stopping a seat whose tab is open and killing an in-flight `verify`/`run-check`. Size: seconds. Rerun: a seat dies mid-pass unexpectedly.
3. **Finished leaf, live tab, nothing else left → pane fetch happens.** Observable: fake-herdr call log contains `pane list` for a pass whose leaf has no worktree and no temp — the fetch cannot be triggered by any existing rule. Catches the "reads an empty pane list" miss. Size: seconds. Rerun: a merged leaf's slice dies while its tab is open.
4. **No pane list, no stop.** Fake systemctl log has no `stop` for the recorded-tab slice while `paneListStdout` is `unavailable`. Catches stopping on an unproven "tab gone". Size: seconds. Rerun: herdr outage correlates with seat deaths.
5. **Orphan empty slice stopped; non-empty kept.** Fake: `stop` logged for the empty-slice candidate only. Catches both the 44-slice leak and stopping a slice that still holds a process. Size: seconds.
6. **Pass never stops its own slice.** Real: `next --all` inside the matched finished slice exits 0 and the slice remains loaded. Catches suicide-stop. Size: seconds.
7. **`phase merged` never stops.** Real: sleeper survives a `merged` move executed inside the slice. Catches a stop wired into `phase`/`mergeWake` instead of reconcile. Size: seconds.
8. **Guard units collect.** Guard `systemd-run` argv gains `-p CollectMode=inactive-or-failed`; real collection semantics proven by readiness P3. Catches the missing property at the construction site. Size: seconds. Rerun: `systemctl --user --failed` accumulates `*-guard.service`.
9. **Failed `akrogon-run-*` cleared.** Real: seeded failed unit absent from `list-units` after the pass. Catches missing `reset-failed`. Size: seconds. Rerun: failed run units accumulate.

## Known limitations

- Real-systemd tests require a user manager (`systemctl --user`); on a host without one they fail like `tests/run-units.test.ts` real cases — accepted precedent, not new machinery.
- A leftover process escaping its slice cgroup (Chrome self-scoping lesson) is not stopped by slice stop — noted exclusion in the design, unchanged.
- `reconcileHost` does not remove `/tmp/akr-*` or retired locks — sibling leaves of the chart own those places; this leaf only adds the slice and reset-failed steps.

## Red results at plan.synthesis

Each run through `akrogon run-check --name 'test' -- bun test tests/leaf-slices.test.ts -t '<pattern>'` from the leaf worktree.

- T1 (criteria 1): FAIL — `Timed out waiting`: both leaf slices stayed `active` and both sleepers stayed alive after the pass.
- T2 (criteria 2,3): FAIL — `Expected: > 0, Received: 0`: no `pane` call in the fake-herdr log; the pass never fetched the pane list for a finished leaf with only a tab left.
- T3 (criterion 2): FAIL — `Timed out waiting`: the control leaf's slice stayed `active`; nothing stopped any finished slice. (The protected slice staying alive is the keep half; the control makes the stop half observable.)
- T4 (criterion 4): FAIL — `Expected: true, Received: false`: no `list-units` in the fake systemctl log; the slice step does not exist to defer to the missing pane list.
- T5 (criterion 5): FAIL — `Expected: true, Received: false`: `stop akrogon-ldeadbeef00.slice` never logged; unmatched empty slices are not stopped.
- T6 (criterion 6): FAIL — `Expected: true, Received: false` (slice evaluated assertion): no `list-units` call; the own-slice guard has no code to guard yet. With the slice step present and the guard absent, the pass would stop its own slice.
- T7 (criterion 7): PASS — nothing in `phase merged` touches slices today; kept green as the regression guard for the new stop call (the merge must still run inside an unstopped slice).
- T8 (criterion 8): FAIL — guard argv is `... -p TimeoutStopSec=5 --` without `CollectMode=inactive-or-failed`.
- T9 (criterion 9): FAIL — `akrogon-run-flp-…-dead.service` still listed after the pass; no `reset-failed` exists.


## Implementation notes

- 2026-10-15: Coordinate run admission with slice eligibility and stopping to enforce brief criterion 2 during concurrent shell checks, and retain slices whose ownership cannot be proven after an inventory error, as design Q3 requires for unprovable items.
