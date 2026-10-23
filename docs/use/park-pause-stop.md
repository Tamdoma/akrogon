# Park, pause and stop work

Akrogon gives you four ways to hold work back: park an issue, pause a repository, stop a leaf, or stop one check run. Use them when work should wait, when you want automatic passes to stop for a while, or when something is running that should not be.

![Three controls side by side: pause and unpause switch a repo between running and paused, park and unpark move a whole issue between open and parked, and stop and start switch a leaf between started and stopped, with stop-run stopping one run and leftovers listing what cleanup kept.](../pictures/control-states.svg)

Run every command below from inside the registered repository. The full command list is in [commands.md](../reference/commands.md).

## Park an issue

Park moves a whole issue out of the open queue. Use it for work you do not want yet.

```sh
akrogon park <issue>
```

`<issue>` is the top-level folder name under `issues/open/`. The folder moves to `issues/parked/<issue>/`, and the command prints `parked <issue>`. You can name several issues at once.

Park is refused in two cases:

- A leaf of the issue has a tab or a worktree. That work is running, so stop or finish it first.
- An open leaf lists a leaf of the issue in `blocked-by`. Parking it would leave that open leaf waiting on something it cannot reach.

To park every issue that can be parked:

```sh
akrogon park --all
```

With `--all`, issues that cannot move are skipped and listed. `running` marks an issue with a running leaf, `needed` marks one that an open leaf still depends on, and `unreadable` marks one with a bad `state.yaml`.

Bring an issue back when you want it:

```sh
akrogon unpark <issue>
akrogon next <slug>
```

Unpark moves the folder back to `issues/open/`. It only puts the issue back in the queue. Dependencies and the `max_active` limit still apply, and a leaf that never ran starts only when you run `akrogon next`. `akrogon unpark --all` brings back every parked issue.

## Pause a repository

Pause stops automatic dispatch for the current repository. It moves no files and kills nothing.

```sh
akrogon pause
```

The command prints `<repo> paused`. While paused, automatic passes do nothing for that repository, including leaves that already have a tab. A command you type yourself, such as `akrogon next <slug>`, still runs in full, and the repository stays paused after it. `akrogon status` marks a paused repository.

Turn it back on:

```sh
akrogon unpause
```

Unpause clears the mark and runs one pass right away. That pass resumes leaves that already have a tab or worktree, runs the cleanup that waited, and runs the merge pass.

Pause and park are different. Park takes whole issues that are not running out of the queue. Pause freezes automatic work for the whole repository, running leaves included.

## Stop a leaf

Stop ends every process a leaf's seats started, including browsers and worker scripts.

```sh
akrogon stop <slug>
```

Akrogon writes the leaf into `stopped.yaml` in the Akrogon home folder, then stops the leaf's systemd slice. It prints `stopped: <repo>/<slug>`. The worktree and its files stay. If the slice stop fails, the leaf stays marked stopped and the command exits with an error. Run it again to retry.

To stop every leaf in the repository that has work in progress:

```sh
akrogon stop --all
```

It prints one line per leaf. One failure does not stop the others, and the command exits with an error if any leaf failed.

While a leaf is stopped:

- Automatic passes skip it quietly.
- A typed `akrogon next <slug>` reports `Leaf is stopped` with the `akrogon start <slug>` command and exits with an error.
- `akrogon status` shows `stopped` in the leaf's row, and `akrogon status <slug>` prints a `stopped:` line.

Start it again:

```sh
akrogon start <slug>
```

Start clears the stopped mark and runs `akrogon next` for that leaf. It exits with an error if the leaf is not stopped.

Panes you split by hand in a leaf's tab are outside the slice and survive a stop.

## Stop one check run

A long check run can be stopped on its own. Each run prints `run <run-id>` when it starts.

```sh
akrogon stop-run <run-id>
```

You can only stop runs started from your own pane, so other seats and leaves are not touched. With no id, it stops your run if you have exactly one. If you have more than one, it lists them and asks for an id.

## Clean up leftovers

Cleanup removes the worktrees and slices of finished leaves on its own. When it keeps something that needs a person, it is listed here:

```sh
akrogon leftovers
```

The output groups kept paths by repository and by reason, with a `host` group for systemd units and old paths on this machine. It prints `no leftovers` when there is nothing to do. Outside a repository, it covers every registered repository. Things kept because work is still running are not listed, since they clear when that work ends.

Next: [Watch while you are away](watch-while-away.md)
