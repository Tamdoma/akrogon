# Display variables under run-check

## Question

Q1. Which display variables does `akrogon run-check` pass from the caller to the checked command for every repo, with no `pass_env` entry?

- a. The X11 pair: `DISPLAY` and `XAUTHORITY`, each only when the caller has it. `XDG_RUNTIME_DIR` stays as today (absent unless a repo lists it).
- b. The full set: `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY` and `XDG_RUNTIME_DIR`, each only when the caller has it (the set the framework repo lists in `pass_env` today).

Q2. Do `akrogon verify` passes (configured `checks`, and merge verify inside a land) get the same display variables?

- a. No. Verify keeps today's environment. Only run-check changes.
- b. Yes. The verify pass service (`passForwarded`) and the land service (`launchLand`) forward the same names, so one command sees the same display under run-check and under verify.

### Carries

- Intake: issues/chart/run-check-display/INTAKE.md (Tamdoma/akrogon#155, lesson history learnings/history/2026-11-24-run-check-drops-display.md).
- Signposts (A's picks under full autopilot): issues/chart/run-check-display/forks/signposts.md. 1a fix in the mechanism that fails; 2a free tests at the real boundary plus charting probes; 3a no new record kinds; 4a one leaf per chart; 6a old config keeps working with no migration.
- Operator words for this door session: "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."
- Shared opening map: issues/chart/seat-turn-idle/slots/map-merged.md § run-check-display (#155) and § Shared facts.
- Surfaces: src/run-check.ts `copied`, `constructedEnv`, `runUnitArgv` call; src/scope.ts `runUnitArgv`, `runtimeDir`; src/verify.ts `passForwarded`, `launchPass`; src/land.ts `launchLand`; docs/reference/checks.md (check environment paragraph); docs/reference/config.md (`pass_env` row); learnings/LESSONS.md line "run-check drops DISPLAY".

## Findings

### Charting proofs

All free, run 2026-11-25 by A from the akrogon root through the installed release 085f2f88 (`akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/run-check-display/direct`), identity: local user ivan on this host (Hyprland Wayland session with Xwayland, caller env `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR=/run/user/1000`, `XAUTHORITY` unset). Browser: Playwright 1.63.0 Chromium from the Himne checkout (b6c6c75) under node v26.13.1. Script: `chromium.launch({headless:false})`, open a data: page, read its heading, close. Logs in `direct/`.

| probe | command env inside run-check | result | log |
|---|---|---|---|
| P0 | none, prints display names | `none`: no DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR, XAUTHORITY reach the command | check-probe-env-1795567787801-3016502.log |
| P1 | none | exit 1, Chromium `ozone_platform_x11.cc:257 Missing X server or $DISPLAY` (reproduces #155) | check-probe-none-full-1795567906807-3231288.log |
| P2 | `DISPLAY=:0` only | exit 0, window opened, page heading read | check-probe-display-1795567788702-3017038.log |
| P3 | `WAYLAND_DISPLAY=wayland-1 XDG_RUNTIME_DIR=/run/user/1000` only | exit 1, same X11 error: Playwright's Chromium uses the X11 ozone backend by default | check-probe-wayland-full-1795567907178-3231719.log |

Cleanup: each browser closed by the script; no files outside `direct/`. Limits: one host, X via Xwayland with no auth cookie, so `XAUTHORITY` was not exercised; Firefox and WebKit not tried; a Wayland-native client (`--ozone-platform=wayland`) not tried.

| probe | command | result | log |
|---|---|---|---|
| A-S1 | `systemd-run --user --quiet --pipe --collect env` (control) | service env holds the manager's `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_SESSION_TYPE=wayland` | terminal, 2026-11-25 |
| A-S2 | same with `-p 'UnsetEnvironment=DISPLAY WAYLAND_DISPLAY XAUTHORITY'` | the three names absent | terminal |
| A-S3 | same with `--setenv=DISPLAY=:99 --setenv=XAUTHORITY=/tmp/xa -p UnsetEnvironment=WAYLAND_DISPLAY` | `DISPLAY=:99`, `XAUTHORITY=/tmp/xa`, no `WAYLAND_DISPLAY` | terminal |
| A-S4 | two `-p UnsetEnvironment=<one name>` flags | both names absent | terminal |

Service probes: systemd 262 (262.2-1-arch), local user ivan, no unit left behind (`--collect`). Limits: transient services with `--pipe`, not the `launchPass`/`launchLand` argv itself; the listener's own env held `DISPLAY` at this check (started 2026-11-25 00:03:56 CET), a listener started before the compositor was not observed. `systemctl --user show-environment` 2026-11-25: `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR=/run/user/1000`, `XDG_SESSION_TYPE=wayland`, no `XAUTHORITY`.

Peer probes (B, C, D, 2026-11-25, logs `direct/check-b-*`, `check-probe-c-*`, `check-d-*`): Wayland pair passes with `--ozone-platform=wayland`; `WAYLAND_DISPLAY` without `XDG_RUNTIME_DIR` fails even with it; `XDG_SESSION_TYPE=wayland` moves a default launch to Wayland (D); headed Chromium with the full set stays in `akrogon-run-<id>.scope` (C); `headless: true` stays headless with the full set (C).

### Exchange

Blind notes: slots/display-env-{A,B,C,D}.md. Merged: slots/display-env-merged.md. Rebuttals: slots/display-env-rebuttal-{B,C,D}.md.

- Q1: b (B,C,D), a (A). A's reason (runtime dir exposes hc to akrogon's suite) refuted: tests/isolation.ts preload pins `XDG_RUNTIME_DIR`, and hc falls back to `/run/user/$UID` anyway (C).
- Q2: b (B,C,D), a (A). A's premise (verify stays display-less) refuted by manager env inheritance (C probe, A-S1).
- Rebuttal B R1/R2/R4 and D R2: only-if-set `--setenv` leaves a caller-absent name inherited from the manager; fix with `UnsetEnvironment=`; the criterion must observe the unset, not the absent `--setenv`. Adopted.
- Rebuttal B R3: `XDG_SESSION_TYPE` already reaches verify payloads. Refuted: constructedEnv copies only listed names, so the service's inherited value never reaches a payload; excluded from the list, it reaches neither door.
- Rebuttal C: headed Chromium as a leaf proof. Not adopted (see Taken).
- Rebuttal D R1/R3: attribution corrections, applied in this record.
- First final-shape check (slots/display-env-final-shape.md, returns display-env-final-check-{B,C,D}.md): C problem 1 (listener predates the desktop display, so unsetting in land strips what framework's merge verify inherits today) adopted as K1; C problem 2 and D F1 (blank values) adopted as K3; D F2 (scope of the session-type reason) adopted as K4; B P1 (inner run scope re-injects `XDG_SESSION_TYPE`) refuted by A's probes (`env -i ... systemd-run --user --scope env` prints only given names; direct/check-probe-a-sessiontype-1795569364709-270540.log prints none), B withdrew it.
- Second final-shape check (slots/display-env-final-shape-2.md): no problem (B, C, D).

## Taken

A's pick under full autopilot, 2026-11-25, not operator words. Round written in A's terminal (t126).

Q1: b. `akrogon run-check` copies `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY` and `XDG_RUNTIME_DIR` from the caller for every repo, each only when the caller holds it, from one exported display-name list. Reason: the names are the address of the caller's graphical session in two unsplittable pairs (X: `DISPLAY` + auth file pointer; Wayland: `WAYLAND_DISPLAY` + socket directory); one list change removes the failure class at the failing mechanism (signpost 1a). Rejected a (X pair only): a Wayland-native client or a host without Xwayland stays broken, and `WAYLAND_DISPLAY` cannot be added later without `XDG_RUNTIME_DIR`; A's isolation reason was refuted (tests/isolation.ts pins the runtime dir; hc falls back to `/run/user/$UID`).

Q2: b. One command sees the same display at every door it enters by its caller. The verify pass service (`launchPass`) carries its caller's values exactly: `--setenv=NAME=<value>` for each of `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY` the caller holds, `-p UnsetEnvironment=NAME` for each it lacks. The land service (`launchLand`) sets each the caller holds and leaves the rest to the user manager, so a land started by a listener that predates the desktop display keeps today's inherited values (signpost 6a). Reason: verify runs every command through `checkedRun` → `constructedEnv`, and `passForwarded`'s stated rule is to carry what constructedEnv selects; user services otherwise inherit the manager's display regardless of the caller. Rejected a: verify would pick up the manager's display, not the caller's, so the two doors diverge by host.

Binding decisions (the chosen option's avoidance mechanisms):

1. Copy from the caller only, never synthesize (no `runtimeDir()` for the payload); `runUnitArgv`'s unset path for `XDG_RUNTIME_DIR` stays.
2. Blank rule: a name held with an empty value is held at every door and passed as that empty value; only an undefined name is absent. A display name never gets both `--setenv` and `UnsetEnvironment=` on one unit, including when a repo lists it in `pass_env`.
3. The four names stay out of src/config.ts `constructed`, so `env`/`pass_env` entries naming them keep loading.
4. `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` stays assigned after `copied`, `env` and `pass_env`.
5. `XDG_SESSION_TYPE` and `WAYLAND_SOCKET` are not passed. Excluding the session type keeps Chromium's default platform choice on the probed X11 path; a command that selects Wayland itself still gets the Wayland pair. `WAYLAND_SOCKET` is an inherited fd number.
6. One exported display-name list feeds `copied`, `passForwarded` and `launchLand`.
7. `XDG_RUNTIME_DIR` in both services stays as today (`runtimeDir()`, always set); a verify payload therefore always carries it, while a run-check payload carries it only when the caller does. The docs state this.
8. Service behavior is proven on the launched argv through `FAKE_SYSTEMD_RUN_LOG`, since a real user service on a desktop host inherits the manager's display.

```text
caller env ──run-check──> payload: the four names as the caller holds them
caller env ──verify────> pass unit: --setenv held / UnsetEnvironment lacking ──> payload
caller env ──land──────> land unit: --setenv held / manager otherwise ──> verify ──> payload
```

Headed-browser proof: the charting probes (P1 red with no display, P2 green with `DISPLAY` alone, peer probes for the Wayland pair) prove the pre-existing part; the leaf's own failure, a dropped variable, is caught at the real CLI. Standing dissent: C holds that the leaf should also run a real headed Chromium launch against the fixed CLI on this host.
