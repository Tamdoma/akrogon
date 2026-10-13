# Proofs

## Grant
Approval: operator "1a" 2026-10-13 to the split and live tests T1-T6 (door, identity ivan uid 1000, user systemd manager, herdr 0.9.1). Targets: user unit file ~/.config/systemd/user/akrogon.slice (removed after proofs; the leaf installs it as a symlink), transient user scopes and slices named akrogon-proof*, a throwaway herdr tab in the operator's session and a separate herdr session named akrogon-proof, a framework scratch worktree. Effects: local only, no public, billing, DNS or retention effects. Stop line: no change to the operator's own tabs, panes or Chrome. Lifetime: this charting pass.

## T6 slice unit file, 2026-10-13
Command: wrote ~/.config/systemd/user/akrogon.slice ([Slice] CPUWeight=20, CPUQuota=1600%, MemoryHigh=64G, MemoryMax=96G, MemorySwapMax=0), `systemctl --user daemon-reload`, `systemctl --user show akrogon.slice`. systemd 262.
Result: CPUWeight=20, CPUQuotaPerSecUSec=16s, MemoryHigh=68719476736, MemoryMax=103079215104, MemorySwapMax=0, TasksMax=infinity. Kernel read inside a child scope (T1): akrogon.slice cpu.max=1600000 100000, cpu.weight=20, memory.high/max as above, memory.swap.max=0, pids.max=max. A child `akrogon-proof.slice` auto-nests under akrogon.slice by the dash rule.
Cleanup: file kept until T4, removed at the end of proofs.
Limits: a regular file, not the install symlink; daemon-reload by hand.

## T1 seat smoke under the bus cut, 2026-10-13
Command: `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent systemd-run --user --scope --unit=akrogon-proof-t1 --slice=akrogon-proof.slice -p TimeoutStopSec=5` running git ls-remote, gh api user, `pi -p`, `codex exec`.
Result: scope placed at akrogon.slice/akrogon-proof.slice/akrogon-proof-t1.scope. git ls-remote on public akrogon: ok. pi: ok. codex exec: ok. gh api user: FAILED 401, gh stores its token in the keyring (Secret Service over the session bus). Private framework `git ls-remote` under the cut: FAILED (credential helper is `gh auth git-credential`). Without the cut both work.
Note: systemd-run takes `TimeoutStopSec=5`; `TimeoutStopUSec` is the D-Bus property name only.
Cleanup: scope inactive after exit.
Repair needed: GitHub auth without the session bus.

## T5 permit flock through bun:ffi, 2026-10-13
Command: Bun script, dlopen libc.so.6 flock(i32,i32), fd opened O_RDWR|O_CREAT|O_CLOEXEC, LOCK_EX|LOCK_NB poll every 250 ms. First holder spawns `setsid sleep 30`, second waits, first is SIGKILLed.
Result: first acquired at 0 ms, its setsid child holds no lock fd. Second acquired 3004 ms after start, right after the SIGKILL, while the setsid child still lived. Release on holder death confirmed.
Cleanup: scratch dir removed, no sleepers left.
Limits: one host, errno not captured (leaf must capture it), no nesting.

## T4 framework core under the exact slice policy, 2026-10-13
Command: framework scratch worktree at d09a6f323 (same as measurement 2), TMPDIR=/tmp/akm4, `bun install --frozen-lockfile --backend=copyfile` then `bun run framework:verify:core`, inside `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent systemd-run --user --scope --slice=akrogon-proof.slice -p TimeoutStopSec=5 -p RuntimeMaxSec=1200`, under akrogon.slice from T6. Sampled every 2 s.
Run 1: exit 1 in 265 s. One failure: test:playback-probe "click did not pause the video" (pause persistence, 38 s). Everything else passed. akrogon.slice throttled 525 s of CPU time across 825 of 2760 periods. Peaks: 6624 tasks, 17.4 GB.
Run 2: exit 0 in 256 s. Throttled a further 541 s. Peaks: 6285 tasks, 15.7 GB, load 29.
Context: the same failure text appears without any quota in framework issues/closed/merge-flow/motion-probe-lane/implementation/logs-r2/core-after-1.invalid-1.log:2947 and issues/open/backlink-audit-run/service-coverage/technical-pack-selection/implementation/check-test_changed-1791843733171-2219867.log:4236, and the open framework leaf issues/open/flaky-tests/flaky-test-fixes/plan.md:7 names it a known flake (in-page polling under parallel lanes).
Against the 1a rule (300 s or less, no failure): time passes both runs (+7% and +11% over 239 s). Failure rule: run 2 passes, run 1 failed on the known pre-existing flake. Operator verdict 2026-10-13: 1a, keep the quota. Known pre-existing flakes owned by framework flaky-test-fixes do not count as failures.
Cleanup: scratch worktree removed with `git worktree remove`, /tmp/akm4 and scratch files deleted, worktree list shows no scratch entry.
Limits: two runs, one revision, desktop idle.

## T1 rerun after the gh file-storage repair, 2026-10-13
Identity: gh account ivanjuras, token stored in /home/ivan/.config/gh/hosts.yml (operator ran `gh auth login -h github.com -p https -w --insecure-storage`). gh 2.100.0, git credential helper `gh auth git-credential`.
Command: `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent systemd-run --user --scope --slice=akrogon-proof.slice -p TimeoutStopSec=5 --quiet bash -c '...'`.
Observed: cgroup .../akrogon.slice/akrogon-proof.slice/run-*.scope. `gh api user --jq .login` printed ivanjuras, exit 0. `git -C <framework> ls-remote origin HEAD` (private Tamdoma/tamdoma-framework) returned d09a6f323f6f, exit 0.
Cleanup: scope exited on its own, nothing created.
Limits: read-only calls. Push was not tried. Proves the bus cut no longer breaks gh or private git for this account.

## T2 boxed herdr pane, agent start, slice stop, 2026-10-13
Identity: ivan uid 1000, user systemd manager (systemd 262), herdr 0.9.1, pi as the seat harness.
Steps: `herdr tab create --no-focus --label akrogon-proof-t2 --env DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`, `herdr pane process-info` for shell_pid, start time from /proc/<pid>/stat field 22, then `busctl --user call org.freedesktop.systemd1 /org/freedesktop/systemd1 org.freedesktop.systemd1.Manager StartTransientUnit 'ssa(sv)a(sa(sv))' akrogon-proof-t2-<pane>-<pid>-<start>.scope fail N PIDs au 1 <pid> Slice s akrogon-proof-t2.slice TimeoutStopUSec t 5000000 [SendSIGHUP b true] 0`, then `herdr agent start --kind pi --pane <id>`, then `systemctl --user stop akrogon-proof-t2.slice`.
Observed: before the move the herdr shell sat in the terminal's app scope. After the call it sat in .../akrogon.slice/akrogon-proof.slice/akrogon-proof-t2.slice/<scope> with the bus cut in its environ. pi started from that shell landed in the same scope.
Pass a (no SendSIGHUP): stop took 5217 ms. Interactive bash ignores SIGTERM, so systemd waited the 5 s timeout and SIGKILLed it. Pane and tab were gone afterwards (pane_not_found, tab_not_found). The scope stayed loaded as failed (result 'timeout') until `systemctl --user reset-failed`.
Pass b (SendSIGHUP=yes): stop took 19 ms, scope "Stopped" cleanly, pane gone, no failed unit left.
Result for the leaf: pane scopes are created with SendSIGHUP=yes plus TimeoutStopUSec=5 s. The 5 s timeout stays as the backstop.
Cleanup: `systemctl --user reset-failed 'akrogon-proof-t2*'`, no proof units or tabs left, scratch dir removed.
Limits: one idle pi seat each pass. A seat mid-tool-call with children that ignore SIGHUP still relies on the 5 s SIGKILL.

## T3 cold herdr restart of a boxed seat, 2026-10-13
Identity: ivan uid 1000, herdr 0.9.1 binary (the operator's running servers report 0.9.3), pi.
Isolation: a separate headless server, `systemd-run --user --unit=akrogon-proof-t3-server --slice=akrogon-proof.slice --setenv=XDG_CONFIG_HOME=/tmp/akp3/cfg herdr server`, with a copy of config.toml and agent-detection only. No plugins.json, so the akrogon plugin's startup `pull --all` and `next --resume` could not run. Client calls unset the HERDR_* pane variables so they could not reach the operator's session. `session.resume_agents_on_restore` left at default (true).
Steps: `workspace create --env DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent`, shell moved into akrogon-proof-t3-p-<pid>-<start>.scope with StartTransientUnit (SendSIGHUP, 5 s stop timeout), `agent start --kind pi`, one prompt ("Reply with the single word OK. Do not run any tools.") so the session file had content (7 lines), `herdr server stop`, then the same systemd-run start.
Observed after stop: old shell and pi gone, the pane scope gone.
Observed after restart: herdr restored pane w1:p1 with the same pane id and resumed pi with `--session <same file>`. The new shell sat in the server's own cgroup (akrogon-proof-t3-server.service), not in any pane scope. The shell and pi had the real DBUS_SESSION_BUS_ADDRESS (unix:path=/run/...), so the bus cut was lost. Over 45 s the session file stayed at 7 lines and no new session file appeared: the resumed seat ran nothing before a prompt.
Result: confirms restore 1b's premise and accepted residual. The ensure step can find the pane by its recorded id and see that its shell is not in the scope named for that pane. The check must match the pane's own scope name, not "somewhere under akrogon.slice": here the server itself sat under akrogon.slice.
Not proven: the akrogon startup pass replacing the pane. That code does not exist yet and becomes a done criterion of L2.
Cleanup: test server stopped, `reset-failed`, proof slices stopped, no akrogon-proof unit left, /tmp/akp3 and the two proof pi session folders under ~/.pi/agent/sessions deleted.
Limits: one idle pi seat that had answered one prompt. A seat restored mid-task was not tried. In the real setup the herdr server runs in the terminal's app scope.

## Proof cleanup, 2026-10-13
~/.config/systemd/user/akrogon.slice removed, akrogon.slice stopped, `daemon-reload` run. `systemctl --user list-units --all 'akrogon*'` lists nothing. Scratch measurement and probe files deleted. The leaf installs the slice file again as a symlink.

## T7 scope calls from a shell with the bus cut, 2026-10-13
Why: `akrogon next` and `akrogon stop` can be typed in a boxed pane, whose env has the bus cut.
Identity: ivan uid 1000, systemd 262 (262-1-arch) busctl and systemctl. Target: a `tail -f /dev/null` child, transient scopes akrogon-proof-bus-*.
Observed with DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent:
- `busctl --user call ... StartTransientUnit`: "Failed to connect to user scope bus via local transport". No scope.
- `busctl --address=unix:path=$XDG_RUNTIME_DIR/systemd/private call ...`: "Invalid request descriptor". No scope.
- The same busctl call with `DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus` set on that one subprocess: job returned, the PID moved into .../akrogon.slice/akrogon-proof.slice/akrogon-proof-bus-d.scope.
- `systemctl --user stop akrogon-proof.slice` with the cut: exit 0, the process died (systemctl uses the manager's private socket).
Result for the leaf: akrogon's StartTransientUnit subprocess sets DBUS_SESSION_BUS_ADDRESS=unix:path=$XDG_RUNTIME_DIR/bus for itself. Seat env keeps the cut. systemctl needs nothing.
Cleanup: proof slices stopped, no akrogon unit left, no probe process left.
Limits: one process, busctl CLI only (not a D-Bus library).
