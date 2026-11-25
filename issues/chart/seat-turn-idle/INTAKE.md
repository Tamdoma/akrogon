# Intake: seat-turn-idle

## Scope

A seat whose agent turn ended receives the next phase prompt even while a background shell it started still runs; leftover seat shells end when the phase advances. Destination repo: akrogon.

## Provenance

- GitHub: Tamdoma/akrogon#157
- Operator: door session 2026-11-24 (handed list of five seeds)

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

## Source: operator door message 2026-11-24

5 issues pulled. We need to chart them out. Use the following consultants: slot b: pi swe-2-1-max, slot c: agy neon high, slot d: pi muse wonder full 1.0. Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance.

## Agent findings

Imported at door open 2026-11-24T22:57:50Z (pull time). No identity match in open/closed leaf sources or chart intakes. Territory map findings are added after the shared opening map (issues/chart/seat-turn-idle/slots/map-merged.md).
