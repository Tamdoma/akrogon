# Brief: plan-not-cap

## What
The fix-round cap no longer sends a leaf to `failed`. A problem that keeps coming back is treated as a plan problem and corrected inside the leaf.

- A `check.fix` request from `check.repair` or `merge` moves to `check.fix` at any round count. The count still increments and still shows in `akrogon status`.
- In `check.repair`, when a Fix repeats an earlier round's problem, contradicts a plan decision, or needs a step the plan lacks, B hands it to A through `check.fix` as a plan correction. The handoff names the repeated problem, the contradicted decision or the missing step.
- In `check.fix`, A corrects `plan.md` for each named plan correction before changing code, and adds an executable check A runs for the corrected rule. The brief, the locked design and the test-change protections stay as they are.
- The `fix_rounds` key stays in the config schema and keeps bounding direct-route repairs.

Owned: `src/phase.ts` (the cap only, today `:357-362` and the `fix rounds exhausted` reason at `:376`) (B,C), its tests, `skills/check-issue/SKILL.md` (today `:93`), `skills/implement-issue/SKILL.md` (today `:42` and the check.fix section), `skills/init-akrogon/SKILL.md` (today `:26`), `docs/guide/phases.md` (today `:76`, `:108`), `docs/guide/setup.md` (today `:60`).

## Why
Tamdoma/akrogon#82, #83, #85: leaf-env-file hit the cap with plan rule D3 still false, because each round patched code against the false rule; recovery at the cap was refused 28 seconds later, against the docs. Five of the night's failed moves came from the cap. The operator chose to remove the cap failure and send repeated problems back to the plan (chart night-flow, fork stop-rules, S2).

## Done-criteria
1. `akrogon phase <slug> check.fix --slot B` from `check.repair`, and the merge eject to `check.fix` (`--culprit`), move the leaf to `check.fix` when `fix_rounds` is at or above the configured value, and the recorded count goes up by one. No path through the cap reaches `failed`.
2. A repo config with `fix_rounds` still parses, and the direct-route repair bound in `skills/chart-issues/SKILL.md` is unchanged.
3. `skills/check-issue/SKILL.md` tells B to hand a repeated problem, a contradicted plan decision or a missing plan step to A as a named plan correction. `skills/implement-issue/SKILL.md` tells A to correct `plan.md` for it with an executable check before code changes, keeping brief, locked design and test-change protections.
4. `docs/guide/phases.md`, `docs/guide/setup.md`, `skills/init-akrogon/SKILL.md`, `skills/check-issue/SKILL.md` and `skills/implement-issue/SKILL.md` describe no failure at a repair cap and no "final allowed repair round". A sweep of `skills/` and `docs/` by meaning finds none; hits outside scope are listed in the report.
