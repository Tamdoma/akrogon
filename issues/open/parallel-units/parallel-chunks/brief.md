# Brief: parallel-chunks

## What
When B delegates a leaf pass to workers, it runs up to 3 chunks at once whose prerequisites have landed and whose edits and verification are independent. Each worker gets its own detached worktree at `<lane>/<worktree_root>/<slug>-u<N>` (B, C). B commits pending lane edits before each wave, when there are any (B), and cherry-picks worker commits back one at a time. Dependent or uncertain chunks still run one at a time. Inline and standalone modes do not change.

## Why
Implement is the longest phase because B spawns one worker, waits, then spawns the next (Tamdoma/akrogon#31). content-batch spent 159 of 189 parent minutes in `subagent_wait`. A simulation on real leaves estimates 392→151 minutes (content-batch) and 368→201 (plan-script) at 3 at once, and no gain on chained leaves (`issues/chart/parallel-units/slots/cap-C.md`).

## Done-criteria
1. `skills/implement-issue/SKILL.md`, `worker-protocol.md` and `brief-template.md` state the wave rule, cap 3, the section-4 record, checkpoint-then-cherry-pick return, the worker worktree path, conflict handling, crash resume, and the cleanup order: each landed worktree is removed after its lane changed tests, and all are gone before the full suite, checks and `akrogon phase` (B). Nothing in them still says leaf workers run sequentially in one worktree.
2. `docs/guide/phases.md:87` and `skills/AREA.md:21` describe the same rule.
3. A temporary scenario script in a temp git repo, deleted after the run and never added under `tests/` (C), runs the protocol's literal git steps and ends with `git status --porcelain` empty on the lane. The steps are: lane with uncommitted edits → checkpoint commit → two `git worktree add --detach issues/worktrees/<slug>-u<N>` under the default root → one commit in each → serial `git cherry-pick` → `git worktree remove`. It also covers a conflicting pair: `cherry-pick --abort` leaves the lane clean, and the conflicting worker worktree is kept so its commit stays reachable (C). The transcript is recorded in `implementation/report.md`.
4. `bun run format`, `bun run typecheck` and `bun test` pass.
