# Design: run-permit

## Binding decisions, verbatim

### Limit boundary (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/limit-boundary.md)


#### Measurement 2026-10-13 (operator chose measure first, 1a)
Run: framework 92b9f3131 scratch worktree, `bun install` then `bun run framework:verify:core`, under `flock /home/ivan/.akrogon/framework-tests.lock` and `systemd-run --user --scope --unit=akr-measure -p CPUQuota=1600% -p TasksMax=3000 -p MemoryMax=48G -p RuntimeMaxSec=2400`, sampled every 2 s from the scope cgroup.
- Stopped by the door after about 2.5 min (01:57:10 to 01:59:45) because tests were crashing. No duration measured.
- In-scope peaks: tasks 3000 (hit TasksMax), memory 13.9 GB, 228 Chrome processes, about 494 CPU-seconds, 30 s throttled. Host load peaked about 12.
- 41 core dumps inside the scope (node SIGABRT, chrome SIGILL/SIGTRAP, headless-shell SIGABRT): thread and process creation failed at TasksMax. A task cap on a whole suite turns into crashes, not waiting.
- Escape: 9 more crashed browsers sat in their own `app-com.google.Chrome-<pid>.scope` and `app-org.chromium.Chromium-<pid>.scope` units, started at 01:57:13 onward (journalctl --user). Test browsers on this host move themselves out of the caller's cgroup, so a fence around a seat or run does not contain Chrome as-is. Mechanism not yet identified.
- Cleanup: scope stopped (`systemctl --user is-active` failed), no test browsers left, scratch worktree removed (`git worktree list` has no match). The operator's own Chrome (PID 2326745, started 00:17) untouched.

#### Chrome self-scoping mechanism, 2026-10-13
- Source: Chromium main `components/dbus/xdg/systemd.cc` (chromium.googlesource.com, read 2026-10-13): for xdg-desktop-portal app identity, Chrome calls systemd `StartTransientUnit` to move its own PID into `app-<app>-<pid>.scope`. It skips this when `FLATPAK_SANDBOX_DIR` or `SNAP` is set, or when `org.freedesktop.systemd1` has no owner on its session bus.
- Probe (door, identity ivan uid 1000, systemd 262, /opt/google/chrome/chrome headless, 2026-10-13): inside `systemd-run --user --scope`, default env put the browser in `app-com.google.Chrome-1496159.scope` (escaped). With `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` the browser stayed in the caller's scope. Cleanup: both probe scopes gone, temp profiles removed, no probe Chrome left. Limits: one Chrome binary, headless, one launch; Playwright headless-shell and Chromium not probed; whether seats or tests need the session bus not checked.

#### Round 2 notes, 2026-10-13
Notes: slots/limit-boundary-2-A.md, -B.md, -C.md; merged slots/limit-boundary-2-merged.md; rebuttals -2-rebuttal-B.md, -2-rebuttal-C.md.
- Revised 1a (A,B,C): permit in run-check/base-run, every seat contained, `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` set in the seat env and in constructedEnv after pass_env, reserved so pass_env cannot reopen it; XDG_RUNTIME_DIR alone finds /run/user/1000/bus (C).
- No TasksMax as a working limit (A,B,C). B rebuttal R1: that rules out TasksMax 3000, not CPUQuota or an emergency MemoryMax. Ceiling kind goes to ceiling-values.
- Scope control under the cut bus: a private manager socket exists (systemd v262 bus-util.c, B); exact control operation proof pending (B rebuttal R2).
- Pending probes: Chromium and Playwright headless-shell under the cut; seat smoke under the cut (gh, git credential helper, xdg-open).
- C rebuttal: show the operator the slowdown answer before asking.

#### Measurement 2, 2026-10-13 (completed)
Run: framework d09a6f323 scratch worktree, `bun run framework:verify:core`, TMPDIR=/tmp/akm2, under the framework flock and `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent systemd-run --user --scope --unit=akr-measure3 -p CPUWeight=20 -p MemoryHigh=48G -p RuntimeMaxSec=2400`, sampled every 2 s.
- Passed, exit 0, 239 s wall time.
- Peaks: 409 Chrome processes, 6138 tasks, 15.9 GB memory, sampled host load 40 on 32 threads. 1988 CPU-seconds, about 8.3 cores on average. 0 throttled.
- 0 core dumps, 0 new app-*.scope Chrome units: every browser, Playwright Chromium included, stayed in the scope with the session bus cut, and the suite passes without it.
- An earlier attempt (akr-measure2) was invalid: the long scratchpad TMPDIR made Playwright Chromium abort with "Socket path too long" (11 dumps). Not load and not the bus cut.
- Systemd scope control worked from an environment with the session bus cut (systemd-run start and stop).
- Cleanup: scope inactive, scratch worktree removed, /tmp/akm2 removed.

2026-10-13, operator: "1a" (after "1 - I'm leanign towards a, but how much will this slow everything down?", measure-first "1a", and the completed measurement).
Revised 1a, binding:
- One host-wide permit; every `akrogon run-check` and `base-run` execution holds it while its command runs. Starts at 1 permit (one run alone peaks at load 40 on 32 threads). A nested run inside an admitted run does not take a second permit. The permit is held by the run-check/base-run process, never by generated shell text or a descendant.
- Every dispatched seat and all its descendants live in an akrogon-owned cgroup that akrogon can stop.
- Contained work runs with `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`, set in the seat env and in constructedEnv after env/pass_env, and reserved so repo config cannot override it. DISPLAY, WAYLAND_DISPLAY and XDG_RUNTIME_DIR unchanged.
- No TasksMax as a working limit. Low CPU priority for akrogon work relative to the operator's session; any memory or CPU ceiling kind and value is decided in ceiling-values.
Reason: only option that bounds and stops the worker scripts that bypassed run-check in the incident; the measurement showed one run passes in 239 s with every browser contained under the bus cut.
Foreclosed: 1b run-check only, 1c ceiling only, 1d fewer leaves or workers, browser-level counter, managing Chrome app-*.scope units, fake SNAP/FLATPAK env.
Pending proofs before handoff: seat smoke (pi, codex, gh, git) under the cut bus; the exact scope-control operation akrogon will use.

#### Addendum after proof T1, 2026-10-13
T1 showed the bus cut breaks gh and private git auth: gh keeps its token in the keyring over the session bus. Operator chose 1a: gh stores its token in its own file (`gh auth login -h github.com -p https -w --insecure-storage`, ~/.config/gh/hosts.yml, mode 600). Foreclosed: a D-Bus filter proxy, akrogon copying GH_TOKEN into seat env. Human-only prerequisite, owner operator, pending until `gh auth status` reports file storage and T1 passes gh and private git under the cut. Done 2026-10-13.

### Heavy runs (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/heavy-runs.md)

See Findings: settled by limit-boundary 1a, every run-check and base-run execution holds the permit.
Settled by limit-boundary 1a, 2026-10-13. The round text the operator answered "1a" to said "One ticket for the whole PC. Every test run started through `run-check` or `base-run` must hold it." So every run-check and base-run execution takes the permit, with no light list. Foreclosed: per-name light list (C). A later need for exemptions is new intake.

### Permit release (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/permit-release.md)

1a, operator 2026-10-13. Reason: simple, and the queue can never jam on a stuck process.
- The permit is released when the run-check/base-run process exits, any cause. One exclusive flock(2) held by that Bun process through bun:ffi on a close-on-exec fd, strictly one permit.
- Nested runs reuse admission through a run token in constructedEnv plus a sidecar holder record verified by PID, kernel start time and boot id.
- No per-run units, no process-group kill. Leftovers of a killed run stay in the pane box and end with the leaf stop.
- Accepted residual: leftovers of a killed run can overlap the next run.
- Lock path (akrogon home vs /run/user/<uid>) carried to leaf design.
- Foreclosed: 1b workload-empty release, per-run units, flock(1) or helper-held locks, PID files.

### Queue order (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/queue-order.md)

1a, operator 2026-10-13. Reason: least code.
- Order is whatever flock grants, no merge priority, no starvation promise. LOCK_NB poll with a short sleep, only EWOULDBLOCK retried, outside the global .lock and base-run record locks.
- No akrogon wait bound. A cancelled-before-launch request is never reported as a test result.
- Waiter prints a stderr line naming the holder. `akrogon status` prints the live holder from the verified sidecar only.
- Queue time is one optional wait field on check_start.
- Foreclosed in this chart: merge-first (later, on measured merge waits), waiter registry, request/end timing pair, wait timeout.

### Fog defaults (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/fog-defaults.md)

Operator 2026-10-13: "1a | 2a | 3a". 1a: all six accepted as written into the leaf designs. 2a: debate no. 3a: tree, contracts and live-change grants approved.

### Exclusions
- seat-scope, restore, ceiling-values, stop: not this leaf. The bus-cut lines of limit-boundary belong to seat-containment.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md
Interpretation: proof is the existing `bun test` suite with temporary AKROGON_HOME and registered repos as current tests build (`tests/helpers.ts:25` fixture, `:50` cli), with real `akrogon run-check` processes running small shell commands (sleep, setsid). No new runner, no live model run, no systemd. Criteria 2 and 4 are the consequential negative cases. flock(2) is real in the tests: the kernel behavior is under test. akrogon's own checks already run inside `run-check` (`akrogon config` checks), so tests must use a temporary AKROGON_HOME and never the real lock.

## Leaf architecture
Owned:
- New `src/permit.ts`: `withPermit(holder, fn)` returns fn's result plus `wait_ms`.
  - Lock file `<globalHome()>/run.lock` (src/config.ts:197-199). Path choice: akrogon home (A,C), so test runs under a temporary AKROGON_HOME never contend with live seats. B's dissent: `/run/user/<uid>/akrogon-run.lock` is the only path shared by every akrogon home on the host. Carried, not taken.
  - flock(2) through `bun:ffi` on `libc.so.6` (proofs.md T5), fd opened with O_CLOEXEC, `LOCK_EX|LOCK_NB` polled every 250 ms, only EWOULDBLOCK retried, any other errno thrown with path and errno. No `flock(1)` helper, no PID file as the lock.
  - Waiting happens outside the global `.lock` and outside base-run record locks (src/base-run.ts:140-142, :173-191).
  - On acquire, write the holder sidecar `<globalHome()>/run-holder.yaml`: run token, PID, kernel start time (/proc/<pid>/stat field 22), boot id (/proc/sys/kernel/random/boot_id), repo, leaf slug, check name, start time. Parse it with a zod schema on read.
  - Waiter's first failed poll prints one stderr line from the verified sidecar (holder repo, leaf, check name, PID), or "holder unknown" when the sidecar does not verify.
  - Nested reuse: `AKROGON_RUN=<token>` is set in constructedEnv for the admitted command. A run whose env token equals the sidecar token, whose sidecar PID is alive with the recorded start time and boot id, runs without the lock. Any mismatch takes the normal path.
- `.gitignore`: add `run.lock` and `run-holder.yaml` beside the existing `.lock` and `paused.yaml` entries (.gitignore:5-6), because globalHome defaults to the repo root (C).
- `src/run-check.ts`: `withPermit` wraps check_start through check_end (:171-185), so check_start is written after admission. `AKROGON_RUN` joins constructedEnv (:44-56) after the env/pass_env loop.
- `src/config.ts:69-78`: `AKROGON_RUN` joins the constructed set so repo env/pass_env cannot name it.
- `src/timing.ts:36`: check_start gains optional `wait_ms` (nonnegative int).
- `src/base-run.ts`: `withPermit` around spawnLogged at :164 only. Worktree prep stays outside. No timing events added.
- `src/status.ts`: the overview prints the verified holder line. Nothing for waiters.
Exclusions: merge priority, waiter registry, wait timeout, request/end timing pair, per-run systemd units, process-group kill, the session bus cut in constructedEnv (seat-containment owns it), any change to framework config (door step after merge).
Accepted residuals (fog-defaults 1a): leftovers of a killed run can overlap the next run. A SIGKILLed holder leaves check_start without check_end. A seat whose harness tool times out on a waiting run leaves the waiter running in its pane, and the waiter's run happens later. Suites that keep a server alive across separate run-check calls lose the permit between calls; the server stays in the pane box.
