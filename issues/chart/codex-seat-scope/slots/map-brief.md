# Opening map brief (chart codex-seat-scope)

You are a consultant for the chart door in hc terminal t126. Map blind: do not read other seats' map files. Edit no repo file except your return file. Launch no leaf seat and change no leaf state.

Reading rule: read /home/ivan/Work/infra/akrogon/issues/chart/codex-seat-scope/slots/reading-rule.md first; it binds you.

## Inputs

- Intake (with A's evidence and the free probe): /home/ivan/Work/infra/akrogon/issues/chart/codex-seat-scope/INTAKE.md
- Signposts (binding direction): /home/ivan/Work/infra/akrogon/issues/chart/codex-seat-scope/forks/signposts.md
- Live surface (repo /home/ivan/Work/infra/akrogon, main 9a7cf416): src/seat.ts (startSeat, scopeEntry, cgroupOf, the systemd-run argv and wiring), src/tool-cgroup.ts (entry script text, refreshToolEntry, ownToolCgroup, relocateFromToolCgroup, sweepScope, sweepToolCgroups, toolShellAlive), src/scope.ts, src/AREA.md, tests/tool-entry.test.ts, tests/tool-entry-tracing.test.ts, the installed entry ~/.akrogon/tool-entry/bash-env, the launchers ~/.local/share/mise/command-wrappers/bin/codex and /usr/share/omarchy/bin/omarchy-agent-account-exec, and the closed design that introduced the entry: /home/ivan/Work/infra/akrogon/issues/closed/seat-shell-kill/ (design.md and plan.md under tool-cgroup-kill).
- Locks: the closed seat-shell-kill design's decisions stand unless the map shows one cannot hold for a bash-wrapped harness.

## Task

Write an independent territory map, proportional to a small fix: confirm or refute the cause in the intake with your own evidence; the material forks that change the outcome (start with where the seat's own process is told apart from a tool shell); the options for each with what each could break or invite later (tool kill, the sweep, other harness kinds, future wrappers); the pitfalls and what removes each; every surface (code, tests, docs) the change must touch; and any question a practitioner would ask. Cite file and function for each claim. Free probes only.

## Return

Write /home/ivan/Work/infra/akrogon/issues/chart/codex-seat-scope/slots/map-<your slot letter lowercase>.md, then run:
hc send t126 "done <your slot letter>: <return path>"
