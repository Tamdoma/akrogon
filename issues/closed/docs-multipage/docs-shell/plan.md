# Plan: docs-shell

Direct synthesis by slot B. The leaf has `debate: "no"`, so no positions or rebuttals are required.

## Read first

- `issues/open/docs-multipage/docs-shell/brief.md` and `design.md` in the registered checkout `/home/ivan/Work/infra/akrogon`.
- `REFERENCE.md`, then `docs/guide.html` in the worktree. Relevant source: head and CSS at lines 1–204, header at 208–225, hero at 230–326, idea at 329–360, footer and animation script at the end. Use element boundaries rather than assuming line numbers remain stable.
- `package.json`, `bun.lock`, `tsconfig.json`, `.gitignore` for verification integration. `.evidence/` is already ignored. There is no Playwright dependency yet.
- `learnings/LESSONS.md`. Relevant evidence principles: exercise rendered behavior rather than relying on inspection, and report out-of-scope unresolved links. No lesson history is needed to decide this migration.

## Decisions and interfaces

- **D1. Scope:** create `docs/style.css`, `docs/index.html`, and `docs/idea.html`. Leave `guide.html` byte-identical. Its eventual deletion belongs to docs-retire-guide. No prerequisite leaf is needed to execute this leaf. The later page leaves need this shell before copying it.
- **D2. Styles:** copy the complete bytes between the guide's `<style>` and `</style>` tags into `style.css`. Preserve whitespace, selectors, values, media queries and animations. Both pages link `style.css` and reproduce the source font links and preconnects. No new CSS rules or inline style blocks.
- **D3. Shared shell:** both pages have the doctype, `html lang="en"`, charset, viewport, a page-specific title, shared head links, sticky `header.nav`, `main id="top"` with exactly one section, and the original footer. Preserve the logotype SVG and Akrogon name in `.nav-in`. Keep its logo link `#top`, which remains valid on each page. Replace the old guide metadata/cheat link with a semantic `nav` inside the header, in a separate `.wrap` below `.nav-in`. Use plain, whitespace-separated text anchors that wrap naturally with existing styles. Do not put page navigation inside `.meta`, which the existing mobile media query hides. This avoids fitting sixteen links beside the logo or changing the locked stylesheet.
- **D4. Navigation contract:** the semantic page nav has exactly sixteen relative file links in this order: `index.html`, `idea.html`, `parts.html`, `state.html`, `install.html`, `setup.html`, `create.html`, `next.html`, `phases.html`, `files.html`, `merge.html`, `in-practice.html`, `limits.html`, `problems.html`, `learn.html`, `cheat.html`. Use concise readable labels, including Home and In practice. Exactly one nav anchor has `aria-current="page"`, matching the document. Logo/footer links are outside this sixteen-link nav. Repeat the same nav markup on both pages except the current marker.
- **D5. Content:** copy the entire idea section, including opening and closing section tags, byte for byte inside idea's main. Preserve the hero copy, SVG, and wrappers on index. Within that hero, replace its old fragment-based table of contents with one list entry for each of the sixteen page destinations, including index, with one brief description each. Combine day/cases into In practice. Keep this list inside the hero so main still contains one section. Do not rewrite the idea prose or other guide sections.
- **D6. Animation:** copy the guide's final script into both pages after the footer. The unchanged CSS makes `[data-animate]` invisible until this script reveals it. Preserve its reduced-motion handling as well. No new shared JavaScript file or animation redesign.
- **D7. Verification tooling:** the standing design requires Playwright, headless Chromium, trace on and no video. Install `@playwright/test` as a consumer-repo dev dependency, updating `package.json` and `bun.lock`. Add a narrowly scoped Playwright config/spec under `tests/browser/` with the spec named `docs-shell.pw.ts` and explicit Playwright `testMatch` so ordinary Bun tests do not discover it as a Bun test. Use an explicit Playwright command and an existing ignored `.evidence/docs-shell/` output directory. No production server, bundler, hosting or build step is introduced. These support files implement the mandatory verification requirement.

## Acceptance criteria

- **C1. Source preservation:** CSS inner bytes and the full idea section match the guide exactly. The guide has no diff from the leaf base. Both new documents contain no `<style>` block.
- **C2. Shell and navigation:** both documents have the required head, logo, footer, one main section and the sixteen-link nav contract in D4. Both use the same stylesheet. Home → Idea → Home works by clicking visible navigation links when opened through `file://`.
- **C3. Index:** the hero text and illustration remain intact, its page list has sixteen relative destinations and a meaningful one-line description for each, and no obsolete `#day`, `#cases` or missing-page fragment links remain in that list. Preserve the hero SVG's valid `#hero-rail` reference.
- **C4. Rendered behavior:** at desktop (1440×1000) and narrow (390×844) viewports, content and SVGs become visible after scrolling into view, nav links remain reachable without horizontal page overflow, and the header remains sticky. Match the source's fonts, colors and content layout at the same viewport, allowing the new header's different height. Check normal and reduced-motion modes. Verify actual font loading before assessing font fidelity.
- **C5. Evidence:** the end-to-end command exits zero and retains full-page screenshots of both pages and a Playwright trace, including an idea screenshot path recorded in the implementation report. Inspect the screenshots rather than treating their existence as visual approval.

## Ordered execution checklist

1. **A1 — Source extraction:** write `docs/style.css` from the original style inner text. Save/check the guide's original hash. Satisfies C1.
2. **A2 — Pattern page:** build `docs/idea.html` with D3/D4 shell, unchanged idea section, original footer and D6 script. Satisfies C1/C2 and establishes the exact shell later leaves copy.
3. **A3 — Entry page:** copy that shell into `docs/index.html`, change title/current marker, and place the source hero with the revised descriptive page list inside main. Satisfies C2/C3.
4. **A4 — Verification:** add the D7 dependency/config/spec and exercise C1–C5. Test behavioral negatives and edges: no duplicate/wrong current marker, no inline style block, no lost content from animation initialization, no hidden mobile page nav, and reduced-motion content visibility. Do not test arbitrary descriptive wording or demand screenshot pixel identity across animations. Preserve byte equality only for the explicitly locked source copies.
5. **A5 — Handoff:** run configured checks, review the scoped diff and record exact verification commands and artifact paths. Preserve all requested evidence, remove iteration-only helpers, and commit the implementation before handing it to review.

## Concrete verification

From the leaf worktree, implementation runs:

```sh
bun add --dev @playwright/test
bunx playwright install chromium
bunx playwright test --config tests/browser/playwright.config.ts
bun run format
bun test
bun run typecheck
git diff --exit-code "$AKROGON_BASE" -- docs/guide.html
git diff --check
```

The Playwright config selects only the docs-shell spec, uses Chromium/headless, `trace: 'on'`, `video: 'off'`, and writes under `.evidence/docs-shell/`. Resolve file URLs from the worktree, not a hardcoded machine path. The scenario opens index, clicks Idea, checks its current marker and visible text/illustration, scrolls to reveal all animated content, saves the idea screenshot, clicks Home and saves index. Repeat for the narrow viewport and reduced motion. Compare source section rendering/computed styles at matching viewports and visually inspect retained screenshots. Source-byte assertions read the original guide and generated files. Record the actual screenshot and trace paths emitted by the runner.

## Open limitations

- **L1. Pending pages:** fourteen page destinations do not exist in this leaf. Their links are intentional and must be reported, not replaced with placeholders or treated as a shell failure. Full link resolution belongs to docs-retire-guide after the page leaves land.
- **L2. External fonts:** the inherited Google Fonts links require network access. An unavailable font service prevents confirming actual font fidelity in that run and must be reported rather than hidden with mocks.
- **L3. Inherited animation behavior:** without JavaScript, the copied guide CSS keeps animated content hidden except in reduced-motion mode. Fixing that existing design behavior would require changing the locked source CSS/content and is outside this leaf.
