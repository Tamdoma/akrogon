# Brief 2: chart-issues writer contract for three markers

## 1. Goal

The chart-issues skill is the only writer of terminal chart markers; it must define all three markers and the last-wins rule so future charts can declare `closed` or `held`. Plan decision D4, brief criterion 7.

## 2. Numbered acceptance criteria

1. `skills/chart-issues/SKILL.md` and `skills/chart-issues/assets/shapes.md` each state all three markers — `Handed off`, `Closed`, `Held` — their `<YYYY-MM-DD>` date shape, that a marker must begin its own line, and that the last marker in the file is authoritative.

## 3. Read-first list

- `skills/chart-issues/SKILL.md:57` — the `Handed off <date>` append sentence in the Handoff section.
- `skills/chart-issues/assets/shapes.md:33` — the `Handed off <YYYY-MM-DD>` sentence in the handoff paragraph.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — required reading.

## 4. Change list and needed interfaces

- `skills/chart-issues/SKILL.md:57` — generalize the append sentence. It currently reads: "After valid handoff append `Handed off <date>` to CHART.md, retaining the chart and source inputs in place; command dispatch remains the authority, so finish without running `akrogon next` or a chart phase transition." The revised sentence(s) must keep the handoff semantics (append, retain chart and inputs, no dispatch) while naming all three markers, the `<YYYY-MM-DD>` shape, the own-line requirement and last-wins.
- `skills/chart-issues/assets/shapes.md:33` — same contract in the sentence: "After valid handoff, append `Handed off <YYYY-MM-DD>` to CHART.md without moving it." Keep the surrounding paragraph (duplicate detection, new intake) intact.

No code interfaces. The marker vocabulary is exactly `Handed off`, `Closed`, `Held`; the reader (`src/status.ts`) matches `^(Handed off|Closed|Held)\b` and takes the last match.

## 5. Do-not, reasons and exceptions

- Do not rewrite surrounding skill text, restructure sections, or touch other skill files — the leaf owns the marker-writing sentences only.
- Do not introduce a fourth marker or describe returning a chart to `charting` — locked design Q2; reopening is an operator edit under `issues/`.
- Do not document marker semantics the reader does not implement — the contract is: line-start anchored, `<YYYY-MM-DD>` date shape, trailing prose permitted, last marker wins.
- Do not edit anything under `issues/` — `akrogon phase` rejects `issues/` diffs.
- Return a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief from B authorizing that change.

These exclusions exist because the leaf's owned surface in the skills is the marker contract sentences; everything else stays byte-identical. The only exception is a revised brief from B.

## 6. Ordered steps

1. Edit `skills/chart-issues/SKILL.md:57` (criterion 1).
2. Edit `skills/chart-issues/assets/shapes.md:33` (criterion 1).
3. Run the changed-test command; report whether it selected any test file. Skill prose has no test coverage — verification is the two files stating the four contract facts.

Advisory size: 2 files, under 10 turns.

## 7. Commands

```bash
AKROGON_BASE=b538c238ba374fe2adf9bb1e23e5b0b77cc93d35
bun test --changed="$AKROGON_BASE"
```

Run from the worktree root. If it selects nothing for skill-only changes, say so in the report; do not substitute the full suite.

## 8. Done-when, evidence and report

Both files state: three markers by name, `<YYYY-MM-DD>` date shape, marker begins its own line, last marker in the file is authoritative. Pasted changed-test output (or its no-selection result).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
