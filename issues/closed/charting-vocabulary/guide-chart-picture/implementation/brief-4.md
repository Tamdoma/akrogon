# Sub-brief 4: browser test updates + playwright verification

## 1. Goal

Update the three browser test files for the new `chart.html` page and prove the guide still renders and navigates. Plan decision D7. Sibling briefs have already created the page and wired nav/toc/pagers; verify that assumption first and report a mismatch if the page or links are missing.

## 2. Numbered acceptance criteria

1. `tests/browser/docs-shell.pw.ts`: `'chart'` inserted between `'create'` and `'next'` in `destinations`; `.toc li` count `16`→`17`.
2. `tests/browser/docs-concepts.pw.ts`: `'chart'` inserted between `'create'` and `'next'` in `destinations`. Nothing else — chart.html must NOT join `concepts` (that test requires the page to equal idea.html modulo title/aria-current/main, which the differing pager breaks).
3. `tests/browser/docs-operate.pw.ts`: `'chart'` inserted between `'create'` and `'next'` in `destinations`; `names` becomes `['install','setup','create','chart','next','merge']` so the new page is navigated to and shell-verified.
4. `bunx --no-install playwright test --config tests/browser/playwright.config.ts` passes (4 projects: desktop, mobile, desktop-reduced, mobile-reduced).
5. `bunx --no-install playwright test --config tests/browser/docs-operate.config.ts` and `--config tests/browser/docs-concepts.config.ts` pass.
6. The trace artifact directory (`.evidence/docs-shell/browser/` per config `outputDir`) is recorded in the report.

## 3. Read-first list

- `tests/browser/docs-shell.pw.ts`, `docs-operate.pw.ts`, `docs-concepts.pw.ts` — the arrays and counts
- `tests/browser/playwright.config.ts`, `docs-operate.config.ts`, `docs-concepts.config.ts` — testMatch and outputDir
- `docs/guide/chart.html` — confirm it exists and its nav lists 17 links
- This skill folder's `ponytail.md`

## 4. Change list and needed interfaces

- Three `.pw.ts` files, array/count edits only.
- `chart.html` must satisfy docs-operate's shell check: `<section id="chart" aria-label="Chart a destination">` whose aria-label maps to `<title>Chart a destination · Akrogon Guide</title>`, one `main section`, `link[href="style.css"]`, exactly one `aria-current` nav link pointing at chart.html, all `href^="#"` anchors resolving, `main pre`/`main .tbl` containers with `overflow-x: auto`, sticky header. If the page fails these, that is a defect in brief-1's output — fix the page minimally and say so in the report.

## 5. Do-not, reasons and exceptions

- Do not add chart.html to docs-concepts' `concepts` list — see criterion 2.
- Do not change test logic, helpers, or other entries — minimal diff.
- Do not edit guide pages except a minimal fix to chart.html if it fails the shell contract — everything else belongs to earlier briefs.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from B.

Restated: array/count edits plus at most a minimal chart.html shell fix; mismatch over scope change.

## 6. Ordered steps

1. Confirm `docs/guide/chart.html` exists and every page's nav has 17 links (`grep -c 'href=' docs/guide/chart.html` in the nav block, or eyeball).
2. Edit the three test files (criteria 1-3).
3. Run the three playwright configs (criteria 4-5). If a failure traces to chart.html's shell, fix the page minimally per section 4 and rerun.
4. Record the trace/output artifact path (criterion 6).

Advisory size: 3 files, under 15 turns.

## 7. Commands

`AKROGON_BASE=9ab80642f1411732a48acdd9302af4f49e9f972f bun test --changed="$AKROGON_BASE"` — bun test cannot see `.pw.ts` files, so the real targeted checks are the three playwright configs in section 6; run both.

## 8. Done-when, evidence and report

All three playwright configs pass with output pasted; trace artifact path recorded; test diffs minimal.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
