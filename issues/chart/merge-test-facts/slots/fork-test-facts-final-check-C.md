# Final-shape check: slot C, chart merge-test-facts, fork test-facts (round 1)

Target: `issues/chart/merge-test-facts/slots/fork-test-facts-final-shape.md` (2026-11-25).

## Defect 1 — Item 5 (`Join`): false recovery claim ("a later attempt that joins a live pass is recoverable by tree")

- **Contradiction:** Item 5 states that `samePass` remains unchanged and claims: *"a later attempt that joins a live pass is recoverable by tree."* That claim contradicts the actual attempt record schema and write path:
  - `src/attempts.ts` (`attemptRecordSchema`, read 2026-11-25): `merge-attempts.jsonl` rows carry `attempt`, `repo`, `holder`, `built_on`, `tested_top?`, `outcome`, `start?`, `end`, `pressure?`, `tools?`. There is **no `tree` field** and **no `top` field** (`built_on` is the base commit on main, whose tree is not the stacked merge tree).
  - `src/phase.ts` (`recordTested`, `landGates`) and `src/land.ts` (`landAttempt`, `repairExit`, read 2026-11-25): `tested_top` is written only by `recordTested` inside `landGates`, which runs only after `verify()` exits green (or passes `mainRedCover`). On a red verify exit, `landAttempt` takes `repairExit` before `landGates`, leaving `tested_top` absent.
  - Measured fact (2026-11-25, `/home/ivan/Work/infra/tamdoma/framework/issues/merge-attempts.jsonl`): 91 of 92 red attempts since 2026-11-21 have no `tested_top`.
- **Consequence if built as written:** If a later attempt joins a live pass launched without an attempt (or by a prior crashed attempt) and that pass finishes **red**, the joining attempt's `merge-attempts.jsonl` row holds no `tree`, no `top`, and no `tested_top`, while the `verify-runs.jsonl` row carries the launcher's `attempt` (or none). After leaf close, recovery "by tree" from the surviving ledgers is impossible; a consumer or test relying on Item 5's contract fails on red joined passes, leaving them unjoinable except by leaf + time window (against the `#154` join outcome in `forks/test-facts.md` `### Carries` for that case).
- **Fix:** Either correct Item 5's stated limit to say only a joined **green** pass is recoverable via `tested_top` sha while a joined **red** pass has no tree/sha key on the attempt row (recoverable only by leaf + window), or include `caller.attempt` in `samePass` so an attempt does not join a pass launched under a different or absent attempt.

No other defects found in items 1–4, 6, or 7 (prior disagreements on K, rerun-leg placement, and `samePass` remain recorded as dissent in `fork-test-facts-rebuttal-C.md`).
