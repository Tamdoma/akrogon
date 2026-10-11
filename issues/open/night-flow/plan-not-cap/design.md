# Design: plan-not-cap

## Binding decisions, verbatim

From `issues/chart/night-flow/forks/stop-rules.md`, Taken. Operator, 2026-10-11, on the simplified round: "1a | 2a | 3a |"

S2 plan-not-cap (2a)
- Removes only the round-cap path (`src/phase.ts:308-313,327`) (C). Other automatic failed exits (`src/next.ts:560-578`, skill-ordered stops) go to the next fork (B F4 held there).
- B names the repeated problem, the contradicted decision, or a missing plan step, and hands it to A through check.fix; A corrects `plan.md` with an executable check A runs, preserving brief, locked design and test-change protections (`src/phase.ts:282-284`) (B F3). "Executable check" is the shape's addition to the operator's words (C).
- `fix_rounds` key stays parsed (strict schema `src/config.ts:38-45`, framework config sets it) (C) and keeps bounding direct-route repairs (`skills/chart-issues/SKILL.md:117`) (B F5). State counter stays (`src/routing.ts:53-55`, status).
- Text: `docs/guide/phases.md:76,108`, `docs/guide/setup.md:60`, `skills/init-akrogon/SKILL.md:26`, `skills/check-issue/SKILL.md:93`, `skills/implement-issue/SKILL.md:42` (B,C).

Foreclosed: the repo-wide hold and `held.yaml`; raising `fix_rounds` as the fix; a per-check ancestor guard.

Current anchors on main `c53f619` (the Taken lines above are older): cap `src/phase.ts:357-362`, reason `:376`, test-change protections `:324-326`, counter `:156-159` (B,C).

Exclusions: seat-fault failed exits belong to `seat-retry`; the pre-merge red-on-base stop is already gone, removed by the merged `known-red-leaf`; the direct route's bound is unchanged.

`fix_rounds: 8` is on akrogon main (`issues/config.yaml:4`, `9ed8865`) and framework main (`c45d6693f`). Both repos have `direct` false, so after this leaf the value bounds nothing there and needs no revert (C F2).

## Standing design

`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf: criterion 1 is a CLI state move, proven in the `tests/phase.test.ts` style against a real temporary repo with `fix_rounds` set low, one case from `check.repair` and one from the merge eject to `check.fix`, plus one deliberate break restoring the cap and turning the test red. The merge case reaches the cap only through `transition(culpritLeaf, 'check.fix', ...)` (`src/phase.ts:1081`), so it needs a batch record and `--culprit` in the `tests/culprit.test.ts` style. The `--red-on-base` ending never calls `transition` and has no cap path (C F3). Criteria 3 and 4 are skill and doc text, proven by the report's sweep. No live run and no outside call.

## Leaf architecture

- `src/phase.ts`: `capped` goes; `destination` is committed as is, and the `fix rounds exhausted` failure reason goes. `fix_rounds` counting at `:156-159` and `requiredSlots` stay.
- `src/config.ts` schema and `issues/config.yaml` files are unchanged.
- Skill text: one rule in check-issue's check.repair section and one in implement-issue's check.fix section. The "final allowed repair round" overlap limit in implement-issue goes with the cap.
- Not in scope: a new cap, a new phase, automatic escalation, changes to the brief or design protections.
