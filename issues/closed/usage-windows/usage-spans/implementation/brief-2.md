# Worker brief 2: door prose for spans, calls and pi in three docs

## 1. Goal

Implement plan.md D6: update the three doc surfaces so the door's span lifecycle and the new usage fields are documented. Plan: `/home/ivan/Work/infra/akrogon/issues/open/usage-windows/usage-spans/plan.md`.

## 2. Numbered acceptance criteria

Each file states, in its own existing section and house style:

1. `skills/chart-issues/SKILL.md` (seat record paragraph, around line 39): the door opens a span when it begins work on a chart; after outstanding consultant turns are collected it closes the span on handoff, close or hold, when the chart waits on an approval, need or prerequisite, or before switching to another chart; it keeps the span open while waiting on this chart's consultants; it opens a new span on re-entry; only the last span may be open; the first chart's first span covers a shared opening map so the map counts once; a record without `spans` reads as a legacy window.
2. `skills/chart-issues/assets/shapes.md` (`### seats.yaml`): the `spans:` list shape — `{from: ISO, to?: ISO}`, half-open `[from, to)`, only the last may omit `to`; the same open/close rule in one or two lines; pi `session` is the session file path.
3. `docs/guide/chart.md` (`seats.yaml`/`USAGE.md` paragraph, ~line 162): spans definition and when the door writes them, `legacy window` for records without spans, `calls` and `average context per call` meaning (one call = one model response reporting usage; average context = per-call input context including cache), pi seats are measured.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` lines 29–45 and 60–80 (seat record + usage run prose).
- `skills/chart-issues/assets/shapes.md` `### seats.yaml` (~line 161–180).
- `docs/guide/chart.md` ~line 150–170.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`. No interfaces, no shared test resource, no prerequisite.

Edit only the named sections. Keep each file's existing voice and line-level style; SKILL.md and shapes.md use dense single-sentence rules, chart.md uses short operator-facing sentences. A live `seats.yaml` example for the shape: `issues/chart/usage-windows/seats.yaml` in the registered checkout has `spans: [{from: '2026-10-17T10:22:40Z', to: '2026-10-17T10:35:45Z'}]`.

## 5. Do-not, reasons and exceptions

- Do not touch `chart-usage.ts`, tests, fixtures or any other doc; the checklist names these three files.
- Do not add claims the criteria do not require (no cost language, no quality claims).
- Do not reformat or rewrap unrelated paragraphs; minimal diff.
- Return a mismatch with evidence instead of widening scope; the exception is a revised brief from A.

## 6. Ordered steps

1. Read the three sections.
2. Edit SKILL.md seat record paragraph (criterion 1).
3. Edit shapes.md seats.yaml (criterion 2), updating the example block if it helps show spans.
4. Edit chart.md paragraph (criterion 3).
5. Verify prose mentions `spans`, `legacy window`, `calls`, `average context per call`, `pi` where required; commit.

Advisory size: ~3 files, under 12 turns.

## 7. Commands

No test commands. Verify with grep:

```sh
grep -n "spans\|legacy window\|average context" skills/chart-issues/SKILL.md skills/chart-issues/assets/shapes.md docs/guide/chart.md
```

## 8. Done-when, evidence and report

All three criteria visible in the diff. Commit your chunk with the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
