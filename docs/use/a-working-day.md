# A working day

A usual day takes a request, charts it into leaves, runs the leaves and ends with the work merged on your default branch. Read this page to see the order of the steps. Each step links the page that covers it in detail.

![A working day from intake to merged: intake from a local note, a GitHub issue or a pulled seed goes to /chart-issues, then handoff to issues/open, akrogon next, the seats plan, build, review and repair, the command lands it and it is merged, with watch-issues beside the run, broadcast once per finished issue, and two side paths where the direct route has the door build, B review and the door land, and autopilot charts and hands off but starts nothing.](../pictures/working-day.svg)

## The usual day

1. Start with a request. This can be a local note you write in the chart door. Optional: bring in a GitHub issue with `akrogon pull`, which copies open issues into `issues/seeds/`, or file one first with the seed-issue skill. See [Report an observation](report-an-observation.md).
2. Chart it with `/chart-issues`. The door asks you about each open question until nothing is left to guess. See [Plan work](plan-work.md) and [chart-issues](../../skills/chart-issues/SKILL.md).
3. The door hands off the leaves. It writes each leaf folder under `issues/open/` and marks the chart `Handed off`. It starts nothing. If the work is already clear, you can write the leaf files yourself instead. See [Write issues by hand](write-issues-by-hand.md).
4. Run `akrogon next`. It starts the leaves that are ready. See [Run work](run-work.md).
5. The seats work the leaf. Seat A and seat B plan it, A builds it, they review it, and B repairs what the review finds. Akrogon prompts the next seat from the leaf's state, so you do not copy prompts between panes. See [plan-issue](../../skills/plan-issue/SKILL.md), [implement-issue](../../skills/implement-issue/SKILL.md) and [check-issue](../../skills/check-issue/SKILL.md).
6. The command lands it. When a merge attempt is ready, `akrogon next` runs `akrogon land`, which checks the attempt, pushes it and moves the leaf to `merged`. If a check fails or a rebase is needed, seat B takes over with the [merge-issue](../../skills/merge-issue/SKILL.md) skill.

Optional: run `/watch-issues` beside steps 4 to 6 to keep leaves moving while you step away. See [Watch while away](watch-while-away.md).

Optional: when you set Discord targets under `broadcast` in [config.md](../reference/config.md), seat B sends one plain update per finished issue or epic after it merges. See [broadcast-issue](../../skills/broadcast-issue/SKILL.md).

To hold work back or stop a running leaf, see [Park, pause and stop](park-pause-stop.md).

## Two other routes

The direct route is for one small, settled change. The door builds it in a worktree, the first chart consultant (B) reviews it, and the door lands it on your default branch. It skips the leaf handoff and `akrogon next`. It keeps the charted decisions and B's review. The door offers it only when the chart is eligible, and you can always decline. See [Quick fix](quick-fix.md).

Autopilot charts and hands off without asking you each question. It starts no execution. You still run `akrogon next` on the handed-off leaves. See [Autopilot](autopilot.md).

Chart consultants are the helper panes that advise the door while it charts. They are not the seats A and B that work on a leaf.

The full command list is in [commands.md](../reference/commands.md).

Next: [Plan work](plan-work.md)
