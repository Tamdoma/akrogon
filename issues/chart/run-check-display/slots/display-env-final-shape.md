# display-env, proposed final shape (A's pick under full autopilot, 2026-11-25)

Corrections relative to slots/display-env-merged.md are marked [C1]..[C4].

## Q1: b

`akrogon run-check` copies `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY` and `XDG_RUNTIME_DIR` from the caller for every repo, each only when the caller has it (src/run-check.ts `copied`), from one exported display-name list. Never synthesized (no `runtimeDir()` for the payload), blank stays blank, `runUnitArgv`'s unset path unchanged. The names stay out of src/config.ts `constructed`, so `env`/`pass_env` entries naming them keep loading. `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` stays assigned after `copied`/env/pass_env.
[C1] `XDG_SESSION_TYPE` and `WAYLAND_SOCKET` are not in the list (keeps every headed proof on the probed X11 path; `WAYLAND_SOCKET` is an inherited fd number).

## Q2: b

[C2] The verify pass service (`launchPass`) and the land service (`launchLand`) carry the caller's display values exactly: for each of `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY` from the shared list, `--setenv=NAME=<value>` when the caller has it and `-p UnsetEnvironment=NAME` when it does not (systemd user services otherwise inherit the user manager's values). Never `--setenv=NAME=` with an empty value. `passForwarded` gets the names from the shared list.
[C3] `XDG_RUNTIME_DIR` in both services stays as today (`runtimeDir()`, always set, needed for systemctl), so a verify payload always carries it while a run-check payload carries it only when the caller does; docs state this.

## Done-criteria

1. In a repo with empty `pass_env`, a command run through `akrogon run-check` receives each of the four names the caller has, with the caller's value, and none the caller lacks (blank `XDG_RUNTIME_DIR` stays blank); the bus stays cut. Proof: own test through the real CLI.
2. A repo listing these names in `pass_env` still loads and its command receives the same values. Proof: same test file.
3. [C4] With the caller holding the three non-runtime names, the verify pass unit and the land unit are launched with `--setenv` for each with the caller's value; with the caller lacking them, each unit is launched with `UnsetEnvironment=` for each and no `--setenv` for them; `launchLand` carries one `XDG_RUNTIME_DIR`. Proof: own test reading the launched argv through `FAKE_SYSTEMD_RUN_LOG`.
4. docs/reference/checks.md (check environment paragraph) and docs/reference/config.md (`pass_env` row) state the display names, the caller-only rule and the service rule.
5. The lesson "run-check drops DISPLAY" retires: its line is removed from learnings/LESSONS.md and `Applied <date> by <file:line>: <what stops it>` is appended to learnings/history/2026-11-24-run-check-drops-display.md in the leaf diff.

Not a leaf criterion (C's dissent): a real headed Chromium launch. The charting probes (P1 red with no display, P2 green with `DISPLAY` alone) prove the pre-existing part; the leaf's own failure, the dropped variable, is caught by criterion 1 at the real CLI; akrogon has no Playwright dependency.
