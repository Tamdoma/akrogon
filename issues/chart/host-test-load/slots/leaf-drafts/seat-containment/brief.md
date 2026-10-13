# Brief: seat-containment

## What
Every leaf pane shell akrogon creates or reuses runs in its own systemd user scope under a per-leaf slice under one capped `akrogon.slice`, before any agent starts in it. Leaf shells and run-check/base-run commands get the session bus cut, so browsers they launch stay inside. A recorded pane found outside its own scope, as after a herdr restore, is replaced boxed before any prompt. `akrogon install` installs the slice limits.

## Why
In the 2026-10-13 incident, worker scripts bypassed `run-check` and Chrome moved itself out of the caller's cgroup over the session bus (chart limit-boundary, Chromium systemd.cc), so nothing could cap or stop the load (Tamdoma/akrogon#88). This leaf gives leaf-stop the leaf slice name and the pane scopes it stops.

## Done-criteria
1. After `akrogon install`, and after akrogon's self-update installs a new main, `~/.config/systemd/user/akrogon.slice` links to the slice file in the akrogon checkout, the user manager is reloaded, and `systemctl --user show akrogon.slice` reports CPUWeight=20, a 1600% CPU quota, MemoryHigh=64G, MemoryMax=96G and MemorySwapMax=0.
2. After `akrogon next` allocates a leaf in a real herdr server, each recorded pane's shell runs in a scope named from the leaf, pane id, shell PID and shell start time, under that leaf's slice under akrogon.slice, before the seat starts. The seat, and a Chrome it launches, run in that same scope.
3. A newly created leaf pane shell, and every `run-check` and `base-run` command, has `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`, and a repo config that names `DBUS_SESSION_BUS_ADDRESS` in `env` or `pass_env` is rejected.
4. When the scope cannot be created or the pre-start check does not confirm the shell's PID, start time and cgroup, the leaf is not dispatched in that pass, the error is reported with the leaf slug, and no agent is started in that pane.
5. After a cold restart of a real herdr server running the akrogon plugin, its startup akrogon pass closes each recorded leaf pane whose shell is outside its own scope and recreates it boxed before any prompt. A pane whose cgroup cannot be read is not closed, and that leaf is skipped in that pass.
6. Each pane scope is created with SendSIGHUP=yes and a 5 s stop timeout, as `systemctl --user show` reports.
