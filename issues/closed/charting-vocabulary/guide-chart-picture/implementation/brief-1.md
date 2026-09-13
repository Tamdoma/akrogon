# Sub-brief 1: chart.html page + index toc entry

## 1. Goal

Create `docs/guide/chart.html`, the new guide page between Create and Next, and add its entry to the `index.html` contents list. Plan decisions D1 and D6.

## 2. Numbered acceptance criteria

1. `docs/guide/chart.html` exists with the same head, header, footer and script blocks as every other guide page (they are byte-identical; copy `idea.html`'s and change only title, nav aria-current, and main).
2. Page-specific values: `<title>Chart a destination · Akrogon Guide</title>`; `<section id="chart" class="sec" aria-label="Chart a destination">` wrapped in `<div class="band">` with `<div class="wrap" data-animate>` inside; eyebrow `<span class="eyebrow">07 · Chart a destination</span>`; nav link `<a href="chart.html" aria-current="page">Chart</a>` placed between Create and Next; pager `<a class="prev" href="create.html">…Create` and `<a class="next" href="next.html">…Next`.
3. The body tells how a chart flows, in this order: look at the territory, draw the map; the sharp parts become forks, the rest is fog; forks are put to you in rounds, every question with exhaustive options and one recommended; every answer redraws the map, fog clears into forks, new forks can appear at any round; when no fork is open and no fog is left the route is clear and the chart hands off.
4. The body includes the worked example from `issues/chart/charting-vocabulary/INTAKE.md` (authoritative root `/home/ivan/Work/infra/akrogon`): a seat that quits mid-phase — three forks (detection, trigger, repeated misses), one patch of fog that cleared after round 1 into a fourth fork (briefs listing needed keys up front → the Operator inputs section), four rounds, one thing off route (automatic healing in single-seat phases). Keep it faithful and short.
5. Beginner rules: short sentences, one idea per paragraph, a term is used only after `parts.html` defines it (territory, map, fog, fork, question, round, chart, off route are being defined there by a sibling brief — you may use them).
6. The page contains none of: `decision`, `batch`, `not yet specified`, `out of scope`, `unspecified` (case-insensitive).
7. `index.html` toc gains `<li><a href="chart.html">Chart</a><p>See how a chart flows.</p></li>` between the Create and Next `<li>` entries.

## 3. Read-first list

- `docs/guide/idea.html` — copy its shell verbatim
- `docs/guide/create.html` — the page before; match its tone and structure (head/lede, table or zig blocks, why-box optional)
- `docs/guide/index.html` — toc `<ol class="toc">` around line 130
- `/home/ivan/Work/infra/akrogon/issues/chart/charting-vocabulary/INTAKE.md` — worked example, "Example from today" section
- `/home/ivan/Work/infra/akrogon/issues/open/charting-vocabulary/rename-vocabulary/brief.md` — the eight word definitions
- `docs/guide/style.css` — skim for available classes (tbl, zig, why, cap, pre)
- This skill folder's `ponytail.md`

## 4. Change list and needed interfaces

- New file `docs/guide/chart.html`.
- Edit `docs/guide/index.html`: one `<li>` in the toc.
- The nav in chart.html lists all 17 pages: index, idea, parts, state, install, setup, create, chart, next, phases, files, merge, in-practice, limits, problems, learn, cheat — matching the existing nav markup exactly, with `aria-current="page"` only on chart.

## 5. Do-not, reasons and exceptions

- Do not edit any other page's nav or content — sibling briefs own those; overlapping edits collide.
- Do not use the forbidden words in criterion 6 — a done-criterion greps the whole guide for them.
- Do not invent SVG illustrations unless simple; a table or short paragraphs are enough. Keep the page consistent with siblings.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from B.

Restated: only chart.html and index.html's toc; no forbidden words; mismatch over scope change.

## 6. Ordered steps

1. Read idea.html and create.html for shell and tone.
2. Write `docs/guide/chart.html` (criteria 1–6).
3. Add the toc `<li>` in `index.html` (criterion 7).
4. Self-check: `grep -niE "decision|batch|not yet specified|out of scope|unspecified" docs/guide/chart.html` prints nothing; nav order in the new file matches criterion 2's list.

Advisory size: 2 files, under 12 turns.

## 7. Commands

`AKROGON_BASE=9ab80642f1411732a48acdd9302af4f49e9f972f bun test --changed="$AKROGON_BASE"` — expected to run no tests (HTML is invisible to it); that is fine, B runs the browser suite.

## 8. Done-when, evidence and report

chart.html exists meeting criteria 1–6, index.html toc has the entry, grep self-check output pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
