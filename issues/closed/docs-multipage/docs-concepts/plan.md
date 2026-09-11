# Plan: docs-concepts

Direct synthesis by slot B. Authoritative state has `debate: "no"`, so positions and rebuttals are not required.

## Read first

- Registered checkout `/home/ivan/Work/infra/akrogon`: `issues/open/docs-multipage/docs-concepts/brief.md`, `design.md`, and `state.yaml`.
- Worktree: `REFERENCE.md`, then `docs/guide.html` sections `parts`, `state`, `phases`, and `files`, including the enclosing `.band` elements for parts and phases.
- `docs/idea.html` for the complete head, header/nav, main wrapper, footer, and animation script. `docs/style.css` for inherited band, table, code overflow, and animation behavior.
- `tests/browser/playwright.config.ts`, `tests/browser/docs-shell.pw.ts`, `package.json`, and `.gitignore` for the existing browser verification setup.
- `learnings/LESSONS.md`: exercise rendered behavior and report unresolved out-of-scope links. No history is needed to verify a historical claim for this migration.

## Decisions and interfaces

- **D1. Scope and dependency:** create only the four requested production pages. The actual prerequisite is docs-shell, whose `idea.html`, stylesheet, and Playwright setup are present in this checkout. No other page leaf must finish first. Leave `docs/guide.html`, `docs/idea.html`, `docs/index.html`, and `docs/style.css` byte-identical. Guide deletion belongs to docs-retire-guide.
- **D2. Shell:** copy idea's head, header, footer, and final animation script verbatim, changing only the title and current nav marker. Use titles `Every moving part · Akrogon Guide`, `The state file · Akrogon Guide`, `The phases · Akrogon Guide`, and `Where files live · Akrogon Guide`. Keep `main id="top"` so logo/footer anchors work. Keep the script because the inherited CSS initially hides animated content.
- **D3. Navigation:** preserve the sixteen relative destinations and their order: index, idea, parts, state, install, setup, create, next, phases, files, merge, in-practice, limits, problems, learn, cheat, each with `.html`. Exactly one nav link has `aria-current="page"`, matching the page. Keep the inherited labels and placement.
- **D4. Content and appearance:** each main contains the complete source section with its original ID, prose, numbering, tables, examples, SVGs, attributes, and whitespace. Retain the enclosing `<div class="band">` around parts and phases inside main because it supplies their background and phase-card styling. State and files have no such wrapper. “No inline style” here means no `<style>` element, as the brief specifies. Preserve existing `style` attributes inside copied content.
- **D5. Links:** rewrite actual HTML anchors targeting other guide sections to their destination page, such as `href="#state"` to `href="state.html"`. Keep valid same-page fragments and SVG references intact. These four source sections currently contain no cross-section anchors, so their section markup can be copied unchanged. Do not rewrite plain prose such as “section 08” or introduce links as editorial improvements.
- **D6. Verification support:** reuse the installed `@playwright/test` dependency. Add `tests/browser/docs-concepts.pw.ts` and a leaf-specific `tests/browser/docs-concepts.config.ts`. Import the existing default config and override only test selection and output directory, preserving its four viewport/motion projects, headless Chromium, trace on, and video off. Use `.evidence/docs-concepts/browser/`. Keep the shell spec/config unchanged and introduce no server, build step, dependency, or general test framework. Use existing helper patterns without refactoring unrelated tests.

## Acceptance criteria

- **C1. Complete copies:** all four files exist. Each main contains exactly one section with the matching ID, and its full markup matches the guide after only D5's permitted anchor changes. Parts and phases retain their band wrappers. No prose, example, table row, SVG, or inline attribute is lost.
- **C2. Shell contract:** each page loads `style.css`, has no `<style>` element, preserves the source head links, header/footer/logo and animation script, and satisfies D3. Normalizing only the title and current marker makes the copied shell equal to idea's shell.
- **C3. Navigation behavior:** opening index through `file://`, clicking Parts → State → Phases → Files → Home reaches the expected files, with the correct current marker and visible content on each. Logo/footer `#top` destinations resolve. Any retained content fragments resolve within their page. Do not require not-yet-created sibling pages to exist.
- **C4. Rendered edges:** at 1440×1000 and 390×844, with normal and reduced motion, all section content becomes visible after scrolling into view, tables/code remain readable through their existing overflow containers, navigation is reachable, and migration introduces no horizontal overflow beyond the source section at the same viewport. Parts has confirmed inherited mobile grid overflow, retained under the locked source-copy requirement. The sticky header and inherited band backgrounds remain correct. Compare relevant computed fonts/colors/layout against each source section at the same viewport, then inspect screenshots. Do not enforce animation pixel identity.
- **C5. Preservation and evidence:** the four excluded source files have no diff from `AKROGON_BASE`. Browser verification exits zero and retains full-page screenshots of each new page plus traces. The implementation report records actual commands, results, screenshot paths, and trace paths.

## Ordered file and criterion checklist

1. **A1. Capture and migrate:** verify the four source files against the base, then create `docs/parts.html`, `docs/state.html`, `docs/phases.html`, and `docs/files.html` using D2–D5. Inspect section boundaries rather than copying fixed line ranges. Covers C1/C2.
2. **A2. Add browser verification:** write the D6 config/spec. Assert source completeness and the shell contract, then exercise C3/C4 in all inherited projects. Negative checks cover duplicate/wrong current markers, inline style blocks, missing local fragment targets, and content left transparent after animation. Do not manufacture cross-section links just to test a rewrite absent from the source.
3. **A3. Render and inspect:** save a screenshot for each page in each project using `testInfo.outputPath`, after revealing all animated content. Keep traces. Inspect desktop and mobile captures for clipped text, missing content, lost band styling, and unusable navigation. Verify actual font loading with the existing shell test's approach. Covers C4/C5.
4. **A4. Handoff:** run the commands below, inspect the final scoped diff, remove iteration-only helpers, and record evidence and limitations in the authoritative implementation report. Commit implementation files on the leaf branch before review. Issue artifacts stay in the registered checkout.

## Concrete verification

From the worktree, after implementation:

```sh
bunx playwright test --config tests/browser/docs-concepts.config.ts
bun run format
bun test
bun run typecheck
git diff --exit-code "$AKROGON_BASE" -- docs/guide.html docs/idea.html docs/index.html docs/style.css
git diff --check
```

If Chromium is not installed, run `bunx playwright install chromium` before browser verification. Use file URLs resolved relative to the spec, as the existing shell test does. Name screenshots `parts.png`, `state.png`, `phases.png`, and `files.png` under each project's test output directory. The trace is retained by the inherited `trace: 'on'` setting. Record emitted paths rather than guessed paths. Run the browser command again if verification-driven edits change its inputs.

## Open limitations

- **L1. Sibling destinations:** only index and idea exist before this leaf. Links to the remaining ten pages stay present even while those sibling leaves are unfinished. Full-site link resolution belongs to docs-retire-guide.
- **L2. Inherited behavior:** Google Fonts requires network access, and the copied animation script/CSS has the existing JavaScript dependency. Font-loading failures or inherited rendering defects must be reported with evidence. Do not hide them with mocks or change the locked shared files.
- **L3. Source wording:** the source still refers to numbered sections and includes existing operational claims. This leaf preserves that wording. Correcting or modernizing guide content is outside its locked migration scope.

- **L4. Confirmed mobile Parts overflow:** at a 390px viewport, its 342px grid contains a 663.516px copy/pre/figure extending to 687.516px, identically in guide and migrated Parts. Fixing `.zig .copy` minimum width requires changing locked CSS or section attributes. Preserve source fidelity and verify equal section geometry instead. State, Phases, and Files must remain within the viewport.
