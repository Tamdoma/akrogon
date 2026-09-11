# 1. Goal
Implement docs-concepts plan D1–D6 in the leaf worktree. One bounded unit creates four concept pages and their browser verification.

# 2. Numbered acceptance criteria
1. C1: Copy the complete parts, state, phases, and files sections from guide.html. Keep band wrappers for parts/phases.
2. C2: Copy idea's shell and script, change title/current marker only. Sixteen links, exactly one correct current page, shared CSS, no style element.
3. C3: Browser clicks Home → Parts → State → Phases → Files → Home work. Local fragments resolve.
4. C4: Desktop/mobile and normal/reduced motion render visible complete content, preserve source styling, keep navigation reachable and introduce no horizontal overflow beyond the original section. Parts retains confirmed source grid overflow, with matching geometry asserted against guide. State, Phases, and Files must fit the viewport.
5. C5: Preserve guide/idea/index/style files. Retain and inspect screenshots of all four pages and traces from successful headless Chromium verification.

# 3. Read-first list
Authoritative parent plan.md, brief.md and design.md. Worktree docs/idea.html, relevant sections of docs/guide.html, docs/style.css, tests/browser/playwright.config.ts and docs-shell.pw.ts, package.json and .gitignore. Read /home/ivan/.codex/skills/implement-issue/ponytail.md. Existing browser test is the pattern. Do not reread learnings as pass input.

# 4. Change list and needed interfaces
Create docs/{parts,state,phases,files}.html and tests/browser/docs-concepts.{config,pw}.ts. Config imports existing config and overrides testMatch/outputDir, retaining projects and Chromium settings. Resolve file URLs relative to spec. Use testInfo.outputPath for screenshots. No new dependency needed.

# 5. Do-not, reasons and exceptions
Do not edit shared shell, stylesheet, source guide, existing tests, or production code because scope is four copied pages. Do not modernize prose or alter section markup because this is migration. Preserve inline style attributes, only style elements are prohibited. No fake links or font mocks. Return mismatches with evidence instead of changing scope/interfaces. Only a revised brief from B authorizes an exception. B resolved the observed mobile Parts mismatch in favor of locked source fidelity: test Parts overflow geometry against its source, retain strict viewport checks for the other pages, and report the inherited defect. Do not fix CSS or copied markup. These exclusions preserve locked source fidelity and sibling ownership.

# 6. Ordered steps
1. Write acceptance-derived browser verification first. Run it before pages exist and retain red evidence.
2. Generate the four pages by copying section boundaries and the idea shell, preserving wrappers. Run browser verification to green and inspect screenshots.
3. Run the changed-test command and fill the report below. Do not commit or advance phase, B handles final checks and commit.
Advisory size: six files, one bounded worker. Return a mismatch for required shared-source changes rather than widening scope.

# 7. Commands
Changed tests: `AKROGON_BASE=e31834df16a47c8cf0ad2e1824dc7b306a5dab7f bun test --changed=e31834df16a47c8cf0ad2e1824dc7b306a5dab7f`.
Required end-to-end evidence: `bunx playwright test --config tests/browser/docs-concepts.config.ts`. Browser install only if needed: `bunx playwright install chromium`. B runs full suite and other configured checks after return.

# 8. Done-when, evidence and report
All C1–C5 met, with actual red/green output and screenshot/trace paths recorded. Report any inherited defects or unavailable fonts rather than hiding failures. Existing absent sibling destinations, JavaScript dependency, and unchanged numbered prose are limitations.

Changed files and reasons: Created docs/parts.html, docs/state.html, docs/phases.html, and docs/files.html as exact section copies inside idea’s shell, with title and current marker changed and original band wrappers retained. Created tests/browser/docs-concepts.config.ts and docs-concepts.pw.ts for source fidelity, navigation, fonts, motion, geometry, overflow containers, and screenshots across the four inherited Chromium projects. Shared/source files untouched.
Tests run: Browser red run before page creation exited 1 with four ENOENT failures for parts.html. Log: `.evidence/docs-concepts/red.log`; original failed traces are in `.evidence/docs-concepts/red/`. An intermediate run exposed inherited Parts mobile overflow, recorded in `.evidence/docs-concepts/verification.log`. After B revised C4 to require source fidelity for that existing defect, `bunx playwright test --config tests/browser/docs-concepts.config.ts` exited 0: 4 passed (10.4s). Log: `.evidence/docs-concepts/green.log`. Actual Google fonts loaded in every project, without mocks. Changed-test command from section 7 exited 0: 6 changed files, no affected Bun tests, 0 pass/0 fail. Log: `.evidence/docs-concepts/changed-tests.log`.

Screenshot and trace paths: `.evidence/docs-concepts/browser/docs-concepts.pw.ts-complete-concept-copies-and-navigation-{desktop,mobile,desktop-reduced,mobile-reduced}/` contains `parts.png`, `state.png`, `phases.png`, `files.png`, and `trace.zip` in every project directory (16 screenshots, 4 successful traces). Visually inspected all four desktop and all four mobile screenshots: complete content, expected bands, reachable wrapped navigation, and inherited mobile Parts overflow. Code and table content outside their container viewport is horizontally scrollable, verified in the browser. Diagnostic captures also remain at `.evidence/docs-concepts/{parts,state,phases,files,guide}-mobile-diagnostic.png`.
Known limitations: Parts inherits source grid overflow on mobile. At 390px, its .zig is 342px while .copy, pre, and .fig are 663.516px, with right edge 687.516px. The source guide has the same geometry, now asserted by verification. Fixing it requires changing locked CSS or section markup and was explicitly excluded by B’s revised brief. State, Phases, and Files fit 390px. Remaining sibling destinations are absent, animation visibility depends on JavaScript, Google Fonts requires network access, and original numbered prose/operational claims remain unchanged.
Unverified criteria: None under revised C1–C5. B owns final full-suite/configured checks, source-preservation verification against base, commit, and phase transition. No commit or phase action performed by worker.

B final verification: `bun test` exited 0 with 52 pass, 0 fail, 540 assertions. `bun run typecheck` exited 0. `bun run format` exited 0 with every file unchanged. `git diff --exit-code e31834df16a47c8cf0ad2e1824dc7b306a5dab7f -- docs/guide.html docs/idea.html docs/index.html docs/style.css` exited 0. Independent source inspection confirmed complete copied sections, correct current markers, and unchanged footer/script for all four pages. `git diff --cached --check` exited 0 before commit. Six scoped files committed as `8b5b9e1` (`docs: split concept sections into standalone pages`). No issue files committed on the branch. All requested migration criteria verified, with inherited Parts mobile overflow explicitly retained as L4.
