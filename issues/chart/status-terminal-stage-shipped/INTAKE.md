# Intake: status-terminal-stage-shipped

## Scope
`akrogon status --charts` shows a terminal stage for charts that closed or were held without handoff. Already shipped; this chart records provenance so #15 is not re-imported.

## Provenance
- GitHub: Tamdoma/akrogon#15
- Operator: chart-issues door 2026-09-18, "pull recent 3 issues, use slot B"

## Source: Tamdoma/akrogon#15
# status --charts labels held or closed charts as "charting" indefinitely

Source: Tamdoma/akrogon#15
URL: https://github.com/Tamdoma/akrogon/issues/15

Unverified intake.

## Observation
`akrogon status --charts` shows two charts as `charting` that will never hand off. Stage is derived at `src/status.ts:247`: a line matching `^Handed off\b` in CHART.md gives `handed off`, otherwise any forks or fog gives `charting`, otherwise `empty`. A chart that records a terminal outcome other than handoff keeps its forks and so displays as `charting` forever.

Two cases in the framework repo (`/home/ivan/Work/infra/tamdoma/framework`):
- `issues/chart/legacy-lifecycle-residue/CHART.md` records `Closed 2026-09-12: all sources dropped, nothing handed off.` Shows as `charting`, age 3d.
- `issues/chart/skill-lane-argument-kind/CHART.md` is held with no leaf (operator handed the fix to a fixer directly on 2026-09-15, recorded in `forks/disposition.md`). Shows as `charting`, age 1d.

## Location
akrogon CLI, `akrogon status --charts`, `src/status.ts:247`. Observed 2026-09-17 against the framework repo.

## Reproduction
Run `akrogon status --charts` in a registered repo whose CHART.md contains a `Closed <date>` line or a hold with no `Handed off` line. Every run.

## Expected behavior
A terminal stage (for example `closed` or `held`) for charts that will never hand off, so `charting` only means open work.

## Urgency
Low. Status output misreports finished charts as in-progress. Workaround: read CHART.md directly.

## Agent findings
- (both) Commit 2edea9c, closed leaf `issues/closed/chart-terminal-stage/terminal-stage-marker/`, changed `src/status.ts:247-251` to match `^(Handed off|Closed|Held)\b` with the last line winning. That leaf carries `sources: []`, so #15 was never attached to it.
- (both) Live run of `akrogon status --charts` in `/home/ivan/Work/infra/tamdoma/framework` on 2026-09-18: `legacy-lifecycle-residue` reads `closed`, `skill-lane-argument-kind` reads `held`. The two charts in the report already carry markers.
- (B) `bun test tests/status.test.ts -t 'charts derives stage'` passed, 8 assertions; `tests/status.test.ts:488-535` covers precedence, closed charts retaining forks, marker words inside bullets, and the single-chart layout.
