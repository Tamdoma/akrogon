# Brief: remove-plan-debate

## What

Remove the lifecycle planning debate from akrogon. Leaf planning always runs as slot A direct synthesis at `plan.synthesis`. Deleted: the `plan.positions` and `plan.rebuttal` phases, their routes and guards, the `debate` state field, the repo `rebuttal` setting, the plan-issue debate sections, check-issue's debate-artifact read, and the chart door's debate election at the handoff review. Old records keep loading: `readState` and `readRepo` drop a legacy `debate` or `rebuttal` key before the strict parse, and history logs naming the retired phases keep parsing. Every current skill and doc that describes the lifecycle debate is updated in the same leaf. The chart-level consultant exchange (blind notes, merge, rebuttal during charting) is unchanged.

## Why

Debate was chosen on 21 of 1,058 leaves (2%) across all 11 registered repos, with no detectable effect on review Fix rates. Charting already gives every brief and design a multi-model review before handoff. The phases, the field, the setting and the door question are maintained surface with no current use.

## Done-criteria

1. A leaf `state.yaml` that still carries `debate: 'no'` or `debate: 'yes'` loads through `readState`, and a repo `issues/config.yaml` that still carries `rebuttal: true` or `rebuttal: false` loads through `readRepo` and through the config parse `akrogon init` applies to a proposal or an existing config (B,C,D); the loaded `State` and `RepoConfig` have no `debate` or `rebuttal` property, and an unrelated unknown key in either file is still refused.
2. A `state.yaml` written without `debate` loads, and `saveState` of a state loaded from a file with `debate` writes a file without it.
3. `issues/log.jsonl` lines and `issues/timings.jsonl` events whose phase fields name `plan.positions` or `plan.rebuttal`, and a failed state whose `failure.phase` names one, still parse, and the timing report over such lines completes and counts a completed retired-phase visit as an A+B visit without consulting live routing (B,C,D); a `state.yaml` whose `phase` is `plan.positions` or `plan.rebuttal` is refused as invalid, and `akrogon phase <slug> plan.positions` and `akrogon phase <slug> plan.rebuttal` are refused.
4. A leaf at `plan.synthesis` is dispatched to slot A alone and moves to `implement` as today; no route leads into or out of the retired phases, including recovery from `failed`.
5. `skills/plan-issue/SKILL.md` describes only `plan.synthesis` as the planning pass, from the brief and design; `skills/check-issue/SKILL.md` no longer reads debate artifacts; `skills/chart-issues/SKILL.md` and `assets/shapes.md` ask no debate question, offer the route as lifecycle or direct, record `Route: <lifecycle | direct>`, and their `state.yaml` template has no `debate` key and starts at `plan.synthesis`; `skills/init-akrogon/SKILL.md` writes no `rebuttal` key; `skills/watch-issues/SKILL.md` lists no retired phase.
6. No current doc under `docs/` describes the lifecycle debate, the `debate` field, the `rebuttal` setting or the retired phases as an available option, including `docs/pictures/phases.svg` and `docs/use/a-working-day.md` (D); `docs/use/roll-back-a-release.md` states that records created or saved without `debate` need `debate: 'no'` restored before the previous release can load them (B); docs and pictures of the chart-level consultant rebuttal are unchanged.
