# Limit boundary

## Question
Q1. Where is the host-wide limit on heavy test and browser load enforced, so that no leaf, worker or ad-hoc script can exceed it?
- 1a: `akrogon run-check` and `base-run` take one host-wide permit per heavy run (fixed count in global config, starting at 1), and every seat runs inside a per-leaf systemd user scope under one akrogon slice, so ad-hoc runs and detached browsers stay inside a unit akrogon can measure and stop.
- 1b: run-check and base-run permit only, each admitted run inside its own scope for reaping. Direct `bun run test:changed` and worker scripts bypass it, named as a known limit.
- 1c: cgroup slice resource ceiling only (CPU/memory/tasks on the akrogon slice), no run counter.
- 1d: lower `max_active` or worker counts only.

### Carries
- Intake: ../INTAKE.md (Tamdoma/akrogon#88 and operator note).
- Locks: akrogon chart leaf-speed (chained-units: single-unit waves run serial-solo; leaves-as-chunks deferred). Framework open leaf test-changed-shared-files owns selector breadth.
- Host: systemd 262 user manager, cgroup v2, cpu/memory/pids delegated to user@1000, 32 threads.

## Findings
Independent notes: slots/limit-boundary-A.md, -B.md, -C.md. Merged: slots/limit-boundary-merged.md. Rebuttals: slots/limit-boundary-rebuttal-B.md, -C.md.
- All slots pick 1a (A,B,C). 1b rejected: one of six incident runs used run-check (C). 1c kept only as a backstop (B,C). 1d counts panes, not runs (A,B,C).
- Seat launch has no wrapper slot: herdr agent start --kind, argv[0] must equal the kind (src/next.ts:268-276, 631-647) (A,B,C). Adoption of existing PIDs into a transient scope via StartTransientUnit PIDs (B, systemd.io CONTROL_GROUP_INTERFACE, 2026-10-13).
- Slice needs a ceiling on CPU, memory and tasks, values after a bounded measurement (B rebuttal R1, R3; C).
- Practitioner: Bazel --local_test_jobs and exclusive tag; Skia tagged emulator tests exclusive (bazel.googlesource.com dffb6ee9, skia buildbot 87c6f30a, read 2026-10-13).
- Remaining disagreements moved to their own forks: seat-scope (pane shell before launch vs seat process after), permit-release (process lifetime vs workload retirement), heavy-runs (all vs opt-out list).

## Taken

### Measurement 2026-10-13 (operator chose measure first, 1a)
Run: framework 92b9f3131 scratch worktree, `bun install` then `bun run framework:verify:core`, under `flock /home/ivan/.akrogon/framework-tests.lock` and `systemd-run --user --scope --unit=akr-measure -p CPUQuota=1600% -p TasksMax=3000 -p MemoryMax=48G -p RuntimeMaxSec=2400`, sampled every 2 s from the scope cgroup.
- Stopped by the door after about 2.5 min (01:57:10 to 01:59:45) because tests were crashing. No duration measured.
- In-scope peaks: tasks 3000 (hit TasksMax), memory 13.9 GB, 228 Chrome processes, about 494 CPU-seconds, 30 s throttled. Host load peaked about 12.
- 41 core dumps inside the scope (node SIGABRT, chrome SIGILL/SIGTRAP, headless-shell SIGABRT): thread and process creation failed at TasksMax. A task cap on a whole suite turns into crashes, not waiting.
- Escape: 9 more crashed browsers sat in their own `app-com.google.Chrome-<pid>.scope` and `app-org.chromium.Chromium-<pid>.scope` units, started at 01:57:13 onward (journalctl --user). Test browsers on this host move themselves out of the caller's cgroup, so a fence around a seat or run does not contain Chrome as-is. Mechanism not yet identified.
- Cleanup: scope stopped (`systemctl --user is-active` failed), no test browsers left, scratch worktree removed (`git worktree list` has no match). The operator's own Chrome (PID 2326745, started 00:17) untouched.

### Chrome self-scoping mechanism, 2026-10-13
- Source: Chromium main `components/dbus/xdg/systemd.cc` (chromium.googlesource.com, read 2026-10-13): for xdg-desktop-portal app identity, Chrome calls systemd `StartTransientUnit` to move its own PID into `app-<app>-<pid>.scope`. It skips this when `FLATPAK_SANDBOX_DIR` or `SNAP` is set, or when `org.freedesktop.systemd1` has no owner on its session bus.
- Probe (door, identity ivan uid 1000, systemd 262, /opt/google/chrome/chrome headless, 2026-10-13): inside `systemd-run --user --scope`, default env put the browser in `app-com.google.Chrome-1496159.scope` (escaped). With `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` the browser stayed in the caller's scope. Cleanup: both probe scopes gone, temp profiles removed, no probe Chrome left. Limits: one Chrome binary, headless, one launch; Playwright headless-shell and Chromium not probed; whether seats or tests need the session bus not checked.

### Round 2 notes, 2026-10-13
Notes: slots/limit-boundary-2-A.md, -B.md, -C.md; merged slots/limit-boundary-2-merged.md; rebuttals -2-rebuttal-B.md, -2-rebuttal-C.md.
- Revised 1a (A,B,C): permit in run-check/base-run, every seat contained, `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` set in the seat env and in constructedEnv after pass_env, reserved so pass_env cannot reopen it; XDG_RUNTIME_DIR alone finds /run/user/1000/bus (C).
- No TasksMax as a working limit (A,B,C). B rebuttal R1: that rules out TasksMax 3000, not CPUQuota or an emergency MemoryMax. Ceiling kind goes to ceiling-values.
- Scope control under the cut bus: a private manager socket exists (systemd v262 bus-util.c, B); exact control operation proof pending (B rebuttal R2).
- Pending probes: Chromium and Playwright headless-shell under the cut; seat smoke under the cut (gh, git credential helper, xdg-open).
- C rebuttal: show the operator the slowdown answer before asking.

### Measurement 2, 2026-10-13 (completed)
Run: framework d09a6f323 scratch worktree, `bun run framework:verify:core`, TMPDIR=/tmp/akm2, under the framework flock and `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent systemd-run --user --scope --unit=akr-measure3 -p CPUWeight=20 -p MemoryHigh=48G -p RuntimeMaxSec=2400`, sampled every 2 s.
- Passed, exit 0, 239 s wall time.
- Peaks: 409 Chrome processes, 6138 tasks, 15.9 GB memory, sampled host load 40 on 32 threads. 1988 CPU-seconds, about 8.3 cores on average. 0 throttled.
- 0 core dumps, 0 new app-*.scope Chrome units: every browser, Playwright Chromium included, stayed in the scope with the session bus cut, and the suite passes without it.
- An earlier attempt (akr-measure2) was invalid: the long scratchpad TMPDIR made Playwright Chromium abort with "Socket path too long" (11 dumps). Not load and not the bus cut.
- Systemd scope control worked from an environment with the session bus cut (systemd-run start and stop).
- Cleanup: scope inactive, scratch worktree removed, /tmp/akm2 removed.

## Taken
2026-10-13, operator: "1a" (after "1 - I'm leanign towards a, but how much will this slow everything down?", measure-first "1a", and the completed measurement).
Revised 1a, binding:
- One host-wide permit; every `akrogon run-check` and `base-run` execution holds it while its command runs. Starts at 1 permit (one run alone peaks at load 40 on 32 threads). A nested run inside an admitted run does not take a second permit. The permit is held by the run-check/base-run process, never by generated shell text or a descendant.
- Every dispatched seat and all its descendants live in an akrogon-owned cgroup that akrogon can stop.
- Contained work runs with `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`, set in the seat env and in constructedEnv after env/pass_env, and reserved so repo config cannot override it. DISPLAY, WAYLAND_DISPLAY and XDG_RUNTIME_DIR unchanged.
- No TasksMax as a working limit. Low CPU priority for akrogon work relative to the operator's session; any memory or CPU ceiling kind and value is decided in ceiling-values.
Reason: only option that bounds and stops the worker scripts that bypassed run-check in the incident; the measurement showed one run passes in 239 s with every browser contained under the bus cut.
Foreclosed: 1b run-check only, 1c ceiling only, 1d fewer leaves or workers, browser-level counter, managing Chrome app-*.scope units, fake SNAP/FLATPAK env.
Pending proofs before handoff: seat smoke (pi, codex, gh, git) under the cut bus; the exact scope-control operation akrogon will use.

### Addendum after proof T1, 2026-10-13
T1 showed the bus cut breaks gh and private git auth: gh keeps its token in the keyring over the session bus. Operator chose 1a: gh stores its token in its own file (`gh auth login -h github.com -p https -w --insecure-storage`, ~/.config/gh/hosts.yml, mode 600). Foreclosed: a D-Bus filter proxy, akrogon copying GH_TOKEN into seat env. Human-only prerequisite, owner operator, pending until `gh auth status` reports file storage and T1 passes gh and private git under the cut. Done 2026-10-13.
