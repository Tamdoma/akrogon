# Intake: seat-shell-kill

## Scope

Re-chart of the stopped leaf akrogon issues/open/seat-turn-idle/shell-sweep (chart issues/chart/seat-turn-idle, handed off 2026-11-25). Same source and same operator decision: leftover seat shells end when the leaf's phase advances, and a seat recovered by hc as a bare shell is a lost seat. The new contract replaces shell-sweep's process-selection rule. Destination repo: akrogon.

## Provenance

- GitHub: Tamdoma/akrogon#157 (also in the sources of the stopped leaf shell-sweep, which this chart replaces at handoff)
- Operator: watcher relay from t346, 2026-11-25, and the operator's reply "1a 2a" in door t126, 2026-11-25

## Source: Tamdoma/akrogon#157

# A leaf seat whose turn ended but left a background shell running stays "working" in hc, so akrogon never delivers the next phase prompt and the leaf stalls holding a capacity slot

Source: Tamdoma/akrogon#157
URL: https://github.com/Tamdoma/akrogon/issues/157

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Operator decision (Ivan Juras, 2026-11-24)

- Fix this in akrogon/hc, not with a watch-side kill permission: a seat whose agent turn has ended counts as idle for prompt delivery even when a background shell it started is still running.
- Leftover seat shells end when the leaf's phase advances.
- Not in scope: granting the watch permission to kill seat shells as the workaround.

## Observation

On framework leaf `writers-write-the-spec-sections`, seat A (claude, hc terminal `t3fp`) moved the leaf `implement -> check.review` at 18:07 UTC on 2026-11-24 and ended its turn. The pane read `done 7:07 PM · 1 shell still running`. B had already reviewed (`done: [B]`, `verdict: {B: fix}`), so check.review was waiting only on A.

The leftover shell was an implement-time poll loop, started by the seat and run under the claude process:

```
until [ -n "$(git -C /home/ivan/.akrogon/worktrees/framework/writers-write-the-spec-sections-u2 log --oneline 710c1323ff..HEAD 2>/dev/null)" ] && [ -n "$(git -C /home/ivan/.akrogon/worktrees/framework/writers-write-the-spec-sections-u3 log --oneline 710c1323ff..HEAD 2>/dev/null)" ]; do sleep 30; done; echo both
```

Worker worktrees `-u2` and `-u3` had already been removed, so the loop could never end. `hc get --json t3fp` kept reporting `status.state: working`, and `akrogon status` showed `busy A` growing for about 4h50m. During that time A's `check-issue` prompt was never delivered, and the leaf held one of framework's 3 `max_active` slots, so `halt-record` (waiting on `capacity` since 16:24 UTC) could not start.

At about 22:50 UTC the operator killed the loop by hand (`kill 3538019`). Within seconds akrogon delivered A's prompt (`prompted.A.turn: 2`), and A began the review.

Same class, seen the same day: after a host reboot the leaf seat panes (`t3dg`, `t3db`) came back as live bash shells with the agent gone and no hc status. `akrogon next --resume` relaunched nothing, because the seat terminal was `live`, not `finished` or missing, and `dispatchSlot` returns on a null status. Recovery needed a manual relaunch in each pane.

## Location

akrogon `next` dispatch (`src/next.ts` `dispatchSlot`) reading seat status from hc (`src/hc.ts` `statusSchema`, `terminal()`), on framework leaf seats in hc session `infra`.

## Reproduction

1. A leaf seat (claude) starts a background shell during a phase, such as a poll loop waiting on worker worktrees.
2. The seat calls `akrogon phase ...` and ends its turn while that shell is still running, and the shell can never end.
3. `akrogon next` / the listener never delivers the next prompt to that seat.

Frequency: once observed for the stuck background shell. The reboot variant happened to every seated leaf after one reboot.

## Expected behavior

A seat whose agent turn has ended receives the next phase prompt whether or not a background shell it started is still running. A seat pane whose agent process is gone is treated as lost or finished, so `next --resume` relaunches it.

## Urgency

High for unattended runs. The leaf stalls with no notice, for as long as nobody looks, and it blocks a capacity slot for other leaves. Workaround: kill the leftover shell, which is not the agent, by hand. The watch agent's own kill was refused by the harness permission classifier, so this needed the operator.

## Suspected cause

Agent view. `dispatchSlot` in `src/next.ts` takes the seat's busy or idle state from hc's terminal `status.state` and returns unless it is `idle` or `done` (`if (status !== 'idle' && status !== 'done') return;`). It goes to the lost-seat path only when the terminal is missing or `finished`. hc appears to derive `working` from the claude pane's state, which counts a live background shell as busy even after the turn ended. For the reboot case, a bash pane has a `live` terminal and a null status, which falls through to the same return. Contributing condition: nothing ends seat-started background shells when a phase advances or worker worktrees are removed.

Files read: `~/.akrogon/releases/b39da300b2be6fcfe818016f280bf8b0c228d2c7/src/next.ts` (`dispatchSlot`, `dispatchLeaf`, `resumeRepos`), `src/hc.ts` (status schema). These are the installed release copy, not the destination source checkout `/home/ivan/Work/infra/akrogon`, but the same file names exist there.

Not inspected: how herdr-core computes `status.state` for a claude pane that has a background shell. If hc reports `idle` for that case in some builds, the cause is in claude's pane signal instead.

Related reports: none found. Searched Tamdoma/akrogon, all states: the `@me` reports since 2026-11-22 (limit 40), plus "background shell working" and "resume live bash" (limit 10 each). #151 (host reconcile killing seats) is a different seat-liveness failure.

## Source: operator relay via t346, 2026-11-25

<hc from="t346">Operator request, relayed by the akrogon watch (t3kt's watcher): judge whether leaf seat-turn-idle/shell-sweep needs re-charting, and chart it if so. Evidence: 6h+ open, now check.fix round 5 (issues/log.jsonl). Plan 1h05, implement 52m, then five review->fix rounds of about 1h each. review-B.md shows each repair introducing new defects: F6 (round-1 repair kills unrelated non-shell processes), F8-F10 (SIGSTOP freeze crosses the scope boundary, can leave a shell stopped, waits under the global lock), F11-F12 (process-group lineage kills a live harness child; admission lock stalls every phase move across repos). Watcher's reading: the design picks which processes to kill from userland /proc and cgroup snapshots while the tree forks, reparents and migrates, so every rule leaves a race window, and fix rounds have no cap. Candidate direction, unverified: a kernel-atomic kill (tool shells in their own cgroup, one cgroup.kill write) instead of per-process selection. direct-visible/direct-leaf stays blocked on shell-sweep. Seat A t3mw is still working round 5. The watch has not stopped or failed it.</hc>

## Source: operator door message 2026-11-25

1a 2a

(Answer to the door's round in t126: "1 · Should I stop shell-sweep now, while seat A is in round 5?" 1a stop now; "2 · Who answers the new chart's questions?" 2a autopilot, A answers each question and records why, consultants B, C and D (t3p0 to t3p2) still running, the session's signposts carry over.)

## Agent findings

- 2026-11-25T07:14:20Z `akrogon stop shell-sweep` printed `stopped: akrogon/shell-sweep`; status shows it stopped at check.fix, fix rounds 5, worktree /home/ivan/.akrogon/worktrees/akrogon/shell-sweep kept.
- review-B.md (issues/open/seat-turn-idle/shell-sweep/review-B.md): F1 (late child of a looping shell survives) and F2 (run-check admitted during the sweep loses its writer) open since round 1 and still reproduced at round 4; new defects per round: F6 (round 1), F8 to F10 (round 2), F11 and F12 (round 4). All stem from the shell-sweep Taken Q2 rule selecting processes from /proc and cgroup.procs snapshots while the tree forks, reparents and migrates.
- Seats launch as `systemd-run --user --scope ... -- env <akrogon env> <harness argv>` (src/seat.ts startSeat), so akrogon sets the harness environment and the scope properties.
- Brief criterion 4 of shell-sweep (recovered bare-shell seat is lost) drew no review finding; it is not the failing part.
