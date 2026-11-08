# run-check ended a detached herdr-app window

## Case

herdr-setup leaf update-check, implement, 2026-11-07, akrogon release 67f0b262. To prove criterion 1 on fresh builds, slot A opened a throwaway session with `akrogon run-check --name c1-probe-open -- herdrapp --session uc-probe`. `herdrapp` starts the window with `setsid -f herdr-app` and waits until `herdr-app status` answers, then runs `space.new`.

## Evidence

run-check printed `check c1-probe-open: 0`. Straight after, `HERDR_APP_HOME=~/.config/herdr-app-sessions/uc-probe herdr-app status` gave `Connection refused`, `pgrep -x herdr-app` listed only the operator's infra window, and `~/.local/state/herdrapp/uc-probe.log` was empty. The session's core (`herdr-core serve`, started through the window) and its socket were still there. `herdrapp session attach uc-probe` run from the plain Bash tool opened a window that stayed up, and the following `akrogon run-check --name c1-pass -- bin/herdr-update-check uc-probe` passed against it. Logs are under herdr-setup `issues/open/herdr-app/update-check/implementation/` (`check-c1-probe-open-*`, `check-c1-pass-*`).

## Learning

run-check cleans up the processes started under it, `setsid -f` included, so it is the wrong wrapper for a step whose product is a process that must outlive the command (a window, a server). Start that step outside run-check, then run the observation that reads it under run-check. Not checked: the exact mechanism (cgroup or process-group kill), and why the core survived while the window did not.
