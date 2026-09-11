# Implementation: docs-operate

## 1. Goal
Implement plan D1–D6: five standalone operating pages copied from the guide with the established shell and browser evidence.

## 2. Numbered acceptance criteria
1. C1: all five complete source sections preserved, including install/create band wrappers and merge ink-band.
2. C2: shell, titles, stylesheet and sixteen-link nav copied correctly, one matching current marker, no style elements or invalid local fragments.
3. C3: navigate Install → Setup → Create → Next → Merge → Install, with visible content, accessible narrow-screen tables/code and sticky navigation at desktop/mobile and reduced-motion settings.
4. C4: successful headless Chromium command with traces, no video, and screenshots of every page. Verify source styles and font loading.
5. C5: only five pages and two verification files change. Protected source files remain identical. B runs blocking checks and commits after worker return.

## 3. Read-first list
Read authoritative ../plan.md and ../design.md, worktree docs/idea.html, relevant sections in docs/guide.html, docs/style.css, tests/browser/playwright.config.ts and docs-shell.pw.ts, package.json, tsconfig.json, .gitignore, and /home/ivan/.codex/skills/implement-issue/ponytail.md. Existing shell browser test is the pattern.

## 4. Change list and needed interfaces
Create docs/{install,setup,create,next,merge}.html, tests/browser/docs-operate.pw.ts and docs-operate.config.ts. Import/spread existing Playwright config with leaf-specific testMatch/outputDir. No API or shared file changes.

## 5. Do-not, reasons and exceptions
Do not edit protected source/shared files or sibling pages, since this leaf only extracts five sections. Preserve source prose and inline style attributes, since content corrections are outside scope. Do not commit or change lifecycle state, which B handles. Return a mismatch with evidence instead of widening scope or interfaces. Only a revised brief from B permits an exception. These exclusions preserve source fidelity and parallel ownership, with revised authorization as the sole exception.

## 6. Ordered steps
1. Derive browser assertions from C1–C4 and run before pages exist to record red evidence. Add only leaf-specific config/spec.
2. Extract five pages from existing shell and source sections according to D2–D5. Run browser check to green, fixing owned files as necessary.
3. Run changed tests and fill section 8 with exact command results and evidence paths. About seven files, one bounded implementation unit. Return a mismatch if requirements cannot be met within this scope.

## 7. Commands
Resolved changed-test command: `AKROGON_BASE=e31834df16a47c8cf0ad2e1824dc7b306a5dab7f bun test --changed=e31834df16a47c8cf0ad2e1824dc7b306a5dab7f`.
The required targeted browser invocation for C3/C4 is `bunx playwright test --config tests/browser/docs-operate.config.ts`. Do not run the full Bun suite or other blocking checks, which B runs after return.

## 8. Done-when, evidence and report
C1–C4 pass with browser exit status and artifacts recorded. Report actual limitations and unverified criteria. B independently inspects screenshots and runs C5 checks before commit/handoff.

Changed files and reasons: Created docs/install.html, setup.html, create.html, next.html and merge.html by copying their complete source sections into the idea shell. Created tests/browser/docs-operate.pw.ts for source, shell, navigation, font, style, scroll and screenshot verification, and docs-operate.config.ts to reuse the shared browser projects with isolated output.
Tests run: `bunx playwright test --config tests/browser/docs-operate.config.ts` initially exited 1 with four missing-install.html failures before pages existed. Red traces remain under `.evidence/docs-operate/red-browser/`. After extraction and B's C3 clarification, the same command exited 0: 4 passed (8.6s), covering desktop/mobile and reduced-motion variants. `AKROGON_BASE=e31834df16a47c8cf0ad2e1824dc7b306a5dab7f bun test --changed=e31834df16a47c8cf0ad2e1824dc7b306a5dab7f` exited 0: 7 changed files, no affected Bun tests, 0 pass / 0 fail. Formatted only the two owned verification files with Prettier.

Evidence: `.evidence/docs-operate/browser/docs-operate.pw.ts-operati-c1325-urce-and-navigate-in-a-loop-{desktop,mobile,desktop-reduced,mobile-reduced}/` each contains `install.png`, `setup.png`, `create.png`, `next.png`, `merge.png`, `source-next.png` and `trace.zip`. Next geometry is attached to each trace. Inspected all five desktop and all five mobile page screenshots plus the mobile source-next screenshot. Content is visible, band/card styling and merge contrast are retained. Mobile tables and preformatted code scroll horizontally inside their containers, verified by reaching their right edge. Spectral, Bricolage Grotesque and Martian Mono loaded in every project.
Known limitations: Sibling pages are unfinished and their destinations are checked without opening them. External fonts require network. Source prose and animation behavior remain inherited. L4: next has a 490px document width at a 390px viewport because its nowrap prompt expands the grid copy and illustration to 466.46875px from x=24. The source next section has identical measured section/copy/illustration geometry. B explicitly retained this existing overflow under C3. Mobile Create and Next tables require horizontal scrolling, as in the source.
Unverified criteria: None under the recorded C3 scope clarification. Reduced-motion behavior was checked by browser assertions and captured screenshots. Visual inspection covered normal desktop/mobile images.

Implementation clarification from B: C3 permits the inherited next-page overflow at 390px, provided the test demonstrates matching source section geometry and reports it explicitly. Keep the no-overflow assertion for the other four pages. Do not alter source content or shared CSS. Record actual widths and screenshots for both source and migrated next. This exception corrects a plan criterion beyond the locked extraction scope.

B verification: `bun run format` exited 0 with all files unchanged. `bun test` exited 0: 52 pass, 0 fail, 540 assertions. `bun run typecheck` exited 0. Worker changed-test evidence above satisfies the configured changed-test check. Independent section extraction comparison confirmed all five source sections match exactly. Protected-file diff against e31834df16a47c8cf0ad2e1824dc7b306a5dab7f and staged diff whitespace check exited 0. Independently inspected all five desktop and mobile screenshots plus mobile source-next, confirming the recorded inherited overflow and scrollable table limitations. Only the seven planned files were committed.

Commit: `9f9def720ab1a28e1f535ed00ad89826ae145096` (`docs: extract operating guide pages`). `git status --porcelain` returned no output after commit. C1–C5 are complete under the source-preservation limitation.
