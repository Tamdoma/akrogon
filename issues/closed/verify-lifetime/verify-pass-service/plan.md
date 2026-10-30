# Plan: verify-pass-service

## Design conflicts

None found. Brief and design agree.

## Decisions

### D1. Pass service shape

Each `runOnce` runs inside a systemd user transient service:

- Unit `akrogon-verify-<id>.service` (`passUnit(id)` in `src/verify.ts`), launched with `systemd-run --user --quiet`, `--slice=akrogon.slice`, `-p CollectMode=inactive-or-failed`, `-p TimeoutStopSec=5`, `--working-directory=<repo.root>`, `--setenv` per forwarded name, payload `env <AKROGON_PASS_DIR=...> <AKROGON_SCOPE=...> <process.execPath> <toolRoot>/src/akrogon.ts verify-pass <dir>`. No `sh -c` wrapper: payload is direct argv; `--working-directory` supplies the cwd.
- Stream capture: `verifyPassCommand` wraps `process.stdout.write`/`process.stderr.write` at its top to also append each chunk to `<dir>/out` and `<dir>/err` (tee, pass-through preserved). This covers `console.*`, `spawnLogged`'s stdout/stderr re-emit, `run <check id>` and `waiting for` writes under real systemd and under the fake seam identically, so no `StandardOutput=` unit properties are needed.
- `akrogon verify-pass <dir>` is a new internal verb in `src/akrogon.ts`: dispatch only, no parseArgs options. `docs/reference/commands.md` gains one row and `tests/command-reference.test.ts` `contracts` gains `'verify-pass': '<dir>'` (required by the reference-coverage test).

### D2. Pass record (join/result carrier), registry at `<AKROGON_HOME>/verify-passes/<id>/`

Files: `record.yaml`, `out`, `err`, `status`.

`record.yaml` fields: `run`, `repo` (name), `root` (repo root), `leaf` (caller slug), `target` (caller target), `unit_name`, `caller_scope`, `tree`, `scope` ('leaf'|'merge'), `commands` (`{name, command}[]`, the exact resolved set), `setup` (resolved setup command text or ''), `compares` (optional), `pid` (0 until the pass starts), `boot_id`, `pending` (bool), `created` (ISO).

- `pid: 0, pending: true` at creation; `verify-pass` first writes `{pid: process.pid, boot_id, pending: false}`. A live pass = `pending` fresh (age < 30 s) or `pidAlive(record.pid) && boot_id === currentBoot`.
- `AKROGON_SCOPE` env = `caller_scope` resolved in the caller. `callerScope()` gains a first branch returning `process.env.AKROGON_SCOPE` when set-and-nonempty (D-answer: carrier is a plain env name, not `AKROGON_RUN`, since `nested()` would treat the pass as inside a run and change admission semantics; `liveRuns` records are untouched — `scope` field content is unchanged, only its source). Set inside the service only via `env AKROGON_SCOPE=` in the unit payload, never through `--setenv` of a parent value (env name is absent in every caller). `verifyPassCommand` also sets `process.env.AKROGON_SCOPE` for the fake-exec/inline path where payload env reaches it.
- `status` holds the pass's exit code: 0/1 = `reportRun`-equivalent outcome, 2 = `runOnce` threw or post-receipt step failed, written by `verifyPassCommand` in `finally`-style flow after rethrowing. Absent `status` + dead pass = non-zero waiter result.

### D3. Join under `recordLock` (`git rev-parse --git-path akrogon-verify-runs.lock`)

`passOnce(repo, caller, scope, sha, expectedCommands, setupText, compares, akrogonBase)`:

1. Compute `tree` and the key fields in the caller.
2. Under `recordLock` (exclusive): scan `verify-passes/*` for records with `repo === repo.name` and key match on `{caller_scope, target, leaf, unit?, tree, scope, commands JSON-equal, setup, compares}`. A record whose pass is live joins (returns its dir/id); a matched dead pass is skipped; no match → `mkdirSync` the new pass dir (atomic), write `record.yaml` with `pending: true, pid: 0`.
3. Outside the lock: print `run <id>` to stderr, launch the service for a new pass (launch failure removes the pending dir and throws), then `waitPass(dir)`.
4. `waitPass` streams `out`/`err` increments to the caller's stdout/stderr until the pass is dead, final-drains, returns `status`-file code or 1 when absent.

Rationale: the registry dir is keyed by pass id under `AKROGON_HOME` (repo-independent, so `stop-run` finds passes without a repo context); join metadata stays out of the receipt schema (design point 6). `recordLock` already exists; the lock is held only for filesystem reads/writes, never across `systemd-run` (the fake seam would deadlock — see D6).

### D4. `verify()` caller rewrite (src/verify.ts)

- `verify()`: `verifyCaller` → `scope`/`sha`/`tree`/`expected`/`setupText` resolved once in the caller; `greenRun` early-reuse unchanged; then each `runOnce` site becomes `passOnce` returning `{id, code}`; `run` lines come from `passOnce`.
- `runOnce` keeps its signature minus printing ownership: it still appends the receipt (now inside the pass process, `pid: process.pid` = pass pid — consumers `noticeCovers` and reconcile's `ownerDead` stay correct), runs checks, rewrites under the record lock, sends the notice, removes the checkout. The `run <id>` pass line is printed by `passOnce`, and `verify-pass` appends the `verify <scope> <sha>: green|red` summary into its own `out` before `status` so starters and joiners see identical lines.
- Known-red: `head` needs only its pass id (the caller's own generated or joined id) → `compares`. `redRun` lookup unchanged. A fresh head `code === 0` returns 0 (summary already printed by the pass); otherwise continue to the base `passOnce` with `compares = head.id`, then `knownRedReceipt` as today.
- `reportRun` becomes the pass-internal summary printer (used by `verifyPassCommand`), unchanged in shape otherwise; `verify()` no longer calls it for fresh passes.

### D5. `stop-run` pass stop (src/stop-run.ts)

`stopRunCommand(id)`: unchanged scan of `liveRuns()` for check runs. If `id` is set and no check-run record matches, scan `<AKROGON_HOME>/verify-passes/*` for `run === id && caller_scope === scope && live`; on match `systemctl --user stop akrogon-verify-<id>` (one call, `CommandError` on failure). Foreign-scope or absent → existing `No run <id> owned by scope` error, pass keeps running. The service stop kills the pass process; `startRunGuard` then stops the current `akrogon-run-*` scope (waiter pid gone), a `waiting` full check's poll exits its pass with a dead wrapper — same mechanism as caller death. Bare `stop-run` (no id) is unchanged: passes are not listed as check runs.

### D6. Env forwarded to the service (transport only, same values the caller's checks would see)

`--setenv` for: `HOME`, `PATH`, `AKROGON_HOME`, `AKROGON_LEAF_TEMP_ROOT`, `AKROGON_RETIRED_TEMP_ROOT`, `AKROGON_PROC_ROOT`, `AKROGON_CGROUP_ROOT`, `AKROGON_RUN_SLICE`, `AKROGON_RUN` (forwarded when set-and-nonempty so a pass inside a check run keeps its checks nested under that run — the pass's checks behave as attached-today), `XDG_RUNTIME_DIR`, `XDG_CACHE_HOME`, `NODE_DISABLE_COMPILE_CACHE`, `FAKE_SYSTEMD_RUN_LOG`, `FAKE_SYSTEMCTL_DB`, `FAKE_SYSTEMCTL_LOG`, `FAKE_HERDR`, `FAKE_BUSCTL_HOME`, every `repo.config.env`/`pass_env` name present in the caller, `DBUS_SESSION_BUS_ADDRESS=sessionBusAddress()`. `AKROGON_PASS_DIR` and `AKROGON_SCOPE` are set via the `env` payload prefix, not parent values. Forbidden env names are never forwarded (they are refused in the caller first).

### D7. Reconcile sweep for dead pass dirs

`src/reconcile.ts` host step: for each `<AKROGON_HOME>/verify-passes/*`, read `record.yaml` (drop on unreadable after grace), drop the dir when the pass is dead (pending stale ≥30 s, or `!pidAlive`/boot mismatch) and the newest mtime is ≥ 60 min — the grace covers late waiters draining `status`/`out`. Live or young dirs kept. `verify-*` worktree sweep is unchanged (receipt pid = pass pid, `ownerDead` already correct — D-answer confirmed: the owner check sees the pass process).

### D8. Fake seam change (tests/fake-systemd-run.sh)

Add a third branch: when the argv contains ` verify-pass `, shift to `--` and `exec` the payload (skipping the leading `env NAME=value` words via `exec env ...` — the payload already starts with `env`, so plain `exec "$@"` works since the fake forwards the whole payload after `--`). All other non-`--scope` calls keep `exit 0`. This makes the entire pass path (record, join, wait, status, stream files) run synchronously in the caller under unit tests; `pidAlive`-based liveness is then always "dead at poll time" for fake runs — join tests need real systemd (D9).

### D9. Test surfaces

- `tests/run-units.test.ts` (real systemd, `spawnReal`/`spawnScoped`): new `test.serial` cases for criteria 1–5; update the existing `'a verify runs setup and each command in its own run unit'` stderr `run` count 2 → 3 (new pass line first). Shared fixture gains `RUN_UNITS_OUT`-independent checks written per test through config rewrite as existing tests do.
- `tests/verify.test.ts`: delete `'a run killed during setup leaves a record with start and no end or removal'` — its expectation encodes the retired caller-bound lifetime (design point 7; replaced by the criterion-1 test asserting completion after caller kill). `Test-Change:` trailer citing the design line.
- `tests/command-reference.test.ts`: `contracts` gains `verify-pass`. `Test-Change:` trailer.
- `tests/fake-systemd-run.sh`: D8 branch. `Test-Change:` trailer.
- `tests/helpers.ts`: extend `fixture()` to symlink `fake-systemctl.ts` into `unitBin` and set `FAKE_SYSTEMCTL_DB`/`FAKE_SYSTEMCTL_LOG` per fixture (is-active/stop in fake runs hit a shim, not the host manager). `Test-Change:` trailer.

## Open-for-the-plan answers

- Exact scope carrier: `AKROGON_SCOPE` env (D2). `liveRuns` records parse unchanged.
- Where the pass leaves exit status: `<AKROGON_HOME>/verify-passes/<id>/status` plus `record.yaml` (D2), swept by reconcile after a grace (D7) — no receipt schema change.
- Reconcile owner check on a live pass checkout: receipt `pid` = pass pid, `ownerDead` sees it alive — no code change needed (D7).

## Read-first paths

- `src/verify.ts` — `verify`, `runOnce`, `reportRun`, `verifyRunSchema`, `verifyCommands`, `greenRun`/`redRun`/`knownRedReceipt`/`requireGreenReceipt`, `recordLock`, `noticeCovers`/`pidAlive`/`bootId`.
- `src/run-check.ts` — `checkedRun`, `constructedEnv` (`copied` names), `LeafTarget`, `refuse`.
- `src/admission.ts` — `callerScope`, `withAdmission`, `liveRuns`, `nested`, `cancelWaitingRun`, record schema.
- `src/scope.ts` — `runUnitArgv`, `startRunGuard`, `stopRunUnits`, `runSlice`, `sessionBusAddress`, `procRoot`.
- `src/land.ts` — `launchLand` argv shape, `land` verify call.
- `src/stop-run.ts` — `stopRunCommand` scope match.
- `src/reconcile.ts` — `ownerDead`, `verify-*` worktree rule (~line 1039), run-root/owner sweeps, host step.
- `src/config.ts` — `toolRoot`, `globalHome`, `setupCommand`, `worktreeStore`, `base`, env/`pass_env` schema, reserved `constructed` set.
- `src/akrogon.ts` — verb dispatch, `verify` case.
- `tests/helpers.ts` (`fixture`, `cli`, `spawnFiles` usage, `fakeAkrogon`, `fakeSystemctl`), `tests/run-units.test.ts` (`spawnReal`, `spawnScoped`, `waitActive`, `unitDir`, `realFixture`), `tests/verify.test.ts` (fixture flow, `records`, `callerWorktree`), `tests/fake-systemd-run.sh`, `tests/fake-systemctl.ts`, `tests/command-reference.test.ts` (`contracts`).
- `docs/reference/commands.md` (verify, stop-run rows), `src/AREA.md` (lines 6, 19–21, 33), `docs/reference-index.md`.
- `learnings/LESSONS.md` — no lesson hits this mechanism; the 2026-10-13 scope-kill and 2026-10-15 spawn-PATH lessons were checked and apply only to run scopes / spawn PATH (already covered by `--setenv=PATH`).

## Interfaces

- `akrogon verify` — unchanged flags; new first stderr line `run <pass id>`; same remaining lines (streamed from the pass), same exit code, including joins.
- `akrogon verify-pass <dir>` — internal; runs one pass from its `record.yaml`; entry point of the service unit.
- `akrogon stop-run [<id>]` — check-run semantics unchanged; `<id>` may now name a live pass owned by the caller scope.
- Pass dir `<AKROGON_HOME>/verify-passes/<id>/`: `record.yaml`, `out`, `err`, `status`.

## Waves

Every unit shares `src/verify.ts`/`src/verify-pass.ts` ownership or depends on its interfaces, so the run is serial-solo (one unit, one wave): implement-issue's rule has A implement it directly, no workers.

### Wave 1 (sole unit) — all criteria

Owns: `src/verify.ts`, `src/verify-pass.ts` (new), `src/stop-run.ts`, `src/admission.ts`, `src/akrogon.ts`, `src/reconcile.ts` (pass-dir sweep), `tests/verify.test.ts`, `tests/run-units.test.ts`, `tests/fake-systemd-run.sh`, `tests/helpers.ts`, `tests/command-reference.test.ts`, `docs/reference/commands.md`, `src/AREA.md`. Shared test resource: the host systemd user manager (real-systemd tests are `test.serial` against `akrogon-test-*` slices). No prerequisite units.

## Condition trace (decision → criterion condition → case)

- C1 "pass keeps running after caller group SIGKILL; receipt completes; checkout removed" → D1 service + D2/D7. Case: kill caller's pgid mid `test` check; assert receipt end+setup+exits+logs and `run.path` gone. Shown red on base (pass dies with caller today).
- C2 "repeat call on same key starts no second pass; a differing key part starts its own" → D3 join. Cases: repeat identical call while check sleeps (one receipt; joiner prints per-command lines + same code); caller in a different scope, and a caller on a different tree (new commit), each produce a second receipt. Shown red on base: second `verify` would wait on the first's record lock then run a second pass — actually on base there is no join at all, so the test fails at `akrogon verify-pass`/record dir absence and at two receipts.
- C2 "dead pass never joined" → D2 liveness + D4. Case folded into C4's stopped-pass repeat: after `stop-run`, a repeat `verify` prints a different pass id and writes a second receipt.
- C3 "exit code = pass outcome" → D2 status + `waitPass`. Cases: green (0, attached and via C2 joiner), red check (1), checkout-removal failure (check command `rm -rf`s the store checkout at its end → `git worktree remove` fails → status 2 → caller non-zero), stop-killed pass (no end, no status → caller non-zero). The no-status/dead-pass branch is exercised by the C4 stop test.
- C4 "`run <id>` first; stop-run stops whole pass during a check and while a `full` check waits; foreign scope refused; receipt keeps no end and is never reused" → D5 + D1. Cases: (a) mid-check stop, (b) `full`-waiting stop (seed a live full record from a sleeper, configure the pass's check as `full`), (c) foreign-scope `stop-run <id>` refused + pass still alive, (d) post-stop repeat gets a new pass id. Between-checks stop shares the service-stop mechanism (recorded, no separate case — the pass has no code path distinguishing them: systemd stop arrives identically in either state, and a stop landing between commands leaves `commands` shorter but identical semantics).
- C5 "check runs keep the caller's scope as owner" → D2 `AKROGON_SCOPE` + `callerScope` branch. Case: `spawnScoped` verify; while the check sleeps, the live run record's `scope` equals `paneA.scope` — not the service's empty cgroup scope.
- C6 docs → doc lines reviewed against shipped behavior (no runtime test, per standing design).

## Red results on the base commit

Commit `05532cdc` (this branch) adds the tests. On the base code each criterion test fails for the missing behavior:

- `run-units` "a verify pass survives its caller being SIGKILLed mid-check": `error: pass receipt still incomplete after the caller died` (30 s poll; the pass dies with the caller today) — proven-bug red.
- `run-units` "a repeat verify joins the live pass...": fails at the join assertions (no pass id printed; each call runs its own suite).
- `run-units` "stop-run <pass id> stops the whole pass": `Expected: 0 Received: 4` on `systemctl is-active akrogon-verify-<id>` (no such unit exists today).
- `run-units` "stop-run <pass id> while a full check waits": `Expected: 0 Received: 1` on `stop-run <verify id>` (stop-run resolves no pass id today).
- `run-units` "a pass keeps the starting caller scope...": on base the caller dies with its check (30 s: `pass did not complete after its check was stopped`); its deliberate-break red is dropping the `AKROGON_SCOPE` carrier, which turns `record.scope` into `''`.
- `run-units` "a verify runs setup and each command in its own run unit": `Expected length: 3 Received length: 2` (no pass `run` line).
- `command-reference` "escaped alternatives...": `+ "verify-pass"` unmatched verb (dispatch lacks it).
- `verify.test` "a failure after the receipt is written...": green on base by construction — the attached post-receipt failure path already exits non-zero; the test locks the behavior the new plumbing must preserve, and the joined variant is proven by the C2 test.

## Verification map

| Criterion | Boundary | Before → after | Command (through `akrogon run-check`) | Size | Rerun trigger |
|---|---|---|---|---|---|
| 1 | CLI + real systemd | Pass dies with caller → survives; no-end receipt → full receipt + removed checkout | `akrogon run-check --name test -- sh -c 'bun test --timeout=120000 tests/run-units.test.ts'` (new test.serial "a verify pass survives its caller's process group") | minutes | Any change to launch/wait/receipt code |
| 2 | CLI + real systemd | Second call starts a second suite → joins | same file, "a repeat verify joins the live pass; a different key starts a new pass" | minutes | join-key or liveness changes |
| 3 | CLI (fake seam for green/red/removal; real for killed) | wrong/absent code mapping → exact | `bun test tests/verify.test.ts` (green/red codes) + run-units removal+stop cases | minutes | status/waiter changes |
| 4 | CLI + real systemd | no pass id printed, no pass stop → printed + stopped | run-units "stop-run <pass id> stops the pass" + full-wait stop case | minutes | stop-run or pass-record changes |
| 5 | CLI + real systemd | records lose caller scope → keep it | run-units "a pass keeps the caller's scope on its check records" | minutes | carrier changes |
| 6 | docs | absent → stated | read-back in review (no runtime proof) | — | doc edits |

All test commands run via `akrogon run-check --name test -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && bun test ...'` matching the repo's configured `test` check shape; new test files are added by this leaf (allowed for proof inputs — the runner exists at AKROGON_BASE). Proof commands: `bun test tests/verify.test.ts` for criterion-3 code paths and regression, `bun test tests/run-units.test.ts` for criteria 1,2,4,5, plus `format`/`typecheck` checks before implement end.

## Doc checklist (criterion 6)

- `docs/reference/commands.md` — `verify` row: pass service, `run <pass id>`, join rule, exit-code source; `stop-run` row: pass id stop + foreign-scope refusal; new `verify-pass` row (internal).
- `src/AREA.md` — line 6 verify/run-check/stop-run, line 19 verify internals, line 20 admission (`AKROGON_SCOPE` carrier), line 21 stop-run/scope, line 33 receipt timing (append inside the pass, status file, `verify-passes` sweep).

## Env check

`akrogon status verify-pass-service` prints no `Missing:` lines; design names no credentials. No blocker.

## Known limitations

- `run <check id>` lines appear inside the pass's `err` stream replayed by the waiter — a joiner sees them slightly delayed, and a seat stopping a specific check run reads them there; `stop-run` for a check id keeps working regardless.
- A pass whose service never starts leaves a pending record swept by reconcile (30 s pending TTL + 60 min dir grace).

## Implementation notes

- 2026-10-27: Resolve a matching live head pass before completed-receipt reuse, as brief C2/C3 and design binding decision 4 require repeats to wait for the pass outcome including post-receipt failures. Receipt gate definitions remain unchanged.
