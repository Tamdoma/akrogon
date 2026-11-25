# Fork notes: display-env, slot C

## Q1: Which display variables does `akrogon run-check` pass by default?

### Pick, reason, and cost

- **Pick**: `b` — copy `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, and `XDG_RUNTIME_DIR` in `src/run-check.ts` (`copied`), each only when defined in the caller (`process.env[key] !== undefined`).
- **Reason**:
  - Eliminates the entire display-dropped failure class in the failing mechanism (Signpost 1a) across both Linux display stacks: X11/Xwayland (`DISPLAY` + `XAUTHORITY`) and native Wayland (`WAYLAND_DISPLAY` + `XDG_RUNTIME_DIR`).
  - On this host (Omarchy/Hyprland: `XDG_SESSION_TYPE=wayland`, `WAYLAND_DISPLAY=wayland-1`, Xwayland at `DISPLAY=:0`), Playwright 1.63's default Chromium launches over Xwayland with `DISPLAY=:0` alone, while native Wayland Chromium (`--ozone-platform=wayland`), GTK4/Qt6/Electron Wayland apps, and Wayland-only sessions fail without **both** `WAYLAND_DISPLAY` and `XDG_RUNTIME_DIR` (libwayland connects to `$XDG_RUNTIME_DIR/$WAYLAND_DISPLAY`).
  - `XAUTHORITY` costs nothing when absent (not set on this host) and is required on Xorg / display-manager / `-auth` Xwayland sessions where the auth cookie lives outside `~/.Xauthority` (e.g., `/run/user/$UID/gdm/Xauthority` or `/tmp/xauth_*`).
  - Matches the set `framework/issues/config.yaml` already runs in production (`pass_env: [DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR]`). Keeping all four unreserved in `src/config.ts` means existing `pass_env` configs keep working with no migration (Signpost 6a).
  - Preserves Chrome cgroup containment: headed Chromium launched with `DISPLAY`, `WAYLAND_DISPLAY`, and `XDG_RUNTIME_DIR` stays inside `akrogon-run-<id>.scope` because `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` still blocks D-Bus self-scoping.
- **Cost**:
  - Exposing `XDG_RUNTIME_DIR` (`/run/user/$UID`) lets `systemctl --user` inside a checked command reach `$XDG_RUNTIME_DIR/systemd/private` even while `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` still blocks `busctl --user` and Chrome self-scoping.
  - Unisolated `akrogon` invocations inside `run-check` (outside `bun test`, whose `tests/isolation.ts` preload overrides `XDG_RUNTIME_DIR` to a scratch dir) can see `$XDG_RUNTIME_DIR/herdr-core`. (Note: `hc` itself already falls back to `/run/user/$UID` when `XDG_RUNTIME_DIR` is unset, so omitting `XDG_RUNTIME_DIR` does not isolate `hc`.)
  - XDG-compliant tools that create runtime sockets/files under `$XDG_RUNTIME_DIR` instead of `$TMPDIR` are not cleaned up by `run-check`'s run-root removal.
  - Requires updating the env allowlist assertion in `tests/run-check.test.ts` and `docs/reference/checks.md`, and retiring the `run-check drops DISPLAY` line from `learnings/LESSONS.md`.

### Rejected option

- **`a` (`DISPLAY` and `XAUTHORITY` only)**: Sufficient for Playwright's default Xwayland path on this host, and avoids exposing `$XDG_RUNTIME_DIR/systemd/private` by default. Rejected because it leaves native Wayland checks (`chromium --ozone-platform=wayland`, Wayland-native GUI apps) and Wayland-only sessions (no Xwayland) hitting the exact same failure class, and forces repos like `framework` to retain `pass_env: [WAYLAND_DISPLAY, XDG_RUNTIME_DIR]` instead of solving display forwarding once in akrogon (Signpost 1a).

### Evidence

- **Tier 1 (probe, 2026-11-25)**: `akrogon run-check --name probe-c-env --holder /home/ivan/Work/infra/akrogon/issues/chart/run-check-display/direct -- env` (`check-probe-c-env-1795568071281-3324217.log`) confirmed baseline `run-check` drops `DISPLAY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`, and sets `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`.
- **Tier 1 (probe, 2026-11-25)**: `probe-c-pw-matrix` (`check-probe-c-pw-matrix-1795568073846-3324215.log`) launched Playwright 1.63 (`chromium-1243`, `headless: false`) under `akrogon run-check`:
  - none → exit 1 (`Looks like you launched a headed browser without having a XServer running`);
  - `DISPLAY=:0` alone → exit 0 (`OK: ok headed_ua_has_headless: false`);
  - `DISPLAY=:0` + `XDG_RUNTIME_DIR=/run/user/1000` → exit 0;
  - `DISPLAY=:0` + `WAYLAND_DISPLAY=wayland-1` + `XDG_RUNTIME_DIR=/run/user/1000` → exit 0;
  - `WAYLAND_DISPLAY=wayland-1` (+ `XDG_RUNTIME_DIR`) with default args → exit 1 (Playwright Chromium defaults to Ozone X11);
  - `DISPLAY=:0` + `XAUTHORITY=/nonexistent/xauth` → exit 0 (Xwayland on this host does not enforce xauth; `/home/ivan/.Xauthority` does not exist).
- **Tier 1 (probe, 2026-11-25)**: `probe-c-wayland-and-svc` (`check-probe-c-wayland-and-svc-1795568114155-3342862.log`) tested Playwright Chromium with `--ozone-platform=wayland`:
  - `WAYLAND_DISPLAY=wayland-1` + `XDG_RUNTIME_DIR=/run/user/1000` (no `DISPLAY`) → exit 0 (`OK: ok`);
  - `WAYLAND_DISPLAY=wayland-1` without `XDG_RUNTIME_DIR` → exit 1 (`error: XDG_RUNTIME_DIR is invalid or not set in the environment`, `Failed to connect to Wayland display: No such file or directory (2)`);
  - `headless: true` with full display set → exit 0 (`HEADLESS_OK: h`).
- **Tier 1 (probe, 2026-11-25)**: `probe-c-chrome-cgroup2` (`check-probe-c-chrome-cgroup2-1795568235686-3405904.log`) launched headed Chromium inside `akrogon run-check` with `DISPLAY=:0 WAYLAND_DISPLAY=wayland-1 XDG_RUNTIME_DIR=/run/user/1000`: Chrome PID stayed in `0::/user.slice/user-1000.slice/user@1000.service/akrogon.slice/akrogon-run-dee044bd-8de3-45e3-a0b5-8706aa211c6b.scope` (identical to `/proc/self/cgroup`).
- **Tier 1 (probe, 2026-11-25)**: `probe-c-dbus-xdg` & `probe-c-isolation` (`check-probe-c-dbus-xdg-1795568169295-3359039.log`, `check-probe-c-isolation-1795568193522-3383129.log`):
  - Without `XDG_RUNTIME_DIR`: `systemctl --user is-system-running` failed (`Failed to connect to user scope bus via local transport`); `hc ls` still succeeded (exit 0, listed live sessions by falling back to `/run/user/$UID`).
  - With `XDG_RUNTIME_DIR=/run/user/1000` and cut bus: `busctl --user` failed (`No such file or directory`), while `systemctl --user is-system-running` reached the real user manager (`degraded`).
- **Tier 1 (source read, 2026-11-25)**: `src/run-check.ts:49-85,436-444`, `src/scope.ts:35-81`, `src/config.ts:110-137`, `tests/isolation.ts:64-69`, `bunfig.toml`, `tests/run-check.test.ts:160-212`, `tests/run-units.test.ts:296-337`, `/home/ivan/Work/infra/tamdoma/framework/issues/config.yaml:7`, `learnings/LESSONS.md:60` (confirmed committed on `origin/main`).
- **Tier 2 (specs, 2026-11-25)**: `X(7)` / `Xsecurity(7)` (Xlib/XCB read `DISPLAY` and `XAUTHORITY` for non-default auth files); Wayland client protocol (`wl_display_connect` opens `$XDG_RUNTIME_DIR/$WAYLAND_DISPLAY`); Chromium Ozone Wayland (`ozone_platform_wayland.cc`).

### Pitfalls and what removes each

1. **Synthesizing `XDG_RUNTIME_DIR` via `runtimeDir()` when the caller had none**: Copying via `runtimeDir()` instead of `process.env.XDG_RUNTIME_DIR` would invent `/run/user/$UID` when a caller intentionally omitted or blanked it, breaking `tests/run-units.test.ts:297`.
   - *Removal*: Add the four names to `copied` so `constructedEnv` copies only when `process.env[key] !== undefined`, and keep `runUnitArgv`'s `runtime === undefined ? ['-u', 'XDG_RUNTIME_DIR'] : ...` restore in `src/scope.ts:77`.
2. **Reserving display names in `src/config.ts` `constructed` set**: Would reject existing repos like `framework` (`pass_env: [DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR]`), violating Signpost 6a.
   - *Removal*: Do not add any of the four names to `constructed` in `src/config.ts`; keep them legal in `env` and `pass_env`.
3. **Breaking `akrogon`'s allowlist test or test isolation**: `tests/run-check.test.ts:160` fails if `allowed` omits any copied var present in the test worker's env (`XDG_RUNTIME_DIR` is always set by `tests/isolation.ts`, and `DISPLAY`/`WAYLAND_DISPLAY` are set on desktops).
   - *Removal*: Update `allowed` in `tests/run-check.test.ts` and add explicit present/absent assertions. `tests/isolation.ts` (`bunfig.toml` preload) already pins `XDG_RUNTIME_DIR` to `suiteRoot/run`, so `bun test` stays isolated from `/run/user/$UID/herdr-core`.
4. **Re-enabling Chrome cgroup escape**: Passing `XDG_RUNTIME_DIR` must not weaken bus cutting.
   - *Removal*: Keep `env.DBUS_SESSION_BUS_ADDRESS = 'unix:path=/nonexistent'` assigned unconditionally after `copied`, `env`, and `pass_env` (`src/run-check.ts:81`).
5. **Stale docs and lesson line**: `docs/reference/checks.md:50` omits display vars, and `learnings/LESSONS.md:60` ("run-check drops DISPLAY") is on `origin/main`.
   - *Removal*: Update `docs/reference/checks.md` to name the display vars explicitly and retire the `run-check drops DISPLAY` line from `learnings/LESSONS.md` (keeping `learnings/history/2026-11-24-run-check-drops-display.md`).

### Questions the fork does not ask

1. **Should `XDG_SESSION_TYPE` stay excluded?** Probe `probe-c-wayland-and-svc` showed Chromium `--ozone-platform-hint=auto` (without `DISPLAY`) failed when only `WAYLAND_DISPLAY` + `XDG_RUNTIME_DIR` were set (likely needing `XDG_SESSION_TYPE=wayland`), while `--ozone-platform=wayland` succeeded. Keeping `XDG_SESSION_TYPE` out stays minimal (4 vars matching `framework` + `XAUTHORITY`), unless auto-hint Wayland detection without `DISPLAY` is desired.
2. **Is `systemctl --user` reachability via `$XDG_RUNTIME_DIR/systemd/private` acceptable by default?** Probed: it is already exposed in `framework` via `pass_env`, and `akrogon` tests isolate `XDG_RUNTIME_DIR` in `tests/isolation.ts`. Confirming whether any non-isolated check relies on `systemctl --user` failing inside `run-check` would close the last isolation question.

---

## Q2: Do `akrogon verify` passes and merge verify inside a land get the same display variables?

### Pick, reason, and cost

- **Pick**: `b` — Yes. Forward the same display names in `src/verify.ts` (`passForwarded`) and `src/land.ts` (`launchLand`) when set in the caller, sharing one exported list with `src/run-check.ts`.
- **Reason**:
  - `verify` already runs every setup, check, merge check, and rerun through `checkedRun` → `constructedEnv` (`src/verify.ts:673,729,766,782`). `src/verify.ts:903-905` already defines the invariant: `passForwarded` carries everything `constructedEnv` selects so `run-check` and `verify` enforce one check-environment policy.
  - **Systemd transient-service reality (probed)**: `launchPass` and `launchLand` launch transient `systemd --user` `.service` units (unlike `run-check`'s `--scope`). `systemd --user` automatically injects its manager environment (`DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR=/run/user/1000` on this host) into transient services even without `--setenv`. Leaving `passForwarded` and `launchLand` untouched does **not** keep verify display-less; instead it silently overrides caller values (e.g., caller's `DISPLAY=:99` was replaced by manager's `:0` in our probe), drops `XAUTHORITY` (absent from manager env on this host), and behaves inconsistently across hosts without `systemd --user` display import and between real `systemd-run` vs `tests/fake-systemd-run.sh`.
  - A command that passes under `akrogon run-check` (including a headed check configured in `checks` or `merge_checks`) will see the exact same display environment under `akrogon verify` and `akrogon land`.
  - Headless checks remain unaffected: Playwright `headless: true` stays headless when the full display set is present (probed), and `framework` already runs all leaf and merge verifies with `[DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR]`.
- **Cost**:
  - Minimal code change (~5 lines across `src/verify.ts` and `src/land.ts`, reusing one shared display-env constant from `src/run-check.ts`) plus tests on `launchPass` / `launchLand` `--setenv=` forwarding.
  - Any repo that explicitly places a headed command in `checks` or `merge_checks` will open a window during unattended `verify` / `land` (which is the intended behavior if configured there).

### Rejected option

- **`a` (No — verify keeps today's environment; only run-check changes)**: Fails under both possible implementations:
  1. *Leaving `constructedEnv` shared without updating `passForwarded`/`launchLand`*: broken half-measure — `verify` still gets `DISPLAY`/`WAYLAND_DISPLAY`/`XDG_RUNTIME_DIR` on hosts with `systemd --user` display import, while silently dropping caller overrides (`DISPLAY=:99`) and `XAUTHORITY`, and failing on hosts without systemd manager import.
  2. *Splitting `constructedEnv`/`checkedRun` into separate `run-check` vs `verify` policies*: adds branching complexity, violates the single-environment contract in `src/verify.ts:903`, and makes any repo with a headed test in `checks` or `merge_checks` pass `run-check` and fail `verify`/`land` with `Missing X server or $DISPLAY`.

### Evidence

- **Tier 1 (probe, 2026-11-25)**: `probe-c-wayland-and-svc` (`check-probe-c-wayland-and-svc-1795568114155-3342862.log`) launched two real `systemd-run --user` transient services from a caller with `DISPLAY=:99 XAUTHORITY=/tmp/fake-xauth`:
  - Without display `--setenv`: the service received `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR=/run/user/1000`, `XDG_SESSION_TYPE=wayland` (inherited from `systemd --user` manager env; caller's `DISPLAY=:99` was overridden and `XAUTHORITY` was dropped).
  - With `--setenv=DISPLAY=:99 --setenv=XAUTHORITY=/tmp/fake-xauth`: the service received `DISPLAY=:99`, `XAUTHORITY=/tmp/fake-xauth`, `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR=/run/user/1000`.
- **Tier 1 (live host read, 2026-11-25)**: `systemctl --user show-environment` on this host contains `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR=/run/user/1000`, `XDG_SESSION_TYPE=wayland` (and no `XAUTHORITY`).
- **Tier 1 (source read, 2026-11-25)**:
  - `src/verify.ts:903-954`: `passForwarded` already lists every `copied` var (`HOME`, `PATH`, `XDG_CACHE_HOME`, `AKROGON_HOME`, `FAKE_SYSTEMD_RUN_LOG`) plus `XDG_RUNTIME_DIR`; `launchPass` emits `--setenv=${name}=${env[name]}` for defined names in `new Set([...passForwarded, ...repo.config.env, ...repo.config.pass_env])`.
  - `src/land.ts:28-63`: `launchLand` already emits `--setenv=XDG_RUNTIME_DIR=${runtimeDir()}` and forwards optional vars via `process.env[name] !== undefined`.
  - `systemd/akrogon-listener.service`: `WantedBy=default.target`, so `akrogon listen` (which calls `launchLand` via `src/next.ts:1067,1175`) can start before the desktop compositor imports `DISPLAY`/`WAYLAND_DISPLAY` into `systemd --user`.
  - `tests/fake-systemd-run.sh`: executes `verify-pass` in-place (inheriting caller env rather than `systemd --user` manager env) and logs args to `FAKE_SYSTEMD_RUN_LOG`.
- **Tier 2 (docs, 2026-11-25)**: `systemd-run(1)` and `systemd.exec(5)` (transient `.service` units run under the user manager and inherit its environment block plus `--setenv=`; `--scope` units wrap the caller's process and inherit caller env directly).

### Pitfalls and what removes each

1. **`akrogon-listener.service` boot-order race breaking `launchLand` if absent vars are unset**: `akrogon listen` starts at `default.target` and may lack `DISPLAY`/`WAYLAND_DISPLAY` in its own `process.env` even after the compositor imports them into `systemd --user`.
   - *Removal*: In `launchLand` (and `launchPass`), pass `--setenv=NAME=VALUE` **only when `process.env[NAME] !== undefined`** (never `--unsetenv` or `--setenv=NAME=`). A listener without `DISPLAY` still lets `akrogon-land-<attempt>` inherit the live `systemd --user` manager display env, while an interactive caller overrides it cleanly.
2. **Duplicate `--setenv=XDG_RUNTIME_DIR=` in `launchLand` / `launchPass`**: `src/land.ts:42` already sets `--setenv=XDG_RUNTIME_DIR=${runtimeDir()}`, and `src/verify.ts:917` already includes `XDG_RUNTIME_DIR` in `passForwarded`.
   - *Removal*: In `launchLand`, forward only the non-`XDG_RUNTIME_DIR` display vars (`DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`) from the shared list alongside line 42; `launchPass` already deduplicates via `new Set(...)`.
3. **List drift across `src/run-check.ts`, `src/verify.ts`, and `src/land.ts`**: Copying three separate string arrays invites future skew.
   - *Removal*: Export one shared constant (e.g., `DISPLAY_ENV` or `displayVars`) from `src/run-check.ts` and consume it in `copied`, `passForwarded`, and `launchLand`.
4. **Testing omission against real `systemd-run --user` transient services**: Under real `systemd-run --user`, a transient `.service` inherits the host manager's `DISPLAY`/`WAYLAND_DISPLAY` even when absent from the caller, which can cause false failures if a test asserts those vars are unset inside a real transient service on a desktop host.
   - *Removal*: Assert `--setenv=` presence/omission for `launchPass` and `launchLand` via `FAKE_SYSTEMD_RUN_LOG` (and caller override like `DISPLAY=:99` through the verify check log); assert absent-var preservation against real `systemd-run --user --scope` via `run-check`.

### Questions the fork does not ask

1. **Headless SSH caller on a machine with a logged-in desktop**: When a caller without `DISPLAY` runs `akrogon verify`, `launchPass` without `--unsetenv` lets `akrogon-verify-<id>` inherit `systemd --user`'s desktop `DISPLAY=:0` (and `launchPass` already passes `env = sessionBusEnv()`, so `XDG_RUNTIME_DIR` is always `runtimeDir()` inside `verify-pass` even if the caller left it unset). Is keeping `launchPass` consistent with `launchLand` and existing `passForwarded` behavior (`--setenv` only when defined) preferred over adding `--unsetenv` in `launchPass`? (Recommended: yes — keep one simple rule.)

---

## Leaf done-criteria and cheapest proofs

1. **Default `run-check` display forwarding**: In a repo with `pass_env: []`, `akrogon run-check` passes caller-set `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, and `XDG_RUNTIME_DIR` unchanged to the checked command, while keeping `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` and dropping undeclared variables.
   - *Cheapest proof*: Run `akrogon run-check -- sh -c env` in a temp fixture repo (`pass_env: []`) with all four display vars, a real `DBUS_SESSION_BUS_ADDRESS`, and an undeclared sentinel var in caller env; assert the four values match, the sentinel is absent, and `DBUS_SESSION_BUS_ADDRESS` is `unix:path=/nonexistent`.
2. **Absent and blank preservation under `run-check` (real scope)**: When any of `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, or `XDG_RUNTIME_DIR` is unset in the caller, `akrogon run-check` leaves it unset in the checked command (and a blank `XDG_RUNTIME_DIR=''` stays blank) while the real `systemd-run --user --scope` unit launches and cleans up cleanly.
   - *Cheapest proof*: Run `akrogon run-check` with real `systemd-run` in an isolated test slice with all four unset (and separately with `XDG_RUNTIME_DIR=''`), printing `${VAR-unset}` for each; assert exit 0, each absent var prints `unset`, and blank prints empty.
3. **Headed browser proof under `run-check` with `pass_env: []` and cgroup containment**: A headed Playwright Chromium command run via `akrogon run-check` in a repo with `pass_env: []` opens a page, evaluates DOM content, keeps the Chromium process inside `akrogon-run-<id>.scope`, and exits 0 (both default X11/Xwayland and `--ozone-platform=wayland`).
   - *Cheapest proof*: Free local probe via `akrogon run-check --holder <dir>` launching Playwright Chromium (`headless: false`, default args and `--ozone-platform=wayland`), asserting DOM text, matching `/proc/<chrome-pid>/cgroup` to `/proc/self/cgroup` (`akrogon-run-*.scope`), closing the browser, and exiting 0.
4. **Backward compatibility for repos listing display vars in `pass_env`**: A repo whose `issues/config.yaml` lists `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, and/or `XDG_RUNTIME_DIR` in `pass_env` parses cleanly and forwards those values in `run-check` and `verify` without error or duplicate `--setenv=` flags.
   - *Cheapest proof*: Run `akrogon config`, `akrogon run-check`, and `akrogon verify` in a temp fixture repo with `pass_env: [DISPLAY, XAUTHORITY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR]` and `FAKE_SYSTEMD_RUN_LOG`; assert exit 0, forwarded values in child output, and no duplicate `--setenv=` for the same key.
5. **`akrogon verify` forwards caller display vars (and overrides) to the pass service and checks**: In a repo with `pass_env: []`, `akrogon verify` passes caller-set `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, and `XDG_RUNTIME_DIR` to `akrogon-verify-<id>` and into its check commands (preserving overrides such as `DISPLAY=:99`), and omits `--setenv=` for any of `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY` absent in the caller.
   - *Cheapest proof*: Run `akrogon verify` in a temp fixture repo (`pass_env: []`, check prints all four vars) with `FAKE_SYSTEMD_RUN_LOG`: once with custom values (`DISPLAY=:99`, `XAUTHORITY=/tmp/xa`, `WAYLAND_DISPLAY=wayland-9`, scratch `XDG_RUNTIME_DIR`), asserting both the logged `--setenv=` flags and check-log values; and once with `DISPLAY`/`XAUTHORITY`/`WAYLAND_DISPLAY` unset, asserting none of those three `--setenv=` flags appear.
6. **`akrogon land` (`launchLand`) forwards caller display vars without unsetting absent ones**: Launching `akrogon-land-<attempt>` includes `--setenv=` for `DISPLAY`, `XAUTHORITY`, and `WAYLAND_DISPLAY` when set in the caller (with exactly one `--setenv=XDG_RUNTIME_DIR=`), and emits none of those three flags (and no `--unsetenv=`) when absent.
   - *Cheapest proof*: Trigger `launchLand` in a temp fixture repo with `FAKE_SYSTEMD_RUN_LOG`, once with `DISPLAY`/`XAUTHORITY`/`WAYLAND_DISPLAY` set and once with them unset; assert exact `--setenv=` presence/absence and single `XDG_RUNTIME_DIR`.
7. **Documentation updated and lesson retired**: `docs/reference/checks.md` documents that `run-check` and `verify` pass `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, and `XDG_RUNTIME_DIR` when set in the caller while keeping `DBUS_SESSION_BUS_ADDRESS` cut, and `learnings/LESSONS.md` removes the `run-check drops DISPLAY` line while `learnings/history/2026-11-24-run-check-drops-display.md` stays intact.
   - *Cheapest proof*: Verify the updated paragraph in `docs/reference/checks.md`, absence of `run-check drops DISPLAY` in `learnings/LESSONS.md`, presence of `learnings/history/2026-11-24-run-check-drops-display.md`, and green repo doc/lesson checks.
