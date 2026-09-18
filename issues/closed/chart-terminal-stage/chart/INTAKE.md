# Intake: chart-terminal-stage

## Scope
One issue, one leaf, registered repo `akrogon`: the disposition marker contract in `skills/chart-issues/`, the reader in `src/status.ts`, and scenarios in `tests/status.test.ts`.

## Provenance
- GitHub: Tamdoma/akrogon#15

## Source: Tamdoma/akrogon#15
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
- The reported mechanism is confirmed at `src/status.ts:247`. There is exactly one terminal marker, `^Handed off\b`.
- The marker writer is the chart-issues skill in this repo (`skills/chart-issues/SKILL.md:57`), not the command. A command-only change produces no markers for future charts.
- The held framework chart has no marker line, so a reader change alone cannot correct that record.
