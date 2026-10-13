# Design: leaf-stop

## Binding decisions, verbatim

### Stop (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/stop.md)

1a, operator 2026-10-13. Reason: a stop is not a failure, and restart is one command.
- Pause unchanged. New `akrogon stop <leaf>` and repo-scoped `akrogon stop --all` over allocated leaves. No `start --all`.
- Fence: host-local `stopped.yaml` in akrogon home beside paused.yaml, written under the global lock before any kill. Gates in dispatchLeaf (automatic passes end quietly, a picked manual next errors and names `akrogon start`) and in the merge path before a new stack or merge seat. `akrogon status` marks stopped leaves.
- Kill: stop the leaf slice by its shared derived name, pane scopes created with SendSIGHUP=yes and TimeoutStopUSec=5000000 (proofs.md T2: interactive bash ignores TERM, so without SIGHUP every stop waits 5 s and leaves a failed unit). A failed stop keeps the fence, reports the error and is retryable. --all reports per leaf.
- `akrogon start <leaf>` removes the entry under the lock and runs the targeted `akrogon next <leaf>` pass.
- Stop runs from an operator shell outside the box. Pi Esc unchanged.
- Foreclosed: pause kills, failed-phase fence, park fence, PID or tab kills, pi Esc change.

### Seat scope (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/seat-scope.md)

1a, operator 2026-10-13, after asking about speed and complexity. Reason: no added waiting (measurement 2 ran boxed at normal time), and the change stays in one place.
- Each pane shell is placed in its own scope (named from pane id plus shell PID and start time) under a per-leaf slice under akrogon.slice, inside `allocate` before the final state save and before any agent start. Failure skips the leaf this pass with the error recorded.
- A read-only PID, start-time and cgroup check runs before agent start.
- The bus cut joins the placement env list.
- Rollout has no code for old leaves: the operator closes every running leaf tab once when the change ships. No legacy tracking, no live migration.
- Foreclosed: 1b (uncontained legacy leaves), 1c (seat process after start), live migration.
- Proof done 2026-10-13 (proofs.md T2): `herdr pane process-info` gave shell_pid, systemd StartTransientUnit with PIDs moved that live shell into a named scope under a leaf slice, a pi seat started afterwards was born inside it, and stopping the leaf slice closed the herdr pane and tab. Scopes carry SendSIGHUP=yes (see stop).
- Proof done 2026-10-13 (proofs.md T7): under the bus cut, `busctl --user` cannot reach systemd. akrogon's scope-creating busctl subprocess sets DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus for itself only. `systemctl --user stop` works under the cut.

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

### Fog defaults (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/fog-defaults.md)

Operator 2026-10-13: "1a | 2a | 3a". 1a: all six accepted as written into the leaf designs. 2a: debate no. 3a: tree, contracts and live-change grants approved.

### Exclusions
- permit-release, queue-order, heavy-runs: run-permit. restore and ceiling-values: seat-containment. From seat-scope and limit-boundary, this leaf uses only the leaf slice name and the scope properties seat-containment creates.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md
Interpretation: criteria 2 to 7 are proven by `bun test` with temporary AKROGON_HOME, registered repos and fake `systemctl` and herdr on PATH, as current tests build them (tests/helpers.ts). Criterion 7 extends the existing command-reference test (tests/command-reference.test.ts). Criterion 1 needs the real user systemd manager and herdr, because the kill reaching a seat's browser and herdr closing the panes cannot be shown by a smaller check (chart proof T2). It runs once live with the existing `akrogon next`, recorded in the implementation report with process lists before and after. Criterion 3 is the consequential negative case.

Live isolation (chart proofs T3): live criteria run in an isolated herdr server started with `systemd-run --user --unit=<name> herdr server` and `XDG_CONFIG_HOME` set to a short temporary path (socket paths over about 100 bytes fail), with the akrogon plugin linked there only, `AKROGON_HOME` set to a temporary home whose config registers only a temporary repo, and the pane-level `HERDR_*` variables unset on client calls. The plugin scripts call `akrogon` from PATH (plugin/next.sh), so the server's PATH starts with a temporary `akrogon` shim that runs the leaf worktree's `src/akrogon.ts`. The operator's herdr session, repos and akrogon home are never touched.

## Leaf architecture
Owned:
- New `src/stop.ts`:
  - `stopped.yaml` in `globalHome()` beside paused.yaml (src/pause.ts:19-58 is the pattern). It holds a zod-parsed record keyed `<repo>/<slug>`. Read and write it under the global lock `resolve(globalHome(), '.lock')` with `withLock` (src/state.ts:205-226).
  - `stop <leaf>`: write the entry under the lock first, then run `systemctl --user stop <leafSlice(repo, slug)>` from seat-containment. That call works with the bus cut (proofs.md T7). On systemd 262, stopping a slice that is not loaded exits 0 (door check 2026-10-13, `systemctl --user stop akrogon-lnotreal.slice`, rc=0). A non-zero exit throws with the slice name, exit code and stderr, and the entry stays.
  - `stop --all`: over allocated leaves (state.tab set) of the current repo, one result line each, exit non-zero if any failed.
  - `start <leaf>`: remove the entry under the lock, then call the targeted next pass.
- `.gitignore`: add `stopped.yaml` beside the existing `paused.yaml` entry (.gitignore:6), because globalHome defaults to the repo root (C).
- `src/akrogon.ts:53-188`: `stop` and `start` verbs and the usage string.
- `src/next.ts`:
  - Gate in `dispatchLeaf` (:694) beside the paused gate (:715). Automatic passes end quietly. A manual targeted next throws naming `akrogon start <leaf>`.
  - Gate in the merge path before a stack or merge seat starts (`dispatchMergeLeaf` :1291, `mergeTurn` :1041). The implementer cites the exact lines.
- `src/status.ts`: mark stopped leaves in the overview and in `status <slug>`, beside the paused marks (:359, :405-406).
- README.md:132-149 verb table, docs/guide/next.md beside the pause section (:106-117).
Exclusions: pause semantics, pi Esc, `start --all`, the failed-phase fence, killing by PID or tab, stopping run-check processes outside leaf panes (standalone `run-check --holder` leftovers are outside any box), creating slices or scopes (seat-containment), the run permit.
Accepted residuals (fog-defaults 1a): panes split by hand in a leaf tab are outside the box and survive a stop.
