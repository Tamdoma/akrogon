# Fork notes A: containment

## Q1 keep boxing
- Pick: keep it for leaf seats exactly as today (leaf slice under `akrogon.slice`, same limits); consultants and doors stay unboxed as today. Reason: standing direction (nothing that works today breaks); the slice limits protect the machine from a runaway leaf and give check runs their parent slice (`src/run-check.ts:298`).
- Rejected: dropping it (signpost 2a removes old-herdr-only machinery; the slice is akrogon's, not herdr's).

## Q2 how
- Pick: wrap the harness argv at start: `hc run --bg ... -- systemd-run --user --scope --quiet --slice=<leaf slice> -p TimeoutStopSec=5 -p SendSIGHUP=yes -- env K=V ... <harness argv> "<task>"`. `systemd-run --scope` registers the scope and execs the command in place, and `env` execs too, so hc's `pid` is the harness (session-id reads it first). The scope exists before the harness runs, so nothing escapes the box. Reason: fewer parts than today: no shell pid lookup, no `busctl` call, no `inOwnScope` check-and-repair loop; the same `systemd-run` pattern check runs and verify already use. Cost: argv grows; the scope name must stay unique per start (`paneScope` used pane id, pid and start time; use the hc name plus start time).
- Rejected: moving hc's `pid` after start (today's `adoptShell` port): a window where the harness and its first children run outside the box, plus a check-and-repair path.
- Pitfall: `systemd-run` needs the user bus (`XDG_RUNTIME_DIR`, `DBUS_SESSION_BUS_ADDRESS`) in the core's environment, which hc passes to its programs; probe from a listener-started seat. Pitfall: `hc kill` signals the harness; with `SendSIGHUP` and the scope stopping when its last process exits, children die as today; probe that a grandchild server dies with the scope.

## Q3 env
- Pick: `env K=V` in the argv, inside the scope (above). One mechanism for CLI and engine, visible in `hc get` argv. The API `env` would need the start command to speak JSON-RPC for one field.
- HC_SESSION: the engine pins it per call (identity Taken); land, verify and check runs started by `systemd-run` inherit the caller's environment only through `--setenv`/`-E` or `env` in argv; they get `HC_SESSION` and `HERDR_APP_HOME` explicitly, as `src/land.ts` passes its environment today. Probe: a land run reaches hc.
