# Review A: charting-fixes

- Base: `8025b594104c6dbc1d83dc35060c50887b8e6d06` (`origin/main`)
- Reviewed head: `9a7402bf4464d812163e3dd4e1b4dcfd312c867a` (`charting-fixes`, clean working tree, 4 commits ahead of base: `86eae17b`, `7c315f74`, `cacff1ca`, `9a7402bf`)
- Verdict: `ready`

## Review summary

No documented runtime behavior changed (checked unchanged `docs/reference/where-things-go.md`; no `AREA.md` files or `learnings/LESSONS.md` lines are in the diff).

- **Criterion 1 (em dashes removed and sentences naturally rewritten)**: Verified mechanically via `tests/docs-em-dash.test.ts` (`check em-dash-guard: 0 .../check-em-dash-guard-1795786898010-696730.log`, `2 pass, 0 fail`). Reviewed all 20 edited Markdown files line by line against `origin/main...HEAD`: all 107 em dashes across 67 lines were removed through natural sentence rewrites (periods, commas, colons, semicolons, parentheses, and restructured clauses) with zero `" - "`, `"--"`, or en-dash substitutes (all `--` strings in added lines are pre-existing CLI flags). Mathematical `−`/`×` in `docs/reference/checks.md`, `(script)` in `checks.md` and `files.md`, the single-line `verify-runs.jsonl` and `commands.md` table rows, and `claude`/`codex`/`pi`/`agy` in `docs/use/watch-while-away.md` are all preserved.
- **Criterion 2 (consultant examples and page 04 slots sentence)**: Verified across all 6 pages (`docs/guide/04`–`08` and `docs/README.md`) via `check consultant-examples-check: 0 .../check-consultant-examples-check-1795786898129-696453.log` and diff inspection. All 4 consultant-starting examples (`04:22`, `06:35`, `06:54`, `06:75` including singular `Use consultant B.`) name each slot with harness, model, and effort (`Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.` / singular `slot B` on `06:75`). Page 04 line 25 holds `While charting, consultants sit in slots B, C, D, and a Lifecycle task later gets its own fresh slot B (the reviewer).`
- **Criterion 3 (em-dash guard test and deliberate break)**: Reviewed `tests/docs-em-dash.test.ts` (94 lines, zero external deps). It discovers `README.md`, `docs/**/*.md` recursively, and `docs/pictures/**/*.svg` recursively from disk with no hand-copied list, splits on `/\r\n|[\n\r\u2028\u2029]/`, checks `/\u2014|&mdash;|&#8212;|&#x2014;/i`, and exercises temp-dir negative, freshness, SVG, and non-LF cases cleaned up in `finally`. Read both kept logs via `akrogon log`: the deliberate break (`check-em-dash-deliberate-break-1795786897909-696583.log`, exit `1`) failed naming `docs/README.md:70: Deliberate break — em dash check.`, and the clean delivered tree (`check-em-dash-guard-1795786898010-696730.log`, exit `0`) passed.
- **Criterion 4 (strict diff scope and destination `checks`)**: `git diff --stat 8025b594...9a7402bf` touches only `tests/docs-em-dash.test.ts` and the 20 Markdown files holding em dashes/consultant examples; excluded surfaces (`04`–`08` tab section, previous/next links, picture embeds, `README.md`, `docs/pictures/*.svg`, agent docs) are untouched. `akrogon verify` passed on `9a7402bf4464d812163e3dd4e1b4dcfd312c867a` (`verify setup: 0`, `verify format: 0`, `verify typecheck: 0`, `verify test: 0`, `verify leaf 9a7402bf4464d812163e3dd4e1b4dcfd312c867a: green`, wall time `109s`, including `--rerun-each=5` on `tests/docs-em-dash.test.ts`).

## Verification evidence

- `git status --porcelain`: empty
- `akrogon log /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-em-dash-guard-1795786898010-696730.log`: `2 pass, 0 fail`
- `akrogon log /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-fixes/charting-fixes/implementation/check-em-dash-deliberate-break-1795786897909-696583.log`: `1 pass, 1 fail` (`docs/README.md:70: Deliberate break — em dash check.`)
- `akrogon verify` on `9a7402bf4464d812163e3dd4e1b4dcfd312c867a`: `verify leaf 9a7402bf4464d812163e3dd4e1b4dcfd312c867a: green` (`check-setup-1795786907763-697094.log`, `check-format-1795786910646-697094.log`, `check-typecheck-1795786913327-697094.log`, `check-test-1795787016277-697094.log`)

## Findings

### Fixes

None.

### Nits

None.

### Operator actions

None.
