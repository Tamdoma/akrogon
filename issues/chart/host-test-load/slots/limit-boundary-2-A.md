# Notes A, limit-boundary round 2 (before reading B/C)
Pick: 1a kept, with two binding parts. (1) Contained work runs with no reachable session bus: DBUS_SESSION_BUS_ADDRESS set to an unreachable path in the run env that run-check builds and in the seat env at pane allocation; akrogon src and pi extensions do not use dbus or notify-send (grep, 2026-10-13). (2) The ceiling is soft pressure only: CPUWeight low on the akrogon slice so the operator's desktop wins, MemoryHigh as a brake, no TasksMax (it crashed a suite at 3000). The permit, not the ceiling, does the limiting.
Rejected: run-only containment (ad-hoc worker scripts were 5 of 6 incident runs); browser-level limit (every harness reimplements it).
Evidence: Chromium components/dbus/xdg/systemd.cc; door probe in fork; measurement in fork.
Pitfalls: a test that needs the session bus breaks (proof: framework suite passes with the bus cut); a future Chrome changes the skip rule (done-criterion: a test proving a launched Chrome stays in the leaf's group).
Missing question: does the bus cut need to cover Playwright headless-shell (not probed).
