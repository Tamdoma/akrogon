# What Akrogon is

Akrogon is a small software factory for people who already use a coding agent. You bring a request. Akrogon turns it into a written contract, has one agent build it, has two agents review it, and lands the result on your default branch.

You decide what to build and when to start it. Akrogon keeps track of where each piece of work is and tells the next agent what to do. It does not decide what your product needs, and it does not deploy your product.

![How work moves through Akrogon: a request goes to the chart door, where you and agent A settle it, then becomes a contract in issues/open, then is built, gets an independent review, is repaired if needed, is landed by the command and ends merged. A dashed side path shows the direct route, where one small settled chart keeps the charted decisions and B's review but skips the leaf handoff, and the door lands it itself.](../pictures/factory-overview.svg)

## From request to merged

1. You start with a request. It can be a note you type, or a GitHub issue you copy into your project with `akrogon pull`.
2. You open the chart door by running `/chart-issues` in an agent. The door asks you one open question per round until nothing is left to guess.
3. The door writes the settled work as one or more leaves under `issues/open/`. Each leaf is a written contract: what to build, why, and how to tell it is done.
4. You run `akrogon next`. It gives the leaf its own worktree and starts two agent seats, A and B, side by side in Herdr.
5. The seats plan the work. Seat A builds it.
6. Both seats review the build without reading each other's review. When they find problems, seat B repairs most of them and hands the rest back to A.
7. The command lands the leaf. It checks the exact commit, pushes it to your default branch and marks the leaf merged.

For one small, settled change, the door can offer the direct route instead. The door builds it itself, B reviews it, and the door lands it. See [Quick fix](../use/quick-fix.md).

## The words

- **Chart.** A folder under `issues/chart/` where the door and you settle a request. Each open question is a fork, and each fork records your answer and the reason.
- **Leaf.** One piece of work small enough to plan, build and review as a unit. It is a folder under `issues/open/` holding `brief.md`, `design.md` and `state.yaml`. The folder name is the leaf's slug, the name commands use.
- **Seat A and seat B.** The two agent roles that work on a leaf. A writes the plan and builds. Both review. B repairs most findings. B also takes over landing when a check fails or a rebase is needed. A and B are jobs, not fixed models. You pick the agent CLI and model for each seat.
- **Phase.** The step a leaf is in, such as `implement` or `check.review`. It is written in the leaf's `state.yaml`. Only Akrogon commands change it.
- **Worktree.** A separate checkout of your repository where a leaf's code changes happen. Your own checkout stays untouched while the seats work.
- **Landing.** Putting a tested commit on your default branch. The command runs it with `akrogon land`, which checks the commit, pushes it and moves the leaf to `merged`.

A skill is a written procedure an agent follows, such as [chart-issues](../../skills/chart-issues/SKILL.md). A command is the `akrogon` program, which does the mechanical parts: it starts seats, moves phases and lands work. Herdr is the terminal tool that holds the seat panes.

The full list of phases is in [State and phases](../reference/state-and-phases.md).

Next: [Why it works](why-it-works.md)
