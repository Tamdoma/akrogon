# Design: seat-containment

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

### Seat scope (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/seat-scope.md)

1a, operator 2026-10-13, after asking about speed and complexity. Reason: no added waiting (measurement 2 ran boxed at normal time), and the change stays in one place.
- Each pane shell is placed in its own scope (named from pane id plus shell PID and start time) under a per-leaf slice under akrogon.slice, inside `allocate` before the final state save and before any agent start. Failure skips the leaf this pass with the error recorded.
- A read-only PID, start-time and cgroup check runs before agent start.
- The bus cut joins the placement env list.
- Rollout has no code for old leaves: the operator closes every running leaf tab once when the change ships. No legacy tracking, no live migration.
- Foreclosed: 1b (uncontained legacy leaves), 1c (seat process after start), live migration.
- Proof done 2026-10-13 (proofs.md T2): `herdr pane process-info` gave shell_pid, systemd StartTransientUnit with PIDs moved that live shell into a named scope under a leaf slice, a pi seat started afterwards was born inside it, and stopping the leaf slice closed the herdr pane and tab. Scopes carry SendSIGHUP=yes (see stop).
- Proof done 2026-10-13 (proofs.md T7): under the bus cut, `busctl --user` cannot reach systemd. akrogon's scope-creating busctl subprocess sets DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus for itself only. `systemctl --user stop` works under the cut.

### Restore (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/restore.md)

1b, operator 2026-10-13, replacing an earlier 1a the same day. Reason: the operator still needs their own agent tabs to auto-resume after a herdr restart. "Maybe 1b first" leaves 1c (herdr per-tab opt-out) as a possible later chart, not part of this one.
- herdr `resume_agents_on_restore` stays at its default, true. No herdr config change.
- The allocate ensure step closes a recorded leaf pane whose shell is positively outside its own akrogon scope, per pane, and the existing repair split or new-tab path recreates it before any start or prompt, busy-seat paths included. An unreadable check skips the pass and never closes.
- Detection is the scope alone (A,C). B's dissent that the bus cut should also be checked is carried to the leaf design.
- Live handoff runtimes pass the check unchanged.
- Accepted residual: between a cold restore and the first akrogon pass (`--resume` at plugin startup, plugin/herdr-plugin.toml:10-11), a resumed leaf seat sits unboxed with the bus reachable. The operator does not type into reopened leaf tabs before akrogon replaces them.
- Foreclosed in this chart: 1a (resume off), adopting restored shells. 1c goes to Off route.
- Proof done 2026-10-13 (proofs.md T3): after a cold restart herdr resumed the seat with the same pane id, outside its scope and without the bus cut, and the seat ran nothing before a prompt. Replacement by the startup akrogon pass is an L2 done criterion. The check must match the pane's own scope name, not any path under akrogon.slice.

### Ceiling values (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/ceiling-values.md)

1a, operator 2026-10-13. Reason: half the PC stays free no matter what akrogon runs.
- akrogon.slice: CPUWeight=20, CPUQuota=1600%, MemoryHigh=64G, MemoryMax=96G, MemorySwapMax=0. No TasksMax, IO, affinity or ManagedOOM.
- Delivered as a unit file in the akrogon repo, symlinked to ~/.config/systemd/user/akrogon.slice by `akrogon install`, which runs `systemctl --user daemon-reload` (A,C). B's transient-slice dissent carried to leaf design.
- Proof done 2026-10-13 (proofs.md T4): framework:verify:core under exactly these properties ran 265 s and 256 s. Run 1 hit only the known playback-probe flake. Operator kept the quota (1a). If a later run takes over 300 s or fails on a non-flake, the quota comes out and this fork reopens.
- Foreclosed: priority only (1b), per-leaf limits, TasksMax.

### Framework fan-out (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/framework-fanout.md)

1a, operator 2026-10-13.
- No framework fan-out chart now. The ceiling-values quota rerun keeps the 16-thread quota when the suite passes with no failure or timeout in 300 s or less (measurement 2: 239 s). Otherwise the quota comes out and ceiling-values reopens.
- Later framework chart only on the revisit triggers in Findings.

### Fog defaults (/home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/fog-defaults.md)

Operator 2026-10-13: "1a | 2a | 3a". 1a: all six accepted as written into the leaf designs. 2a: debate no. 3a: tree, contracts and live-change grants approved.

### Exclusions
- permit-release, queue-order, heavy-runs: run-permit. stop: leaf-stop, except the scope stop properties this leaf creates (SendSIGHUP=yes, TimeoutStopUSec=5000000).

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md
Interpretation: installation paths, conflict handling, command construction, criteria 3 and 4, and criterion 5's unreadable branch are proven by `bun test` with temporary HOME and AKROGON_HOME and fake `systemctl`, `busctl` and herdr on PATH (tests/helpers.ts:86 fakeHerdr, :103 fakeGh show the pattern). The fake herdr (tests/fake-herdr.ts) gains `pane process-info` and `pane close` handlers. These are test fixtures, not machinery. Criteria 2 and 5 need the real herdr server and the user systemd manager, because cgroup placement and herdr resume cannot be shown by a smaller check (chart proofs T2, T3). They run as live checks with the existing `akrogon next` and herdr, no new runner, recorded in the implementation report with the commands and the `/proc/<pid>/cgroup` lines as evidence. During that live run the seat also links this leaf's `systemd/akrogon.slice` into `~/.config/systemd/user/`, runs `systemctl --user daemon-reload`, and reads back the real manager's akrogon.slice properties and the created pane scopes' SendSIGHUP and TimeoutStopUSec. The actual values are recorded beside the cgroup paths and complete criteria 1 and 6 (B). At the end of the live run the seat removes that link and reloads again, so no link points into the leaf worktree. Self-update relinks it from main after merge. Criterion 4 is the consequential negative case.

Live isolation (chart proofs T3): live criteria run in an isolated herdr server started with `systemd-run --user --unit=<name> herdr server` and `XDG_CONFIG_HOME` set to a short temporary path (socket paths over about 100 bytes fail), with the akrogon plugin linked there only, `AKROGON_HOME` set to a temporary home whose config registers only a temporary repo, and the pane-level `HERDR_*` variables unset on client calls. The plugin scripts call `akrogon` from PATH (plugin/next.sh), so the server's PATH starts with a temporary `akrogon` shim that runs the leaf worktree's `src/akrogon.ts`. The operator's herdr session, repos and akrogon home are never touched.

## Leaf architecture
Owned:
- `systemd/akrogon.slice` in this repo, content as proven (proofs.md T6): `[Unit] Description=Akrogon leaves, seats and test runs`, `Before=slices.target`, `[Slice] CPUWeight=20 CPUQuota=1600% MemoryHigh=64G MemoryMax=96G MemorySwapMax=0`.
- `src/install.ts:52-62` and self-update's install stage (`src/self-update.ts:188-201`, which today applies skill links only): both link it to `~/.config/systemd/user/akrogon.slice` through the same link plan as skill links (a conflicting non-link path is reported the same way) and then run `systemctl --user daemon-reload`, so a merged main installs the slice without an operator step (A). B's dissent (create the slice transiently in the ensure step, no file) is carried, not taken.
- New `src/scope.ts`:
  - `leafSlice(repo, slug)`: dash-free derived name `akrogon-l<first 12 hex of sha256(repo.name + "/" + slug)>.slice`, so it nests directly under akrogon.slice. leaf-stop consumes this export.
  - `paneScope(slice, paneId, pid, start)`: `<slice stem>-p<pane id with non-alphanumerics removed>-<pid>-<start>.scope`.
  - `adoptShell(...)`: `herdr pane process-info --pane <id>` gives `shell_pid` (herdr 0.9.1), start time from /proc/<pid>/stat field 22, then `busctl --user call org.freedesktop.systemd1 /org/freedesktop/systemd1 org.freedesktop.systemd1.Manager StartTransientUnit 'ssa(sv)a(sa(sv))' <scope> fail 4 PIDs au 1 <pid> Slice s <slice> TimeoutStopUSec t 5000000 SendSIGHUP b true 0`. That subprocess sets `DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus` for itself only, because akrogon may run from a boxed pane where `busctl --user` cannot connect (proofs.md T7).
  - `inOwnScope(...)`: read-only check that /proc/<pid>/stat start time matches and /proc/<pid>/cgroup ends in `/<leaf slice>/<pane scope>` for that pane, PID and start time. Being anywhere under akrogon.slice is not enough (proofs.md T3). Returns inside, outside or unreadable.
  - All `/proc` reads go through a proc root: `AKROGON_PROC_ROOT` when set (validated as a non-blank absolute path, the `AKROGON_LEAF_TEMP_ROOT` pattern at src/config.ts:266-268), `/proc` otherwise. In tests, fake herdr returns a fixed shell pid, the fixture seeds `<root>/<pid>/stat`, and the fake busctl writes `<root>/<pid>/cgroup` for the adopted scope, so `inOwnScope` runs unmodified against fixture files. Live criteria use the default root (C).
- `src/next.ts` allocate (:427-534):
  - Ensure step for recorded panes: outside means `herdr pane close` and treat the pane as missing so the existing split or new-tab path recreates it. Unreadable means fail the leaf this pass. Closing the tab's last pane follows the no-tab path.
  - Every pane allocate resolves (new tab root, splits, recorded panes) is adopted or verified before the final `saveState` at :531-532. Any failure throws and the leaf is not dispatched.
  - The bus cut joins `placement` (:453-465).
- `src/run-check.ts` constructedEnv (:44-56) sets the bus cut after the env/pass_env loop. `src/config.ts:69-78` adds `DBUS_SESSION_BUS_ADDRESS` to the constructed set.
Exclusions: stop and start verbs, the stopped fence (leaf-stop), the run permit (run-permit), adoption of restored shells, live migration of running leaves, herdr config changes, TasksMax, per-leaf limits, empty leaf slice removal.
Accepted residuals: between a cold restore and the first akrogon pass, a resumed seat sits unboxed with the bus reachable (restore 1b). Panes the operator splits by hand in a leaf tab are outside the box and not stopped. Empty leaf slices of merged leaves stay loaded until the user manager restarts; they hold no processes or limits (fog-defaults 1a).
Rollout: no code for old leaves. The operator closes every running leaf tab once after merge (CHART.md Pending steps).
