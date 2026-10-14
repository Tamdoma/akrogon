# Plan: run-units

Debate off (`debate: "no"`); synthesized directly from brief and design.

## Decisions

- **D1** Unit mechanism is the chart-proven pair (forks/cross-leaf-kill.md proof 2026-10-13): a transient scope `akrogon-run-<id>.scope` holding the run command, plus a guard service `akrogon-run-<id>-guard.service` in the same slice running `tail --pid=<wrapper> -f /dev/null; systemctl --user stop <scope>`. The wrapper starts the guard before spawning the scoped command, and on normal end stops scope and guard itself in a `finally`. Wrapper SIGTERM or SIGKILL leaves `tail` exiting and the guard stopping the scope. `TimeoutStopSec=5` on the scope. New helpers live in `src/scope.ts` beside `adoptShell`.
- **D2** The scoped command runs as `systemd-run --user --scope --quiet --unit=akrogon-run-<id> --slice=<slice> -p TimeoutStopSec=5 -- env DBUS_SESSION_BUS_ADDRESS=<cut> <argv>`. The spawn env gives the `systemd-run` client the real session bus (wrapper's `DBUS_SESSION_BUS_ADDRESS`, else `unix:path=<XDG_RUNTIME_DIR|/run/user/<uid>>/bus`, the proven fallback); the `env` prefix re-cuts the bus inside the scope so the constructed check environment is unchanged. Exit code and stdio pass through `systemd-run --scope` (proof T1). `spawnLogged` is reused with this argv and the real-bus env; cgroup membership is set at fork time, so a child that forks at once lands inside.
- **D3** Parent slice: leaf/worker/base-scope runs use `leafSlice(repo, slug)`; `--leaf <path>` runs use that leaf's slice; `--holder` runs (slug `checkout`) sit directly under `akrogon.slice` (no leaf identity; "same units under akrogon.slice" per C6). `AKROGON_RUN_SLICE` (non-blank `*.slice` name) overrides the parent — a test seam of the `AKROGON_CGROUP_ROOT` class, used only so suite runs land under `akrogon-test-*.slice` per the grant.
- **D4** `RunRecord` gains `run` (uuid), `slice`, `scope` (launching pane scope name, `''` when the caller is in no scope), `unit` (`akrogon-run-<id>.scope`); `state` gains `'ended'`. The record is still created `waiting`, flipped `live` inside the admitting lock, and removed in `finally`.
- **D5** `callerScope()` in `src/admission.ts`: an `AKROGON_RUN` matching a live record returns that record's `scope` (a seat inside a run has the run scope, not the pane scope, as innermost cgroup segment); otherwise the innermost `[^/]+\.scope` segment of `<procRoot>/self/cgroup` verbatim (an `akrogon-run-*` innermost stays itself — a foreign-token caller proves nothing it did not have); otherwise `''`. `stop-run` never matches on `''`.
- **D6 superseded (operator 2026-10-14):** no reservation and no memory or spacing condition; see brief criterion 5. Original text kept for history:
  **D6** Reservation accounting inside `withAdmission`, all under the existing flock. `RESERVE = 16 GiB` constant. Deny when `usage + peers + RESERVE >= 48 GiB`, where `peers` sums over `live` records: `max(0, RESERVE - unitStat)` with `unitStat` = the unit's `memory.stat` `anon+shmem` under `<cgroupRoot>/.../akrogon.slice/[<record.slice>/]<record.unit>/` (`akrogon.slice` as record slice = no extra level); absent `memory.stat` = `RESERVE` (record live ⇒ pre-creation). `'waiting'`, `'ended'` and dead records count 0. Reason text becomes `anon+shmem <u> GiB + runs <r> GiB >= 48 GiB` (`runs` = peers + candidate reserve) — the three `anon\+shmem ... >= 48 GiB` regexes in `tests/run-permit.test.ts` get widened, not weakened. Normal end releases: record → `'ended'` before `stopRunUnits` (the draining unit's memory still counts in slice usage), then the existing `finally` removes the file. Killed wrapper ⇒ record stays, dead pid fails `live()` ⇒ 0. A nested `run-check`/`base-run` writes no record and adds no reservation.
- **D7** `akrogon stop-run [<run-id>]` in a new `src/stop-run.ts`: caller scope per D5, non-empty equality against `live` records' `scope`. With an id: no match exits non-zero naming the run and the caller's scope (a run launched by another pane is refused). Without: print each matching run as `run <id> <repo>/<leaf> <check>` and stop iff exactly one matches, else exit 1. Stop = `systemctl --user stop <record.unit> akrogon-run-<record.run>-guard.service` via `command()` — errors propagate. No repo lookup needed (records are host-global under `AKROGON_HOME`); `stop-run` skips `requireRepo` so it works from any cwd.
- **D8** On admission (`held` only) `withAdmission` prints `run <id>` on stdout before `fn` runs. Nested runs print nothing and create nothing (D6).
- **D9** Stale sweep (binding 1a's "next run-check" arm): inside `withAdmission`'s top-level path before writing its own record, each `runs/*.yaml` — unparseable → remove; `live()`-invalid (dead pid, wrong start, other boot) → best-effort `systemctl --user stop <unit> <guard>` then remove the file. The "and allocate" arm of 1a is consciously not implemented: allocate prompts seats and a stale `akrogon-run-*` unit there is self-cleaning through the guard and the next run's sweep; noted as an open limitation for review.
- **D10** Wrapper cleanup ordering: `try { spawnLogged(unitArgv) } finally { admission.release(); stopRunUnits(unit, guard) }` — `stopRunUnits` is `systemctl --user stop` on both names, result ignored (stopping an already-unloaded unit is success for cleanup purposes; the guard covers every abnormal exit).
- **D11** `tests/helpers.ts`: `fixture()` creates `f.home/unitbin` holding a `systemd-run` symlink to the new `tests/fake-systemd-run.sh`; `cli()` and `fakeAkrogon()` PATH-prepend it (caller-supplied `PATH` still wins); `cli()` defaults `AKROGON_RUN: ''` so suite-inherited tokens cannot leak into fixture spawns (an explicit caller `AKROGON_RUN` still wins). The fake shim logs argv to `$FAKE_SYSTEMD_RUN_LOG`, execs the payload after `--` for `--scope` calls, exits 0 for service calls. Real-unit tests spawn the entry directly with a clean PATH and `AKROGON_RUN_SLICE`.
- **D12** Skills wording (C7): `skills/implement-issue/SKILL.md:57`, `skills/implement-issue/worker-protocol.md:13`, `skills/check-issue/SKILL.md:63` replace the "stops only a process it started, by the PID it recorded" clause with "stops a run with `akrogon stop-run <run-id>` (the run line printed at run start), never by pattern", keeping the pattern-kill ban sentence. `README.md` gains the `stop-run` row, `docs/guide/setup.md:70` paragraph gains units + reservation + stop-run, `docs/guide/next.md` stop section gains a stop-run line, `src/AREA.md` updates the admission/scope/stop lines, `tests/AREA.md` lists the new file.

## Read-first

- `src/admission.ts` — record schema, `live()`, `nested()`, `denied()`, the lock loop to extend.
- `src/scope.ts` — `adoptShell`'s per-subprocess bus pattern (`DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus`) and `procRoot()`/`leafSlice()`/`paneScope()` helpers.
- `src/run-check.ts`, `src/base-run.ts` — the two `withAdmission` call sites, `constructedEnv`, `spawnLogged`.
- `src/akrogon.ts` — verb dispatch and usage line; `tests/command-reference.test.ts` contract map.
- `src/status.ts:409` — `waitingRuns()` consumer (unchanged).
- `tests/run-permit.test.ts` — spawn/`Cap`/`waitText`/`marks` patterns and the reason regexes to widen.
- `tests/helpers.ts`, `tests/fake-busctl.ts`, `tests/fake-proc.ts`, `tests/fake-systemctl.sh` — fixture seams.
- `issues/chart/permit-bypass/forks/cross-leaf-kill.md` (proof, lines 26-31), `issues/chart/host-test-load/proofs.md` (T1/T7: scope argv, bus behavior).
- `skills/implement-issue/SKILL.md:57`, `worker-protocol.md:13`, `skills/check-issue/SKILL.md:63` — the recorded-PID stop rule to replace.
- `docs/guide/setup.md:70`, `docs/guide/next.md:126-149`, `README.md:147-150` — doc surfaces.

## Interfaces

```ts
// src/scope.ts
export function runUnitBase(run: string): string;              // 'akrogon-run-<run>'
export function runSlice(slice: string): string;               // AKROGON_RUN_SLICE validated, else arg
export function runUnitArgv(slice: string, run: string, argv: string[], cutBus: string): string[];
export async function startRunGuard(slice: string, run: string, wpid: number): Promise<void>;
export async function stopRunUnits(...units: string[]): Promise<void>; // best-effort
export function sessionBusAddress(): string;

// src/admission.ts
export interface AdmissionHolder {
  repo: string; leaf: string; check: string;
  run: string; slice: string; scope: string; unit: string;
}
export type Admission =
  | { kind: 'held'; token: string; wait_ms: number; release(): void }
  | { kind: 'nested'; token: string };
export function liveRuns(): RunRecord[];        // state 'live' + live pid/start/boot
export function callerScope(): Promise<string> | string;

// src/stop-run.ts
export async function stopRunCommand(id: string | undefined): Promise<number>;
```

`src/akrogon.ts` gains `stop-run: '[<run-id>]'` dispatch and the usage line; `RunRecord.state` becomes `'waiting' | 'live' | 'ended'`.

## Checklist (waves)

Tests (`tests/run-units.test.ts`, `tests/fake-systemd-run.sh`, `tests/helpers.ts`, `tests/command-reference.test.ts`) are committed on the leaf branch by this pass; units implement code and docs only.

- **Wave 1**
  - **U1** run-unit mechanism: owns `src/scope.ts`, `src/admission.ts`, `src/run-check.ts`, `src/base-run.ts`, `src/stop-run.ts` (new), `src/akrogon.ts`, `tests/run-permit.test.ts` (reason regex only), `tests/run-units.test.ts` + `tests/helpers.ts` + `tests/fake-systemd-run.sh` (fixes only if implementation drifts from D1–D9). Covers done-criteria 1-6, 8.
  - **U2** skill and doc wording: owns `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/check-issue/SKILL.md`, `README.md`, `docs/guide/setup.md`, `docs/guide/next.md`, `src/AREA.md`, `tests/AREA.md`. No dependency on U1 — the surface is pinned by D7/D12.
- **Wave 2** — none; disjoint owned paths, no shared test resource, no ordering.

Affected agent docs: the three skill files (one-line swaps per D12). Affected human docs: `README.md`, `docs/guide/setup.md`, `docs/guide/next.md`, `src/AREA.md`, `tests/AREA.md`.

## Done-criteria → proof

All proof commands exist at `AKROGON_BASE` (`bun test`, `bun run typecheck`); real transient units under `akrogon-test-*.slice` and fake cgroup roots are test inputs inside the readiness grant, not new machinery. The suite is not a slow run; no restart boundaries.

| Criterion | Proof | Catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1, run-id print | `bun test tests/run-units.test.ts` — "top-level run-check boxes command, forking child and nested run-check in one scope" (real units under `akrogon-test-*.slice`; all three `/proc/*/cgroup` paths name the same `akrogon-run-*.scope`; `run <id>` on stdout; units gone after) | missing unit, missing bus cut inside scope, nested run creating a second unit, missing print | seconds | src/scope.ts, src/run-check.ts, src/admission.ts |
| 2 | same file — "stop-run stops only the caller's runs" (two runs, real units: `stop-run <id>` from launcher proc kills that scope and its sleeper, sibling stays; id from a different proc refused; no-arg lists and refuses ≠1; no-scope caller refused) | stop reaching other seats/leaves, missing refusal, no authority check | seconds | src/stop-run.ts, src/admission.ts |
| 3 | same file — "SIGTERM and SIGKILL of the wrapper reap the run unit" (each signal: wrapper killed while its command sleeps past the window; scope + guard inactive, `cgroup.procs` empty or gone within TimeoutStopUSec + 5 s) | missing guard, leaked descendants, missing scope stop | seconds | src/scope.ts, src/run-check.ts |
| 4 | same file — "base-run runs setup and command in one unit" (`setup` writes its cgroup, command writes its; both name the same `akrogon-run-*.scope` under the test slice; `base-runs.jsonl` row ends; unit gone after) | setup outside the unit, missing unit for base-run | seconds | src/base-run.ts |
| 5 | same file — "admission counts live reservations" (fake records: live+measured shrink, live+pending=full, waiting/ended/dead=0; candidate denied at usage+Σ+16 ≥ 48, admitted after shrink; nested inner run writes no record file while outer is live) | reservation missing from accounting, nested adding load, stale reservation | seconds | src/admission.ts |
| 6 | same file — "--leaf and --holder keep working with units" (fake systemd-run log shows `--slice akrogon-l<hash>` for --leaf and leaf worktree, `akrogon.slice` for --holder; exit 0 and logs kept) | dropped flags, wrong slice, holder path breaking | seconds | src/run-check.ts, src/scope.ts |
| sweep (1a) | same file — "a stale run record and unit are swept" (real stale scope under test slice + dead-pid record; next `run-check` stops the unit and removes the file) | stale sweep missing, live run swept | seconds | src/admission.ts |
| 7 | same file — "skills name akrogon stop-run" + `bun test tests/command-reference.test.ts` (verb row, usage line, contract) | recorded-PID wording surviving, verb missing from docs | seconds | skills/*, README.md, src/akrogon.ts |
| 8 | `akrogon run-check --name test -- bun test --timeout=30000` and `akrogon run-check --name typecheck -- bun run typecheck` (the repo `checks` commands) | suite regressions, type errors | minutes | any owned file |

## Intended red

First run of the committed tests against the unimplemented code (`bun test tests/run-units.test.ts tests/command-reference.test.ts --timeout=45000`, 2026-10-13): 4 pass / 11 fail, all failures on missing behavior.

- `escaped alternatives and reordered rows preserve argument semantics` (command-reference): the `stop-run` contract row exists but the verb is absent from the dispatcher: `+ "stop-run"` missing between `stop` and `sync`.
- `a top-level run-check boxes its command...`: the wrapper ran the command fine but printed no run id: `result.stdout.match(/^run [0-9a-f-]{36}$/gm)` is null; cgroup assertions unreachable.
- `stop-run stops only the caller pane scope runs`: records carry no `run`/`unit` fields, so `seedUnitStat` dies with `paths[2] ... got undefined`; `akrogon stop-run` is unknown usage (empty stdout/stderr, non-zero).
- `SIGTERM`/`SIGKILL` of the wrapper: `No live reap record` — records exist but carry no `unit` field and no run unit is created.
- `a base-run runs setup and command in one run unit`: base-run exits 0 but prints no `run <id>` line.
- `admission counts live per-run reservations`: `candidate admitted while reservations reach the limit` — the 4 GiB usage admits with three live records because no reservation term exists.
- `a nested run-check inside a live run adds no record and no reservation`: readdir inside the inner run saw 0 yaml records while the outer's record should have been the only one (record-shape red; under implementation the live outer record is exactly one).
- `run-check --leaf and --holder...`: `FAKE_SYSTEMD_RUN_LOG` never created — old code invokes no `systemd-run`.
- `skills name akrogon stop-run`: `skills/implement-issue/SKILL.md` lacks `akrogon stop-run`.
- `a stale run record and unit are swept`: `Timed out waiting for akrogon-run-stale0.scope to become inactive` — no sweep exists.

Test-infrastructure notes for implement: real-unit tests share one fixture + one `akrogon-test-<pid>-N.slice` per file and run `test.serial`; per-test sleeps are bounded (60/30/12 s) so dangling children never stall the file. On a loaded host, fixture git work alone can eat most of a 30–45 s budget — timeouts seen during red were load, not hangs. `cli()`/`fakeAkrogon()` PATH-prepend the fake `systemd-run`, so existing tests stay virtualized; real tests spawn the entry directly with `AKROGON_RUN_SLICE`.

Commit `HEAD~` on the leaf branch carries the tests before any product code.

## Docs touched

- `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/check-issue/SKILL.md` — stop-run clause (C7).
- `README.md` — `stop-run` command row.
- `docs/guide/setup.md` — run units and reservations in the start-check paragraph.
- `docs/guide/next.md` — `stop-run` beside the stop section.
- `src/AREA.md` — admission reservation, scope run-unit helpers, stop-run module.
- `tests/AREA.md` — `tests/run-units.test.ts` one-liner.

## Implementation notes

- 2026-10-14: D6's `<record.slice>/` path level refines to systemd's name hierarchy — a slice `a-b-c.slice` sits at `a.slice/a-b.slice/a-b-c.slice` under `akrogon.slice`, so unit-stat paths (implementation and tests) expand each dash prefix cumulatively. `akrogon.slice` itself adds no level. The readiness grant's `akrogon-test-*` naming makes the expansion unavoidable.
- 2026-10-14: D8/D7 refine to `run <id>` and the `stop-run` listing on **stderr**, not stdout — the command's stdout is contract output parsed by callers and tests (18 regressions when printed on stdout).
- 2026-10-14: operator amendment — "O1 <- drop the memory check now. make it happen." D6 (reservations + memory/spacing denial) is superseded: `admission.ts` reads no `memory.stat`, has no 48 GiB limit, no `RUN_GIB`/`peerReservations`, no `AKROGON_SPACING_MS`/`last-start`/`flock`. Records, `run <id>` (stderr), stale sweep, nested identity and `stop-run` stay. Tests asserting reservations/spacing/threshold waits were inverted per brief criterion 5 (replaced).
- check.fix 2026-10-14: review corrections — base-run resolves its slice through `leafSlice(repo, leaf.state.slug)` (B/F1, repro test first); cleanup assertions count only units under the fixture's slice since the enclosing run is itself an akrogon-run scope (B/F2); C3's deadline is one timer measured at signal delivery covering scope+guard+procs (B/F4); the skill-wording test asserts only executable tokens (B/F3).
