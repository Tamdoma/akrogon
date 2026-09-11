## 1. Goal
Implement plan D1–D4: delete the retired guide, repair its four browser-spec consumers, and prove the remaining site works.

## 2. Numbered acceptance criteria
1. AC1: guide absent and all 16 replacement pages remain.
2. AC2: every relative href resolves to a file inside docs, proven by an ephemeral checker with negative/edge fixtures, recorded by B.
3. AC3: no guide.html references in src, skills, plugin, docs, REFERENCE.md or browser specs.
4. AC4: preserve independent browser coverage and pass all four existing configs with traces/screenshots, run by B.
5. AC5: changed tests and B's repository checks pass with a minimal diff.

## 3. Read-first list
Read ../plan.md, ../design.md, docs/index.html, docs/idea.html, docs/style.css, tests/browser/docs-{shell,concepts,operate,practice}.pw.ts, tests/browser/playwright.config.ts and sibling configs, package.json, bunfig.toml, .gitignore. Existing browser navigation assertions are the pattern. Read /home/ivan/.codex/skills/implement-issue/ponytail.md.

## 4. Change list and needed interfaces
Worker owns docs/guide.html deletion and necessary edits to the four named browser specs. No new interface. Remove source reads, source tabs, guide comparisons and now-unused helpers. Preserve all independent current-page checks and surviving shell comparisons. Derive operate section/title from current HTML without self-comparison. Preserve existing parts/next/day overflow exceptions. B owns the ephemeral link checker, final verification, report, and commit.

## 5. Do-not, reasons and exceptions
Do not change page content, CSS, configs, dependencies, or unrelated tests. Do not replace the guide with a fixture or Git retrieval. Do not delete suites or refactor shared helpers. These exclusions keep retirement minimal and preserve reader coverage. Return a mismatch with evidence if scope or interface changes are required. Only a revised brief from B authorizes exceptions.

## 6. Ordered steps
1. Confirm replacements exist (AC1). Delete guide, then demonstrate red by collecting the existing browser suite and record its missing-file failure before spec edits.
2. Repair all four consumers per plan D2/D3 (AC3/AC4), removing obsolete test-name promises as needed.
3. Run resolved changed tests (AC5). B runs browser suites and all other checks after your return.
4. Fill section 8 report. About five files and one bounded unit. Work substantially beyond this returns a mismatch, not scope expansion.

## 7. Commands
AKROGON_BASE=a2b9e07179546a935f854d5a9ea9ca160c5d3408 bun test --changed=a2b9e07179546a935f854d5a9ea9ca160c5d3408

For fail-first evidence only, use existing Playwright config with --list after deletion and before repairs. Do not run the full unit suite. B owns final browser runs and full checks.

## 8. Done-when, evidence and report
Return when deletion and consumer repairs are saved, changed-test result is recorded, and retained independent coverage is explained. B will fill final link/browser/check evidence and commit before handoff. Browser runs use installed headless Chromium with trace on and video off, with artifacts under existing .evidence paths.

Changed files and reasons: deleted docs/guide.html after confirming the exact 16 replacement pages. Repaired tests/browser/docs-{shell,concepts,operate,practice}.pw.ts by removing guide reads, source tabs, source comparisons, and unused comparison helpers. Renamed source-promising tests. Operate derives its shell title from the migrated section and no longer compares section content to itself. Preserved independent navigation/current-page state, stylesheet/font loading, animation/reduced motion, sections/anchors, sticky header, scrolling, screenshots, surviving idea-shell comparisons, and existing overflow checks/exceptions.
Tests run: fail-first `bunx playwright test --config tests/browser/playwright.config.ts --list` after deletion and before repairs exited 1 with ENOENT for docs/guide.html at docs-shell.pw.ts:23. `AKROGON_BASE=a2b9e07179546a935f854d5a9ea9ca160c5d3408 bun test --changed=a2b9e07179546a935f854d5a9ea9ca160c5d3408` exited 0: 6 changed files, no affected test files, 0 pass/0 fail. Formatted only the four edited specs. `git diff --check` passed and `rg -n 'guide\.html' tests/browser` returned no matches (exit 1). B owns final browser execution and repository checks.
Known limitations: guide equivalence ends at retirement; parts/next/day layout exceptions and external font dependency remain.
Unverified criteria: AC2 and final AC4/AC5 are B's verification work after worker return.
