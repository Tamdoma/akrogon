# Intake: drop-debate

## Scope

Destination akrogon. Remove the leaf planning debate (`plan.positions`, `plan.rebuttal`, the `debate` state field, the repo `rebuttal` setting) and the door's debate question at handoff review, and decide whether the handoff contract (brief.md, design.md) needs strengthening so slot A writes the best plan by direct synthesis.

## Provenance

- Operator: chart-issues door message, 2026-10-25

## Source: operator 2026-10-25

Take a look at how many times we actually went with the debate option during the planning synthesis. It seems like we don't even need this option at all, and I like to keep Akrogon lean. Use slot B (codex) and slot c (fable 5.1) as consultants. They're already active in this tab. Turn on slot D as well (pi meta muse wonder full contributor). I think we need to remove the planning debate question at the end and the planning debate in general. We're just not using it, and the entire planning is already done. Also take a look if we actually need to strengthen the handoff format to make sure the implementer during the lifecycle creates the best possible implementation plan.

## Agent findings

- Debate usage, counted 2026-10-25 from `debate:` in every `state.yaml` under each registered repo's `issues/`: 21 `yes` of 1,058 leaves (2%). akrogon 5/242, framework 13/688, boulevard-automation 2/23, blepsis 1/11, all others 0. 12 of the 13 framework `yes` leaves were last touched 2026-10-12 (one batch); the latest is framework `capture-transport/session-transport` (2026-10-24).
- Debate surface in code: `src/state.ts:87` (`debate` enum), `src/next.ts:923-927` (debate leaf must start at `plan.positions`), `src/routing.ts:28-29,42` (`plan.positions`, `plan.rebuttal` phases), `src/config.ts:43` and `src/phase.ts:342` (repo `rebuttal` setting), `skills/plan-issue/SKILL.md`, `skills/check-issue/SKILL.md:41,47`, `skills/chart-issues/SKILL.md` and `assets/shapes.md`, docs under `docs/`, tests (notably `tests/next.test.ts`).
