# Skills

A skill is a set of instructions an agent follows for one kind of job. Each one lives in its own folder under `skills/` with a `SKILL.md` file.

There are two kinds:

- **Skills you start yourself.** You type them in an agent session, for example `/chart-issues` or `/seed-issue`.
- **Skills the `akrogon` command starts.** When a leaf moves to a new phase, the command sends a prompt to a seat's pane. Seat A and seat B are the two execution seats. They plan, build, review and repair leaves. You do not type these skills during normal work.

Chart consultants are different from seats A and B. A consultant is an hc terminal (B, C, D and so on), started by the door as its child or supplied by the operator, that chart-issues asks for an independent view while it plans a chart. Consultants help decide what to build. Execution seats do the leaf work after handoff.

[`skills/lesson-rule.md`](../../skills/lesson-rule.md) is not a skill you run. It is a shared rule every skill follows when it writes a lesson into `learnings/`.

## chart-issues

- **Result:** charts of open questions (forks) turned into settled leaf contracts in a registered repository. One signposts round opens the session and sets its direction, then three Charting modes (No autopilot, Semi-autopilot and Full autopilot) set who answers the signposts and the forks. A small settled chart can instead take the direct route: the door builds it in a worktree as seat A of a real leaf, seat B reviews, and the command lands it like any leaf.
- **When to use:** you have notes, reports or seeds and need to decide what to build before any code is written.
- **Who starts it:** you. It is operator-invoked only. It asks you questions in chat. Semi-autopilot and Full autopilot run only when you switch them on in words.
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

- **Result:** a review file per reviewer with Fix and Nit findings and a verdict. In lifecycle `check.repair`, B repairs most Fixes itself.
- **When to use:** any leaf in `check.review`, or a lifecycle leaf in `check.repair`.
- **Who starts it:** for lifecycle leaves, the command dispatches A and B for initial review and B for `check.repair` and later reviews. For direct leaves, the chart door sends every review to B and handles `check.repair` as A.
- **Source:** [`skills/check-issue/SKILL.md`](../../skills/check-issue/SKILL.md)

## merge-issue

- **Result:** the reference for the command-owned merge phase: the merge turn's batch and rebase, the `akrogon land` run that verifies, gates and pushes, each `merge_exit` into `check.repair` or `failed`, and the operator's slot-less `akrogon phase <slug> merged`. Merge holds no seat, so no prompt names this skill.
- **When to use:** to understand or intervene in a leaf's merge: a held batch, a merge exit the repair seat reported, or a `failed` merge leaf's recovery.
- **Who starts it:** nobody. It documents what the command runs.
- **Source:** [`skills/merge-issue/SKILL.md`](../../skills/merge-issue/SKILL.md)

## seed-issue

- **Result:** files an observation as unverified intake or adds your stated decision to an open report. If you name an open report for the edit, the skill uses that report's repository. For filing, it uses `issues_repo` in the root `akrogon.yaml`, or the GitHub `origin` if that file is absent. When the failure names a path that belongs to akrogon, it files in akrogon's own issue destination.
- **When to use:** you saw something wrong and want it filed for later charting. It needs only an authenticated `gh`, with no install, registration or leaf.
- **Who starts it:** you. A seat that writes a checkable lesson, or a lesson about a check that refused valid work, also runs it, following the lesson rule.
- **Source:** [`skills/seed-issue/SKILL.md`](../../skills/seed-issue/SKILL.md)

## broadcast-issue

- **Result:** one plain-language Discord update for a completed standalone issue or epic, sent to the targets in `broadcast.discord.webhook_env`.
- **When to use:** right after `issue complete` or `epic complete`.
- **Who starts it:** the command, prompting the merged leaf's seat B.
- **Source:** [`skills/broadcast-issue/SKILL.md`](../../skills/broadcast-issue/SKILL.md)

## init-akrogon

- **Result:** a proposed lifecycle configuration for a repository (checks, merge checks, grounding index and more), and an optional test toolkit, then the repository initialized through the `akrogon` command.
- **When to use:** you are setting up a repository for akrogon, or reviewing its setup again.
- **Who starts it:** you. It runs outside any leaf.
- **Source:** [`skills/init-akrogon/SKILL.md`](../../skills/init-akrogon/SKILL.md)

## watch-issues

- **Result:** a timer terminal that checks every open leaf of one repo every 20 minutes through your agent. It moves waiting leaves on, recovers some failures, steers looping seats once and notifies you when a leaf needs you.
- **When to use:** you are stepping away and want open leaves to keep moving.
- **Who starts it:** you. It works in claude, codex, pi and agy. Use `watch-issues stop` to end it. It also ends on agent exit, terminal reuse, or a reset the harness shows. A compaction summary before a tick keeps it running. Stated limits: a prompt typed into the watcher terminal when a tick is due can receive the tick (claude/agy check inside that turn; codex drops the prompt's task); a shell-launched agent exiting right as a tick goes out can leave the tick in the shell, with or without a held draft. See the reset and held-draft limits in [Watch while away](../use/watch-while-away.md#stop-the-watch).
- **Source:** [`skills/watch-issues/SKILL.md`](../../skills/watch-issues/SKILL.md)

## learn-issues

- **Result:** each active lesson in `learnings/LESSONS.md` sorted as stopped, checkable, removal, transfer or stays. Stopped lines are removed, transfers are prepared for your approval, and checkable ones get a printed `/seed-issue` line you can choose to run. A removal is a check that refused valid work, and it gets a printed `/seed-issue` line naming that check for removal. All edits stay uncommitted for you to review.
- **When to use:** the lesson list has grown and you want to clear what no longer applies.
- **Who starts it:** you. It is operator-invoked only.
- **Source:** [`skills/learn-issues/SKILL.md`](../../skills/learn-issues/SKILL.md)
