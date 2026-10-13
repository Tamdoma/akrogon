# Chrome escapes the caller's cgroup, and TasksMax crashes suites

## Case
Chart host-test-load measured one framework `framework:verify:core` run inside `systemd-run --user --scope -p TasksMax=3000 -p CPUQuota=1600% -p MemoryMax=48G` on 2026-10-13.

## Evidence
- The scope reached pids.peak 3000 within about 2 minutes and 41 processes inside it dumped core (node SIGABRT, chrome SIGILL/SIGTRAP): thread and process creation failed at the cap.
- 9 more crashed test browsers were in their own `app-com.google.Chrome-<pid>.scope` and `app-org.chromium.Chromium-<pid>.scope` units (`coredumpctl -F COREDUMP_CGROUP`, `journalctl --user -g app-com.google.Chrome`), outside the caller's scope.
- Record: issues/chart/host-test-load/forks/limit-boundary.md, Measurement 2026-10-13.

## Learning
A cgroup around a test run or seat does not contain Chrome on this host unless its self-scoping is disabled and proven. A task cap on a whole suite produces crashes, not queueing.
