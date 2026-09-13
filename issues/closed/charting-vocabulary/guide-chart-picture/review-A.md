# Review A: guide-chart-picture

Base: `9ab80642f1411732a48acdd9302af4f49e9f972f`
Reviewed head: `471a17185a8f924362d6a95da20e50e4226e8f5c` (plus lesson commit `1c096e7` added during review)

## Verification evidence

- Criterion 1 (nav/toc/pagers): all 17 `docs/guide/*.html` files contain `href="chart.html"`; nav order verified in diff (Chart between Create and Next on every page); `index.html` toc entry between Create and Next; `create.html` next pager → `chart.html` "Chart"; `next.html` prev pager → `chart.html` "Chart". `chart.html` has `aria-current="page"` on its own nav link, eyebrow `07 · Chart a destination`, section `id="chart"` inside `.band` with `data-animate`.
- Shell verbatim: normalized comparison (title, aria-current, main stripped) shows `chart.html` byte-identical shell to `idea.html` and all 15 other pages.
- Eyebrow renumber: `grep eyebrow` shows 01–16 sequential, chart at 07, both in-practice heads at 12.
- Criterion 2 (parts.html): eight rows after Leaf in order territory, map, fog, fork, question, round, chart, off route; lede Twelve→Twenty; definitions match rename-vocabulary brief; "Where it lives" cells match `shapes.md` (`forks/<fork>.md`, `CHART.md` `## Fog`, `## Off route`).
- Criterion 3 (forbidden grep): `grep -rniE "decision|batch|not yet specified|out of scope|unspecified" docs/guide/` matches only `files.html:100` (design.md row) and `files.html:103` (plan.md row, now with "decisions").
- Criterion 4 (playwright): rerun by reviewer — `playwright.config.ts` 4/4 pass, `docs-operate.config.ts` 4/4 pass, `docs-concepts.config.ts` 4/4 pass. Trace artifacts under `.evidence/docs-shell/browser/`, `.evidence/docs-operate/browser/`, `.evidence/docs-concepts/browser/`; `chart.png` screenshots confirm the new page renders and is navigated.
- Criterion 5 (bun test): rerun by reviewer — 217 pass, 0 fail. `bun run typecheck` clean.
- Criterion 6 (readability): chart.html paragraphs are one idea each; territory/map/fog/fork/question/round/chart/off route all defined in parts.html before use; worked example matches `INTAKE.md` (three forks, one fog patch, four rounds, one off route).
- Test changes: `'chart'` between `'create'` and `'next'` in all three destinations arrays; docs-shell toc count 16→17; docs-operate `names` gains `'chart'`; chart.html correctly absent from docs-concepts `concepts` (pager differs from idea.html).

## Findings

### Nits

- N1 — `cheat.html` `/chart-issues` line carries no link to `chart.html`. Plan D5 named `cheat.html:64` among the synced lines and the brief says "link to the Chart page where a reader needs more". The line sits inside `<pre><code>` on `.ink-band`, where `style.css` sets `.ink-band a{color:var(--parchment)}` — identical to the code text, so the link would be invisible. Report records this under known limitations. Reasonable deviation, not a defect: the line is a command listing, not prose needing more. Recorded as lesson `history/2026-09-14-ink-band-links.md`.

### Fixes

None.

## Verdict

nits

## Merge evidence (slot A)

- Rebase onto `origin/main` (`69a9dfe`) clean; head `eb4361e`.
- `bun run format`: clean, all files unchanged.
- `bun run typecheck`: clean.
- `bun test --changed=$AKROGON_BASE` (base `69a9dfe`): 141 pass, 0 fail.
- `bun test`: 221 pass, 0 fail.
