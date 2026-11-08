# run-check hides the desktop bus, so keyring logins fail

## Case

herdr-setup leaf herdr-skill, implement pass, 2026-11-07, criterion 2 discovery runs. The throwaway hc core `hs-e2e-skill` was started with `akrogon run-check --name e2e-server-start -- hc server start`, and each harness was launched with `akrogon run-check -- hc run --bg ...`. claude, codex and pi started signed in. agy 1.5.3 opened on "You are currently not signed in. Select login method", while `agy models` in the seat's own shell worked.

## Evidence

- agy's log `~/.gemini/antigravity-cli/log/cli-20261107_153332.log`: `Failed to load stored token from keyring, falling back to file: dial unix /nonexistent: connect: no such file or directory` and `You are not logged into Antigravity.`
- `akrogon run-check --name e2e-dbus-probe -- sh -c 'echo "$DBUS_SESSION_BUS_ADDRESS"'` printed `unix:path=/nonexistent`. The seat's shell has `unix:path=/run/user/1000/bus`. The source is `src/run-check.ts` `constructedEnv`: `env.DBUS_SESSION_BUS_ADDRESS = 'unix:path=/nonexistent'`.
- After the core was restarted and agy relaunched with `DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus` set inside the run-check command, agy opened signed in (session 5/8 of the leaf grant).

## Learning

A process started under run-check inherits a dead session bus. A harness whose login lives in the keyring (agy here) looks signed out, which costs a counted paid session. A long-lived core started under run-check passes the dead bus to every terminal it later runs. When a live run launches a harness or a core through run-check, set the real `DBUS_SESSION_BUS_ADDRESS` inside the command. The run-check sandboxing stays in place for everything else.
