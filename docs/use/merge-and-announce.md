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

1. Runs `akrogon verify --attempt <id>` on a fresh checkout. A merge runs every `checks` command not named in `merge_covers`, then, once those are green, the `merge_checks` members all at once. See [Checks](../reference/checks.md).
2. Runs the land gates, such as the `Test-Change:` trailer rule.
3. Pushes the tested head fast-forward.
4. Moves the leaf to `merged`.

No seat is prompted. While the land run works, `akrogon status <slug>` shows `land` for the leaf. If someone else pushed first, the command rebases again and retries once.

Source: [land.ts](../../src/land.ts), `commandMerged` in [phase.ts](../../src/phase.ts), the merge turn in [next.ts](../../src/next.ts).

## When the land run exits

Merge holds no seat, so nobody is prompted inside it. When the land run cannot land the leaf it writes `state.merge_exit` and moves the leaf to `check.repair`. Seat B's repair prompt then carries `merge-exit=<reason>` plus the exit's fields.

| Exit `merge-exit=` | What it means                                 | Fields carried                               |
| ------------------ | --------------------------------------------- | -------------------------------------------- |
| `red`              | The verify run went red and no cover applied. | `run=<id>`, `top=<sha>`, `base_verdict=<id>` |
| `gate`             | A land gate refused.                          | `refusal=<text>`, `top=<sha>`                |
| `conflict`         | The rebase or restack conflicted.             | `base=<sha>`, `top=<sha>` on a land exit     |
| `dirty`            | The worktree held uncommitted work.           | `base=<sha>`, `top=<sha>` on a land exit     |

`base_verdict` appears only when land ran the base pass itself and names that base run; a green verdict there means the head red is the leaf's own. The merge turn writes `conflict` and `dirty` itself when its own build step fails; a restack conflict mid-run writes them from the land run.

Three push outcomes are not exits. A first fast-forward refusal restacks and pushes again inside the same run. A second clears the batch, prints `held <slug> attempt=<id>` and keeps the leaf in `merge` at its queue place. A push error that is not a refusal moves the leaf to `failed` with git's stderr as the reason. A `failed` leaf is recovered by the operator; `akrogon phase <slug> merged` also lands an applied batch directly.

The full procedure, including red-run judgment and `merge_exit`, is in [merge-issue](../../skills/merge-issue/SKILL.md). Phase rules are in [State and phases](../reference/state-and-phases.md).

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

- When the command's land run merged, `akrogon status` shows `broadcast pending`. `akrogon next` then prompts B with a broadcast-only `broadcast-issue` turn.
- When you land a leaf yourself with `akrogon phase <slug> merged`, run broadcast-issue yourself for the printed completion line.

The message has a one-line summary and two short lists: what was wrong or missing before, and what is better now. It is written for the whole team, not only developers.

The targets are the environment variable names in `broadcast.discord.webhook_env`. Their values are read from `~/.config/akrogon/env`. See [Config](../reference/config.md).

A failed broadcast shows its error but does not undo the merge or reopen the issue.

Next: [When work fails](when-work-fails.md)
