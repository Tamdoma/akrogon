# Brief 4: live run (U4)

## 1. Goal
Show with the real user systemd manager and a real, isolated herdr 0.9.1 server that the landed code (U1-U3) boxes leaf panes, replaces a restored pane, and installs the slice values. Criteria C1, C2, C5 and C6 (live parts). You change no repo file. Your output is evidence in your report.

## 2. Acceptance criteria (each a recorded observation with the exact command and output)
1. C1: with `~/.config/systemd/user/akrogon.slice` linked to `<lane>/systemd/akrogon.slice` and `systemctl --user daemon-reload` run, `systemctl --user show akrogon.slice -p CPUWeight -p CPUQuotaPerSecUSec -p MemoryHigh -p MemoryMax -p MemorySwapMax` reports CPUWeight=20, CPUQuotaPerSecUSec=16s, MemoryHigh=68719476736, MemoryMax=103079215104 and MemorySwapMax=0.
2. C2: after `akrogon next live-seat-1` in the isolated server, for each recorded pane (state.yaml `pane.A`, `pane.B`): `herdr pane process-info --pane <id>` shell_pid, and `/proc/<shell_pid>/cgroup` ends in `/akrogon.slice/<leafSlice>/<leafSlice stem>-p<id alnum>-<pid>-<start>.scope`. The seat process in pane A (its foreground pid from process-info) has the same cgroup. A Chromium started from a boxed pane shell with `herdr pane run <B> '<cmd>'` (cmd: `chromium --headless=new --no-sandbox --user-data-dir=$TMPDIR/live-chrome about:blank & sleep 4; for p in $(pgrep -f live-chrome); do cat /proc/$p/cgroup; done; kill %1`, or equivalent) shows every chromium process in pane B's scope, and `systemctl --user list-units 'app-*Chrom*'` shows no new unit.
3. C6: `systemctl --user show <each pane scope> -p SendSIGHUP -p TimeoutStopUSec` reports SendSIGHUP=yes and TimeoutStopUSec=5s.
4. C5: stop the isolated server (`herdr server stop` with the same XDG_CONFIG_HOME) and start it again with the same unit command. The plugin's startup `next --resume` runs. Afterwards the leaf's recorded pane A id differs from before the restart (or the old pane is gone), and the new pane A shell's cgroup is in its own scope as in AC2, observed before or at the first prompt. Also record what happens to pane B. If startup did not replace the pane, record the observed state and the startup log, and return that as a failed criterion. Do not fix code.

## 3. Read first
- /home/ivan/Work/infra/akrogon/issues/open/host-test-load/seat-containment/design.md, the "Live isolation" paragraph and `grants` (bounds and stop_line).
- /home/ivan/Work/infra/akrogon/issues/chart/host-test-load/proofs.md T2 and T3 (how the isolated server was run).
- <lane>/plugin/herdr-plugin.toml, plugin/next.sh, src/scope.ts.
- /home/ivan/.claude/skills/implement-issue/ponytail.md
<lane> = /home/ivan/.akrogon/worktrees/akrogon/seat-containment (read-only for you, never edit it).

## 4. Setup (all temp paths short, under /tmp/akl-<random 4>, socket paths must stay under ~100 bytes)
- T=/tmp/akl-XXXX. Create T/cfg (XDG_CONFIG_HOME), T/home (AKROGON_HOME), T/repo (a git repo with one commit, a bare remote T/remote.git as `origin` with main pushed), T/bin.
- T/bin/akrogon: `#!/bin/sh` + `exec bun /home/ivan/.akrogon/worktrees/akrogon/seat-containment/src/akrogon.ts "$@"`.
- Copy ~/.config/herdr/config.toml and ~/.config/herdr/agent-detection into T/cfg/herdr/ (read-only copies). No plugins.json copy.
- T/home/config.yaml: `max_active: 1`, slots a and b both `{harness: pi, model: <a cheap pi model from ~/.akrogon config or the operator's pi default>, effort: low}`, `harnesses: {pi: "pi --model {model} --thinking {effort}"}`, `repos: {live: T/repo}`, worktree store default is fine only if you set `worktree_root` in the repo config to T/wt. T/repo/issues/config.yaml: `grounding: none`, `checks: {}`, `worktree_root: T/wt`.
- Leaf T/repo/issues/open/live/live-seat-1/state.yaml: slug live-seat-1, phase plan.synthesis, created today, repo live, debate 'no', blocked-by []. Plus a one-line brief.md. Commit and push.
- Start the server: `systemd-run --user --unit=akl-live-server --setenv=XDG_CONFIG_HOME=T/cfg --setenv=AKROGON_HOME=T/home --setenv=PATH=T/bin:$PATH herdr server`. Every herdr client call: `env -u HERDR_PANE_ID -u HERDR_SOCKET -u HERDR_ENV XDG_CONFIG_HOME=T/cfg herdr ...` (unset every HERDR_* var present in your env). Then `herdr workspace create --label live`, then `herdr plugin link /home/ivan/.akrogon/worktrees/akrogon/seat-containment/plugin` against that server only.
- Link the slice (AC1) before `next`.
- Run `akrogon next live-seat-1` as `env -u HERDR_* XDG_CONFIG_HOME=T/cfg AKROGON_HOME=T/home PATH=T/bin:$PATH akrogon next live-seat-1` from T/repo.

## 5. Do-not, reasons, exceptions (grant: operator 2026-10-13, design.md grants[0])
- Never touch the operator's herdr server or sessions (never call herdr without XDG_CONFIG_HOME=T/cfg and HERDR_* unset), the real ~/.akrogon home, registered repos, the operator's Chrome, other leaves' slices, or any ~/.config/systemd/user file other than the akrogon.slice link.
- At most 3 live attempts, each fully cleaned before the next.
- Do not edit any file in the lane or any repo. A failure is evidence to return.
- Never print or read .env files.
Reasons: the grant's stop_line. There is no exception without a new operator grant.

## 6. Steps
1. Setup (section 4), AC1.
2. `next`, AC2, AC3.
3. Restart, AC4.
4. Cleanup (always, also on failure): `env ... herdr server stop` (or `systemctl --user stop akl-live-server`), `systemctl --user stop <leafSlice>` and `reset-failed`, `rm ~/.config/systemd/user/akrogon.slice` and `systemctl --user daemon-reload`, remove T and any pi session folders the seat created (find them by the T/wt cwd under ~/.pi/agent/sessions and remove only those). Absence check: `systemctl --user list-units --all 'akrogon-l*' 'akl-*'` shows none of yours, the server unit is inactive, T is gone, `ls -la ~/.config/systemd/user/akrogon.slice` fails.
Advisory size: no files, under 40 turns.

## 7. Commands
No test command. Every observation is a direct command whose output you paste.

## 8. Done-when
Every AC observed or explicitly failed with output, cleanup done with the absence check pasted. Record the grant reference, unit names created and wall time.

Changed files and reasons: none
Tests run: <live commands and outputs, per AC>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
