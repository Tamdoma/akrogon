# Intake: killed-check-log

## Scope

Destination repo: akrogon. Handed work: Tamdoma/akrogon#120 (mirrored seed `issues/seeds/120-a-run-check-killed-by-the-seat-tool.md`). Grouping proposed after the map.

## Provenance

- GitHub: Tamdoma/akrogon#120
- Operator: chart door switch-on, 2026-10-27T14:38Z, pane w8:pNP

## Source: operator 2026-10-27T14:38Z

Check the pulled issue. Use slot b consultant (codex already active in this herdr tab), and do it on autopilot. Then nudge the watch-akrogon tab (watcher agent) to start the process.

## Source: Tamdoma/akrogon#120

# A run-check killed by the seat tool timeout keeps no log, and the seat sat on it for over an hour with no busy alert

Source: Tamdoma/akrogon#120
URL: https://github.com/Tamdoma/akrogon/issues/120

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

Framework leaf `config-helper-require` was in check.fix with seat A (pi, pane `wA:p1MS`). At 13:20:40Z, A ran this in the foreground under a 2400s pi tool timeout:

`akrogon run-check --name emdash-conversion-base --holder <leaf dir> -- bun test --timeout=120000 ./.claude/skills/dev-build-emdash/test/`

The command ran from a detached base worktree, `/tmp/basecheck`. At 14:00:40Z the tool timeout killed it. pi reported "Partial output (0 of 0 bytes)", and no `check-emdash-conversion-base-*.log` appeared in the leaf's `implementation/` folder. A then started the same command again under a 3600s timeout. That run was about 40% through the suite after 27 minutes when the operator killed it.

`state.yaml` showed `busy_since: A: 2026-10-27T13:14:03.425Z` and `busy_notified: {}` at 14:25Z, 71 minutes after A went busy. No herdr notification was shown. The operator found the stall by hand.

## Location

- akrogon release 63c20f9859578c179a30dac9c6ab0ac648a6f62b
- `src/run-check.ts` (`checkedRun`)
- `src/next.ts` (`observeBusy`, `STALL_MS`)
- `plugin/herdr-plugin.toml`
- A pi seat running long checks in the foreground

## Reproduction

1. Have a seat run `akrogon run-check` on a command that takes longer than the seat's tool timeout.
2. The harness kills the call, and no check log reaches the leaf.
3. Keep the seat busy past 60 minutes while no pane changes status. `busy_notified` stays empty.

Seen once here, 2026-10-27 13:14Z to 14:30Z.

## Expected behavior

Not provided.

## Urgency

One leaf lost about 70 minutes, plus the earlier time spent collecting evidence. A killed run keeps no evidence, so the seat cannot learn how far the run got and repeats it with a bigger timeout. Workaround: the operator reads `state.yaml` and the pane, then steers the seat, which is what happened here.

## Suspected cause

Agent view.

Log loss: in `checkedRun`, the child writes to `<runRoot>/out.log`. The log is copied to the holder only after `spawnLogged` returns (`copyFileSync(log, kept)`). The outer `finally` then runs `rmSync(runRoot, { recursive: true, force: true })`. A run whose caller is killed before the child exits never reaches the copy, so nothing is kept in the leaf. While the run is live, its output only exists under `/var/tmp/akr-1000/.../run-*/akrogon-io-*/{out,err}`. The seat piped run-check to `tail`, which also prints nothing until the run ends.

Missing alert: `observeBusy`'s 60-minute `STALL_MS` check only runs inside `akrogon next`. `plugin/herdr-plugin.toml` starts `next` only at startup and on the `pane.agent_status_changed`, `pane.exited`, `pane.closed` and `tab.closed` events. A seat busy inside one long tool call changes no pane status, so `next` never ran after the hour. This matches #23's mechanism, which still holds in this release.

Files read:
- Installed release copy `~/.akrogon/releases/63c20f9859578c179a30dac9c6ab0ac648a6f62b/src/run-check.ts` lines 150-300 and `src/next.ts` lines 215-265
- `plugin/herdr-plugin.toml` and `plugin/next.sh`
- The leaf `state.yaml` and the seat's pi session log

The installed release copy is not verified to match the akrogon main source.

Not inspected:
- Whether the killed wrapper reached its `finally`, or left a `run-*` dir behind
- Whether a watch-issues cron was meant to be running

Related reports:
- Tamdoma/akrogon#23 (closed): same stall-alert mechanism, so the event-only trigger still holds in this release.
- Tamdoma/akrogon#89 (closed): a seat tool timeout killing run-check, there while waiting for the permit.

Searched Tamdoma/akrogon, all states, for "run-check timeout log" and "busy stall notification" (limit 10), plus @me reports since 2026-10-25 (limit 40).

## Agent findings

- (A) `src/run-check.ts` `checkedRun`: the child's stdout and stderr go to capture files under the run root (`src/shell.ts` `spawnFiles`), are appended to `<runRoot>/out.log` only after `spawnLogged` returns, and are copied to the holder as `check-<name>-<ms>-<pid>.log` only after that. A caller killed before the child exits never reaches the copy.
- (A) pi 1.4.0 kills a timed-out bash tool call with `process.kill(-pid, "SIGKILL")` on the process group (strings of the installed binary), so the wrapper's `finally` never runs. The only code that survives is the systemd guard from `src/scope.ts` `startRunGuard` (`tail --pid=<wrapper>; rm record; systemctl stop <run>.scope`).
- (A) `src/reconcile.ts` drops a run root whose `.owner` pid is dead, so the captured partial output under `/var/tmp/akr-1000/...` is deleted on the next reconcile.
- (A) run-check prints the child's output and the log path only after the run ends, so a killed caller sees "0 of 0 bytes".
- (A) Lock from `issues/chart/seat-stall-detection/forks/stall-detection.md` and `no-akrogon-detector.md` (operator, 2026-09-18): no clocks, polls or watchdogs; a stall from pure silence stays invisible by accepted consequence. `issues/chart/stall-notifier-removal/forks/delete-notifier.md` (operator correction 2026-09-18) keeps the event-driven `STALL_MS` notifier unchanged.
- (A) `skills/implement-issue/SKILL.md:47` tells seat A to run the exact printed command once in the foreground with the tool timeout set above its expected run time.
