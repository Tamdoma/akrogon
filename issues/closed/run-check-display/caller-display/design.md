# Design: caller-display

## Binding decisions, verbatim

### Signposts, from forks/signposts.md

A's picks under full autopilot (operator: "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance."), not operator words:

1. 1a. Removing the failure class beats guarding it (operator value: simplicity, removing over adding).
2. 2a. Free tests catch these mechanical bugs at lower cost (operator values: speed and price).
3. 3a. Fewest moving parts (operator value: simplicity).
4. 4a. Fewest leaves to dispatch and review (operator value: simplicity).
5. 5a. #157 stalls unattended runs and holds capacity; #153 is the widest change and gains from the others landing first.
6. 6a. No migration step to run or get wrong (operator value: simplicity).

Account: the session prioritizes fixing each mechanism in akrogon itself, proving it with free tests, and reusing existing records. It gives up per-repo config knobs, live-run evidence and new record kinds unless a chart shows no other way.

### Display variables, from forks/display-env.md

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

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md, as it applies here:

- Proof at the real boundary (signpost 2a): criteria 1 and 2 run the real `akrogon run-check` CLI in a temp fixture repo, as tests/run-check.test.ts already does. Criterion 3 reads the argv the real launch code hands to `systemd-run` through the existing fake (`tests/fake-systemd-run.sh`, `FAKE_SYSTEMD_RUN_LOG`). A real user service is not the proof, because on a desktop host it inherits the manager's display and hides an absent case.
- Bug fix shows red then green: criterion 1 fails on the base (no display name reaches the command) and passes after. Criterion 3's unset case is new behavior: a deliberate break (drop the `UnsetEnvironment=` emission) turns it red.
- No machinery: the fixture repo, the CLI helper and the fake systemd-run exist. No Playwright is added to akrogon; the headed-browser part is proven by the charting probes recorded in readiness.yaml.
- No hand-copied lists: the existing env allow-list test in tests/run-check.test.ts hand-copies `copied` names. Where the leaf touches it, it reads the exported display list rather than adding a second copy.
- No live run, no paid launch, no outside call during implementation.

## Held disagreements

- Not a decision, the decision stands. Against: "Headed-browser proof" in the display-env Taken. Fact: no charting probe ran the fixed CLI; every green headed probe set the display inside the command. Consequence: the leaf proves the variable reaches the command, not that a window opens through the fixed CLI. Raised by C (slots/display-env-rebuttal-C.md), state: kept by A under full autopilot 2026-11-25, unanswered by the operator.

## Leaf architecture

Owned surfaces:

- `src/run-check.ts`: one exported display-name list (`DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`), spread into `copied`. `constructedEnv` already copies a `copied` name only when `process.env[key] !== undefined`, so an empty value is copied and an undefined one is not. The bus cut stays after the `env`/`pass_env` loop.
- `src/verify.ts`: `passForwarded` takes the display names from the shared list; `launchPass` adds `-p UnsetEnvironment=<name>` for each of the three non-runtime display names that is undefined in its env. The generic loop already emits `--setenv` only for defined names, so a name gets one or the other, including when a repo lists it in `pass_env`.
- `src/land.ts`: `launchLand` adds `--setenv=<name>=<value>` for each of the three non-runtime display names defined in `process.env`, in the same only-if-defined form it uses for the `AKROGON_*` names. It keeps its one existing `--setenv=XDG_RUNTIME_DIR=${runtimeDir()}`.
- Tests for criteria 1 to 3 in akrogon's existing test files or a new one beside them (plan's choice).
- `tests/isolation.ts` (bun preload): unsets `DISPLAY`, `XAUTHORITY` and `WAYLAND_DISPLAY` beside its `XDG_RUNTIME_DIR` pin, so the suite sees the same display state whoever launched it (desktop seat, SSH shell, listener-started land); tests that need a display name set it explicitly in the env they hand the CLI. (B)
- docs/reference/checks.md (check-environment paragraph), docs/reference/config.md (`pass_env` row).
- learnings/LESSONS.md (remove one line), learnings/history/2026-11-24-run-check-drops-display.md (append the Applied line).

Consumers of the changed state:

- `src/scope.ts:runUnitArgv`, called from `src/run-check.ts` with `env.XDG_RUNTIME_DIR`: it passes `XDG_RUNTIME_DIR=<value>` into the scope when constructedEnv carries the name and `-u XDG_RUNTIME_DIR` otherwise. Checked: both branches already exist, and tests/run-units.test.ts "a forwarded blank or missing XDG_RUNTIME_DIR still launches the run unit and reaches the command as it was" covers them. Reused unchanged.
- The verify pass process (`src/verify.ts` `runOnce` → `checkedRun` → `constructedEnv`): it reads its own `process.env`, which is the pass unit's env. With the list in `copied`, it copies whatever the unit carries; criterion 3 fixes what the unit carries.
- akrogon's own suite: `tests/isolation.ts` (bunfig `preload`) pins `XDG_RUNTIME_DIR` to a suite folder, so suite commands never see the operator's hc sessions. Because the suite always sets it, a run-check payload inside a test now carries it. `tests/helpers.ts` `cli()` spreads `process.env` into each CLI call, which is why the preload unset above is the one place the other three names are fixed. (B) Open for the plan: which existing expectations change with it (the allow-list test in tests/run-check.test.ts is one).
- src/config.ts `constructed` (reserved names): the four names are not added, so framework's `pass_env: [DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR]` keeps loading.
- `UnsetEnvironment=` was added in systemd 235 (systemd.exec(5)); run-check already passes `--expand-environment=no` (`src/scope.ts:runUnitArgv`), added to systemd-run in 254, so every host akrogon runs on has it. The form is one `-p UnsetEnvironment=<name>` per missing name, observed working on systemd 262 (A-S4). (C)

Exclusions:

- `XDG_SESSION_TYPE`, `XDG_CURRENT_DESKTOP` and `WAYLAND_SOCKET` are not passed (binding decision 5).
- Land does not unset (binding decision, Q2): a listener started before the desktop exported its display leaves the land unit to inherit the manager's values, as today.
- Land forwarding the repo's `pass_env` names is a pre-existing gap outside this leaf.
- No change to seat or hc terminal environments.
