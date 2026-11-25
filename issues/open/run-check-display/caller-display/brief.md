# Brief: caller-display

## What

akrogon gives a checked command the caller's display session for every repo, with no `env` or `pass_env` entry:

1. `akrogon run-check` copies `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY` and `XDG_RUNTIME_DIR` from the caller into the command's environment, each only when the caller holds it (`src/run-check.ts` `copied`, read by `constructedEnv`). The names come from one exported display-name list.
2. The verify pass service (`src/verify.ts` `launchPass`) is launched with `--setenv=NAME=<value>` for each of `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY` its caller holds and `-p UnsetEnvironment=NAME` for each it lacks. `passForwarded` takes the names from the shared list.
3. The land service (`src/land.ts` `launchLand`) is launched with `--setenv=NAME=<value>` for each of those three names its caller holds, and nothing for the rest.
4. docs/reference/checks.md and docs/reference/config.md describe this.
5. The lesson "run-check drops DISPLAY" retires.

## Why

Tamdoma/akrogon#155. A `--headed` Playwright proof run through `akrogon run-check` in Himne failed every test before a page loaded with "Missing X server or $DISPLAY", because `constructedEnv` copies a fixed list plus the repo's `env`/`pass_env` and no display variable. The red reads like a test failure. It happened twice on 2026-11-24 (learnings/history/2026-11-24-run-check-drops-display.md). The verify and land services are systemd user services, which inherit the user manager's display whatever the caller holds, so the same command would otherwise see a different display at each door.

## Done-criteria

1. In a repo with empty `env` and `pass_env`, a command run through `akrogon run-check` receives each of `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR` the caller holds, with the caller's value (an empty value stays empty), and none the caller lacks. The same run still gets `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` and no `XDG_SESSION_TYPE`. Proof: own test through the real CLI.
2. A repo listing these names in `pass_env` still loads, and its run-check command receives the same caller values. Proof: own test through the real CLI.
3. With the caller holding `DISPLAY`, `XAUTHORITY` and `WAYLAND_DISPLAY` (one of them empty), the verify pass unit and the land unit are each launched with `--setenv` carrying every caller value, the empty one included. With the caller lacking them, the verify pass unit is launched with one `-p UnsetEnvironment=<name>` per name and no `--setenv` for them, and the land unit with neither. The land unit carries exactly one `XDG_RUNTIME_DIR`. Proof: own test reading the launched argv through `FAKE_SYSTEMD_RUN_LOG`.
4. docs/reference/checks.md's check-environment paragraph names the four display variables and the caller-only rule, and states that a verify payload always carries `XDG_RUNTIME_DIR`. docs/reference/config.md's `pass_env` row or the paragraph after it states that the four display variables reach check commands without being listed and that listing them stays valid. (C,D)
5. The lesson retires in the leaf's diff: the line beginning "run-check drops DISPLAY" is removed from learnings/LESSONS.md, and `Applied <YYYY-MM-DD> by <file:line or commit>: <what stops it>` is appended to learnings/history/2026-11-24-run-check-drops-display.md.
