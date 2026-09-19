# In practice

Start with one small leaf. Watch it move through the phases before filling the queue.

For CSV export, a small brief can cover formatting and tests without also redesigning the export screen.

## A working day

1. Check the board and read any failure causes.
2. Chart new work if its requirements are still unclear.
3. Start the leaves you want to run.
4. Inspect progress when needed.
5. Sync issue records after editing them.

From the example repository:

```sh
cd ~/Work/widgets
akrogon status
akrogon next export-csv
akrogon status export-csv
akrogon sync
```

These are separate steps, not a script you need to repeat on a timer.

Keep work you do not want dispatched in the parked store:

```sh
akrogon park export-csv
```

Parking is for unallocated work. It is not a way to interrupt a running agent.

## The questions that come up, answered

**Do I have to keep sending prompts?**

Normally, Herdr events trigger dispatch as seats finish. A manual next pass can pick up eligible work. Failed leaves need recovery first.

**Can I leave it running?**

You can, but an agent can still hit a permission prompt, lose its session or fail to deliver a result. Akrogon core has no timed watcher.

Claude Code has an optional watch skill:

```text
/watch-issues
```

It checks the repository's open leaves on a 20-minute session cron. It can dispatch eligible work and recover failures when the evidence supports doing so. Human-only blockers are reported for you to resolve.

The skill can also inspect suspected loops and intervene within its safety rules. Recovery is not a promise that every stuck leaf will finish.

This skill requires Claude Code's cron tools. It cannot run in pi or Codex just because installation linked it there. Stop it with:

```text
/watch-issues stop
```

**What if the leaf fails?**

Read its recorded cause. Fix the underlying problem, choose an active phase and dispatch it again:

```sh
akrogon status export-csv
akrogon phase export-csv implement
akrogon next export-csv
```

Implementation is only an example recovery point. The correct phase depends on the work already done.

**Can I lower the load while leaves are running?**

Lower the global max_active limit to a positive number. Existing allocations keep progressing. The limit prevents new allocations once capacity is full.

See [Limits](limits.md) before relying on a folder target or state edit to control running work.

## watch-issues: an optional check while you are away

The watch skill runs an initial check, then creates one session cron if work still needs watching. It expires after seven days.

It reads state and uses Herdr to inspect busy seats. A long-running command alone is not enough to declare a loop. The skill looks for repeated failed actions, off-scope work or other concrete evidence.

When justified, it can stop and redirect a seat once per watch. It confirms that the same session is idle with empty input before sending the correction. If that cannot be established, it reports the problem instead.

For nonhuman failures, recovery also needs a usable seat and readable history. Two consecutive unproductive recovery cycles stop further recovery. Human prerequisites are notification-only.

The watch stops when the readable open tree is empty, or when every remaining leaf is waiting on a human prerequisite that has been reported.

You get occasional inspection and bounded intervention. This does not add a watcher to Akrogon core or remove the need to resolve human blockers.

Previous: [Merge](merge.md) · Next: [Limits](limits.md) · [Home](../../README.md)
