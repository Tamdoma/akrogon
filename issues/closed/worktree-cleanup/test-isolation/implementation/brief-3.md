# Sub-brief 3: run-units teardown of its own slices and stale scope

## 1. Goal

Stop `run-units.test.ts` from leaving `akrogon-test-*.slice` units and its `akrogon-run-stale0.scope` behind. Plan decision D4 bullet 3. Unit 1's preload (isolation.ts + bunfig.toml) is on the leaf HEAD you branch from.

## 2. Numbered acceptance criteria

1. `tests/run-units.test.ts` `afterAll` stops every `akrogon-test-*.slice` this file created (the `shared` slice plus each `testSlice()` result), via `systemctl --user stop`/`reset-failed` through the existing `sysctl`/`stopTestSlice` helper. No `systemctl --user list-units 'akrogon-test-*'` entry created by the run remains after the file finishes.
2. The `stale` `systemd-run --scope --unit=akrogon-run-stale0 sleep 300` test (around line ~578) stops `akrogon-run-stale0.scope` in `finally`, since scope members are systemd-owned, not process descendants.
3. `bun test --timeout=30000 tests/run-units.test.ts` is green and leaves no `akrogon-test-*.slice` or `akrogon-run-stale0.scope` loaded.

## 3. Read-first list

- `tests/run-units.test.ts` whole file — especially `testSlice()`, `shared`/`realFixture()`, `afterAll` (top), `stopTestSlice`, `sysctl`, `spawnReal`/`spawnScoped`, and the `stale`/`sweeper` test near the end.
- `tests/fake-systemd-run.sh` and `tests/fake-systemctl.sh` (what is real vs fake in this file).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Track every slice the file creates: collect the result of each `testSlice()` call and the `shared` slice in a module-level `Set<string>`.
- In `afterAll`, before/after `shared.f.clean()`, for each tracked slice call the existing `stopTestSlice(slice)` (or inline `systemctl --user stop` + `reset-failed`); keep it async and awaited.
- In the `stale`/`sweeper` test, wrap the `stale` spawn in `try { ... } finally { if (stale !== undefined) await sysctl('stop', 'akrogon-run-stale0.scope'); stale?.kill?.('SIGKILL'); }` keeping the existing `stale.kill('SIGKILL')` in place — the sysctl stop handles the systemd-owned scope member the kill misses.
- Owned path: `tests/run-units.test.ts` only.
- Shared test resource: the user systemd manager — use only `stop`/`reset-failed` on units this file names, never a pattern stop.

## 5. Do-not, reasons and exceptions

- Do NOT edit `tests/isolation.ts`, `helpers.ts` or any other test file — disjoint ownership; a missing interface is a mismatch to return. No exception.
- Do NOT stop units by pattern (`systemctl stop 'akrogon-*'`, `pkill`): that kills other leaves' runs on this host — the recorded lesson. Exception: none, use exact unit names you created.
- Do NOT remove `waitInactive`/`waitActive` assertions or change test semantics — this is teardown only. No exception.
- Do NOT leave the `sleep 60`/`sleep 60`-record `Bun.spawn` sleepers: they are direct children killed by the existing `finally`s — keep those `proc.kill` calls; the preload sweep handles the rest.
- Reasons: this file leaves systemd-owned leftovers the process sweep cannot reach; every exclusion guards either a live unit or an unrelated seat.
- Return a mismatch with evidence to A instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in your worktree.
2. Add the slice-tracking set and extend `afterAll` (criterion 1).
3. Add the `akrogon-run-stale0.scope` finally-stop (criterion 2).
4. Run `bun test --timeout=30000 tests/run-units.test.ts` — all green (criterion 3).
5. Check `systemctl --user list-units 'akrogon-test-*' 'akrogon-run-stale0*' --all --no-legend` — the file's new units must be absent (criterion 3).
6. Commit `tests/run-units.test.ts` with a `Test-Change: tests/run-units.test.ts slice/stale-scope teardown, no expectation changed` trailer.

Advisory size: 1 file, under 10 turns.

## 7. Commands

- `bun install --frozen-lockfile`
- `bun test --timeout=30000 tests/run-units.test.ts`
- `systemctl --user list-units 'akrogon-test-*' 'akrogon-run-stale0*' --all --no-legend`

No other test command.

## 8. Done-when, evidence and report

`tests/run-units.test.ts` green; the `systemctl` listing shows no new `akrogon-test-*`/`akrogon-run-stale0*` unit from your run; commit ID returned. Report any pre-existing loaded unit (they exist from earlier runs — other leaves may be cleaning them separately) as a limitation, do not touch them.

Report format:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
