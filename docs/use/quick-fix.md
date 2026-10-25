# Quick fix

The direct route lets the chart door build a small, settled change itself and land it on the default branch. Use it when one code-only change is fully charted and a separate leaf would be more ceremony than the work.

It is one of the ways to run work shown in [Plan work](plan-work.md). The full rules are in [chart-issues](../../skills/chart-issues/SKILL.md).

## What it skips and what it keeps

The direct route skips the leaf handoff and `akrogon next`. No leaf files are written. It keeps everything you decided while charting, and it keeps seat B review.

## When the door offers it

You need no repo setting. Chart as usual and name at least one chart consultant, such as B. At the handoff review, the door decides whether the chart is eligible.

The door refuses the direct route, and says why in one line, when any of these holds:

- The work needs keys or files you supply, a live-account grant, a key it creates, or live resources kept after it ends.
- A done-criterion needs a live run or an outside call while building.
- There is more than one outcome, or an unfinished dependency.
- A step only a person can do is still pending.
- No B pane is named.
- The door is running in [Autopilot](autopilot.md).

When it refuses, you get the normal lifecycle questions.

When the chart is eligible, the review asks one route question with the door's pick:

- lifecycle
- direct

The door may still recommend lifecycle for a small job it thinks is risky. You can always decline direct. Your choice is saved in `CHART.md` as the `Route:` line.

## What happens when you pick direct

Choosing direct also lets the door push to the default branch. Then the door:

1. Makes a branch and a worktree for the change.
2. Builds the change itself with [implement-issue](../../skills/implement-issue/SKILL.md).
3. Sends the change to B, which reviews it as seat B with [check-issue](../../skills/check-issue/SKILL.md).
4. Repairs B's fixes and asks B to check again, up to the repo's `fix_rounds` setting. See [config.md](../reference/config.md).
5. Rebases, runs every configured check with `akrogon verify`, and pushes the exact tested commit. It never force-pushes.
6. Closes the GitHub issues the change delivered with `akrogon close`.
7. Optional: posts an update through [broadcast-issue](../../skills/broadcast-issue/SKILL.md) when the repo has broadcast set up.
8. Removes the branch and worktree and marks the chart `Closed`.

You watch the door's pane. You do not run these commands yourself.

## When it stops

The door stops building when the work grows. That means a settled decision must change, a need the route refuses appears, a criterion cannot pass, or a second outcome shows up. It also stops when the repair rounds run out.

On a stop, the door commits the work so far, keeps the worktree, and writes what is done and not done in the `Direct attempt` section of `CHART.md`. You then pick one of these:

- One more repair round, when the rounds ran out.
- Hand it to the lifecycle. The work becomes a normal leaf that starts at planning and keeps the existing branch.
- Abandon it. The door removes the branch and worktree and marks the chart `Held`.

The full command list is in [commands.md](../reference/commands.md).

Next: [Autopilot](autopilot.md)
