# Plan: docs-operate

Direct synthesis by slot B from the brief, locked design and live checkout. `debate: "no"` requires no positions or rebuttals.

## Read first

- Authoritative `issues/open/docs-multipage/docs-operate/brief.md`, `design.md` and `state.yaml` under `/home/ivan/Work/infra/akrogon`.
- Worktree `REFERENCE.md`, `docs/idea.html` for the complete page shell, and `docs/guide.html` for sections `install`, `setup`, `create`, `next`, and `merge`. Locate by element boundaries, not fixed line numbers.
- `docs/style.css`, especially `.band`, `.band .card`, `.ink-band` and animation rules. Read only.
- `tests/browser/playwright.config.ts`, `tests/browser/docs-shell.pw.ts`, `package.json`, `tsconfig.json` and `.gitignore` for existing verification conventions.
- `learnings/LESSONS.md`: render actual behavior and report unresolved out-of-scope links. No historical evidence is needed for this extraction.

## Decisions and interfaces

- **D1. Ownership and ordering:** create only the five requested production pages. `docs-shell` is the only execution prerequisite and its shell, stylesheet and Playwright dependency are present in this checkout. Do not change `guide.html`, `idea.html`, `index.html`, `style.css` or sibling pages. The parent's eventual guide deletion belongs to another leaf.
- **D2. Shell:** copy the complete shell from `idea.html`, including fonts, stylesheet link, header/logotype, footer, `main id="top"` and animation script. Change the document title to the source section's accessible label plus ` · Akrogon Guide`, and move the sole current-page marker to the matching page. Keep valid shell `#top` links.
- **D3. Navigation interface:** preserve these sixteen relative destinations and their existing labels/order: index, idea, parts, state, install, setup, create, next, phases, files, merge, in-practice, limits, problems, learn, cheat, each suffixed `.html`. Exactly one nav link has `aria-current="page"`. Logo links are outside the sixteen-link nav.
- **D4. Content and appearance:** put the entire matching source section in each page's main, preserving prose, commands, tables, SVGs, classes, IDs and inline style attributes. Preserve the enclosing `<div class="band">` around install and create inside main, because it controls their background and card colors. Setup and next need no wrapper. Merge retains its own `class="ink-band"` and `.band-in` child. Do not add `sec` to merge. The ban on inline `<style>` elements does not prohibit the source's style attributes.
- **D5. Links:** rewrite content anchors targeting another guide section to its relative page file. Preserve valid local fragments and SVG references. No cross-section fragment anchors currently occur in these five source sections, so no content link change is presently needed. Keep external links intact. Do not invent new links or edit command examples.
- **D6. Verification support:** add `tests/browser/docs-operate.pw.ts` and a leaf-specific `tests/browser/docs-operate.config.ts`. Reuse the existing config's projects and browser settings through import/spread, overriding `testMatch` and `outputDir` for this leaf. Leave the shared config and shell spec unchanged so parallel page leaves do not compete over them. Use installed `@playwright/test`, headless Chromium, trace on, video off, and ignored `.evidence/docs-operate/` output. No dependency, build system or production script is needed.

## Acceptance criteria

- **C1. Complete extraction:** each main contains exactly one section with its matching ID and the complete source markup, allowing only D5 link rewrites. Installation and creation retain the source band wrapper. Merge retains its dark-band classes. No content or illustration is truncated.
- **C2. Page contract:** all five pages link `style.css`, contain no `<style>` element, and reproduce the shell with the correct title, sixteen navigation destinations and sole matching current marker. Local fragments resolve to elements in the same document.
- **C3. Browser flow:** starting on install, clicking Setup → Create → Next → Merge → Install reaches the expected file URL and visible matching content. At 1440×1000 and 390×844, navigation remains reachable, the document introduces no horizontal overflow beyond the source section, long code/table content remains accessible, and the header stays sticky. Normal and reduced-motion runs both reveal the content. Verify the next illustration and merge contrast/background against the source at the same viewport.
- **C4. Evidence:** the Playwright command exits zero and retains a full-page screenshot of each page plus traces. Scroll animated elements into view before capture, wait for their final opacity, and inspect the screenshots. Record actual artifact paths in the implementation brief.
- **C5. Scope and checks:** the four protected files are unchanged from the leaf base, the diff contains only the five pages and D6 verification files, and all configured checks pass. Commit implementation before review and record the commit.

## Ordered file and criterion checklist

1. **A1. Extract the pages:** create `docs/install.html`, `docs/setup.html`, `docs/create.html`, `docs/next.html`, and `docs/merge.html` using D2–D5. Preserve section boundaries and wrappers, then compare each copied section to the source. Covers C1/C2.
2. **A2. Exercise the flow:** add the two D6 verification files. Assert section preservation and page contracts, then navigate between all five pages and capture evidence across the inherited desktop/mobile and reduced-motion projects. Covers C1–C4. Negative and edge checks cover missing or duplicate current markers, leftover invalid fragments, inline style elements, hidden animated content, and narrow-screen overflow. Do not assert editorial wording or screenshot pixel identity.
3. **A3. Verify and hand off:** inspect screenshots and relevant computed styles against guide sections, run configured checks, inspect the scoped diff, remove iteration-only helpers, retain screenshots/traces, and record commands, results, limitations and committed implementation. Covers C4/C5.

## Concrete verification

From the leaf worktree after implementation:

```sh
bunx playwright test --config tests/browser/docs-operate.config.ts
bun run format
bun test
bun run typecheck
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
git diff --exit-code "$AKROGON_BASE" -- docs/guide.html docs/idea.html docs/index.html docs/style.css
git diff --check
git status --short
```

Use file URLs resolved relative to the spec, as the existing shell test does. If Chromium is not installed, run `bunx playwright install chromium` before verification. The new config selects only `docs-operate.pw.ts` and writes to `.evidence/docs-operate/browser`. Use `testInfo.outputPath` for `install.png`, `setup.png`, `create.png`, `next.png`, and `merge.png`, with project-specific directories supplied by Playwright. Keep trace output from every run. Check actual font loading using the existing shell approach before assessing font fidelity. Source-content assertions cover the entire section, while rendered checks cover visibility, navigation, layout and the preserved band styling.

## Open limitations

- **L1. Sibling pages:** several nav destinations belong to parallel leaves and do not yet exist here. Check their href contract without requiring those pages to load. Full-site link resolution waits for site assembly and does not block this leaf.
- **L2. External fonts:** inherited Google Fonts require network access. If fonts cannot load, record the verification failure and limitation rather than substituting mocks or claiming visual fidelity.
- **L3. Inherited content:** source command/configuration prose and animation behavior are copied as requested. Correcting existing instructions or redesigning no-JavaScript visibility is outside this leaf.

- **L4. Inherited next overflow:** at a 390px viewport, the unchanged next section expands the document to 490px because its inline prompt code does not wrap. Preserve the locked source and stylesheet. Verify the source and extracted next section have the same overflow geometry, record the screenshot evidence, and retain no-overflow assertions for the other four pages. This narrows C3 to migration regressions rather than requiring an out-of-scope source fix.
