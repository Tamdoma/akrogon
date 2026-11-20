# Watch while you are away

Optional: the [watch-issues](../../skills/watch-issues/SKILL.md) skill checks every open leaf of one repository every 20 minutes while you step away. It works in claude, codex, pi and agy. You start it and you stop it. Your leaves run the same without it.

## Start the watch

Open your agent CLI — claude, codex, pi or agy — in an hc terminal of the session that holds the repository's space, in the registered repository, and send:

```text
watch-issues <root>
```

(Claude also accepts `/watch-issues`.) It runs one check right away and starts a timer terminal named `<prefix>-watch` in the same session, which sends a `watch-issues tick` line to your agent every 20 minutes. If a watch is already running, it reports it and starts no second one.

A tick that queues up while a check runs gets its own check afterwards.

## What each check does

![The watch loop: a 20-minute timer reads status, stops if the repository is paused, then either acts within allowed steps or reports, and notifies you.](../pictures/watch-loop.svg)

1. It runs `akrogon status`. If the repository is paused with `akrogon pause`, the check does nothing else.
2. It reads each open leaf's phase, seats and failure record.
3. It starts leaves that wait on an idle seat with `akrogon next <slug>`, or `akrogon next --all` when several wait. It leaves a leaf alone while a leaf it is blocked by is not merged.
4. It retries a failed leaf at the phase where it failed with `akrogon phase <slug> <phase>` and `akrogon next <slug>`. It does this only when the leaf's seats are idle, and it gives up after two retries in a row that fail again.
5. It reads a busy seat's log and screen. If the seat repeats the same failing step, or works outside its brief, the check stops it once and sends one correcting prompt. A slow command alone is not a reason to step in.
6. It sends a notice that herdr-app shows as a toast when a leaf needs you, then replies with a few lines on what it saw and did.

## What stays yours

The watch never recovers a leaf that failed on a credential, a permission, a decision or an outside step. It notifies you instead. Fix the cause, then move the leaf yourself as shown in [Limits](../reference/limits.md).

The watch never kills an agent, kills or removes a terminal, answers a seat, or edits `state.yaml`, worktrees or `issues/`.

## Stop the watch

Stop it from any terminal of the session, in the watching agent or another one, with:

```text
watch-issues stop <root>
```

(Claude also accepts `/watch-issues stop`.) Besides a stop, the watch ends when the watching agent exits, when its terminal finishes or is reused for another program, and on a conversation reset the harness shows: `/clear` on claude or agy stops it. Codex and pi `/new` may leave the watch running into the new conversation — the first tick tries to stop it, but this is a stated limit, not a guarantee. A tick hc holds back while you have an unfinished draft typed may land in the shell left behind if you exit a shell-launched agent in that window; any agent that gets it refuses it. The watch never ends on its own otherwise, even when no open leaves are left.

Next: [Commands](../reference/commands.md)
