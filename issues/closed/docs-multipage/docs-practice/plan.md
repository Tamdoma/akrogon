# Plan: docs-practice

Direct synthesis by slot B. The leaf has `debate: "no"`, so there are no positions or rebuttals to integrate.

## Read first

- Authoritative leaf: `/home/ivan/Work/infra/akrogon/issues/open/docs-multipage/docs-practice/brief.md` and `design.md`.
- Worktree `REFERENCE.md`, then `docs/guide.html`: sections `day`, `cases`, `limits`, `problems`, `learn`, `cheat`, including surrounding `.band` wrappers. Locate by element boundaries, not line numbers.
- `docs/idea.html` for the complete page shell and animation script, and `docs/style.css` for existing layout classes. Read `docs/index.html` only for the existing entry navigation.
- `tests/browser/playwright.config.ts`, `tests/browser/docs-shell.pw.ts`, `package.json`, `tsconfig.json`, `.gitignore` for the installed browser verification pattern.
- `learnings/LESSONS.md`: rendered evidence matters, unresolved links must be reported, and implementation must be committed before review. No history lookup is required for this migration.

## Decisions and interfaces

- **D1. Scope and dependency:** create only the five owned documentation pages, plus the narrowly scoped browser verification files in D6. Preserve `docs/guide.html`, `docs/idea.html`, `docs/index.html`, and `docs/style.css` byte-for-byte. No prose corrections, worked seed-to-merge example, CSS changes, or other page edits. `docs-shell` is the only execution prerequisite. It is merged and its shell and Playwright dependency are present in this worktree. Neither other page leaf is a prerequisite.
- **D2. Shell:** copy the full idea document shell, replacing only its title, current navigation marker, and main content. Preserve charset, viewport, language, font links, stylesheet link, sticky header, logo SVG, footer, `main id="top"`, and final animation script. Use page-specific titles ending in ` · Akrogon Guide`. The script is required to reveal the inherited `[data-animate]` content.
- **D3. Navigation:** retain the shell's semantic `nav[aria-label="Pages"]` and sixteen relative links in this order: index, idea, parts, state, install, setup, create, next, phases, files, merge, in-practice, limits, problems, learn, cheat, each ending in `.html`. Exactly one nav link has `aria-current="page"`, matching its page. Logo/footer `#top` links stay local and are outside the page-link count.
- **D4. Content:** preserve the complete source sections, including IDs, headings, markup, code, classes, inline style attributes if present, and animation attributes. `in-practice.html` has one new page heading `<h1>In practice</h1>` in a `.wrap.hero` div before the unchanged `day` section, followed by the unchanged `cases` section inside its existing `.band` wrapper. This heading is the explicitly required addition, not permission for new explanatory prose. The remaining four pages each contain their corresponding section. Preserve the outer `.band` around `problems` and the `ink-band` class and `.band-in` child of `cheat`. Do not promote or rewrite source h2 headings.
- **D5. Fragment links:** rewrite only HTML anchor links that point to sections absent from the destination document. Map a section ID to `<id>.html#<id>`, with `day` and `cases` mapping to `in-practice.html#day` and `in-practice.html#cases`. Keep valid local fragments, `#top`, external links, and SVG references unchanged. Inspection found no cross-section anchor links within these six source sections, so no replacement is currently needed. Do not add links merely to exercise this rule.
- **D6. Verification:** reuse the installed `@playwright/test` dependency. Add `tests/browser/docs-practice.pw.ts` and `tests/browser/docs-practice.config.ts`. The latter imports the existing config and overrides only `testMatch` and `outputDir` for this leaf, preserving its four desktop/mobile and normal/reduced-motion projects and Chromium/headless/trace-on/video-off settings. Keep the shell config/spec unchanged to avoid shared-file conflicts with the parallel page leaves. Evidence goes under `.evidence/docs-practice/browser/`. No new dependency, server, build system, shared test framework, or hosting work is needed.

## Acceptance criteria

- **C1. Complete migration:** the five files exist. Their six source sections match the guide's full section markup except any D5-required link rewrites. Each source section occurs once on its assigned page. In practice retains day before cases under its one h1. Problems and cases retain their background wrappers, and cheat retains its dark band. No new prose beyond the required heading.
- **C2. Shared shell:** each page links `style.css`, contains no `<style>` element, preserves the shell and script, and meets D3's sixteen-link/current-marker contract. Source inline style attributes are permitted because the prohibition is on style blocks.
- **C3. Navigation behavior:** a reader can click Home → In practice → Limits → Problems → Learn → Cheat sheet → Home. Each click reaches the expected file and updates the current marker. Direct `in-practice.html#day`, `in-practice.html#cases`, and each other owned page's section fragment resolve to an existing unique section. Local anchor destinations exist. No link points to a removed guide section as an invalid local fragment.
- **C4. Rendering:** all five pages render at 1440×1000 and 390×844 in normal and reduced-motion modes. Scrolling reveals each animated content block. Navigation remains visible and reachable, the header remains sticky, and content is readable. Tables and preformatted commands stay within their existing containers, except the inherited day-section overflow confirmed during implementation. For day, require section and command geometry to match the source at the same viewport with no additional overflow. For all other owned sections, retain the no-page-overflow requirement. Compare source and migrated backgrounds, typography, and content layout at matching viewports, allowing the new shell and In practice heading. Check actual font loading before claiming font fidelity.
- **C5. Evidence and scope:** the browser command exits zero and retains a full-page screenshot for every owned page in each project, plus traces. Inspect screenshots. Record exact commands and actual artifact paths in the implementation report. The four protected documentation files have no diff from the leaf base, required checks pass, and the implementation is committed with a clean worktree before review.

## Ordered file/criterion checklist

1. **A1 — Create `docs/in-practice.html`:** copy the shell, add the required h1, extract the full day and cases sections with the cases wrapper, set title/current marker. Verify C1/C2 and establish the content-copy procedure.
2. **A2 — Create `docs/limits.html`, `docs/problems.html`, `docs/learn.html`, `docs/cheat.html`:** copy the shell and corresponding source sections with D4 wrappers and per-page title/current marker. Inspect anchor destinations using D5. Satisfies C1–C3.
3. **A3 — Add the two D6 browser files:** verify source preservation, navigation, fragments, backgrounds, animation visibility, and responsive reading. Use the existing spec as the local API/style reference without refactoring it. Cover negative/edge cases through missing or duplicate markers/IDs, invalid local fragment detection, long code/table containment, and reduced-motion visibility. No exact-prose assertions except the explicitly locked source-copy requirement and required heading.
4. **A4 — Run verification and hand off:** inspect saved screenshots, run configured checks, inspect the scoped diff, remove iteration-only helpers, record artifacts and any inherited limitation, and commit implementation before review. Satisfies C4/C5. Issue artifacts remain in the registered checkout, never on this worktree branch.

## Concrete verification

Run from the leaf worktree after implementation:

```sh
bunx playwright test --config tests/browser/docs-practice.config.ts
bun run format
bun test
bun run typecheck
git diff --exit-code "$AKROGON_BASE" -- docs/guide.html docs/idea.html docs/index.html docs/style.css
git diff --check
```

Use worktree-relative file URLs, as the existing shell spec does. The browser scenario starts at index and follows C3's actual nav clicks. At every owned page, assert its shell and marker, scroll each `[data-animate]` block into view and wait for opacity 1, verify the relevant sections and containment, return to the top, and save `testInfo.outputPath('<page>.png')` with `fullPage: true`. Separately exercise the retained section fragments. Compare source sections against the source guide in the same browser context and viewport, including effective backgrounds from `.band` and `.ink-band`. Keep traces from the inherited configuration. Source comparisons use section boundaries, including the class-first opening tag of cheat, rather than a single assumed attribute order. If Chromium is missing locally, run `bunx playwright install chromium` before the browser command. Do not execute any shell commands printed inside the migrated guide as part of browser verification.

## Open limitations

- **L1. Pending destinations:** the concept and operating pages are absent from this worktree at synthesis time. Preserve their agreed nav links and report unresolved destinations without adding placeholders. Full-site link resolution and guide deletion belong to docs-retire-guide after the page leaves merge.
- **L2. Inherited rendering:** external Google Fonts need network access. At 390px, the source day section and its faithful copy both have clientWidth 390 and scrollWidth 806 because the Watching command block expands its grid item. Preserve and report this existing defect under the locked section/CSS scope, with source-geometry equality as the regression check. The inherited animation threshold may also prevent very tall animated wrappers from revealing at narrow viewports. Browser verification must exercise the actual long sections and report a concrete failure if found. Do not change protected CSS/script, force content visible in the test, or report a failing render as passed. Without JavaScript, the inherited normal-motion CSS also hides animated content. Repairing inherited behavior requires separate scope.
