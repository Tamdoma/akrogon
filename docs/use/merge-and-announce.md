# Merge and announce

Landing is the last step of a change. A leaf that passed review moves to `merge`. Akrogon then puts it on the default branch and moves it to `merged`. See where landing sits in a change in the [change flow picture](../pictures/change-flow.svg).

You do not start this by hand. `akrogon next` runs the merge turn for you.

## One merge turn per repo

Each registered repo has one merge turn. Leaves in `merge` wait for it in queue order, and only the leaf holding the turn is worked on. `akrogon status` shows which leaf holds it.

## The normal path needs no seat

When a leaf gets the turn, the command:

1. Fetches the remote and rebases the leaf's branch onto `<remote>/<default_branch>`.
2. Starts `akrogon land <slug> --attempt <id>` as a background user unit named `akrogon-land-<id>`.

The land run then does the rest on its own:

1. Runs `akrogon verify --attempt <id>` on a fresh checkout. A merge runs every `checks` command not named in `merge_covers`, then every `merge_checks` command. See [Checks](../reference/checks.md).
2. Runs the `merged --check` gates, such as the `Test-Change:` trailer rule.
3. Pushes the tested head fast-forward.
4. Moves the leaf to `merged`.

No seat is prompted. While the land run works, `akrogon status <slug>` shows `land` for the leaf. If someone else pushed first, the command rebases again and retries once.

Source: [land.ts](../../src/land.ts), `commandMerged` in [phase.ts](../../src/phase.ts), the merge turn in [next.ts](../../src/next.ts).

## When seat B takes over

The land run hands the attempt to seat B in these cases:

| Case                                   | What B sees in its prompt | What B does                                                  |
| -------------------------------------- | ------------------------- | ------------------------------------------------------------ |
| The verify run is red                  | `wake=red red=<run>`      | Reads the logs and judges the cause.                         |
| A gate refused the move                | `wake=gate`               | Fixes the refusal, such as a missing trailer.                |
| The push errored, or was refused twice | `wake=push`               | Reruns verify, `--check` and `merged`, or reports the error. |
| The push needs a hand rebase           | `attempt=<id> solo`       | Rebases by hand and reruns the checks.                       |

A branch that cannot rebase mechanically never reaches the land run. A conflict or a dirty worktree gives B a solo turn, with `attempt=<id> solo` in its prompt. B rebases by hand, runs `akrogon verify --attempt <id>`, then calls `akrogon phase <slug> merged --slot B --attempt <id>`.

B never runs `git push`. When B calls `merged`, the command does the push and moves the leaf. A red result B cannot fix in place sends the leaf to `check.fix` so seat A repairs it.

The full procedure, including red-run judgment and `rerun` lines, is in [merge-issue](../../skills/merge-issue/SKILL.md). Phase rules are in [State and phases](../reference/state-and-phases.md).

## When an issue or epic completes

When the last leaf of an owner merges, the owner is done. The owner is the issue, or its epic when it has one. The command moves the owner folder to `issues/closed/` and prints one of these lines:

```text
issue complete <issue>
epic complete <epic>
```

An issue inside an epic prints nothing. It waits until the whole epic is done.

## The announcement

Each completion gets one update sent to Discord by the [broadcast-issue](../../skills/broadcast-issue/SKILL.md) skill. It runs once per `issue complete` or `epic complete` line, never per leaf.

Who sends it depends on who merged:

- When B called `merged`, B runs broadcast-issue itself, in the same session.
- When the land run merged with no seat, `akrogon status` shows `broadcast pending`. `akrogon next` then prompts B with a broadcast-only `broadcast-issue` turn.

The message has a one-line summary and two short lists: what was wrong or missing before, and what is better now. It is written for the whole team, not only developers.

The targets are the environment variable names in `broadcast.discord.webhook_env`. Their values are read from `~/.config/akrogon/env`. See [Config](../reference/config.md).

A failed broadcast shows its error but does not undo the merge or reopen the issue.

Next: [When work fails](when-work-fails.md)
