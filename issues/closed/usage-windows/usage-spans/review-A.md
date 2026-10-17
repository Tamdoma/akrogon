# Review A: usage-spans

Base `30030e6` (origin/main), reviewed head `c7309ce`. Diff `30030e6...c7309ce`: script +413/-106, tests +326, three doc files, five new fixtures. `akrogon verify` green on the reviewed head (format, 1027 tests, typecheck). `git status` clean.

## Fixes

### F1 — cumulative codex path leaks gap usage into span totals

`codexCounting` cumulative branch computes `tokens` as `last in-span count − last count before the first span`. A cumulative counter is monotone, so every increment produced by records sitting in a gap `[t2, t3)` is folded into the diff for the next span: gap records effectively count.

Realistic source: a cumulative-only codex rollout (the path kept for rollouts without `token_usage_record`) whose consultant session keeps running while the door closes span 1 and re-enters on a new span — the exact multi-span situation this leaf exists to measure. The chart's reported `input_tokens`/`cached_input_tokens`/`output_tokens` then include the other work done between the spans.

Criterion hit: done-criterion 1 — "records in `[t2, t3)` do not [count]". The same leak exists in that branch's `spanOutput(a,b)` (baseline `beforeSpan` takes counts `<= a` including gap-tail increments).

Fix direction: sum per-span diffs — for each effective window `w`, `(last count inside w) − (last count before w.startMs)`, with the pre-first-span baseline as today; apply the same per-window basis to `spanOutput`'s `beforeSpan`. The existing `records outside the window` test covers the single-span degenerate case; a multi-span cumulative fixture is the missing case.

## Nits

### N1 — `token_usage_record` dedupe counts calls but sums tokens on duplicates

`codexCounting` adds `response_id` to a `Set` for `calls` but sums `usage` for every record. If a rollout ever repeats a `response_id`, calls dedupe while tokens inflate. No duplicate exists in the two live rollouts inspected (104/104 and 2/2 unique), so no today consequence — Nit. Promoted by any real rollout emitting a duplicate.

### N2 — `spans: []` prints a bare `window` line

`windowLine` joins zero parts to `window ` for an explicit empty list. The criteria neither allow nor reject an empty list; the line is harmless and cosmetic. Fix would be rejecting `spans: []` or printing a named empty marker — not worth a Fix without a real producer of empty spans.

### N3 — pi `message.usage` presence validates whole-session

`piSession` errors on an assistant missing `usage` anywhere in the file, while calls only count in-span records. Stricter than the criterion's in-span example; consequence is only that a session with a broken record outside all spans reports `usage unmeasured` instead of being ignored — matching the existing claude whole-session validation style. Deferred.

## Other checks

- Done-criteria 1–3: every branch of the criteria has a planned test and all 19 in `tests/chart-usage.test.ts` pass on the reviewed head (`check chart-usage-final: 0`, `check chart-usage-v5: 0`).
- Criterion 4: live runs on copied seats.yaml recorded in `implementation/report.md` with the table, % change and required disclaimers (`check savings-base-red: 0`, `check savings-fresh: 0`, `check savings-usage-windows: 0`); figures are informative only.
- Prose: SKILL.md seat-record, shapes.md seats.yaml and guide/chart.md each carry the required span lifecycle, `legacy window`, `calls`/`average context per call` and pi statements; no other doc describes the changed behavior.
- Trailers: `Test-Change:` trailers on `7b9b668` and `b608935` cover `tests/chart-usage.test.ts` and `tests/fixtures/chart-usage/README.md`; expectation corrections cite real script output.
- No AREA.md touched by the diff. No `.env`, grants or credentials involved.

## Verdict

`fix` — F1 is a concrete, criterion-named defect in the cumulative path on multi-span charts.
