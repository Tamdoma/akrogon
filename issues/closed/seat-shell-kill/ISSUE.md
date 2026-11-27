# Issue: seat-shell-kill

- [tool-cgroup-kill](tool-cgroup-kill/brief.md): place each seat tool shell in its own cgroup and end them with one kernel kill when the leaf's phase advances, and relaunch a seat terminal hc recovered as a bare shell, so a seat whose turn ended receives its next prompt
