# Review B: charting-fixes

- Phase: check.review (initial, blind)
- Base: `8025b594104c6dbc1d83dc35060c50887b8e6d06`
- Reviewed head: `9a7402bf4464d812163e3dd4e1b4dcfd312c867a`
- Verdict: **ready**

## Inputs read

brief.md, design.md, plan.md, implementation/report.md, readiness.yaml, `git diff 8025b594...9a7402bf` (21 files, every hunk read with `--word-diff`), tests/docs-em-dash.test.ts, tests/AREA.md, kept logs named below, verify-runs.jsonl row 866.

## Criterion 1: no em dash, natural rewrites

- Live tree: `grep -rnP '\x{2014}|&mdash;|&#8212;|&#x2014;' README.md docs` returns nothing on the reviewed head.
- Added lines: `git diff ... -- docs | grep '^+' | grep -E ' - |–|[^-]--[^a-z-]'` returns nothing. No " - ", "--" or en dash substitute was introduced.
- Reading: every changed sentence was rewritten with periods, commas, colons, semicolons or parentheses. The longer restructures (checks.md slow-normal paragraph, files.md `verify-runs.jsonl` row, files.md `chart/<chart>/` row, checks.md and commands.md `flaky` text) keep every stated fact. In the `verify-runs.jsonl` row the trailing "start and end, and `slow`" moved into the opening field list, which the removed dash structure required. Small grammar insertions ("is", "come", "It then") exist only where a split sentence needed a verb.
- Heading `08-hand-off.md` "## What the charting agent hands off and what happens next": anchor changed. `tests/docs-links.test.ts` is green in the verify run, so no link pointed at the old anchor.

## Criterion 2: consultant examples and page 04 sentence

- `grep -niE consult docs/guide/0[4-8]*.md docs/README.md`: the four user-typed examples (04:22, 06:35, 06:54, 06:75 including the former singular "Use consultant B.") name each slot with harness, model and effort. The other hits are prose or requirements (07:38 "At least one consultant (`B`) is named"), not examples that start consultants.
- 04:25 holds "While charting, consultants sit in slots B, C, D, and a Lifecycle task later gets its own fresh slot B (the reviewer)."

## Criterion 3: guard test

- `tests/docs-em-dash.test.ts` reads README.md, `docs/**/*.md` and `docs/pictures/**/*.svg` from disk on each call, no page list.
- Green on head: `check em-dash-guard: 0 .../implementation/check-em-dash-guard-1795786898010-696730.log` (2 pass).
- Deliberate break: `check em-dash-deliberate-break: 1 .../implementation/check-em-dash-deliberate-break-1795786897909-696583.log` reports `docs/README.md:70: Deliberate break — em dash check.`, 1 fail.
- Test file unchanged since planning commit `86eae17b`, so all runs above postdate its last change. Rerun-each=5 green inside `verify test`.

## Criterion 4: scope and checks

- Diff touches only the 20 em-dash Markdown files plus the new test. No README.md, SVG, AREA.md or excluded 04 to 08 section (tab section, previous/next lines, embeds) changed. Every hunk is an em-dash line or a consultant example or the page-04 sentence.
- `akrogon verify` on `9a7402bf`: receipt run `6917b659-7d1f-4f20-90e2-ecff13252894`, format/typecheck/test exit 0 (logs check-format-1795786910646, check-typecheck-1795786913327, check-test-1795787016277 in implementation/).
- Planned tests ran through the commands plan.md names. Nothing skips, filters or disables a planned test or runner config.

## Test-Change trailers

`git log 8025b594..HEAD` holds no `Test-Change:` trailers. The only test path in the diff is `tests/docs-em-dash.test.ts`, status `A` (new file), which needs no cited source.

## AREA.md and docs

No `AREA.md` in the diff. The only new behavior is a test. tests/AREA.md names selected tests, not every file (107 test files), so no documented behavior changed.

## Fixes

None.

## Nits

None held.

## Operator actions

None.
