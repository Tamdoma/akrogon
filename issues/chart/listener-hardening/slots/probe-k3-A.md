# Probe K3 (door A, 2026-11-08 ~09:15Z, free)

Command: `env -i HOME PATH LANG XDG_RUNTIME_DIR=<private 0700 dir> DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent HC_SESSION=k3probe hc server start`, hc 0.1.18, user ivan.

Observed:
- `hc-shutdown-*` units before 3951, after start 3951: no unit created.
- Socket only at `<private dir>/herdr-core/k3probe.sock`; none under `/run/user/1000/herdr-core/`.
- The core stayed alive after `hc server start` exited (pid 1732924 alive), so "ends with whatever started it" does not mean "ends when the start command exits"; tests still stop their cores.
- Inside a terminal of that core: `systemd-run --user --scope --quiet true` failed, "Failed to connect to user scope bus via local transport: No such file or directory", exit 1. A seat started through real `systemd-run --user` cannot run in such a core.
- `hc server stop` → `{"stopped":true}`; private dir removed.

Limits: one start; did not test a core given the real bus for terminals but not for hc's own detection; did not run the suite this way.
