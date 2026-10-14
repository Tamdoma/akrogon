# Brief 1: run-unit mechanism (U1)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/run-units-u1` (detached at the leaf head; commit your work there).

## 1. Goal

Each top-level `akrogon run-check`/`base-run` gets its own transient scope `akrogon-run-<id>.scope` under the leaf slice plus a guard service that reaps the unit when the wrapper dies; `akrogon stop-run [<run-id>]` stops only runs owned by the caller's scope; admission adds per-run reservations; a stale sweep removes dead records and their units. Plan decisions D1–D10 of `plan.md` in the leaf folder.

## 2. Numbered acceptance criteria

From the leaf's done-criteria, proved by already-committed tests you must make green without editing (one allowed exception below):

1. A top-level `run-check` boxes its command, a child forked at once and a nested `run-check` in one `akrogon-run-<uuid>.scope` under `AKROGON_RUN_SLICE`; `run <id>` prints exactly once on wrapper stdout; units are gone after.
2. `akrogon stop-run [<id>]` stops only runs whose record `scope` equals the caller scope; an id not owned exits non-zero; a caller in no scope exits non-zero; bare `stop-run` prints each matching run as `run <id> <repo>/<leaf> <check>` and stops iff exactly one matches.
3. SIGTERM and SIGKILL of the wrapper leave the scope inactive with no descendant (guard reaps).
4. `base-run` runs setup and command in one unit under the slice and prints `run <id>` once.
5. Admission denies when `usage + peers + 16 GiB >= 48 GiB`, `peers` = per live record `max(0, 16 GiB − unit anon+shmem)`, unit stat read under `<AKROGON_CGROUP_ROOT>/user.slice/user-<uid>.slice/user@<uid>.service/akrogon.slice/<chain(record.slice)>/<record.unit>` where chain expands systemd's name hierarchy: `a-b-c.slice` → `a.slice/a-b.slice/a-b-c.slice`, `akrogon.slice` → no level; absent stat = full 16 GiB; `waiting`/`ended`/dead-pid records count 0.
6. `--leaf <path>` and `--holder <dir>` keep working: scope argv gets `--slice=akrogon-l<hash of repo/slug>.slice` for leaf worktrees and `--leaf` targets, `--slice=akrogon.slice` for `--holder`; every scope AND guard invocation carries `--unit=` — the committed test asserts ≥6 `--unit=akrogon-run-` tokens in `FAKE_SYSTEMD_RUN_LOG` for 3 runs.
7. Nested `run-check` (valid `AKROGON_RUN`) creates no unit, no record, no reservation and prints no `run` line.
8. A stale `runs/*.yaml` (unparseable, or `live()`-invalid) is removed on the next top-level admission and its `unit`/`akrogon-run-<run>-guard` are `systemctl --user stop`ped.

## 3. Read-first list

- `src/admission.ts` — `withAdmission`, `recordSchema`, `live()`, `nested()`, `denied()`, the lock loop.
- `src/scope.ts` — `adoptShell`'s `DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus` pattern, `procRoot()`, `leafSlice()`.
- `src/run-check.ts` — `withAdmission` call site, `constructedEnv`, `spawnLogged`, `check.run` (already a uuid — reuse as the run id).
- `src/base-run.ts` — `withAdmission` call site; its command already runs as `sh -c script` where script does setup then `exec "$@"`.
- `src/akrogon.ts` — dispatch; `stop-run` goes BEFORE the `stop` case's repo use: it must not call `requireRepo` (records live under `globalHome()`).
- `src/shell.ts` — `spawnFiles`/`finishCaptured`/`run`/`command`, `credentialEnv`.
- `tests/run-units.test.ts`, `tests/fake-systemd-run.sh`, `tests/helpers.ts` — the contract; read them, never edit unless implementation genuinely cannot meet them (mismatch, not a fix).
- `tests/run-permit.test.ts` — the reason regex you may widen per D6.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — read before editing.

## 4. Change list and needed interfaces

Owned paths: `src/scope.ts`, `src/admission.ts`, `src/run-check.ts`, `src/base-run.ts`, `src/stop-run.ts` (new), `src/akrogon.ts`, `tests/run-permit.test.ts` (reason strings only). Wave 1, no prerequisites; another worker owns all docs.

- The committed `tests/run-units.test.ts` `unitDir` has the same defect (flat `[<slice>/]` level) — you ARE authorized to edit that one helper (and only it) to the same chain expansion, so real-cgroup `waitPath` and fake-root `seedUnitStat` both match real hierarchy. Cite this revision in your commit.
- `src/scope.ts` gains: `runUnitBase(run) = 'akrogon-run-<run>'`, `runSlice(slice)` (env `AKROGON_RUN_SLICE` non-blank `*.slice` overrides), `runUnitArgv(slice, run, argv, cutBus)`, `startRunGuard(slice, run, wpid)` (`systemd-run --user --quiet --unit=<base>-guard --slice=<slice> -p TimeoutStopSec=5 -- sh -c 'tail --pid=<wpid> -f /dev/null; exec systemctl --user stop <base>'`), `stopRunUnits(...units)` (best-effort `systemctl --user stop`), `sessionBusAddress()` (caller's `DBUS_SESSION_BUS_ADDRESS`, else `unix:path=$XDG_RUNTIME_DIR/bus`, else `/run/user/<uid>/bus`), `callerScope()`.
- Scope argv: `['systemd-run','--user','--scope','--quiet',`--unit=<base>`,`--slice=<slice>`,'-p','TimeoutStopSec=5','-p','CollectMode=inactive-or-failed','--','env','DBUS_SESSION_BUS_ADDRESS=<cut>',...argv]`; spawn env = the constructed check env with `DBUS_SESSION_BUS_ADDRESS` set to `sessionBusAddress()` so the client reaches the real bus while the `env` prefix re-cuts it inside the scope. Wait on the spawned process's exit via `finishCaptured` — `--scope` runs in the foreground.
- `RunRecord` gains `run`, `slice`, `scope` (launching caller scope, `''` allowed), `unit`; `state` gains `'ended'`. `AdmissionHolder` gains those four fields. `withAdmission`: sweep stale records first (skip the caller's own), write `waiting` record carrying the new fields, `denied()` gets the reservation formula with reason `anon+shmem <u> GiB + runs <r> GiB >= 48 GiB` where `r = peers + 16`, held print `run <holder.run>` on stdout before `fn`, `held` gains `release()` which rewrites the record as `'ended'` (then the existing finally removes the file).
- `callerScope()`: `AKROGON_RUN` set → look up `runs/<sha256(token)>.yaml`, return its `scope` if the record exists and is live; else innermost `[^/]+\.scope` segment of `<procRoot>/self/cgroup`; else `''`.
- `src/run-check.ts`: compute `id` (reuse `check.run` uuid), `slice = runSlice(slug === 'checkout' ? 'akrogon.slice' : leafSlice(repo.name, slug))`, `scope = await callerScope()`, `unit = runUnitBase(id) + '.scope'`; pass them in `AdmissionHolder`; inside `fn`, `admission.kind === 'held'` → `await startRunGuard(...)`, `spawnLogged(runUnitArgv(...), cwd, {...env, DBUS_SESSION_BUS_ADDRESS: sessionBusAddress()}, log)` wrapped `try { ... } finally { admission.release(); await stopRunUnits(unit, base+'-guard.service') }`; `nested` → unchanged `spawnLogged(argv, cwd, env, log)` with no guard/scope.
- `src/base-run.ts`: same wiring; its unit argv is `runUnitArgv(slice, run.run, ['sh','-c',script,'akrogon-base-run',...argv], cutBus)` where `script` already does setup-then-command — so setup lands inside the unit for free. It uses `run.run` (its own base-run uuid) as the id, holder `check: 'base-run'`.
- `src/stop-run.ts`: `stopRunCommand(id?)` — candidates = records in `<globalHome>/runs/*.yaml` that parse, `state==='live'`, `live()` and `scope === await callerScope()` (never `''`). With id: stop iff `record.run === id`, else exit non-zero naming run and scope. Without: print `run <run> <repo>/<leaf> <check>` per match, stop iff exactly one, else exit 1. Stop = `systemctl --user stop <record.unit> akrogon-run-<record.run>-guard.service` via `command()`. Dispatch in `src/akrogon.ts` as `case 'stop-run'` calling `stopRunCommand(positionals[0])` with `z.array(z.string()).max(1)` validation, placed before any `requireRepo`; add `stop-run` to the usage list between `stop` and `sync`.
- `tests/run-permit.test.ts`: update the two `/anon\+shmem [\d.]+ GiB >= 48 GiB/` regexes (lines ~174-175, ~220) and the exact `wait_reason: 'anon+shmem 51 GiB >= 48 GiB'` (~line 302) to the new `anon+shmem <u> GiB + runs <r> GiB >= 48 GiB` shape — widened, same meaning. This is the ONE test edit authorized (regex/exact-string only, no logic).

## 5. Do-not, reasons and exceptions

- No test edits beyond the `run-permit.test.ts` reason strings; a red or wrong planned test is a mismatch back to A. Reason: tests are the contract.
- Do not weaken `nested()` (any live record nests), add fallbacks for systemd-run absence, or swallow `systemd-run`/spawn errors; propagate with argv+code context. Reason: honest failure modes; the exception is a revised brief.
- Do not touch `docs/`, `skills/`, `README.md`, `src/AREA.md`, `tests/AREA.md` — owned by the sibling unit.
- `AKROGON_RUN` carries the admission token (secret for record lookup and nesting), not the printed run id; `run` is the public uuid in the record. Do not conflate.
- The guard must be registered BEFORE the scope spawn (wrapper could die mid-spawn).
- `stop-run` never uses `requireRepo` — it runs from any cwd. Restated: test edits limited to the cited regexes; mismatches return to A; no new dependencies; propagate spawn errors.

## 6. Ordered steps

1. `src/scope.ts`: helpers (criteria 1,3,4,6). 2. `src/admission.ts`: schema fields, `callerScope()`, sweep, reservations in `denied()`, `run` print, `release()` (criteria 2,5,7,8). 3. `src/run-check.ts` wiring (criteria 1,6,7). 4. `src/base-run.ts` wiring (criterion 4). 5. `src/stop-run.ts` + `src/akrogon.ts` dispatch (criterion 2). 6. `tests/run-permit.test.ts` reason strings (keeps existing tests green). 7. Typecheck + the targeted tests in §7.

Advisory: 7 files, ~45 turns.

## 7. Commands

Targeted tests, run from the worktree after `bun install --frozen-lockfile`:
- `bun run typecheck`
- `bun test tests/run-units.test.ts tests/run-permit.test.ts tests/command-reference.test.ts --timeout=45000`

`command-reference`'s `stop-run` README row fails until the sibling docs unit lands — report it as known-unverified, not a defect. All `run-units` failures must be zero. On a loaded host the real-unit tests' fixture git work can eat their budget; a timeout that shows only setup cost is worth one retry.

## 8. Done-when, evidence and report

All run-units tests and run-permit tests green; typecheck clean; commit(s) on the detached head; return commit id + this report filled.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
