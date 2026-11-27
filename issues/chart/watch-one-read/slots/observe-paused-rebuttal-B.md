# Rebuttal and final-shape check, slot B

Three concrete disagreements / build-or-proof gaps:

1. **Paid paused-due proof can pass vacuously or collide with 3-attempt failure (`observe-paused-proposed.md` item 6).**
   - *Fact & evidence:* `tests/e2e/watch-live.e2e.ts` (`watch live cell: a real harness in the tier`) currently stages one leaf (`watch-live-leaf`, slot A = `fake --model idle`) before `startCell` and never calls `pause`. In `src/next.ts` (`dispatchSlot`), three silent stops of `fake --model idle` move a leaf to `phase=failed`. Unlike `watch-hook.sh`, a real model follows `skills/watch-issues/SKILL.md` (`Judge`) and only invokes `akrogon next` for an eligible waiting leaf.
   - *Consequence if built as written:* If the paused due runs on an empty board (before staging the leaf) or after `watch-live-leaf` has already transitioned to `phase=failed` across start + earlier dues, "no `next` at a paused due" is vacuously true — a model ignoring `paused=true` would still run zero `next`. The paid test must have an eligible waiting (unseated `plan.synthesis`) leaf present on disk during the paused due so `paused=true` is what actually suppresses `next`.

2. **Free empty-then-staged and error-path proofs fail to test `observe.ts` if `watch-hook.sh` / `watch-agent.sh` keep their current branching (`observe-paused-proposed.md` item 5).**
   - *Fact & evidence:* `tests/fixtures/watch-hook.sh` and `tests/fixtures/watch-agent.sh` currently run `akrogon next --all` on every check whose output does not match `*paused*`, regardless of exit code or whether any open leaf exists.
   - *Consequence if built as written:*
     - A port that only skips acting on `*paused=true*` falls through to `akrogon next --all` when `observe.ts` exits non-zero with empty stdout (malformed `paused.yaml`), violating `S2a`. Both scripts must require exit `0` AND `paused=false`.
     - If `watch-hook.sh` still calls `akrogon next --all` when `observe.ts` prints no `slug=` lines, the new free case ("a leaf staged after an empty check is acted on at the next due") calls `next --all` on the empty check too and never exercises leaf discovery via `observe.ts`. Requiring at least one `slug=` line before calling `next --all` makes the empty-then-staged case real (and still preserves `tests/e2e/watch-live.e2e.ts` `watch standin cell`'s post-unpause `call next` check because `watch-live-leaf` remains under `issues/open`).

3. **Minor factual inaccuracy in `observe-paused-merged.md` (`Intake corrections`).**
   - *Fact & evidence:* Merged notes claim `"the run-line block and nags still show other repos"` when `akrogon status` runs at a registered root. In `src/status.ts` (`statusCommand`), `scans` is filtered to `current.name` when `current !== null`, and `Unpacked:`, `Slow merge:`, `Failed:`, and `Missing:` nags all iterate over `scans` (single-repo). Only `lineRuns()` (`run line (one queue per repo)`) shows other repos at a registered root.
   - *Consequence:* Copying that line into `CHART.md` or `brief.md` records an inaccurate statement about `src/status.ts`.
