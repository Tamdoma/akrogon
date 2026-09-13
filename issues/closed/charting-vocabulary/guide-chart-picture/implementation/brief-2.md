# Sub-brief 2: nav link, eyebrow renumber, pagers on the 16 existing pages

## 1. Goal

Wire the new Chart page into every existing guide page: one nav link, renumbered eyebrows, two pager fixes. Plan decisions D2 and D3. A sibling brief creates `chart.html` itself; do not create or edit it.

## 2. Numbered acceptance criteria

1. Every one of the 16 existing pages (`index, idea, parts, state, install, setup, create, next, phases, files, merge, in-practice, limits, problems, learn, cheat`) has `<a href="chart.html">Chart</a>` in its `<nav class="wrap" aria-label="Pages">` immediately after the Create link and before the Next link. No `aria-current` on the new link.
2. Eyebrow numbers renumber to match the new page order: `next.html` 07→08, `phases.html` 08→09, `files.html` 09→10, `merge.html` 10→11, `in-practice.html` both `11 ·` heads→12 ("A working day" and "Use cases"), `limits.html` 12→13, `problems.html` 13→14, `learn.html` 14→15, `cheat.html` 15→16. Pages 01–06 are unchanged.
3. `create.html` pager: the `<a class="next" href="next.html">` becomes `href="chart.html"` with `<span class="t">Chart</span>`. `next.html` pager: the `<a class="prev" href="create.html">` becomes `href="chart.html"` with `<span class="t">Chart</span>`. No other pager changes.
4. `grep -n "eyebrow" docs/guide/*.html` shows 01–16 sequential with no duplicates except in-practice's intentional two `12 ·` heads.

## 3. Read-first list

- `docs/guide/create.html` — nav block and pager to copy the pattern
- `docs/guide/next.html`, `phases.html`, `files.html`, `merge.html`, `in-practice.html`, `limits.html`, `problems.html`, `learn.html`, `cheat.html` — eyebrow lines and pagers
- This skill folder's `ponytail.md`

## 4. Change list and needed interfaces

- 16 files, each getting exactly one inserted nav line `<a href="chart.html">Chart</a>` (same indentation as siblings).
- 9 eyebrow edits (in-practice has two).
- 2 pager edits.

## 5. Do-not, reasons and exceptions

- Do not create `chart.html` or edit `index.html`'s toc — sibling briefs own them.
- Do not reformat, reflow, or otherwise touch any other line — minimal diff, the pages are byte-consistent shells and tests compare them.
- Do not add `aria-current` to the new link — only the current page carries it.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from B.

Restated: nav line + eyebrows + two pagers only; no other edits; mismatch over scope change.

## 6. Ordered steps

1. Insert the Chart nav link in all 16 pages (criterion 1). A scripted edit is fine if the result is verified per file.
2. Renumber the nine eyebrows (criterion 2).
3. Fix the two pagers (criterion 3).
4. Self-check: `grep -n 'href="chart.html"' docs/guide/*.html` shows one hit per page (17 counting chart.html once it exists — at your stage, 16); `grep -n "eyebrow" docs/guide/*.html` shows sequential numbers; `grep -n 'class="prev"\|class="next"' docs/guide/create.html docs/guide/next.html` shows the new targets.

Advisory size: 16 files, under 25 turns.

## 7. Commands

`AKROGON_BASE=9ab80642f1411732a48acdd9302af4f49e9f972f bun test --changed="$AKROGON_BASE"` — expected to run no tests (HTML is invisible to it); that is fine, B runs the browser suite.

## 8. Done-when, evidence and report

All 16 pages carry the link, eyebrows are sequential, pagers point at chart.html; self-check output pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
