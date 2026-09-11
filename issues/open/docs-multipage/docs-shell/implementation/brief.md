# Implementation brief: docs-shell

## 1. Goal
Implement plan D1–D7 in the docs-shell worktree: shared unchanged CSS, index and idea pages, and real browser verification.

## 2. Numbered acceptance criteria
1. C1: CSS inner bytes and complete idea section equal guide source. guide.html stays unchanged. Neither new HTML page has a style block.
2. C2: Both pages have the shared head/footer/logo, one main section, and exactly sixteen ordered relative page nav links with exactly one correct aria-current. File navigation Home → Idea → Home works.
3. C3: Index retains hero copy/SVG and replaces its TOC with sixteen page links and brief descriptions, including Home and combined In practice.
4. C4: Desktop 1440×1000 and mobile 390×844 show content, reachable nav, sticky header and no horizontal overflow. Normal and reduced motion work. Fonts and source content styles match guide at the same viewport.
5. C5: Headless Chromium verification retains screenshots and trace with video disabled. Report actual artifact paths. Derive tests before HTML changes and record red then green.

## 3. Read-first list
Read authoritative ../plan.md, ../brief.md, ../design.md. In worktree read docs/guide.html (existing pattern), package.json, bun.lock, tsconfig.json, .gitignore. Read /home/ivan/.codex/skills/implement-issue/ponytail.md. Use the plan source boundaries and preserve its decisions.

## 4. Change list and needed interfaces
Create docs/style.css, docs/index.html, docs/idea.html. Add @playwright/test dev dependency/package lock and tests/browser/playwright.config.ts plus docs-shell.pw.ts with explicit testMatch. Output browser artifacts to ignored .evidence/docs-shell/. Copy the existing animation script to both pages. Nav destinations/order are fixed in plan D4. No new shared JS or build system.

## 5. Do-not, reasons and exceptions
Do not edit guide.html or its CSS/content copies, since they are locked source. Do not create other pages or fix their pending links, since later leaves own them. Do not run the full Bun suite or commit, because B owns those handoff steps. Do not hide verification failures or mock font loading. Return a mismatch with concrete evidence if requirements conflict instead of changing scope/interfaces. Only a revised brief from B authorizes an exception. These exclusions preserve source fidelity, leaf ownership and honest evidence, with exceptions requiring B's revised brief.

## 6. Ordered steps
Derive/add browser tests from criteria first and run red before creating HTML/CSS. Implement source extraction and idea shell, then index and its descriptive list. Run browser verification and changed tests, repair within scope, and fill section 8. Keep approximately seven changed files. Report a mismatch if substantially broader changes are needed.

## 7. Commands
Configured changed-test command:
```sh
export AKROGON_BASE=2932b4e1f996af6a2b289b7aee7c35b774af06b7
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```
Run the required targeted browser command `bunx playwright test --config tests/browser/playwright.config.ts` after installing the recorded dev dependency and Chromium. B runs the full suite and other blocking checks separately.

## 8. Done-when, evidence and report
All five criteria pass or any remaining limitation is explicitly reported with evidence. Preserve screenshots/traces. Return concrete command results and red/green evidence, and fill these lines before returning.

Changed files and reasons: docs/style.css copies the full unchanged CSS inner bytes. docs/idea.html establishes the shared shell and unchanged idea section. docs/index.html keeps the hero and supplies sixteen described page links. package.json and bun.lock record @playwright/test. tests/browser/playwright.config.ts selects only the browser spec with four viewport/motion projects, headless Chromium, trace on, video off and ignored evidence output. tests/browser/docs-shell.pw.ts verifies source fidelity, file navigation, actual font loading, matching computed source styles, visible animations, sticky header, mobile reachability and overflow. Seven files changed.
Tests run: bunx playwright test --config tests/browser/playwright.config.ts ran red before HTML/CSS creation, with all four projects failing on missing style.css (.evidence/docs-shell/red.log). Green run passed all four projects (.evidence/docs-shell/green.log). After parent visual inspection, screenshots were corrected to capture at scroll top and all four projects passed again. bun test --changed=2932b4e1f996af6a2b289b7aee7c35b774af06b7 exited 0, reporting 7 changed files and 0 affected tests (.evidence/docs-shell/changed-tests.log). bun run typecheck passed. Targeted Prettier completed. git diff --exit-code against base for docs/guide.html and git diff --check passed. B ran bun test: 52 passed, 0 failed, 540 assertions (.evidence/docs-shell/full-test.log). B ran bun run format and bun run typecheck: both exited 0 (.evidence/docs-shell/format.log and typecheck.log).
Known limitations: fourteen destination pages await other leaves, Google Fonts needs network, inherited no-JS animation visibility is outside scope.
Unverified criteria: none in the worker brief. Automated C1–C5 checks passed and B visually inspected the corrected desktop and mobile screenshots for both pages and confirmed clear layout, visible content and wrapping navigation. Actual Spectral, Bricolage Grotesque and Martian Mono loading passed in Chromium. Screenshot and trace paths: .evidence/docs-shell/browser/docs-shell.pw.ts-source-copies-and-complete-file-navigation-desktop/idea.png and index.png plus trace.zip. The corresponding mobile, desktop-reduced and mobile-reduced directories also retain both screenshots and trace.zip. These paths are relative to /home/ivan/Work/infra/akrogon/issues/worktrees/docs-shell/.
