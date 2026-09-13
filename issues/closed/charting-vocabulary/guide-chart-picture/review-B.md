# Review B: guide-chart-picture

Base: 9ab80642f1411732a48acdd9302af4f49e9f972f · Reviewed head: 471a171 (`Add chart page to the operator guide`, 20 files, +158/−20). `git status --porcelain` empty; head is one commit ahead of base.

## Verification evidence

- Nav: all 17 pages list the 17 links in the design order with Chart between Create and Next; exactly one `aria-current` per page, on chart.html pointing at chart.html.
- Pagers: create.html next → chart.html/Chart; next.html prev → chart.html/Chart; chart.html prev/next → Create/Next. index.html toc has the Chart `<li>` between Create and Next (17 items).
- Eyebrows: `grep -n "eyebrow" docs/guide/*.html` shows 01–16 sequential, chart at 07, in-practice's two heads both at 12.
- parts.html: eight rows Territory, Map, Fog, Fork, Question, Round, Chart, Off route in order immediately after Leaf; lede reads "Twenty words".
- Forbidden-word grep `grep -rniE "decision|batch|not yet specified|out of scope|unspecified" docs/guide/` matches only files.html:100 (design.md "Locked decisions") and files.html:103 (plan.md "Settled decisions") — exactly the two rows done-criterion 3 allows.
- chart.html content: flow paragraphs in the brief's order, worked example faithful to the intake (three forks + fog-cleared fourth = four rounds, one off route), no forbidden words, one idea per paragraph.
- Playwright: worker ran all three configs after the last docs change — docs-shell 4/4, docs-operate 4/4, docs-concepts 4/4; trace dirs exist at `.evidence/docs-shell/browser/`, `.evidence/docs-operate/browser/`, `.evidence/docs-concepts/browser/` and are recorded in the report. `bun test` 217 pass / 0 fail; `tsc --noEmit` clean; `bun run format` clean.
- No `issues/` paths on the branch; no AREA.md files touched (docs/guide has none), so the area-path check is vacuous.

## Findings

- Nit — `in-practice.html` links `/chart-issues` inside `<code>` (`<code><a href="chart.html">/chart-issues</a></code>`). Valid and consistent with the page, slightly unusual markup; harmless.
- Nit — `cheat.html` keeps `/chart-issues` as a bare command with no link. Justified: an `<a>` inside the dark `<pre>` renders ink-on-ink; the brief allowed this branch.

## Verdict

ready — all six done-criteria verified against the live diff; no Fix findings.
