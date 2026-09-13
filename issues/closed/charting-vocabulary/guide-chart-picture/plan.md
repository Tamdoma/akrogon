# Plan: guide-chart-picture

Debate off (`debate: "no"`); synthesized directly from brief and design. `rename-vocabulary` is merged (commit 0a6ea42 in this worktree), so the eight words and the swapped docs lines are already live.

## Decisions

- D1 — New page `docs/guide/chart.html` at nav position 7, between Create and Next. The shell is copied verbatim from any existing page (head, header, footer and script blocks are byte-identical across all 16 pages; verified by checksum). Page-specific values: `<title>Chart a destination · Akrogon Guide</title>`, `<section id="chart" class="sec" aria-label="Chart a destination">` inside `<div class="band">` with `data-animate` on the wrap, eyebrow `07 · Chart a destination`, `aria-current="page"` on the Chart nav link, pager prev `create.html` "Create" / next `next.html` "Next". Body: the flow in beginner prose — look at the territory, draw the map; sharp parts become forks, the rest is fog; forks come in rounds, every question with exhaustive options and one recommended; every answer redraws the map, fog clears into forks, new forks can appear at any round; when no fork is open and no fog is left the route is clear and the chart hands off — plus the intake's worked example (a seat that quits mid-phase: three forks, one patch of fog, four rounds, one thing off route). Short sentences, one idea per paragraph, only words Parts defines. The page must not contain `decision`, `batch`, `not yet specified`, `out of scope`, or `unspecified` (done-criterion 3).
- D2 — Header nav on all 17 pages gains `<a href="chart.html">Chart</a>` immediately after the Create link, giving the design's order: Home, The idea, Parts, State, Install, Setup, Create, Chart, Next, Phases, Files, Merge, In practice, Limits, Problems, Learn, Cheat sheet.
- D3 — The guide numbers pages in eyebrow labels, so inserting at 07 renumbers the tail: next 07→08, phases 08→09, files 09→10, merge 10→11, in-practice 11→12 (both `11 ·` heads: "A working day" and "Use cases"), limits 12→13, problems 13→14, learn 14→15, cheat 15→16. Pager edits: `create.html` next → `chart.html` "Chart"; `next.html` prev → `chart.html` "Chart". No other pager changes.
- D4 — `parts.html`: eight rows appended to the words table after Leaf, in the order territory, map, fog, fork, question, round, chart, off route, one or two short sentences each taken from the rename-vocabulary brief's definitions, with a "Where it lives" cell per row (`forks/<fork>.md`, `CHART.md` bullets/sections, one screen, never a saved file for the map). Lede "Twelve words" becomes "Twenty words".
- D5 — Chart-line syncs, same words everywhere, `chart.html` linked where a reader needs more: `create.html` rows at :58-59 (the two `/chart-issues` rows), `files.html:106` (chart row), `in-practice.html:67` (chart-issues sentence), `cheat.html:64` (`/chart-issues` line). Also `files.html` plan.md row gains the word "decisions" (e.g. "Settled decisions, read-first paths, ordered checklist, acceptance criteria") so done-criterion 3's grep matches exactly the design.md locked-decisions row and the plan.md row.
- D6 — `index.html` toc: new `<li><a href="chart.html">Chart</a><p>See how a chart flows.</p></li>` between the Create and Next entries (description must exceed 10 chars after digits are stripped — docs-shell asserts this).
- D7 — Test updates: `'chart'` inserted between `'create'` and `'next'` in the `destinations` arrays of `docs-shell.pw.ts`, `docs-concepts.pw.ts` and `docs-operate.pw.ts` (all three enumerate the page list); docs-shell `.toc li` count 16→17; docs-operate `names` becomes `['install','setup','create','chart','next','merge']` so the new page is actually navigated to and shell-verified. chart.html is not added to docs-concepts' `concepts` list: that test requires the whole page to equal idea.html modulo title, aria-current and main, which the differing pager breaks.
- D8 — Verification: `bunx --no-install playwright test --config tests/browser/playwright.config.ts` (headless Chromium, trace on, no video; artifacts land under `.evidence/docs-shell/browser/`), the same command for `docs-operate.config.ts` and `docs-concepts.config.ts` since their arrays change, `bun test`, `bun run typecheck`, and the done-criterion 3 grep. The implementation report records the trace artifact path.

## Read-first

- `issues/open/charting-vocabulary/guide-chart-picture/brief.md`, `design.md` (authoritative root)
- `docs/guide/idea.html` — the shell to copy verbatim
- `docs/guide/parts.html` — words table and lede
- `docs/guide/create.html`, `next.html`, `files.html`, `in-practice.html`, `cheat.html`, `index.html` — the touched lines, pager and toc
- `tests/browser/docs-shell.pw.ts`, `docs-operate.pw.ts`, `docs-concepts.pw.ts` — destinations arrays, toc count, names list
- `issues/chart/charting-vocabulary/INTAKE.md` — the worked example, verbatim source
- `issues/open/charting-vocabulary/rename-vocabulary/brief.md` — the eight definitions
- `skills/chart-issues/assets/shapes.md` — on-disk names the definitions cite (`forks/`, CHART.md sections)

## Ordered checklist

1. Create `docs/guide/chart.html` (D1). Criterion: file exists with the verbatim shell, eyebrow `07`, aria-current on Chart, pager Create/Next, the flow and the worked example, no forbidden words.
2. Add the Chart nav link to the other 16 pages and the toc entry to `index.html` (D2, D6). Criterion: every page's nav lists the 17 links in the D2 order; toc has 17 items.
3. Renumber eyebrows and fix the create/next pagers (D3). Criterion: `grep -n "eyebrow" docs/guide/*.html` shows 01–16 sequential with chart at 07; create.html next and next.html prev point at chart.html.
4. Add the eight rows and update the lede in `parts.html` (D4). Criterion: the eight words appear in order after Leaf.
5. Sync the chart lines and reword the plan.md row (D5). Criterion: `grep -rniE "decision|batch|not yet specified|out of scope|unspecified" docs/guide/` matches only the design.md and plan.md rows in files.html.
6. Update the three test files (D7). Criterion: all three destinations arrays contain `chart` after `create`; docs-shell toc count is 17; docs-operate names include `chart`.
7. Run verification (D8). Criterion: all three playwright configs pass, `bun test` and `bun run typecheck` pass, trace path recorded in the report.

## Acceptance criteria

Mirror brief done-criteria 1–6: chart.html exists and is wired into nav, toc and pagers; parts.html defines the eight words; the forbidden-word grep matches only the two files.html rows; the playwright suite passes with the new page covered and the trace path recorded; `bun test` passes; every touched page reads for a beginner with terms defined before use and one idea per paragraph.

## Risks and open limitation

- R1 — Done-criterion 6 (one idea per paragraph, terms defined before use) is judgment, not a check. Mitigate by writing one-idea paragraphs and self-reviewing chart.html and the touched lines against the parts.html definitions.
- R2 — The eyebrow renumbering spans 8 pages and no test covers it; a missed number is a review defect. The checklist's grep makes it verifiable.
- Open limitation — pages outside the owned list keep their current prose even where it touches charting (e.g. learn.html's "at the next chart"); the design explicitly limits the rewrite to the named pages.
