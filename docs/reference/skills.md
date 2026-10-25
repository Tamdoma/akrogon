# Skills

A skill is a set of instructions an agent follows for one kind of job. Each one lives in its own folder under `skills/` with a `SKILL.md` file.

There are two kinds:

- **Skills you start yourself.** You type them in an agent session, for example `/chart-issues` or `/seed-issue`.
- **Skills the `akrogon` command starts.** When a leaf moves to a new phase, the command sends a prompt to a seat's pane. Seat A and seat B are the two execution seats. They plan, build, review and repair leaves. You do not type these skills during normal work.

Chart consultants are different from seats A and B. A consultant is a peer pane (B, C, D and so on) that chart-issues asks for an independent view while it plans a chart. Consultants help decide what to build. Execution seats do the leaf work after handoff.

[`skills/lesson-rule.md`](../../skills/lesson-rule.md) is not a skill you run. It is a shared rule every skill follows when it writes a lesson into `learnings/`.

## chart-issues

- **Result:** charts of open questions (forks) turned into settled leaf contracts in a registered repository. A small settled chart can instead take the direct route: the door builds it in a worktree, seat B reviews, and the door lands it without leaf files.
- **When to use:** you have notes, reports or seeds and need to decide what to build before any code is written.
- **Who starts it:** you. It is operator-invoked only. It asks you questions in chat. Autopilot runs only when you switch it on in words.
- **Source:** [`skills/chart-issues/SKILL.md`](../../skills/chart-issues/SKILL.md)

## plan-issue

- **Result:** the leaf's `plan.md`, the execution plan. Seat A writes `plan.md` from the brief and design.
- **When to use:** a leaf is in a `plan.*` phase.
- **Who starts it:** the command, dispatching seat A for `plan.synthesis`.
- **Source:** [`skills/plan-issue/SKILL.md`](../../skills/plan-issue/SKILL.md)

## implement-issue

- **Result:** code in the leaf worktree that does what the plan says, or repairs for review findings. Seat A works inline, hands units to workers in waves of up to 3, or builds alone when every wave holds one unit.
- **When to use:** a leaf is in `implement` or `check.fix`. You can also run it yourself without a leaf for a standalone task in the current checkout.
- **Who starts it:** the command, dispatching seat A. The chart door also starts it for a direct-route chart.
- **Source:** [`skills/implement-issue/SKILL.md`](../../skills/implement-issue/SKILL.md)

## check-issue

- **Result:** a review file per seat with Fix and Nit findings and a verdict. In `check.repair`, seat B repairs most Fixes itself.
- **When to use:** a leaf is in `check.review` or `check.repair`.
- **Who starts it:** the command, dispatching seats A and B for the first review, and seat B alone for repair and for reviews after a repair. The chart door also starts it with seat B to review a direct-route change.
- **Source:** [`skills/check-issue/SKILL.md`](../../skills/check-issue/SKILL.md)

## merge-issue

- **Result:** a merge attempt the command could not finish alone, checked or repaired by seat B: the applied rebase checked, a red check or refused push looked into, or a solo leaf rebased by hand. The command then pushes and moves the leaf. Seat B never pushes itself.
- **When to use:** a leaf is in `merge` and the command hands the attempt over. An attempt that passes the command's own land run lands with no seat at all.
- **Who starts it:** the command, dispatching seat B.
- **Source:** [`skills/merge-issue/SKILL.md`](../../skills/merge-issue/SKILL.md)

## seed-issue

- **Result:** one GitHub issue that records an observation as unverified intake. It goes to the repository named by `issues_repo` in the root `akrogon.yaml`, else to the GitHub `origin`. When the failure names a path that belongs to akrogon, it goes to akrogon's own issue destination.
- **When to use:** you saw something wrong and want it filed for later charting. It needs only an authenticated `gh`, with no install, registration or leaf.
- **Who starts it:** you. A seat that writes a checkable lesson also runs it, following the lesson rule.
- **Source:** [`skills/seed-issue/SKILL.md`](../../skills/seed-issue/SKILL.md)

## broadcast-issue

- **Result:** one plain-language Discord update for a completed standalone issue or epic, sent to the targets in `broadcast.discord.webhook_env`.
- **When to use:** right after `issue complete` or `epic complete`, or after a direct landing.
- **Who starts it:** the command, prompting the merged leaf's seat B. After a direct landing, the chart door runs it.
- **Source:** [`skills/broadcast-issue/SKILL.md`](../../skills/broadcast-issue/SKILL.md)

## init-akrogon

- **Result:** a proposed lifecycle configuration for a repository (checks, merge checks, grounding index and more), and an optional test toolkit, then the repository initialized through the `akrogon` command.
- **When to use:** you are setting up a repository for akrogon, or reviewing its setup again.
- **Who starts it:** you. It runs outside any leaf.
- **Source:** [`skills/init-akrogon/SKILL.md`](../../skills/init-akrogon/SKILL.md)

## watch-issues

- **Result:** a Claude Code cron job that checks every open leaf of one repo every 20 minutes. It moves waiting leaves on, recovers some failures, steers looping seats once and notifies you when a leaf needs you.
- **When to use:** you are stepping away and want open leaves to keep moving.
- **Who starts it:** you, and only you stop it with `/watch-issues stop`. It works only in Claude Code. The job also ends with the session or its own 7-day expiry.
- **Source:** [`skills/watch-issues/SKILL.md`](../../skills/watch-issues/SKILL.md)

## learn-issues

- **Result:** each active lesson in `learnings/LESSONS.md` sorted as stopped, checkable, transfer or stays. Stopped lines are removed, transfers are prepared for your approval, and checkable ones get a printed `/seed-issue` line you can choose to run. All edits stay uncommitted for you to review.
- **When to use:** the lesson list has grown and you want to clear what no longer applies.
- **Who starts it:** you. It is operator-invoked only.
- **Source:** [`skills/learn-issues/SKILL.md`](../../skills/learn-issues/SKILL.md)
