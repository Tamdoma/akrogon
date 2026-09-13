# Sub-brief 2: status.ts, tests, docs, README

## 1. Goal

Switch `akrogon status --charts` to the new chart format and reword the four prose lines. Plan D3, D6. Criteria 4, 7 and the header half of 5.

## 2. Acceptance criteria

1. `chartHeader` in `src/status.ts` is `['CHART', 'TAKEN', 'FOG', 'STAGE', 'AGE']`.
2. `chartRow` reads `forks/*.md`, counts a fork taken when `/^## Taken\s*\n\s*\S/m` matches, counts fog via the existing `section(markdown, 'Fog')` helper; stage rule unchanged.
3. `tests/status.test.ts` chart fixture uses `forks/`, `## Forks taken`, `## Fog`, `## Taken` and still asserts `1/2`, `2`, `handed off`, `0/0`, `empty`.
4. `bun test --changed` passes; the changed test fails before the src edit and passes after (red then green).
5. `grep -niE "decision|unspecified" docs/guide/files.html docs/guide/in-practice.html docs/guide/create.html` matches only the design.md locked-decisions row (files.html:99).

## 3. Read-first

- `src/status.ts:216-265` (chartHeader, section, chartRow, chartRows)
- `tests/status.test.ts:455-485`
- `docs/guide/files.html:106`, `in-practice.html:75`, `create.html:58`, `README.md:54`
- `ponytail.md` in this skill folder

## 4. Changes

- `src/status.ts`: `chartHeader` → `['CHART', 'TAKEN', 'FOG', 'STAGE', 'AGE']`; in `chartRow`, `decisions` variable → `forks` dir `resolve(folder, 'forks')`, taken test `/^## Taken\s*\n\s*\S/m`, `unspecified` → `section(markdown, 'Fog')`. Rename locals to match (`files`, `taken`, `fog`). Stage logic untouched.
- `tests/status.test.ts` (~460-485): `routed/decisions` → `routed/forks`; CHART.md fixture `## Decisions So Far` → `## Forks taken`, `## Not Yet Specified` → `## Fog`; fork files `## Resolution` → `## Taken`; `blank` fixture `## Not Yet Specified` → `## Fog`; test name → "taken counts, fog items, stage and age". Assertions unchanged.
- `docs/guide/files.html:106`: "The chart and its decision files" → "The chart and its fork files".
- `docs/guide/in-practice.html:75`: "every chart: decided/total decisions, unspecified items, stage, age" → "every chart: taken/total forks, fog items, stage, age".
- `docs/guide/create.html:58`: "A chart of decisions you settle one by one" → "A chart of forks you take one by one".
- `README.md:54`: "into decisions and leaf contracts" → "into forks and leaf contracts".
- Do NOT touch files.html:99 ("Locked decisions"), files.html:102, create.html:63 — leaf-design context, allowed by criterion 7.

## 5. Do-not

- No dual-format reading, no migrate subcommand, no `issues/` changes, no other docs lines.
- Keep `section()` helper and stage logic exactly as they are.
- Return a mismatch with evidence instead of changing scope; exception is a revised brief from B.

## 6. Steps

1. Update the test fixture and name first; run the changed-test command and show it red (criterion 4).
2. Edit `src/status.ts`; rerun — green.
3. Edit the three docs lines and README row; run the criterion-5 grep.

Advisory size: 5 files, under 20 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=d554f78d87bb7b29a4da8528da4c641e3ba66785`.

## 8. Done-when, evidence and report

Red-then-green output pasted; criterion-5 grep output pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
