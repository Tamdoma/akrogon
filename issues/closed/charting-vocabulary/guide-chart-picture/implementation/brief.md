# Implementation brief: guide-chart-picture

## 1. Goal

Ship the charting picture in the operator guide: a new `docs/guide/chart.html` page between Create and Next, the eight chart words in `parts.html`, synced chart lines in four pages, and the browser tests updated. Plan decisions D1–D8 in `../plan.md`.

## 2. Numbered acceptance criteria

1. `docs/guide/chart.html` exists; every guide page's header nav lists the 17 links in order Home, The idea, Parts, State, Install, Setup, Create, Chart, Next, Phases, Files, Merge, In practice, Limits, Problems, Learn, Cheat sheet; `index.html` toc lists it between Create and Next; `create.html` next pager and `next.html` prev pager point at it.
2. `parts.html` defines territory, map, fog, fork, question, round, chart, off route in the words table after Leaf, in that order.
3. `grep -rniE "decision|batch|not yet specified|out of scope|unspecified" docs/guide/` matches only the design.md and plan.md rows in `files.html`.
4. `bunx --no-install playwright test --config tests/browser/playwright.config.ts` passes, including the complete navigation test with the new page; trace artifact path recorded in the report.
5. `bun test` passes.
6. Every touched page reads for a beginner: short sentences, one idea per paragraph, terms used only after Parts defines them.

## 3. Read-first list

- `../plan.md` — decisions D1–D8
- `docs/guide/idea.html` — the shell to copy verbatim
- `docs/guide/parts.html`, `create.html`, `next.html`, `files.html`, `in-practice.html`, `cheat.html`, `index.html`
- `tests/browser/docs-shell.pw.ts`, `docs-operate.pw.ts`, `docs-concepts.pw.ts`
- `issues/chart/charting-vocabulary/INTAKE.md` (authoritative root `/home/ivan/Work/infra/akrogon`) — worked example source
- `issues/open/charting-vocabulary/rename-vocabulary/brief.md` — the eight definitions
- This skill folder's `ponytail.md`

## 4. Change list and needed interfaces

- New `docs/guide/chart.html` (D1): verbatim shell, `<title>Chart a destination · Akrogon Guide</title>`, `<section id="chart" class="sec" aria-label="Chart a destination">` inside `<div class="band">`, `data-animate` on the wrap, eyebrow `07 · Chart a destination`, `aria-current="page"` on its own nav link, pager prev Create / next Next.
- Nav link `<a href="chart.html">Chart</a>` after Create on all 17 pages (D2).
- Eyebrow renumber next→08, phases→09, files→10, merge→11, in-practice both heads→12, limits→13, problems→14, learn→15, cheat→16 (D3).
- `parts.html`: eight rows after Leaf, lede Twelve→Twenty (D4).
- Chart-line syncs in `create.html`, `files.html`, `in-practice.html`, `cheat.html`; `files.html` plan.md row gains "decisions" (D5).
- `index.html` toc entry (D6).
- Test arrays: `'chart'` between `'create'` and `'next'` in all three `.pw.ts` destinations; docs-shell toc count 16→17; docs-operate `names` gains `'chart'` (D7).

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `skills/`, `README.md`, `issues/` paths on the branch, or any guide page outside the owned list — design exclusions; `akrogon phase` refuses `issues/` diffs on the branch.
- Do not put `decision`, `batch`, `not yet specified`, `out of scope`, or `unspecified` in any new or touched prose — done-criterion 3 greps for them.
- Do not add chart.html to docs-concepts' `concepts` list — that test requires the page to equal idea.html modulo title/aria-current/main, which the differing pager breaks.
- Do not rewrite pages beyond the named lines — the design limits the beginner pass to the listed pages.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from B.

## 6. Ordered steps

Delegated as four sequential sub-briefs in this worktree:

1. `brief-1.md` — create `chart.html` + `index.html` toc entry (criteria 1, 6).
2. `brief-2.md` — nav link on the other 16 pages, eyebrow renumber, create/next pagers (criterion 1).
3. `brief-3.md` — parts.html rows + lede, chart-line syncs, plan.md row reword (criteria 2, 3, 6).
4. `brief-4.md` — test file updates + playwright runs (criteria 4, 5).

Advisory size: ~20 files total, under 60 turns across workers.

## 7. Commands

`AKROGON_BASE=9ab80642f1411732a48acdd9302af4f49e9f972f bun test --changed="$AKROGON_BASE"` for workers; brief-4 additionally runs the playwright configs since bun test cannot see `.pw.ts` files. B runs the full suite and all blocking checks after the last worker.

## 8. Done-when, evidence and report

All six criteria verified with pasted command output; playwright trace path recorded; code committed on the leaf branch.

Changed files and reasons: `docs/guide/chart.html` (new page, verbatim shell, eyebrow 07, flow + worked example); `docs/guide/index.html` (toc entry); 15 other guide pages (Chart nav link; eyebrow renumber on next/phases/files/merge/in-practice×2/limits/problems/learn/cheat; create+next pagers); `parts.html` (eight word rows after Leaf, lede Twelve→Twenty); `create.html`, `files.html`, `in-practice.html` (chart lines linked to chart.html; files.html plan.md row gained "decisions"); `tests/browser/docs-shell.pw.ts`, `docs-concepts.pw.ts`, `docs-operate.pw.ts` ('chart' in destinations, toc 16→17, operate names +chart). `cheat.html` chart line left as a command — a link inside the dark `<pre>` renders ink-on-ink.
Tests run: `bunx --no-install playwright test --config tests/browser/playwright.config.ts` 4/4 pass; `docs-operate.config.ts` 4/4; `docs-concepts.config.ts` 4/4; `bun test` 217 pass 0 fail; `bun run typecheck` clean; `bun run format` clean; forbidden-word grep matches only files.html design.md and plan.md rows. Trace artifacts: `.evidence/docs-shell/browser/`, `.evidence/docs-operate/browser/`, `.evidence/docs-concepts/browser/`.
Known limitations: cheat.html `/chart-issues` mention carries no link (format constraint); pages outside the owned list keep current prose per design.
Unverified criteria: criterion 6 (beginner readability) is judgment — mitigated by one-idea paragraphs and terms defined in parts.html before use.
