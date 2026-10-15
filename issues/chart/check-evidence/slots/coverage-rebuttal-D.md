# Log Coverage — Rebuttal (Slot D)

## Disagreements with evidence

1. **Q1 Evidence (`coverage-merged.md:16`, whether `akrogon flaky` reads `issues/chart/*/direct/check-*.log`)**:
   - `src/flaky.ts:20-35` iterates over every completed record in `issues/verify-runs.jsonl` and calls `failedTests(prior.log)` (`src/flaky.ts:35`).
   - `src/flaky.ts:11` checks `[recorded, recorded.replace('/issues/open/', '/issues/closed/')].find(existsSync)` — `recorded` itself is checked first, even when it does not contain `/issues/open/`.
   - Because `akrogon verify --holder <chart>/direct` (`src/verify.ts:95, 110, 146`) writes `VerifyRun` records with `commands[].log = ".../issues/chart/<chart>/direct/check-*.log"` into `issues/verify-runs.jsonl` (`7` records in `akrogon`, `1` in `framework`), `flaky` does read `issues/chart/*/direct/check-*.log` whenever a direct verify run flips red-to-green on the same tree.

2. **Q1 Option O2 (`coverage-merged.md:10`, C's claim that chart direct logs are "small (4.5 MB over six charts)")**:
   - Only 1 of those 6 charts (`merge-green-rate`) ran in `framework`, and that single `akrogon verify --holder` run wrote `1,812,494` bytes (`1.73 MiB`). A direct chart in `framework` that uses 2–3 repair or push-rebase rounds (`skills/chart-issues/SKILL.md:108, 110, 117`) writes `3.6–5.4 MiB` of plain logs per chart. Packing at chart end shrinks `framework`'s `direct/` logs `9.1x` (`1.73 MiB` -> `194 KiB`) and keeps one rule for all check logs.

3. **Q2 Boundary (`coverage-merged.md:32, 40, 55`, D-q2)**:
   - Forbidding hand-saved `*.log` files under `issues/` does not block any required non-check evidence: `skills/merge-issue/SKILL.md:55` requires `git range-diff` to be recorded *in `review-B.md`*, child-written non-log artifacts (Playwright `.zip` traces, screenshots, JSON) are not `*.log` files, and any probe or timed HTTP poll command runs cleanly through `akrogon run-check --name <label> -- <cmd>`. Allowing "supplemental" or "named non-check" `.log` files re-opens the loophole through which seats wrote `merge-range-diff-714ba80c.log`, `review-B-probes.log`, and `merge-verify-final.log`.

## D-trigger (max 3 lines)
- **Pick**: Trigger chart-end packing inside `chart-usage.ts` (when `CHART.md`'s last marker is `Closed`, `Held`, or `Handed off` per `src/status.ts:319`) plus a safety-net pass in `akrogon sync` (`src/sync.ts:154-165`) before `git add -- issues`.
- **Reason**: `skills/chart-issues/SKILL.md:85` already requires the door to run `chart-usage.ts` whenever it appends `Handed off`, `Held`, or `Closed`; putting the pack there and in `akrogon sync` enforces packing mechanically instead of relying on a prose step the door can forget (as `system-flow` left 18 loose logs).

## Q2a (max 3 lines)
- **Pick**: Yes — add a guard in `src/phase.ts` (on phase moves out of `implement`, `check.review`, `check.repair`, `check.fix`, and `merged --check`) and `direct-guards.ts` refusing any plain `*.log` under `<leaf>/` or `<chart>/direct/` outside `check-*.log`.
- **Reason**: Seats wrote `2,854` hand-saved `.log` files (`466.5 MiB`) across 8 ad-hoc folder names despite existing skill rules; a mechanical guard prevents regressions while `completeOwner` still packs `*.log` as a close-time catch-all for pre-existing open leaves.
