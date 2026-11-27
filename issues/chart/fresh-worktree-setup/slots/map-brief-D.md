# Map brief, slot D: fresh-worktree-setup

You are slot D, a consultant to the chart door (slot A, hc terminal t126). This is a blind exchange: write your own territory map. Do not read any other slot's map file under /home/ivan/Work/infra/akrogon/issues/chart/fresh-worktree-setup/slots/ (map-A.md, map-B.md, map-C.md, map-D.md) until this exchange ends.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. You still choose your own evidence and may locate other needed sections under the same rule.

## What this chart is

Tamdoma/akrogon#158. A new akrogon leaf worktree has no `node_modules`, because the repo's configured `setup` (for example `bun install --frozen-lockfile --backend=copyfile`) runs only around configured checks. A repo whose agent hooks import its own dependencies (the framework repo's PreToolUse Skill hook) then blocks the seat's first tool call, and the dispatched `plan-issue` prompt fails until the seat installs packages itself. The chart must make "the configured `setup` has run in the worktree" true before a seat works in it.

## Inputs

- Intake (source verbatim, findings): /home/ivan/Work/infra/akrogon/issues/chart/fresh-worktree-setup/INTAKE.md
- Locks, never re-argued: session signposts (A's picks), /home/ivan/Work/infra/akrogon/issues/chart/fresh-worktree-setup/forks/signposts.md, section `## Taken` (fix the mechanism, free tests at the real boundary, extend existing records, one leaf unless a part is useful alone, old records keep parsing).
- Lesson to retire if the fix stops it on every path: /home/ivan/Work/infra/akrogon/learnings/history/2026-11-25-fresh-worktree-skips-setup.md and its line in /home/ivan/Work/infra/akrogon/learnings/LESSONS.md.
- Live surfaces: /home/ivan/Work/infra/akrogon/src/next.ts (ensureWorktree, createSparseWorktree, dispatchLeaf, dispatchSlot), /home/ivan/Work/infra/akrogon/src/config.ts (setupCommand, withSetup, the repo config `setup` key), /home/ivan/Work/infra/akrogon/src/run-check.ts and /home/ivan/Work/infra/akrogon/src/verify.ts (where `setup` runs today), /home/ivan/Work/infra/akrogon/src/seat.ts (startSeat), /home/ivan/Work/infra/akrogon/src/land.ts and the restack/rebase paths that change a worktree's lockfile, /home/ivan/Work/infra/akrogon/src/reconcile.ts, and `akrogon guard own-modules` (src/guard*.ts). Repo configs: `akrogon config` and each registered repo's `issues/config.yaml`.

## Task

Write a proportional territory map:

1. The material forks, each with options and what each option could break or invite later (not only now). At least: when `setup` runs (worktree creation only, every seat start, after every rebase or restack that can change the lockfile, or on demand), where it runs (inside the home `.lock` or outside it, inside a run-check scope or plain, with which env), and what a failed or slow `setup` does to dispatch (the leaf, the pass, other leaves).
2. Practitioner questions and pitfalls over the work's lifetime, grounded in inspected files (path and function) or primary docs (URL and date read). Mark model knowledge as such with the searches that found nothing stronger.
3. Your recommended direction and its cost, how a free test at the real boundary proves it, and what you would ask that the intake does not settle.

Free observations are welcome: throwaway repos, worktrees and dirs you create yourself, cleaned up after. Never signal, move or stop a process or terminal you did not create, and change no file outside your return path. Record each observation with command, version, date, result, cleanup and limits.

## Return

Write your map to /home/ivan/Work/infra/akrogon/issues/chart/fresh-worktree-setup/slots/map-D.md, then run:

```bash
hc send t126 "done D: /home/ivan/Work/infra/akrogon/issues/chart/fresh-worktree-setup/slots/map-D.md"
```
