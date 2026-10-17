# Implementation report: autopilot-mode

Serial-solo run (one wave, one unit in plan.md); A implemented the plan itself, no workers, no sub-briefs.

## Refresh history

- First pass: rebased `f7baddc` → `23bce8b` (`add issues`, chart record files only; no overlap), head `c682bd2`. `akrogon verify` red on `tests/timing-report.test.ts` "flow report: parked-carried..." (`oldest <= 5` received `6` — `src/timing-report.ts` computes backlog age from `Date.now()`, the fixed-date fixture broke on 2026-10-17). Proven identical on a scratch worktree at base `23bce8b`; recorded as operator blocker and pass ended `failed`.
- Second pass: operator landed `0dfae20` on main fixing the fixture (`timing-report backlog ages follow the clock, not fixed bounds`). Rebased `23bce8b` → `0dfae20`, clean, head `825fb5d`.
- Base: `0dfae200ae84fc46f10e0d07973c78721cf5d7c9`. Head: `825fb5d7d808e91b39ed7ea0647a93e3ae059964` (`chart-issues: operator-switched autopilot mode for chart doors`).

## Changed files

- `skills/chart-issues/SKILL.md`: new `## Autopilot` section (switch-on, answering, waits/limits, route, scope, consultants, off/resume, record); "attended door" → attended by default; Open first-reply, Drain and Handoff-review pointers to the section; autopilot added to the direct-route refusal list.
- `skills/chart-issues/assets/questions.md`: autopilot exception after "Recommendations and silence cannot supply an operator answer"; budget idle/done + `signal: unproven` gets one more full wait before a drop under autopilot; `failure`/`blocked`/non-zero exit drops the consultant instead of ending A's turn under autopilot.
- `skills/chart-issues/assets/shapes.md`: CHART.md shape gains `## Mode record` (`- mode` lines) and `## Autopilot` (ordered `- ` items, breaches first); prose states every record line is a list item and observed-states-only; fork `## Taken` and the preflight refusal accept an A answer under autopilot with approvals still operator-only.
- `docs/guide/chart.md`: new `## Autopilot` section — switch on/off, what waits for the operator, where the record lives, the wrong-pick-merges cost, the no-two-doors rule, the supervised first run, link to `SKILL.md#autopilot`.

## Proof results (all on head 825fb5d)

- C8 record shape (marker safety): `akrogon run-check --name autopilot-record-shape -- awk '...' skills/chart-issues/assets/shapes.md`. Red before the edit (first pass: `check autopilot-record-shape: 1`), green on head (`check autopilot-record-shape: 0`, log `check-autopilot-record-shape-1792224706186-860052.log`). Fails if `## Autopilot` is absent from the CHART.md block or any record line is not a `- ` item.
- C1–C7 skill/questions/shapes text (prose read, smallest real boundary): `sed -n '/^## Autopilot/,/^## Printed footer/p' skills/chart-issues/SKILL.md` plus `grep -n` on questions.md/shapes.md shows all required rules: herdr-only switch-on with echo and best-guess needs list, verbatim INTAKE words and mode line, A-answers exception with the named values and approvals operator-only, the five waits, lifecycle-only route, handed-list scope with overlap holds, consultant-drop rules including the budget rewait, off/resume with latest-entry mode record, record/section/footer rules.
- C9 guide: `sed -n '/^## Autopilot/,/^## /p' docs/guide/chart.md` shows the six required explanations; the `[chart-issues](../../skills/chart-issues/SKILL.md#autopilot)` link resolves under docs-links (below).
- Existing gates: `akrogon run-check --name chart-shapes -- bun test tests/chart-shapes.test.ts tests/docs-links.test.ts` → 7 pass 0 fail (`check chart-shapes: 0`, log `check-chart-shapes-1792224706338-860151.log`). Proves the `#autopilot` anchor resolves from the guide and the untouched `### readiness.yaml` block still parses.
- Retry on new head: `akrogon run-check --name timing-report -- bun test tests/timing-report.test.ts` → 14 pass 0 fail (`check timing-report: 0`, log `check-timing-report-1792224698149-853575.log`).
- C10 diff scope: `git --no-pager diff --name-only 0dfae20...HEAD` → exactly `docs/guide/chart.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`.
- `akrogon verify` on head 825fb5d: format, test (993 pass 0 fail, log `check-test-1792224908072-860827.log`), typecheck — `verify leaf 825fb5d...: green`.

## Wall time

- `akrogon verify`: ~3.5 min (test segment 197.81s).
- `bun test tests/timing-report.test.ts` (run-check): 0.2s.
- `bun test tests/chart-shapes.test.ts tests/docs-links.test.ts` (run-check): 0.06s.

## Known limitations

- Prose criteria are proven by the agent read of the emitted text plus the mechanical marker/link gates, per the plan; no wording-asserting tests exist by design.
- The earlier `verify` red was a calendar-dependent fixture on main, repaired there by `0dfae20`, not by this leaf.
