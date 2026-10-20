# review-A: green-merge check.review

Base `abfee125b4ab68bec34bd73325c077c12c74fc47`. Reviewed head `4ab37054` (same tree as `d697d6dd`).

## Verification evidence

- `akrogon verify` on d697d6dd was green (run `c4a3b3a0-1bb2-4177-9b1a-0f4ae2e5daca`). Results: test `implementation/check-test-1792425279540-2983992.log` (1062 pass, 0 fail) and typecheck `implementation/check-typecheck-1792425282095-2983992.log`. 4ab37054 is a trailer-only empty commit with the same tree, and `akrogon phase … check.review` accepted it.
- Criteria 1–9: `check green-merge-2: 0 implementation/check-green-merge-2-1792425109478-2969788.log` ran on d697d6dd, after the last change to `tests/green-merge.test.ts` and its helpers (`tests/helpers.ts` changed in 812c4ed2 and only added `seatOwned`).
- Criterion 10: `git --no-pager diff --stat abfee125..HEAD` shows `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md` and `src/AREA.md` changed. Their content matches the plan's docs checklist.
- AREA listing: every source path named in `src/AREA.md` and `tests/AREA.md` exists. The only names not found are runtime state files (`log.jsonl`, `verify-runs.jsonl`, `config.yaml`, `stopped.yaml` and others). They predate this diff and are state names, not source pointers.
- Documented behavior: `README.md` has the new `land` row. `skills/merge-issue/SKILL.md` describes the green path as the command's and lists B's red, gate, push and rebase wakes. No other documented behavior changed.

## Fix

### F1. The land unit cannot reach herdr, so every handoff, broadcast and post-merge wake that needs a pane fails inside the land run

- **Defect.** `launchLand` (`src/land.ts:17`) starts the unit with only `PATH`, `HOME`, `DBUS_SESSION_BUS_ADDRESS` and `AKROGON_HOME`. Everything the land run does after its push or handoff goes through herdr:
  - `handOff` → `mergeWake` → `dispatchMergeLeaf` (B's merge prompt).
  - `landedWake` → `broadcastPass` (B's broadcast prompt), `dispatchDependents` and `closeMergedTab`.
  - The next holder's B dispatch.
- **Realistic source.** This is the operator's real host. The live herdr server listens on a named-session socket: `HERDR_SOCKET_PATH=~/.config/herdr/sessions/infra/herdr.sock` in the caller's environment.
  - The systemd user manager carries no `HERDR_*` variable. `systemctl --user show-environment | grep -c ^HERDR` printed `0`, observed directly, because the bus is cut inside `run-check`.
  - herdr without `HERDR_SOCKET_PATH` falls back to `~/.config/herdr/herdr.sock`, which does not exist. Trace: `check herdr-unit-env: 0 implementation/check-herdr-unit-env-1792425434841-67944.log` shows `herdr pane list` exits 1 with `server_not_running … no herdr server is running at ~/.config/herdr/herdr.sock`. That is the environment the land unit gets.
- **Consequence today.** On a real command-run merge every herdr call in the land run fails. `mergeWake` and `landedWake` report the error and do not retry (D10).
  - Criteria 2, 4 and 5: the batch is saved as `owner: seat`, but B is not prompted until some later `next` runs from a herdr-environment hook.
  - Criterion 6: the broadcast prompt waits the same way.
  - Brief What: dependents and tab cleanup no longer happen at once after a landed push ("so dependents, tab cleanup, self-update and the next holder's turn follow at once").
  - When no other pane event fires, the leaf sits with no seat.
- **Gap.** Every proof runs `akrogon land` directly with the test environment, and the fake `systemd-run` never runs the unit. The unit environment is untested, and the report lists this as a limitation.
- **Fix.** Carry the caller's herdr connection into the unit, for example `--setenv=HERDR_SOCKET_PATH=<value>` when set. Then extend criterion 1's systemd-run log assertion (case 1 already reads that log) so the launch argv must carry it. D3's argv list needs a dated implementation note for the added variable.

## Nits

- **N1. A deterministic crash in the land run relaunches forever with no B handoff.** Examples are a `verify` setup exception or a git error outside the push. Each later `next` sees the unit dead and relaunches it (D4.4), and the attempt never reaches B. `status` shows `land dead`. Deferred because no realistic failing input was traced, only the code path. A real crash record recurring across two relaunches would make it a Fix.
- **N2. An operator `akrogon phase <slug> merged` (no `--slot`) on a command-owned attempt is not refused while the land unit runs.** Both paths reach `batchPush` under the global lock, and the fast-forward push plus `candidate` reconcile should keep this to one move. That was not exercised. Deferred because it is an operator-only action with no traced harm. A double `merged` attempt line from such a race would make it a Fix.

## Verdict

fix
