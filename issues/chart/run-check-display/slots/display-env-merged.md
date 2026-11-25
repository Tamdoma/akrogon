# display-env, merged notes (A, B, C, D)

Sources: display-env-A.md, -B.md, -C.md, -D.md, written blind 2026-11-25. Probes by every slot under issues/chart/run-check-display/direct/.

## Q1 which names run-check passes for every repo

- b, full set `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`, each only when the caller has it (B,C,D). Reason: the names are the address of the caller's graphical session, two pairs that cannot be split: X (`DISPLAY` + auth file pointer) and Wayland (`WAYLAND_DISPLAY` + the socket's directory). One list change in `copied` (B,C,D). Cost: every check sees the real runtime dir (hc sockets, `systemd/private`, pipewire), not a new capability since checks already run as the same uid with the real `HOME` and no filesystem sandbox (D). `systemctl --user` becomes reachable through `$XDG_RUNTIME_DIR/systemd/private`; `busctl --user` still fails on the cut bus (C probed).
- a, X pair only (A). Reason: smallest proven fix, keeps today's runtime-dir absence. Cost: a native Wayland consumer or a host with no Xwayland stays broken, and the fix cannot be extended by one name later because `WAYLAND_DISPLAY` is dead without `XDG_RUNTIME_DIR` (B,C,D).
- A's reason for a is answered: akrogon's suite pins `XDG_RUNTIME_DIR` to a scratch dir in the bun preload (tests/isolation.ts, bunfig.toml `preload`) (C), and hc falls back to `/run/user/$UID` when the variable is unset, so its absence never isolated hc (C probed `hc ls`).

### Evidence

- Probes: no display names reach a run-check command today (A,B,C,D). Headed Playwright 1.63 Chromium: `DISPLAY` alone passes (A,B,C,D); Wayland pair alone fails by default (A,B,C,D) and passes with `--ozone-platform=wayland` (B,C,D); `WAYLAND_DISPLAY` without `XDG_RUNTIME_DIR` fails even with the ozone flag (B,C,D); adding `XDG_SESSION_TYPE=wayland` to the Wayland pair makes the default launch pick Wayland (D; C saw `--ozone-platform-hint=auto` need it). Headed Chromium with the full set stays inside `akrogon-run-<id>.scope` (C). `headless: true` stays headless with the full set (C). `XAUTHORITY=/nonexistent` does not break this host (C: Xwayland here enforces no auth).
- Specs: X(7) `XAUTHORITY` defaults to `$HOME/.Xauthority` (A,B,C,D). `wl_display_connect` opens `$XDG_RUNTIME_DIR/$WAYLAND_DISPLAY` for a relative name (B,C,D). XDG Base Directory spec: runtime dir is a session address (D).
- Source: `constructedEnv` copies each `copied` name only when set; `runUnitArgv` already returns `XDG_RUNTIME_DIR` when constructedEnv carries it and unsets it otherwise (A,B,C,D). `src/config.ts` reserved `constructed` set does not hold the four names, so `pass_env` entries stay valid (A,C). Framework lists `pass_env: [DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR]` (three names, not `XAUTHORITY`; D corrects the fork's Q1b wording) (A,B,C,D).

### Pitfalls

- Inventing a value: copy `process.env` only, never `runtimeDir()`, keep the `runUnitArgv` unset path; a blank `XDG_RUNTIME_DIR` stays blank (C, tests/run-units.test.ts "forwarded blank or missing XDG_RUNTIME_DIR").
- Reserving the names would reject framework's config: keep them out of `constructed` (C).
- Bus cut: keep `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` assigned after `copied`/env/pass_env (C,D).
- Allow-list test in tests/run-check.test.ts hand-copies env names: the leaf updates it (A,C).
- A tool that sniffs `DISPLAY` to pick headed mode: Playwright does not; the cheap suite stays green (A,D).
- `WAYLAND_SOCKET` is an inherited fd number and must not be forwarded (B).
- A stale caller display value passes as is, same as `HOME`/`PATH` (D).

### Open question raised

- `XDG_SESSION_TYPE` (C,D): forwarding it lets a default Chromium launch pick native Wayland on a host with no Xwayland, but on a host with both it can move existing headed proofs from the proven X11 path to Wayland. Neither slot picked adding it; C leans exclude.

## Q2 verify and land

- b, `passForwarded` and `launchLand` forward the same names, only when set, from one shared list (B,C,D). Reason: verify runs every setup and check through `checkedRun` → `constructedEnv` (`src/verify.ts` `runOnce`), and the `passForwarded` comment states the services carry what constructedEnv selects; one command must see the same display at both doors (B,C,D). Cost: a repo that puts a headed command in `checks` or `merge_checks` opens windows during unattended verify and land (B,C,D), which is that command's own flag.
- a, verify unchanged (A). Reason: no intake reports verify; checks are headless by standing design. Premise refuted: transient `systemd-run --user` services inherit the user manager's environment, which on this host holds `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR`, `XDG_SESSION_TYPE=wayland` (C probed a service; A re-read `systemctl --user show-environment` 2026-11-25). Once `copied` holds the display names, verify's constructedEnv picks up the manager's values, not the caller's: a caller `DISPLAY=:99` was replaced by `:0` and `XAUTHORITY` dropped in C's probe. So a leaves verify host-dependent, not display-less (C,D).

### Pitfalls

- Empty-but-set values: `launchLand` uses `?? ''` for PATH/HOME; display names must use its only-if-set `flatMap` pattern, never `--setenv=DISPLAY=` and never `--unsetenv` (B,C,D). A listener started before the compositor imports the display then still lets the land unit inherit the manager's values (C).
- Duplicate `XDG_RUNTIME_DIR` in `launchLand`: it already sets `--setenv=XDG_RUNTIME_DIR=${runtimeDir()}`; add only the other three there (C). `launchPass` already dedupes names with a `Set` (C,D).
- List drift across three sites: one exported display list consumed by `copied`, `passForwarded` and `launchLand` (C,D).
- Tests asserting absence inside a real transient service fail on a desktop host because the manager env leaks in: assert service `--setenv` flags through `FAKE_SYSTEMD_RUN_LOG`, and absence through run-check's real scope (C).

### Open question raised

- Headless SSH caller on a host with a logged-in desktop: verify then inherits the manager's `DISPLAY`. Keep only-if-set with no `--unsetenv` (C recommends; one rule).

## Done-criteria proposed

1. `akrogon run-check` in a repo with empty `pass_env` passes each of the four names the caller has, unchanged, omits each the caller lacks (no synthesis, blank stays blank), keeps the bus cut and drops undeclared names. Real CLI, free (A,B,C,D).
2. A headed Chromium launch through run-check, with no display setting in the command or config, opens a page and exits 0 (B,C,D as a leaf proof; A as a charting probe only, since akrogon has no Playwright dependency).
3. A repo listing these names in `pass_env` still loads and gets the same values (A,C,D).
4. A verify pass command sees the caller's values; with the caller lacking the three non-runtime names, the pass and land unit argv carry no `--setenv` for them, and `launchLand` carries one `XDG_RUNTIME_DIR` (B,C,D).
5. docs/reference/checks.md environment paragraph and docs/reference/config.md `pass_env` row state the display names; the "run-check drops DISPLAY" line is removed from learnings/LESSONS.md with the Applied line in the history file (A,B,C,D).

## Where slots differ

- Q1 a (A) vs b (B,C,D); Q2 a (A) vs b (B,C,D). A's reasons for a are refuted by C's evidence above.
- Headed-browser leaf proof: run on the host (B,C,D) vs charting probe only (A).
