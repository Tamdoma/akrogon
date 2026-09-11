# Implementation brief: docs-practice

## 1. Goal
Implement plan D1–D6 in one verifiable unit: five faithful standalone pages with browser evidence.

## 2. Numbered acceptance criteria
1. C1: Six unchanged source sections occur once on the assigned five pages, with day then band-wrapped cases under one new In practice h1. Preserve problems' band wrapper and cheat's ink-band.
2. C2: Copy idea shell, font/style links, footer and script. Sixteen ordered page links and exactly the correct aria-current marker. No style blocks.
3. C3: Real nav clicks Home → In practice → Limits → Problems → Learn → Cheat → Home work. Owned section fragments and all local anchors resolve uniquely.
4. C4: Desktop/mobile and normal/reduced-motion render readable revealed content, sticky reachable nav, and contained wide tables/code outside the inherited day-section overflow. For day, source and copied section/command widths and overflow behavior must match at each viewport without added overflow. Source backgrounds and typography match.
5. C5: Headless Chromium with traces on and video off retains screenshots for all five pages. Protected files unchanged, changed tests pass. B runs full checks and commits.

## 3. Read-first list
Read ../plan.md, ../brief.md, ../design.md relative to this file's directory. In worktree read docs/idea.html, relevant six sections of docs/guide.html and wrappers, docs/style.css, docs/index.html, tests/browser/playwright.config.ts, tests/browser/docs-shell.pw.ts, package.json, tsconfig.json, .gitignore. Read /home/ivan/.codex/skills/implement-issue/ponytail.md. Plan contains exact source mapping and shell decisions.

## 4. Change list and needed interfaces
Create docs/in-practice.html, limits.html, problems.html, learn.html, cheat.html. Create tests/browser/docs-practice.pw.ts and docs-practice.config.ts. Import existing browser config and override only testMatch/outputDir. Use installed Playwright and worktree-relative file URLs. Keep evidence in .evidence/docs-practice/browser/.

## 5. Do-not, reasons and exceptions
Do not edit guide, idea, index, CSS, shell tests/config, other pages, dependency files, or prose, because source and parallel ownership are locked. Only the required In practice h1 is added. No example, hosting, new dependencies, or cleanup. Do not force animations visible to pass tests. Return a mismatch with evidence if requirements cannot be met within scope, rather than altering scope or interfaces. Only a revised brief from B authorizes such changes. B confirmed the day section is 390px wide with scrollWidth 806 in both source and copy. Preserve this inherited defect and record it explicitly, compare its geometry against the source, and keep strict containment checks for all other sections. This corrects the plan’s overly broad containment criterion to the locked faithful-copy scope without changing product code. These exclusions preserve faithful copies and parallel ownership, with the heading and a B-revised brief as the only stated exceptions.

## 6. Ordered steps
Derive the browser checks from criteria first and demonstrate red for missing pages. Then create In practice and the four other pages per plan A1/A2. Run the browser command for red/green evidence, inspect failures and return any actual scope mismatch. Run changed tests. Save screenshot/trace paths and fill section 8. Advisory size: seven files, about 15 turns. Do not commit. B reviews and commits.

## 7. Commands
AKROGON_BASE=e31834df16a47c8cf0ad2e1824dc7b306a5dab7f bun test --changed=e31834df16a47c8cf0ad2e1824dc7b306a5dab7f

The C5 browser verification invocation is bunx playwright test --config tests/browser/docs-practice.config.ts. Do not run the full Bun suite. B owns full blocking checks.

## 8. Done-when, evidence and report
All criteria verified or concrete mismatches returned. Record browser red/green results, actual screenshot and trace paths, and changed-test output. Do not execute guide example commands. Fill these lines before returning.

Changed files and reasons: Five new docs pages copy the six locked source sections and idea shell, including required heading and wrappers. Two new browser files verify copied markup, shell, navigation, fragment uniqueness, loaded fonts, styles, animation reveal, sticky nav, and viewport geometry in four inherited projects. No protected files or dependency records changed. Committed as e8286f0 (`docs: split practice and reference sections into pages`).
Tests run: `bun install --frozen-lockfile` restored recorded dependencies without manifest/lock changes. Initial `bunx playwright test --config tests/browser/docs-practice.config.ts` before page creation exited 1 with 24 failures for missing destinations/files. After faithful copies, strict containment run exited 1 with 22 passes and 2 inherited mobile overflow failures. That evidence is retained in `.evidence/docs-practice/browser-inherited-failure/` with log `.evidence/docs-practice/inherited-failure.log`. After B revised C4, the same browser command exited 0 with 24 passes in 13.9s. Final log: `.evidence/docs-practice/browser-green.log`. Twenty final full-page screenshots and twenty-four traces are retained under `.evidence/docs-practice/browser/`. Actual mobile screenshot paths:
- `.evidence/docs-practice/browser/docs-practice.pw.ts-in-practice-preserves-source-and-renders-mobile/in-practice.png`
- `.evidence/docs-practice/browser/docs-practice.pw.ts-limits-preserves-source-and-renders-mobile/limits.png`
- `.evidence/docs-practice/browser/docs-practice.pw.ts-problems-preserves-source-and-renders-mobile/problems.png`
- `.evidence/docs-practice/browser/docs-practice.pw.ts-learn-preserves-source-and-renders-mobile/learn.png`
- `.evidence/docs-practice/browser/docs-practice.pw.ts-cheat-preserves-source-and-renders-mobile/cheat.png`
Each named directory includes `trace.zip`, and matching directories for desktop, desktop-reduced, and mobile-reduced include corresponding screenshots/traces. Navigation trace example: `.evidence/docs-practice/browser/docs-practice.pw.ts-reader-7c7df-actice-navigation-back-home-mobile/trace.zip`. Inspected all five desktop and all five mobile screenshots from the retained inherited-failure run. Product markup is identical in the final run. Layout, wrappers, revealed text and typography match the source. Problems and Cheat require contained horizontal scrolling on mobile. `AKROGON_BASE=e31834df16a47c8cf0ad2e1824dc7b306a5dab7f bun test --changed=e31834df16a47c8cf0ad2e1824dc7b306a5dab7f` exited 0: seven changed files, no test files affected, 0 pass/0 fail/0 tests. Browser checks above actually exercise the changed pages. Prettier formatted only the two owned test files. Protected-file diff against base and `git diff --check` passed.
Known limitations: In practice preserves source day-section mobile overflow. Both guide and copy have viewport/clientWidth 390 and scrollWidth 806, with day pre widths 342, 782, 359. The Watching grid child has min-width:auto and expands to 782px. Revised C4 compares exact source/copy section and pre geometry without allowing additional overflow, while every other section retains strict containment. Nine nav destinations owned by parallel leaves remain absent: parts, state, install, setup, create, next, phases, files, merge. External Google Fonts loaded successfully during verification but remain network-dependent. Guide example commands were never executed.
B verification: `bun test` passed 52 tests with 540 assertions and no failures, logged in `.evidence/docs-practice/full-tests.log`. `bun run typecheck` and `bun run format` exited 0, logged in `.evidence/docs-practice/typecheck.log` and `format.log`. Formatting changed no files. B inspected all five mobile screenshots from the preserved failure run and all five desktop screenshots from the final green run. B independently confirmed the source/copy day geometry described above. Protected-file diff and staged diff whitespace check passed. Implementation committed as e8286f0.
Unverified criteria: None within the revised migration scope. The inherited overflow and pending destinations remain explicit limitations. Initial missing-page trace artifacts were overwritten by the first post-implementation browser run, but its exit code and 24-failure result were observed before page creation.
