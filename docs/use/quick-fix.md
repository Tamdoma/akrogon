# Quick fix

The direct route lets the chart door build a small, settled change itself as seat A of a real leaf, with the merge queue landing it like any leaf. Use it when one code-only change is fully charted and a separate leaf handoff would be more ceremony than the work.

It is one of the ways to run work shown in [Plan work](plan-work.md). The full rules are in [chart-issues](../../skills/chart-issues/SKILL.md).

## What it skips and what it keeps

The direct route skips the leaf handoff to fresh seats: the door is seat A and the reviewer is seat B. It keeps everything you decided while charting, the leaf record in `issues/open`, seat B review, the merge queue, the land run and the broadcast.

## When the door offers it

You need no repo setting. Chart as usual and name at least one chart consultant, such as B. At the handoff review, the door decides whether the chart is eligible.

The door refuses the direct route, and says why in one line, when any of these holds:

- The work needs keys or files you supply, a live-account grant, a key it creates, or live resources kept after it ends.
- A done-criterion needs a live run or an outside call while building.
- There is more than one outcome, or an unfinished dependency.
- A step only a person can do is still pending.
- No B pane is named.
- The door is not inside hc.
- The door is running in [Autopilot](autopilot.md).

When it refuses, you get the normal lifecycle questions.

When the chart is eligible, the review asks one route question with the door's pick:

- lifecycle
- direct

The door may still recommend lifecycle for a small job it thinks is risky. You can always decline direct. Your choice is saved in `CHART.md` as the `Route:` line.

## What happens when you pick direct

1. The door writes the leaf files under `issues/open/<chart-slug>/<slug>/` and runs `akrogon direct <slug> --reviewer <B address>`, which creates the worktree and the leaf record.
2. The door builds the change itself in the worktree with [implement-issue](../../skills/implement-issue/SKILL.md) as seat A, then sends the leaf to review.
3. B reviews it with [check-issue](../../skills/check-issue/SKILL.md).
4. On fixes the door repairs as seat A and B checks again.
5. The merge queue and the land run land the leaf like any other: they verify, push the exact tested commit, close the GitHub issues the change delivered, and post an update through [broadcast-issue](../../skills/broadcast-issue/SKILL.md) when the repo has broadcast set up.
6. The door marks the chart `Closed`.

You watch the leaf in `akrogon status` like any other. You do not run these commands yourself.

## When it stops

A task that outgrows the route stops the leaf `failed`: a settled decision must change, a need the route refuses appears, a criterion cannot pass, or a second outcome shows up. You then pick one of these:

- Abandon it: the door runs `akrogon direct-drop`, which stops the leaf's runs, removes the worktree and branch, moves the leaf folder back into the chart and marks the chart `Held`.
- Hand it to the lifecycle: the work is dropped the same way and charted as a normal leaf under a fresh slug.

The full command list is in [commands.md](../reference/commands.md).

Next: [Autopilot](autopilot.md)
