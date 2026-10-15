# Implementation report: finished-leaf-processes

Serial-solo run (plan waves each hold one unit). Base `0a80ab9` (origin/main at refresh), head `32f0b13`.

## Changes

- `src/scope.ts` — `startRunGuard` argv gains `-p CollectMode=inactive-or-failed` (criterion 8); new `cgroupRoot()` (`AKROGON_CGROUP_ROOT`, default `/sys/fs/cgroup`) and `ownSlices()` (`.slice` names on the caller's `/proc/self/cgroup`).
- `src/reconcile.ts` — slice step before the worktree loop: stops `leafSlice` of each open `merged`/`failed` leaf when loaded, unless own slice, live admission record (`liveRuns().slice`), `live === null` with a recorded tab, or live tab; stops recorded in `removed`, keeps with reason. `reconcileNeedsPanes` is now async and also returns true for a finished leaf with a recorded tab or loaded slice (conservative true on inventory failure). New `reconcileHost(repos, live, panesOnce)`: applies the finished rule to slices matching closed leaf records across registered repos, stops unmatched `akrogon-l*.slice` only when its cgroupfs `cgroup.procs` subtree is empty (unreadable = occupied), and `reset-failed`s every failed `akrogon-run-*` unit; kept lines go to `<globalHome>/reconcile-host.json` (`readHostKept`). systemctl calls pin `DBUS_SESSION_BUS_ADDRESS` via `sessionBusAddress()`; inventory failure yields no stops.
- `src/next.ts` — one lazy `panesOnce` shared per `nextCommand` pass, threaded into `reconcileRepos` and `tab_closed`; `reconcileHost` called after per-repo reconcile in `reconcileRepos` and in the `tab_closed` path over all registered repos; `unpausePass` gets it via `reconcileRepos`.
- `src/status.ts` — host kept lines: `Kept:` in leaf view (no path filter — units are not paths) and `Kept by last cleanup:` on the board.
- `tests/leaf-stop.test.ts` — `systemctlCalls` filters to ` stop ` lines (Test-Change trailer): reconcile's `list-units`/`reset-failed` calls on the same fake broke exact-match assertions.
- Docs — README reconcile paragraph, `docs/guide/next.md` slice paragraph, `src/AREA.md` (reconcile + scope lines), `tests/AREA.md` (new test file line).

## Criterion proof (all on head `32f0b13`, via `akrogon run-check --name 'test' -- bun test --timeout=30000 tests/leaf-slices.test.ts`)

All 9 tests pass, log `check test: 0 …/check-test-1792099559116-636394.log`:

- Criteria 1 — merged+failed slices with gone tabs stopped, sleepers dead.
- Criteria 2,3 — live tab keeps slice and forces pane fetch; live run record keeps slice while control slice stops.
- Criterion 4 — unavailable pane list: slice evaluated, no `stop` logged.
- Criterion 5 — unmatched loaded slice stopped only when cgroupfs subtree empty.
- Criterion 6 — pass inside the leaf slice: exit 0, no `stop` for own slice.
- Criterion 7 — `phase merged` inside the slice: completes, sleeper alive, folder moved to closed.
- Criterion 8 — guard argv carries `CollectMode=inactive-or-failed`.
- Criterion 9 — seeded failed `akrogon-run-flp-*` unit absent after the pass.

## Verification

- `akrogon verify` on `5aac9f1` (tree-identical to `32f0b13`; the rebase rewrote commit messages only): green — setup 0, format 0 (`check-format-1792099429604`), test 0: 859 pass / 0 fail (`check-test-1792099559116`), typecheck 0 (`check-typecheck-1792099561765`). First verify red on format (prettier in leaf-stop.test.ts); fixed by `5aac9f1`.
- Full suite run inside the leaf's own slice via run-check; leaf-slices tests exercise the real user manager.

## Wall time

- `akrogon verify`: ~4–5 min per run, three runs total (first red on test regressions + format, second red on format, third green).

## Limitations

- Real-systemd tests need a user manager; same constraint as `tests/run-units.test.ts`.
- `reconcileHost` only resets `akrogon-run-*` failed units and `akrogon-l*` slices; other places of the chart (locks, `/tmp/akr-*`) belong to sibling leaves.
- `next --all` inside the leaf slice now stops every empty `akrogon-l*.slice` on this host — intended product behavior, observed as cleanup of ~50 stale slices.

## 2026-10-15 check.repair

Repaired both initial reviews on base `0a80ab91e9388e60ce148f500fa92eb9859e1aeb`, from reviewed head `32f0b13` to `0dfcedc217967ae4a97935a6cf3b9957bad30054`.

- B-F1: host ownership includes every registered repo, even when the per-repo sweep is targeted. Reproduction `2c97934`, fix `d0e624b`.
- A-F1: a bad leaf inventory retains uncertain slices with its error and allows failed-unit reset to continue. Existing inventory diagnostics still report the bad record. Reproduction `7a4e003`, fix `47821da`.
- B-F2: admission publication and reconcile's final live-run check plus slice stop share a per-slice flock. Admission releases the lock before executing the check. Reproduction `a3e4f14`, fix `0dfcedc`.

Each added reproduction failed before its fix and passed afterward. No existing test expectations changed. Detailed commands and kept red/green logs are in `review-B.md`.

All planned criterion proofs were rerun on the committed repaired head using `akrogon run-check --name repair-criteria -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile" && bun test --timeout=30000 tests/leaf-slices.test.ts'`: 12 pass, 0 fail, including all nine planning-authored tests. Evidence: `check repair-criteria: 0 /home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/finished-leaf-processes/implementation/check-repair-criteria-1792100054760-3806357.log`.

No handoff to A or operator action remains. Unreadable ownership intentionally retains unmatched slices until its repo records are corrected.

Final `akrogon verify` on `0dfcedc217967ae4a97935a6cf3b9957bad30054`: green. Setup 0, format 0, test 0 (862 pass, 0 fail), typecheck 0. Logs: `check-format-1792100061805-3827557.log`, `check-test-1792100175154-3827557.log`, `check-typecheck-1792100177097-3827557.log`, all under this leaf's `implementation/`. No merge_checks were run. The committed worktree is clean.
