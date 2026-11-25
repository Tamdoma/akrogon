# run-check drops DISPLAY, so a headed browser cannot start

## Case

Himne leaf notes-stanza-layout, plan.synthesis pass, 2026-11-24. The operator locked e2e proofs to a visible browser ("the e2e testing has to be done live in the browser, no headless browser."). The planned proof `akrogon run-check --name plan-temp-e2e -- env CI=1 npx playwright test e2e/notes-stanzas.e2e.ts --headed` failed both tests before any page loaded, while the seat's own shell had `DISPLAY=:0`.

## Evidence

- Log `/home/ivan/Work/personal/Himne/issues/open/notes-sheet-layout/notes-stanza-layout/implementation/check-plan-temp-e2e-1795536709963-1573022.log`: Chromium `ERROR:ui/ozone/platform/x11/ozone_platform_x11.cc:257] Missing X server or $DISPLAY`, then Playwright's "Looks like you launched a headed browser without having a XServer running".
- `akrogon run-check --name plan-env-probe -- env` printed no `DISPLAY`, `WAYLAND_DISPLAY` or `XDG_RUNTIME_DIR` (`check-plan-env-probe-1795536714579-1574869.log` in the same folder). `src/run-check.ts` `constructedEnv` copies only the fixed `copied` list plus the repo's `env` and `pass_env`; Himne has `pass_env: []`.
- The same command with `env CI=1 DISPLAY=:0 XDG_RUNTIME_DIR=/run/user/1000` inside it opened the browser and passed (`check-plan-temp-e2e-1795536732337-1578211.log`).

## Learning

A headed browser run under run-check starts with no display unless the display variables reach it. Either the repo lists `DISPLAY` (and `XDG_RUNTIME_DIR` where needed) in `pass_env`, or the proof command sets them inside the run-check command. A plan that names a `--headed` proof under run-check without one of these fails before it tests anything.

Report: https://github.com/Tamdoma/akrogon/issues/155

## Case 2026-11-24, Himne notes-reflow-zoom plan.synthesis

The same headed Playwright proof run through `akrogon run-check` (`env CI=1 npx playwright test e2e/notes-zoom.e2e.ts --headed`) failed all 10 tests at `browserType.launch` with "ui/aura/env.cc:246 The platform failed to initialize. Exiting." A `run-check` printing `env` showed no `DISPLAY`, `WAYLAND_DISPLAY` or `XDG_RUNTIME_DIR` while `/tmp/.X11-unix/X0` was reachable; the same launch from the seat's shell succeeded. Adding `DISPLAY=:0 XDG_RUNTIME_DIR=/run/user/1000` inside the command fixed it. Logs: Himne `issues/open/notes-sheet-layout/notes-reflow-zoom/implementation/check-notes-zoom-e2e-1795538043527-2274478.log`, `check-display-env-1795538102563-2297354.log`.

Applied 2026-11-25 by src/run-check.ts displayEnv/copied: the four display names are copied from the caller into every check command, so a headed browser inherits the caller's session
