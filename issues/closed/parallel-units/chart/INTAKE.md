# Intake: parallel-units

## Scope
Run a leaf's independent implement units at the same time (akrogon implement skill). The pi-extensions concurrency half is seeded separately as Tamdoma/pi-extensions#4.

## Provenance
- GitHub: Tamdoma/akrogon#31
- Operator: 2026-09-27 session ("The parallel chunks", "This is just for chunking, limit yourself to that issue", "Yes, i want to keep them max", "Use slot b and c consultants as well.", "If not, seed it there with details. Simple easiest change. Remember, we use pi most of the time as slot b in the lifecycle")

## Source: Tamdoma/akrogon#31
# Implement seat runs independent units one at a time, so implement takes hours

Source: Tamdoma/akrogon#31
URL: https://github.com/Tamdoma/akrogon/issues/31

Unverified intake.

## Observation
Implement phases in the framework repo take hours, and nearly all of that time is model generation run one unit at a time. `plan-script` spent about 6.5h in implement (294-line plan, 38 steps, 462 files changed). `content-batch` and `satellite-build` were each past 3.5h in implement on 2026-09-27.

Timing from the `content-batch` pi sessions (`~/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-content-batch--/`):
- Parent session: 189m span. 30m model time, 159m waiting in `subagent_wait`.
- Seven child sessions of 11-45m each. Almost 100% model time (15-40s per turn, 34-97 turns, 30k-104k output tokens each). Tool calls finish in seconds.
- The parent runs strict spawn-then-wait pairs: `subagent_spawn {cwd: <leaf worktree>, task: "Implement leaf unit N ..."}` then `subagent_wait {ids: ["sa-N"]}` for units 1 to 7. Every wait lists one id, and every child shares the same worktree `cwd`.
- Seats run `muse-spark-1.3-contributor --thinking max`.

Two places make it one at a time:
- akrogon (this repo, HEAD 9aaadd3):
  - `skills/implement-issue/SKILL.md:3` describes "sequential workers or configured inline execution".
  - `skills/implement-issue/SKILL.md:37` says "delegate each to a subagent sequentially in this worktree".
  - `skills/implement-issue/worker-protocol.md:11` says "Workers execute sequentially in one worktree".
  - The only option is `implement: subagents | inline`.
  - The rule traces to `issues/closed/akrogon-loop/bootstrap/core-skills/plan.md:52`.
- pi-extensions (Tamdoma/pi-extensions, `tamdoma-subagents`). This also needs a change there.
  - `manager.ts:289` hard-codes `concurrency = 1`.
  - `manager.ts:327-331` throws for any value other than 1.
  - `/subagents concurrency <n>` (`ui.ts:1624-1630`) advertises `<1-8>` but calls the same setter.
  - Extra spawns stay `queued` (`manager.ts:1209-1238`).
  - Children have no filesystem isolation: "These controls coordinate work. They are not a filesystem sandbox" (`README.md:78`).
  - Closed pi-extensions issues treat raising concurrency as out of scope (`issues/closed/subagent-admission-stall/chart/CHART.md:18,22`).

Related prior design, not wired into akrogon: the older pi lifecycle scripts at `~/.pi/agent/extensions/issues/.scripts/lifecycle/` include `packet-parallel-policy.ts` and `packet-scratch-worktree.ts`.
- They run at most 2 packets together, and only when their edit paths are provably separate.
- They serialize on overlapping paths, declared dependencies or unlisted paths.
- Each child gets its own scratch worktree, and its changes merge back as a patch.

## Location
akrogon implement phase (`skills/implement-issue`) and the pi `tamdoma-subagents` extension (Tamdoma/pi-extensions) it delegates through.

## Reproduction
1. Dispatch a leaf whose plan has several units into implement with `implement: subagents`.
2. Watch the seat pane: "subagents Done:N Working:1" throughout. Session logs show one `subagent_spawn` followed by `subagent_wait` on that single id, repeated per unit.
Every implement phase observed.

## Expected behavior
When units in a leaf's plan are independent, the implement seat runs them at the same time instead of one after another, without children overwriting each other's work in the shared worktree. Units that depend on each other still run in order. This needs changes in both akrogon (implement skill) and pi-extensions (subagent concurrency and per-child isolation).

## Urgency
Medium. Implement is the longest phase, and the leaf graph is serial behind it: in the satellite-network-simplify epic, 6 leaves waited on `content-batch` and `satellite-build`, and total remaining time was estimated at 10-16h. Workaround: none for parallelism. Lowering thinking level or using a faster model shortens each unit but not the serial chain.

## Source: operator 2026-09-27
The parallel chunks

Yes, i want to keep them max

This is just for chunking, limit yourself to that issue

Use slot b and c consultants as well.

Also see if pi-extensions workspace needs to be seeded

If not, seed it there with details. Simple easiest change. Remember, we use pi most of the time as slot b in the lifecycle

## Agent findings
See slots/map-merged.md.
