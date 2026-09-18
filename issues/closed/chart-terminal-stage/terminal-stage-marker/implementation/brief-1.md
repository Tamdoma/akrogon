# Brief 1: chartRow three-marker stage + tests

## 1. Goal

`akrogon status --charts` recognizes three terminal chart markers instead of one. Plan decisions D1, D2, D3, D6. A CHART.md line starting `Handed off`, `Closed` or `Held` declares the chart's disposition; the last such line in the file wins. No marker line keeps the existing `charting`/`empty` fallback.

## 2. Numbered acceptance criteria

1. `chartRow` in `src/status.ts` derives stage from the last line matching `^(Handed off|Closed|Held)\b` (multiline, line-start anchored, word boundary), mapping to `handed off`, `closed`, `held`. No match: existing `files.length + fog > 0 ? 'charting' : 'empty'` rule unchanged.
2. `Handed off 2026-09-11 into ...` (trailing text) still reads `handed off`. Covered by test.
3. `Held 2026-09-15: ...` then a later `Handed off 2026-09-17` reads `handed off`; reversed order reads `held`. Covered by test.
4. A marker word not at line start (e.g. inside an `## Off route` bullet) does not change stage. Covered by test.
5. `Closed 2026-09-12: ...` with retained fork files reads `closed`, not `charting`. Covered by test.
6. Multi-folder layout plus one single `issues/chart/CHART.md` case resolve stage through the same path. Covered by test.

## 3. Read-first list

- `src/status.ts` — `chartRow` (line 239), `chartRows` (251), `section` (229). Only the stage expression at line 247 changes.
- `tests/status.test.ts` — the existing `--charts` test (lines ~460-482) is the pattern to copy: `fixture()`, `mkdirSync`/`writeFileSync` charts under `issues/chart/<name>/`, `cli(f, ['status','--charts'])`, row regex assertions like `/routed\s+1\/2\s+2\s+handed off\s+\d+m$/`.
- `tests/helpers.ts` — `fixture()` writes `issues/config.yaml` and registers `repo`; `cli` runs the real `src/akrogon.ts` entrypoint.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — required reading.

## 4. Change list and needed interfaces

- `src/status.ts:247` — replace `/^Handed off\b/m.test(markdown) ? 'handed off' : files.length + fog > 0 ? 'charting' : 'empty'` with a last-match scan. Suggested shape: `markdown.match(/^(Handed off|Closed|Held)\b/gm)?.at(-1)?.toLowerCase() ?? (files.length + fog > 0 ? 'charting' : 'empty')`. `String.match` with `g` returns `RegExpMatchArray | null`; `.at(-1)` gives the last line's marker word; `.toLowerCase()` maps `Handed off`→`handed off`, `Closed`→`closed`, `Held`→`held`. Keep the `stage` variable typed `string`.
- `tests/status.test.ts` — new test(s) directly after the existing `--charts` test, same style. One test may cover several criteria via separate fixture charts or sequential CHART.md rewrites, matching existing test structure.

Interfaces: `chartRow(folder: string, name: string, now: number): string[]` unchanged. STAGE column position unchanged. Stage vocabulary emitted is exactly `handed off`, `closed`, `held`, `charting`, `empty`.

## 5. Do-not, reasons and exceptions

- Do not touch `section()`, `chartRows()` layout resolution, the fog counting rule, or the AGE column — design exclusions; the leaf owns `chartRow`'s stage expression only.
- Do not add a fourth marker or a return-to-charting path — locked design Q2; reopening is an operator edit under `issues/`, outside this leaf.
- Do not edit anything under `issues/` — `akrogon phase` rejects `issues/` diffs on the branch.
- Do not stub or mock the file reader — the design's end-to-end line requires real CHART.md fixtures on disk through the real CLI.
- Do not add tests for coverage or prose wording — standing design forbids vanity tests; every test maps to a numbered criterion above.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.

These exclusions exist because the leaf's owned surfaces are `chartRow`'s stage expression and its tests; everything else stays byte-identical. The only exception is a revised brief from B.

## 6. Ordered steps

1. Write the new test(s) in `tests/status.test.ts` covering criteria 2-6; run the changed-test command and show them red against the current one-marker code (fail-first evidence for criteria 3 and 5 at minimum — `Held`/`Closed` are unrecognized today).
2. Edit `src/status.ts:247` to the last-match scan (criterion 1).
3. Rerun the changed-test command; all green.

Advisory size: 2 files, under 15 turns.

## 7. Commands

```bash
AKROGON_BASE=b538c238ba374fe2adf9bb1e23e5b0b77cc93d35
bun test --changed="$AKROGON_BASE"
```

Run from the worktree root. If `--changed` selects no test file for the `src/status.ts` edit alone, run `bun test tests/status.test.ts` directly and report which command was used.

## 8. Done-when, evidence and report

All six criteria verified: the new tests fail before the `src/status.ts` edit (at least the `Held`/`Closed` cases) and pass after; pasted changed-test output shows red then green. No end-to-end artifact required in this unit — B captures the `status --charts` evidence run separately.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
