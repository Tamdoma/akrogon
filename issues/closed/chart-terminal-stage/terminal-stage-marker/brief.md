# Brief: terminal-stage-marker

## What
`akrogon status --charts` recognizes three terminal chart markers instead of one. A CHART.md line starting `Handed off`, `Closed` or `Held` declares the chart's disposition; the **last** such line in the file wins. Stage becomes `handed off`, `closed` or `held` accordingly. A chart with no marker line keeps today's behavior: `charting` when it has fork files or fog bullets, `empty` otherwise. The chart-issues skill, which is the only writer of these lines, defines all three markers and the last-wins rule.

## Why
`src/status.ts:247` recognizes only `^Handed off`. A chart whose work ended any other way keeps its fork files and therefore reads `charting` forever, so the column cannot be trusted to mean open work. Two live framework charts are in this state. Patching only the reader would leave future charts with no way to declare `closed` or `held`, because the writer contract in `skills/chart-issues/` defines no such line.

## Done-criteria
1. `chartRow` in `src/status.ts` derives stage from the last line in CHART.md matching `^(Handed off|Closed|Held)\b`, mapping to `handed off`, `closed` and `held`. With no match, the existing fork-count and fog rule is unchanged.
2. A CHART.md whose only marker is `Handed off 2026-09-11 into ...` still reads `handed off`, confirming the existing trailing-text shape keeps working. Covered in `tests/status.test.ts`.
3. A CHART.md carrying `Held 2026-09-15: ...` on one line and `Handed off 2026-09-17` on a later line reads `handed off`; reversing the two lines reads `held`. Covered by test.
4. A marker word appearing anywhere other than the start of a line, including inside an `## Off route` bullet, does not change the stage. Covered by test.
5. A chart with `Closed 2026-09-12: ...` and retained fork files reads `closed`, not `charting`. Covered by test.
6. Both chart layouts, the single `issues/chart/CHART.md` form and the multi-folder form, resolve stage through the same path (`src/status.ts:251-261`). Covered by test for at least the multi-folder form plus one single-form case.
7. `skills/chart-issues/SKILL.md` and `skills/chart-issues/assets/shapes.md` state all three markers, their `<YYYY-MM-DD>` date shape, that a marker must begin its own line, and that the last marker in the file is authoritative.
8. (B) A real `akrogon status --charts` run against a fixture repository holding one chart per stage is captured to the leaf's evidence directory and its path is named in the implementation report.
9. `bun run format`, `bun run typecheck`, `bun test` pass.
