# Review A: autopilot-mode

Initial blind review of the whole diff. Base `0dfae200ae84fc46f10e0d07973c78721cf5d7c9`, reviewed head `825fb5d7d808e91b39ed7ea0647a93e3ae059964`. Diff is exactly the four owned files (criterion 10 holds): `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`. No test files touched, so no `Test-Change:` trailers are due.

## Evidence checked

- Every binding decision in design.md traced into the diff: switch-on words/herdr-only/echo/needs list/verbatim INTAKE/mode line (criterion 1); A-answers with the five named values, Taken-as-A's, the questions.md exception, fork Taken and preflight acceptance with approvals operator-only (criterion 2); the five waits, checks still stopping handoff, self-modification hold, never-self-switch bound (criterion 3); lifecycle-only route plus the new direct-route refusal bullet (criterion 4); handed-list drain, full-seed-match confirmation vs record-only classes, the four overlap holds, simultaneous-start limit, failed-leaf charting (criterion 5); consultant drops for `failure`/`blocked`/herdr refusal/`budget` idle-done unproven after one more wait, late returns ignored, working budgets rerun, own-call repair, peer-seat skip, own charts exempt (criterion 6); end markers, waiting-chart persistence, early-off only in door pane, mode record latest-entry governs, compaction vs replacement session, off-then-collect-peer (criterion 7); mode record + `## Autopilot` section shape in the locked item order, list-item-only lines, observed-states-only, pass-end line, "handed off" footer with pause, no score (criterion 8); guide section covers all six required explanations (criterion 9).
- `src/status.ts` `lastStage` (`^(Handed off|Closed|Held)\b`): every template record line starts `- `, so no record line can end or reopen a chart. The `## Mode record` and `## Autopilot` headings likewise cannot match.
- `akrogon verify` green on head 825fb5d (993 pass; report cites `check-test-1792224908072-860827.log`). `chart-shapes`/`docs-links` 7/7 pass — the `#autopilot` guide link resolves and the untouched `### readiness.yaml` example still parses. Marker-safety awk green (`check-autopilot-record-shape: 0`).
- Grep audit of the four files for `operator answer`, `attended`, `reported to the operator`, `ends its turn`: remaining hits are either the intended exceptions, approvals correctly left operator-only, or generic wording covered by the canonical section. No contradicting site left.
- Docs check: README, `docs/guide/*`, `docs/reference-index.md` describe chart-issues generically ("resolve open decisions and write leaf contracts") — nothing claims attended-only operation that this diff makes stale. No AREA.md in the diff.
- Report vs plan: all planned proofs ran on the final head after the rebase; the earlier timing-report red was a base-side calendar fixture fixed by `0dfae20`, verified identical on a scratch worktree at `23bce8b`.

## Findings

### Nit N1 — questions.md budget sentence reads as an unconditional drop

`skills/chart-issues/assets/questions.md`: "under autopilot that outcome instead gets one more full wait before the consultant is dropped per `SKILL.md` `## Autopilot`". Read literally, the consultant is dropped after the extra wait regardless of the second wait's outcome; the design and SKILL.md's own wording make the drop conditional on the idle/done+unproven outcome *repeating* ("repeats after one more full wait"). Consequence if misread: a door drops a healthy consultant whose return arrives during the second wait. Deferred: the sentence ends "per `SKILL.md` `## Autopilot`" and that section is unambiguous, so a door reading the referenced rules drops correctly; promotion evidence is an observed autopilot drop after a completed second wait.

### Nit N2 — conditional template sections lack the inline guard `## Direct attempt` uses

`skills/chart-issues/assets/shapes.md` CHART.md block: `## Mode record` and `## Autopilot` are written only under autopilot, but unlike `## Direct attempt` — whose first placeholder line says "only on the direct route" — they carry no inline condition; the guard lives in the prose after the block ("Under autopilot the CHART.md carries..."). Consequence if misread: a door copying the template literally writes autopilot record sections into an attended chart. Deferred: the prose one line below the block states the condition and every other section's placeholders are likewise replaced rather than copied; promotion evidence is an attended CHART.md emitted with the two sections.

## Verdict

`nits` — no Fix clears the bar: every criterion's required text exists, the marker/link/scope mechanics check out, and both findings are wording-level with the correct rule reachable one reference away.
