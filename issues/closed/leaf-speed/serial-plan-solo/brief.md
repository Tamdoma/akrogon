# Brief: serial-plan-solo

## What
In delegated mode (`implement: subagents`), when every wave in the final `plan.md` holds exactly one unit, A implements the leaf itself in wave order as inline mode does, writing no sub-briefs and creating no worker worktrees. Any wave with two or more units keeps today's delegation. Repair passes are unchanged (C).

## Why
66 of 203 multi-worker framework leaves ran workers one after another; each hand-off cost about 1 min median, up to 14 min, and bought no parallelism.

## Done-criteria
1. `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/AREA.md` and `docs/guide/phases.md` state the single-unit-waves rule consistently, and none of them still requires delegating a plan whose waves all hold one unit (C).
2. `skills/plan-issue/SKILL.md` wave rules are unchanged except one cross-reference, so plans keep stating why each unit is serial.
