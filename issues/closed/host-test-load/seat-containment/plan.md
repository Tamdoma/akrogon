# Plan: seat-containment

Debate is off (`debate: no`), so this plan comes straight from brief.md and design.md. The design wins on any conflict. None was found.

## Read first

- `issues/open/host-test-load/seat-containment/design.md`: the binding forks and the leaf architecture.
- `/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/proofs.md`: T2 (adoption call), T3 (cold restore), T6 (slice file), T7 (busctl under the cut).
- `src/AREA.md`, `tests/AREA.md`, `learnings/LESSONS.md` (the lessons on stderr JSON parsing, `.trim().min(1)`, and `bun run format` drift in `src/status.ts`).
- `src/next.ts:427-534` `allocate`, `src/next.ts:789` its caller, and `report` in the caller's catch.
- `src/shell.ts:186` `herdr`, `paneSchema`. `src/run-check.ts:44` `constructedEnv` (base-run reuses it at `src/base-run.ts:153`). `src/config.ts:69-90` reserved env names, `src/config.ts:266` the `AKROGON_LEAF_TEMP_ROOT` validation pattern.
- `src/install.ts` `planSkillLinks`/`applySkillLinks`/`install`. `src/self-update.ts:188` `installStage`.
- `tests/helpers.ts:86` `fakeHerdr`, `tests/fake-herdr.ts`.
- `plugin/herdr-plugin.toml:10-11` (startup `next --resume`).

Live surface checked 2026-10-13: herdr 0.9.1 `pane process-info --pane <id>` prints `{"result":{"process_info":{"pane_id":…,"shell_pid":N,…},"type":"pane_process_info"}}`. `herdr pane close <pane_id>` takes a positional id.

## Decisions

- D1. `src/scope.ts` exports `leafSlice(repo: Pick<Repo, 'name'>, slug)` = `akrogon-l<first 12 hex of sha256(name + "/" + slug)>.slice` and `paneScope(slice, paneId, pid, start)` = `<slice stem>-p<paneId without non-alphanumerics>-<pid>-<start>.scope`. leaf-stop consumes `leafSlice`.
- D2. `adoptShell` reads `shell_pid` from `herdr pane process-info --pane <id>`, the start time from `<proc root>/<pid>/stat` field 22 (parsed after the last `)`), then runs the exact busctl `StartTransientUnit` argv from design.md with `Slice`, `TimeoutStopUSec t 5000000`, `SendSIGHUP b true` and `PIDs au 1 <pid>`. Only that subprocess gets `DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus`. A non-zero exit throws with argv, exit code and stderr.
- D3. `inOwnScope` is read-only and returns `inside | outside | unreadable`. It is `inside` only when the stat start time matches and `<proc root>/<pid>/cgroup` ends in `/<leaf slice>/<paneScope(...)>`. Any other readable content is `outside`. Any read error is `unreadable`. The proc root is `AKROGON_PROC_ROOT` (a non-blank absolute path, or it throws), otherwise `/proc`.
- D4. allocate ensure step. Before tab and pane resolution, each recorded live pane is checked. `outside` closes it with `herdr pane close`. `unreadable` throws, so the leaf is skipped this pass with the error reported by the existing catch (`report(..., slug)`). After closes, panes are listed again, so a closed last pane follows the no-tab path. Every pane allocate ends with is then either adopted (new tab root, new splits) and checked, or checked (`inside` recorded panes, which are never adopted again because the scope name already exists). A failed adopt or a check that does not return `inside` throws before the final `saveState`, so no agent start or prompt happens in that pass.
- D5. `placement` gains `--env DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`. `constructedEnv` sets the same value after the env/pass_env loop. `DBUS_SESSION_BUS_ADDRESS` joins the reserved set in `src/config.ts`, so `env` or `pass_env` naming it is refused.
- D6. `systemd/akrogon.slice` holds exactly the T6 content. `planSkillLinks` adds the link `<home>/.config/systemd/user/akrogon.slice -> <sourceRoot>/systemd/akrogon.slice`, so conflicts are reported the same way as skill links. `install` and self-update's `installStage` run `systemctl --user daemon-reload` after the links are applied. In `installStage` a reload failure returns `links failed: …`-style detail (`reload failed: <stderr>`), matching how that stage reports.
- D7. Fixtures, not machinery: fake herdr gains `pane process-info` and `pane close`. It seeds `<proc root>/<pid>/stat` and an outside cgroup (`app.slice/herdr.scope`) for panes it creates. A pane seeded directly into the db with no proc entry is treated as already boxed in its own scope (from its tab label and workspace label), so the existing tests keep their meaning. `agent start` records the pane's cgroup at start time in `db.startCgroups`. New `tests/fake-busctl.ts` parses the argv, logs the parsed call and the bus env to `<home>/busctl.calls`, writes the scope cgroup, fails when `<home>/busctl.fail` exists, and writes a wrong scope when `<home>/busctl.misplace` exists. `fakeHerdr` links it, and sets `AKROGON_PROC_ROOT=<home>/proc` and `XDG_RUNTIME_DIR=<home>/run`. A fake `systemctl` sh script logs its argv and whether the slice link existed at call time (`FAKE_SLICE_LINK`).
- D8. B's dissents (transient slice, also checking the bus cut on restore) stay as dissents, as the design says. Not taken.

## Interfaces

```ts
// src/scope.ts
export function leafSlice(repo: Pick<Repo, 'name'>, slug: string): string;
export function paneScope(slice: string, paneId: string, pid: number, start: string): string;
export type ShellPlace = { pid: number; start: string };
export async function adoptShell(slice: string, paneId: string): Promise<ShellPlace>;
export async function inOwnScope(slice: string, paneId: string): Promise<'inside' | 'outside' | 'unreadable'>;
export function procRoot(): string;
```

`adoptShell` and `inOwnScope` both call `herdr pane process-info`. A herdr error propagates.

## Done-criteria, proofs

| C | Proof | Catches | Size | Rerun when |
|---|---|---|---|---|
| C1 fixture | `bun test tests/install.test.ts tests/self-update.test.ts` cases "install links akrogon.slice…" and "self-update links akrogon.slice…" | missing link, wrong target, reload missing or before link, slice values wrong, conflict not reported | seconds | install.ts, self-update.ts, systemd/ change |
| C1 live | U4 live run: link leaf `systemd/akrogon.slice`, `systemctl --user daemon-reload`, `systemctl --user show akrogon.slice -p CPUWeight,CPUQuotaPerSecUSec,MemoryHigh,MemoryMax,MemorySwapMax` | real manager rejects or ignores a value | seconds | slice file change |
| C2 fixture | `bun test tests/seat-containment.test.ts` "next boxes every pane…" | wrong slice or scope name, adoption after agent start, re-adoption of an inside pane | seconds | scope.ts, next.ts change |
| C2 live | U4: isolated herdr server, `akrogon next <live-seat-1>`, then `cat /proc/<shell pid>/cgroup` and the seat child's cgroup for each pane | real cgroup placement | minutes | scope.ts, next.ts change |
| C3 | `bun test tests/seat-containment.test.ts tests/run-check.test.ts tests/base-run.test.ts tests/config.test.ts` (bus-cut cases) | bus cut missing in placement, run-check or base-run, or env/pass_env allowed to name it | seconds | next.ts, run-check.ts, config.ts change |
| C4 | `bun test tests/seat-containment.test.ts` "a failed adoption…" and "a misplaced shell…" | dispatch after a failed adopt or check, error without slug | seconds | scope.ts, next.ts change |
| C5 fixture | `bun test tests/seat-containment.test.ts` "an outside pane…" and "an unreadable cgroup…" | outside pane kept or prompted before replacement, unreadable pane closed | seconds | next.ts change |
| C5 live | U4: stop and start the isolated herdr server with the plugin linked, the startup `next --resume` pass replaces the pane, then read the new pane's cgroup | real restore path | minutes | next.ts, plugin change |
| C6 | fixture: C2 test asserts `SendSIGHUP true` and `TimeoutStopUSec 5000000` in the busctl call. Live: U4 `systemctl --user show <scope> -p SendSIGHUP,TimeoutStopUSec` | missing stop properties | seconds | scope.ts change |

Restart boundaries for the slow live run (U4): each live attempt is self-contained and cleaned up before the next (grant bound: at most 3). A failed attempt restarts from server start.

## Tests written at plan.synthesis (red)

- `tests/seat-containment.test.ts` (new): C2, C3 placement, C4, C5, C6 fixture cases.
- `tests/fake-busctl.ts` (new), `tests/fake-herdr.ts`, `tests/helpers.ts`: D7 fixtures.
- `tests/install.test.ts`: fake systemctl in `installEnv`, plus a new C1 case.
- `tests/self-update.test.ts`: the fixture puts a fake systemctl on `process.env.PATH` (restored in `clean`, the tests are `test.serial`), plus a new C1 case.
- `tests/run-check.test.ts`: `DBUS_SESSION_BUS_ADDRESS` added to the allowlist test's allowed set, plus a new C3 case.
- `tests/base-run.test.ts`: a new C3 case.
- `tests/config.test.ts`: `DBUS_SESSION_BUS_ADDRESS` in the reserved list, plus a `pass_env` case.

Red output is recorded under "Red evidence" below.

## Units

Wave 1 (parallel, fixture tests only, no shared live resource):

- U1 slice install. Owns `systemd/akrogon.slice`, `src/install.ts`, `src/self-update.ts`. Needs none. Proves C1 fixture.
- U2 bus cut in runs. Owns `src/run-check.ts`, `src/config.ts`. Needs none. Proves C3 run-check, base-run, config.
- U3 pane boxing. Owns `src/scope.ts` (new), `src/next.ts`. Needs none. Proves C2, C3 placement, C4, C5, C6 fixture.

Wave 2:

- U4 live run. Owns no repo path, only the implementation report. Shared test resource: the user systemd manager, an isolated herdr server under a short temp `XDG_CONFIG_HOME`, a temp `AKROGON_HOME`, a temp repo, fixture slug `live-seat-1`, under the design's grant (operator 2026-10-13). Needs U1, U3. Steps follow design.md "Live isolation": an `akrogon` shim on the server's PATH runs this worktree's `src/akrogon.ts`, `HERDR_*` is unset on client calls, the plugin is linked only there. Record the commands, the `/proc/<pid>/cgroup` lines, the `systemctl --user show` values for akrogon.slice and the pane scopes, and the restore replacement. Cleanup per the grant: remove the akrogon.slice link, daemon-reload, stop the fixture leaf slice and the server unit, reset-failed, remove the temp paths and seat session folders. Absence check: `systemctl --user list-units --all 'akrogon-l*'` shows no fixture slice.

Checks for every unit: the repo `checks` (`format`, `typecheck`, `test`, `test_changed`). Revert unrelated `bun run format` drift (lesson 2026-10-08).

## Docs

- `README.md:132` install row: also links akrogon.slice and reloads the user manager.
- `docs/guide/install.md`: systemd user manager prerequisite, the slice link, self-update relinks and reloads, the one-time closing of running leaf tabs after this ships.
- `docs/guide/setup.md:65` pass_env: `DBUS_SESSION_BUS_ADDRESS` is reserved and always cut.
- `docs/guide/next.md`: leaf panes are boxed before start, and an outside pane is replaced while an unreadable one skips the pass.
- `src/AREA.md`: `src/scope.ts` key file and `AKROGON_PROC_ROOT`.
- `tests/AREA.md`: fake busctl, the proc root fixture, `tests/seat-containment.test.ts`.

## Open limitations, carried

- Between a cold restore and the first akrogon pass, a resumed seat sits unboxed with the bus reachable (restore 1b).
- Panes the operator splits by hand are not boxed. Empty leaf slices stay loaded until the user manager restarts.
- Rollout: the operator closes every running leaf tab once after merge. There is no code for old leaves.

Credentials: the design names none, and `akrogon status seat-containment` prints no `Missing:` line.

## Risks

- R1. `tests/park.test.ts` and `tests/peer-wait.test.ts` build their own fake herdr bin without `fakeHerdr`. If U3 makes them reach allocate, they need the busctl link and `AKROGON_PROC_ROOT` too. That fixture change carries a `Test-Change` trailer citing D7.
- R2. In-process `selfUpdate` calls in `tests/install.test.ts` would reach the real `systemctl` once U1 lands. U1 gives those calls the fake systemctl on PATH, the same way the self-update fixture does, with a `Test-Change` trailer.

## Red evidence

Command: `bun test --timeout=30000` on the test commit, with no product change. Result: 857 pass, 13 fail. Every failure is a planned red below. typecheck and prettier check are clean.

| C | Test | Red output |
|---|---|---|
| C1 | install.test.ts "install links akrogon.slice with the ceiling values…" | `ENOENT … lstat '<home>/.config/systemd/user/akrogon.slice'` |
| C1 | install.test.ts "install reports a non-link akrogon.slice path as a conflict" | `expect(received).not.toBe(expected) Expected: not 0` (install exits 0) |
| C1 | self-update.test.ts "self-update links akrogon.slice from the deployed checkout…" | `ENOENT … lstat '<home>/.config/systemd/user/akrogon.slice'` |
| C2, C6 | seat-containment.test.ts "next boxes every pane shell…" | `expect(received).toEqual(expected)`: no StartTransientUnit call for either pane |
| C3 | seat-containment.test.ts "new leaf pane shells get the session bus cut" | `Expected: true Received: false` (no `--env DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` on tab create or split) |
| C3 | run-check.test.ts "run-check cuts the session bus even when the caller has one" | `Expected to contain: "bus=unix:path=/nonexistent" Received: "bus="` |
| C3 | base-run.test.ts "a base-run command runs with the session bus cut" | `Expected to contain: "bus=unix:path=/nonexistent" Received: "bus=\n"` |
| C3 | config.test.ts "config accepts env … reserved env names" (DBUS added) and "config refuses DBUS_SESSION_BUS_ADDRESS in pass_env" | `Expected: not 0` (config accepted the name) |
| C4 | seat-containment.test.ts "a failed adoption…" and "a misplaced shell…" | `Expected length: 1 Received length: 0` (no slug-tagged skip, the seat was started) |
| C5 | seat-containment.test.ts "an outside pane is closed and recreated boxed before any prompt" | `expect(received).toEqual(expected)`: no `pane close` call |
| C5 | seat-containment.test.ts "an unreadable cgroup never closes the pane…" | `Expected length: 1 Received length: 0` (the leaf was not skipped) |

C1, C2, C5 and C6 also need U4 live evidence. No fixture test can show real cgroup placement, herdr restore or the real manager's values.

## Implementation notes 2026-10-13

- Refines D3: `inOwnScope` returns a discriminated union, `{ place: 'inside' } | { place: 'outside'; cgroup: string } | { place: 'unreadable'; error: string }`, so the skip report carries the read error. Only fs errors with an errno `code` map to `unreadable`. Anything else propagates.
- Refines D4: the end of allocate applies one rule to every final pane. `inside` passes. `outside` gets `adoptShell` and must then check `inside`. `unreadable` throws. Recorded outside panes are already closed by the ensure step, so only panes allocate created or found un-recorded in a bootstrap tab are adopted. A restored shell is never adopted (restore 1b).
- Known risk for U4: StartTransientUnit replies with a job path before the job runs. If the live run shows the immediate check racing the move, U4 records it and A fixes it then. Fixtures cannot show this.
