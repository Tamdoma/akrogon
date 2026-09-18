# Chart: akrogon status --charts shows a terminal stage for charts that will never hand off

## Destination
`akrogon status --charts` prints a terminal stage for a chart whose work ended without handoff, so `charting` means open work only. The chart-issues skill, which writes the markers, defines them.

## Forks taken
- [Terminal chart disposition](forks/terminal-stage.md): two stages `closed` and `held`; last marker line in the file wins; the door agent normalizes the two existing framework records itself at handoff.

## Fog
None.

## Off route
- Editing the two existing framework CHART.md records inside a leaf. `skills/chart-issues/assets/shapes.md:163` refuses a leaf whose owned surfaces touch any path under `issues/`; both records are under `issues/`. Any normalization is an operator step on main. (B, R1)
- Inferring disposition from arbitrary CHART.md or fork prose. The live held fork lists both "hold" and "hand off" as options, so prose cannot distinguish a decision from a quoted option. (B)
- Chart metadata files or a CLI setter. Charts are defined as Markdown with no lifecycle state (shapes.md:15); adding a writing surface exceeds the report.

## Territory findings
- Stage is derived in `src/status.ts:247`: a line matching `^Handed off\b` gives `handed off`, otherwise any fork file or counted fog gives `charting`, otherwise `empty`. Taken forks still count as files (`src/status.ts:238-248`).
- `section()` (`src/status.ts:228-235`) counts `## Fog` bullets and drops `none`/`nothing`; it is not semantic.
- Both chart layouts, single and multi, enter the same reader (`src/status.ts:251-261`).
- The marker producer is this repo's skill: `skills/chart-issues/SKILL.md:57` and `skills/chart-issues/assets/shapes.md:33` define only `Handed off <date>`. A reader-only change leaves future charts undeclared. (both)
- The live closed example carries a `Closed <date>` line; the live held example carries no marker at all, only prose in `forks/disposition.md:16-18`. (B)
- Existing chart tests cover handed-off and blank charts at `tests/status.test.ts:460-482`. (B)
- The AGE column is CHART.md mtime, so writing a marker resets it. Accepted, not a defect. (A)

Handed off 2026-09-18
