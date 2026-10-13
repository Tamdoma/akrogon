# Implementation report: leaf-stop

Mode: delegated, two waves of two workers (plan waves). Base `e5776ade920e619e923a7825140f823c2e89123e` (origin/main, unchanged across all three refreshes, so no refresh moved the branch). Head at handoff `6fe00fa`.

## Commits
- `b61bab5` test: planned tests (plan.synthesis).
- `5d75683` feat: stop and start a leaf (U1, worker commit 37fb068).
- `90a8bd6` docs: describe leaf stop and start (U4, worker commit adfc396, `Test-Change` for tests/AREA.md).
- `e626d92`→ picked as U2: keep stopped leaves out of dispatch and the merge turn.
- `abb0101`→ picked as U3: mark stopped leaves in status.
- reproduction test commit (`Test-Change: tests/leaf-stop.test.ts`, cites live output), then `c1dde6b` fix: start selects the leaf by its folder path.
- `6fe00fa` docs: start runs the targeted pass by leaf path.

## Changed files and reasons
- `src/stop.ts` (new): `stopped.yaml` record keyed `<repo>/<slug>` (D1), `stop <slug>` writes the record under the global lock, then `systemctl --user stop <leafSlice>` (D2), `stop --all` over allocated leaves with one line per leaf and exit 1 on any failure (D3), `start <slug>` removes the record and runs the targeted next pass by leaf folder path (D4).
- `src/akrogon.ts`: `stop` (`<slug> | --all`) and `start <slug>` verbs and usage (D8). `.gitignore`: `stopped.yaml`.
- `src/next.ts`: gate in `dispatchLeaf` after the paused gate. Picked manual passes report `Leaf is stopped: <slug>; run akrogon start <slug>` (exit 1). Automatic and unpicked passes end quietly (D5).
- `src/turn.ts`: `mergeQueue` drops stopped leaves, so no holder, member, stack or merge prompt (D6).
- `src/status.ts`: NOTE cell starts with `stopped`, and `status <slug>` prints `stopped: <repo>/<slug>` (D7).
- README.md verb table, docs/guide/next.md "Stopping a leaf", src/AREA.md, tests/AREA.md (D9).

## Bug found and fixed (reproduction first)
The live run showed `akrogon next <name>` refusing a name shared by an issue and its leaf (`Ambiguous target "live": issue issues/open/live / leaf issues/open/live/live`). `start` passed the bare slug to that pass, so `start` failed for the common one-leaf issue. The reproduction `start runs the targeted pass for a leaf whose issue shares its name` was red on the head before the fix, with the same `Ambiguous target "build"` error from `startCommand` (src/stop.ts:87). Fix: `start` passes `findLeaf(repo, slug).path`. Now green.

## Proof per done-criterion
All on `c1dde6b` unless noted. Test command: `bun test tests/leaf-stop.test.ts --timeout=30000` → 8 pass, 0 fail.
1. Test `stop records the leaf, then stops its leaf slice and keeps the worktree`: pass. Live run below: pass.
2. Tests `a stopped leaf is not dispatched by an automatic pass, and a picked manual pass names start` and `the merge path builds no stack and starts no merge seat for a stopped leaf`: pass.
3. Test `a failed slice stop keeps the record, prints the error, exits non-zero and is retryable`: pass. Not-loaded exits 0 relies on systemd 262's rc=0 (design door check). The fake returns 0.
4. Test `stop --all stops every allocated leaf, reports each, and one failure does not block the others`: pass.
5. Tests `start removes the stopped record and runs the targeted pass, and refuses a leaf that is not stopped` and `start runs the targeted pass for a leaf whose issue shares its name`: pass.
6. Test `status marks a stopped leaf on the board and in its leaf view`: pass.
7. `bun test tests/command-reference.test.ts tests/docs-links.test.ts --timeout=30000` on `6fe00fa`: 9 pass, 0 fail.

## Checks (on c1dde6b, AKROGON_BASE e5776ad)
- format: rc 0, 2 s.
- typecheck: rc 0, 2 s.
- test: rc 0, 109 s, `Ran 887 tests across 49 files`, 0 fail.
- test_changed: rc 0, 26 s, `Ran 144 tests across 8 files`, 0 fail.
- `6fe00fa` changes only README.md and docs/guide/next.md. Their tests (command-reference, docs-links) were rerun on it: 9 pass.

## Live run, criterion 1 (2026-10-13, about 4 min wall time, on 5d75683+U2+U3 = 76136c3, stop path unchanged since)
Isolation: temp root `/tmp/akls.ea7m` (short path for sockets). The herdr server ran as `systemd-run --user --unit=akls-herdr` with `XDG_CONFIG_HOME`, `AKROGON_HOME` and an `akrogon` shim to the worktree's `src/akrogon.ts` first on PATH. It used a copied herdr config.toml and agent-detection, and the plugin linked there. The temp repo `live` had `worktree_root` in the temp root. Client calls unset every `HERDR_*` variable. Seats used `pi --model none/none` so no real work ran.
- `akrogon next issues/open/live/live`: tab `w1:t2`, panes `w1:p2`, `w1:p3`. Scopes `akrogon-l9a3c59ec67a3-pw1p2-149798-420548.scope` and `-pw1p3-149945-420553.scope` under `akrogon-l9a3c59ec67a3.slice`. The seat agent start failed, as intended with the dummy model.
- In pane A: headless Chrome (`--user-data-dir` in the temp root) plus `sleep 9999`. In pane B: `sleep 9998`. Before stop (implementation/live-before.txt): pw1p2 scope held bash, 17 chrome, 2 chrome_crashpad, 1 sleep. pw1p3 held bash and 1 sleep. Every browser was inside the scope.
- `akrogon stop live`: printed `stopped: live/live`, rc 0. `stopped.yaml` = `live/live: true`. `systemctl --user is-active akrogon-l9a3c59ec67a3.slice` → inactive, 0 units loaded. 0 of the recorded PIDs alive, 0 Chrome processes with the temp profile. `herdr pane list`/`tab list` show only the workspace's own pane `w1:p1` (leaf tab and both panes closed). The worktree `/tmp/akls.ea7m/wt/live` still existed.
- Journal: scopes `Stopping` 13:41:57.214, `Stopped` 13:41:57.232 (18 ms, no timeout).
- Cleanup: akls-herdr stopped, no akrogon-l9a3c59ec67a3 units, no processes with the temp root, temp root and its leaf temp folder removed.

## Incident during the live run (fixed)
The first `herdr plugin link` ran with `HERDR_SOCKET_PATH` and `HERDR_SESSION` still set (I unset the wrong names). It reached the operator's herdr and relinked the operator's `akrogon` plugin to `/home/ivan/.akrogon/worktrees/akrogon/leaf-stop/plugin`. The script contents were identical, so behavior was unchanged, but that path is removed at merge. Restored with `herdr plugin link /home/ivan/Work/infra/akrogon/plugin`. `~/.config/herdr/plugins.json` shows `plugin_root: /home/ivan/Work/infra/akrogon/plugin` again. The first `next` also used the default worktree store and created `~/.akrogon/worktrees/live/live`. It was removed (`git worktree remove`, `rmdir`, `branch -D live` in the temp repo) before retrying with `worktree_root`.

## Known limitations
- Stop waits behind any pass holding the global lock. In the live run `akrogon stop` took 99.7 s end to end while the slice stop itself took 18 ms. A hook-triggered `next` pass held the lock while retrying the failing dummy seat start (30 s `herdr agent start` timeouts). The design requires the record to be written under the lock, so this is by design, but an operator stopping a leaf mid-dispatch can wait up to one pass.
- Saved harness sessions remaining after stop is unverified live: the dummy seats never started, so no session existed. Stop touches no session files (code path: record write plus `systemctl stop` only).
- Chrome was started from the pane shell, not by a running agent. Both run as children inside the same pane scope, which is what the slice stop kills.
- Accepted residual (design): panes split by hand in a leaf tab survive a stop.

## Unverified criteria
None beyond the saved-sessions detail above.

## check.fix (2026-10-13)
Input: `review-B.md` check.repair `Handed to A` list (A-F1, A-F2, B-F1). Prior reviewed base `e5776ad`, head `6fe00fa`. Refresh: origin/main is still `e5776ad`, so the branch did not move. Handed-off base `e5776ad`, head: see the last commit below.

Plan corrections in plan.md: D3 and D6 rewritten, and section "check.fix corrections" added (C1-C3).

Commits (before `6fe00fa`):
- `128150a` test: reproduce a second batch after stopping the merge holder (`Test-Change`, cites review-A F1). Red on `128150a`, before the fix: `expect(readState(bb).batch).toBeUndefined()` received bb's own applied batch, `members: []`.
- `7661377` test: reproduce stop --all stopping merged and closed leaves (`Test-Change`, cites review-A F2). Red on `7661377`, before the fix: `stoppedKeys` received `repo/done`, `repo/landed`, `repo/live`, expected `repo/live`.
- `cc545ad` fix: a stopped merge holder keeps the turn (worker R1, brief-5, commit 2a9ef23). `mergeQueue` keeps a stopped leaf that holds a batch. `mergeTurn` returns when its holder is stopped.
- `43b1ab1` fix: stop --all selects only allocated leaves (worker R2, brief-6, commit dc7a834). `--all` uses `leavesUnder(issues/open)` with a tab and `phase !== 'merged'`.
- `af4ead7` docs: a stopped merge holder keeps the turn (docs/guide/next.md, one sentence).

Proof after the fixes:
- P1 `bun test tests/leaf-stop.test.ts --timeout=30000` on `43b1ab1`: 10 pass, 0 fail (both reproductions green).
- P2 `bun test tests/command-reference.test.ts tests/docs-links.test.ts --timeout=30000` on `af4ead7`: 9 pass, 0 fail.

### Live run, criterion 1 with a real saved session (B-F1)
Same isolation as before (temp root `/tmp/akls.DW3Y`, `systemd-run --user --unit=akls-herdr`, temp `XDG_CONFIG_HOME` and `AKROGON_HOME`, every `HERDR_*` variable unset on client calls, `worktree_root` in the temp repo). Both seats were `pi --model deepseek/deepseek-flash --thinking low`, so seat A ran a real harness session. Code: `af4ead7` worktree via the shim.
- `akrogon next issues/open/live/live`: rc 0, tab `w1:t2`, panes A `w1:p2`, B `w1:p3`. Seat A was prompted, and `prompted.A` = `~/.pi/agent/sessions/--tmp-akls.DW3Y-wt-live--/2026-10-13T11-53-30-020Z_01a1351c-4ea4-717b-90e2-07854fa44140.jsonl`.
- In pane B: headless Chrome and `sleep 9998`. Before stop (implementation/live-session-before.txt): the pw1p2 scope held bash and a running `pi`. The pw1p3 scope held bash, 17 chrome, 2 chrome_crashpad and 1 sleep. The session file was 80330 bytes.
- `akrogon stop live`: printed `stopped: live/live`, rc 0, 117 ms. After (implementation/live-session-after.txt):
  - `stopped.yaml` = `live/live: true`.
  - The slice is inactive, with 0 units.
  - 0 of the recorded PIDs alive, 0 Chrome, 0 pi.
  - herdr shows only the workspace pane `w1:p1` and tab `w1:t1`.
  - The worktree is present.
  - The session file is present at the same path: 107427 bytes, 24 lines, all valid JSON, first record `session`, last `message`. pi appended until it was killed, then nothing was removed.
- Cleanup:
  - The akls-herdr server is inactive, with 0 akrogon-l9a3c59ec67a3 units and 0 processes referencing the temp root.
  - Removed: the temp root, the leaf temp folder `/tmp/akr-1000/04de`, and the fixture's pi session folder `--tmp-akls.DW3Y-wt-live--`. All 3 are absent on read-back.
  - Operator `plugins.json` still points at `/home/ivan/Work/infra/akrogon/plugin`. `~/.akrogon/worktrees` is unchanged, and `~/.akrogon/stopped.yaml` is absent.
- This closes the earlier "saved harness sessions unverified" limitation.

### Checks on af4ead7 (AKROGON_BASE e5776ad)
- format: rc 0, 2 s.
- typecheck: rc 0, 2 s.
- test: rc 0, 110 s, `Ran 889 tests across 49 files`, 0 fail.
- test_changed: rc 0, 27 s, `Ran 146 tests across 8 files`, 0 fail.

Handed-off base `e5776ad`, head `af4ead7`. Remaining limitation: N1 (stop waits behind a pass holding the global lock). This run's stop took 117 ms.
