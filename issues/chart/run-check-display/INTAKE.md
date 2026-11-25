# Intake: run-check-display

## Scope

A headed browser proof under akrogon run-check can open a window. Destination repo: akrogon.

## Provenance

- GitHub: Tamdoma/akrogon#155
- Operator: door session 2026-11-24 (handed list of five seeds)

## Source: Tamdoma/akrogon#155

# Under akrogon run-check, a --headed Playwright run exits with "Missing X server or $DISPLAY" before loading a page

Source: Tamdoma/akrogon#155
URL: https://github.com/Tamdoma/akrogon/issues/155

Origin repo: Gospodnja-Obnova/himne
Lesson history: learnings/history/2026-11-24-run-check-drops-display.md

Unverified intake.

## Observation

On 2026-11-24, in the Himne leaf notes-stanza-layout (plan.synthesis), the operator required e2e proofs in a visible browser. `akrogon run-check --name plan-temp-e2e -- env CI=1 npx playwright test e2e/notes-stanzas.e2e.ts --headed` failed both tests before any page loaded:

```
ERROR:ui/ozone/platform/x11/ozone_platform_x11.cc:257] Missing X server or $DISPLAY
ERROR:ui/aura/env.cc:246] The platform failed to initialize.  Exiting.
```

Playwright then printed "Looks like you launched a headed browser without having a XServer running."

- The calling shell had `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-1`, `XDG_RUNTIME_DIR=/run/user/1000`.
- `akrogon run-check --name plan-env-probe -- env` printed none of `DISPLAY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`.
- The same command with `env CI=1 DISPLAY=:0 XDG_RUNTIME_DIR=/run/user/1000` inside the run-check command opened the browser and both tests passed.

## Location

`akrogon run-check`: `src/run-check.ts` `constructedEnv` and the `copied` list (HOME, PATH, XDG_CACHE_HOME, FAKE_SYSTEMD_RUN_LOG, AKROGON_HOME). Consumer: Himne `npx playwright test ... --headed` with `pass_env: []`.

## Reproduction

1. In a repo with `pass_env: []`, run `akrogon run-check --name probe -- env | grep DISPLAY`. Nothing prints.
2. Run any `npx playwright test <spec> --headed` through `akrogon run-check`. Chromium exits with "Missing X server or $DISPLAY".

Frequency: every run.

## Expected behavior

Not provided. A headed proof that the operator requires should be able to open a window, either by a documented `pass_env` entry or by run-check itself.

## Urgency

Every headed browser proof under run-check is red before it tests anything, and the red reads like a test failure. Workaround: set `DISPLAY` (and `XDG_RUNTIME_DIR`) inside the run-check command, or list them in the repo's `pass_env`.

## Suspected cause

Supported hypothesis: `constructedEnv` builds the child env from the fixed `copied` list plus the repo's `env` and `pass_env`, so display variables reach the child only when a repo lists them. Contributing: the operator's headed-only lock (2026-11-24) puts headed runs on the lifecycle path, and plans name the proof command without the variables.
Whose view: agent.
Files read: `src/run-check.ts` (akrogon workspace checkout, `copied` list and `constructedEnv`), `src/config.ts` (`pass_env` schema). Run logs: `/home/ivan/Work/personal/Himne/issues/open/notes-sheet-layout/notes-stanza-layout/implementation/check-plan-temp-e2e-1795536709963-1573022.log`, `check-plan-env-probe-1795536714579-1574869.log`, `check-plan-temp-e2e-1795536732337-1578211.log`.
Not inspected: Wayland-only sessions (only X via `DISPLAY=:0` was tried); whether `XDG_RUNTIME_DIR` is needed or only `DISPLAY`.
Related reports: Tamdoma/akrogon#111 (closed; same mechanism class, a missing locale variable under run-check broke Maestro); Tamdoma/akrogon#110 (closed; different env gap under run-check). Searched Tamdoma/akrogon, `run-check DISPLAY`, `run-check headed`, `run-check pass_env`, all states, limit 10; plus the filing account's reports since 2026-11-22.

## Source: operator door message 2026-11-24

5 issues pulled. We need to chart them out. Use the following consultants: slot b: pi swe-2-1-max, slot c: agy neon high, slot d: pi muse wonder full 1.0. Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance.

## Agent findings

Imported at door open 2026-11-24T22:57:50Z (pull time). No identity match in open/closed leaf sources or chart intakes. Territory map findings are added after the shared opening map (issues/chart/seat-turn-idle/slots/map-merged.md).
