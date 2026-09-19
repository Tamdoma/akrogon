# Guide to GitHub Markdown: independent territory map B

Destination: `/home/ivan/Work/infra/akrogon`. Make root `README.md` the reader entrance and maintain the guide as repository Markdown. This is documentation and its verification, not a CLI, skill-policy, hosting, or issue-store change. Recommendations below are not operator decisions. No A files were read.

## Inspected territory

The operator supplied a migration goal, not permission for a general documentation rewrite. The named audit nevertheless establishes a real content decision: the guide repeats operational rules that have drifted (`astra-6-akrogon-audit.md:127-135`). All 17 HTML pages were inspected, including their main content, with the four browser specs and configurations, README, command-reference test, reference index and package manifest.

| Surface | Content to account for | Evidence |
| --- | --- | --- |
| Entrance | Overview, illustration and 17-entry reading order | `docs/guide/index.html:55-57,60-147` |
| Concepts | Idea, vocabulary, state and phases | `docs/guide/idea.html:57-83`, `parts.html:56-127`, `state.html:55-88`, `phases.html:56-73` (all under `docs/guide/`) |
| Operating | Install, setup, create, chart, dispatch, files and merge | `docs/guide/install.html:56-80`, `setup.html:55-79`, `create.html:56-87`, `chart.html:56-72`, `next.html:55-116`, `files.html:57-107`, `merge.html:56-74` |
| Practice | Working day **and** use cases, limits, troubleshooting, lessons and cheat sheet | `docs/guide/in-practice.html:53-132`, `limits.html:55-66`, `problems.html:56-72`, `learn.html:55-61`, `cheat.html:55-90` |
| Existing reference | Install/init guidance, command contracts, skills and contributor index | `README.md:5-31,33-48,50`, `docs/reference-index.md:3-9` |
| Verification | HTML shell/rendering tests and a separate executable-command contract check | `tests/browser/docs-shell.pw.ts:45-94`, `docs-concepts.pw.ts:53-117`, `docs-operate.pw.ts:53-132`, `docs-practice.pw.ts:52-142`; `tests/command-reference.test.ts:8-32,50-62,72-115` |

Paths abbreviated within table rows retain the first path's directory.

## Material forks

### Q1 · Should README become a short entrance, or contain the whole guide?

The HTML home already links to topic pages. README separately contains useful installation and command reference material. Moving everything into one long README is different from making README the entrance.

Research: operator · intake, read 2026-09-19, asks for README “just like the homepage”; better-than-training · `docs/guide/index.html:130-147`, `README.md:5-48`; [GitHub's README documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes), read 2026-09-19, supports relative links and automatically derived heading outlines. This favors a linked entrance rather than reproducing website navigation everywhere.

- **A (recommended):** README holds the overview, a short start path and grouped guide links. Keep the existing `## Command` table as the single tested invocation reference. Convert the 16 topic pages to `docs/guide/<existing-stem>.md`; absorb `index.html` into README rather than creating another homepage. Each page links home and, if retaining sequential reading, to its next page. Keep `docs/reference-index.md` as the contributor/source map, linked from README.
- **B:** Put the entire guide into README with section links. Fewer files, but more scrolling and a much larger entrance. It also requires resolving overlapping install/setup/command content in one document.

Pitfalls: a directory link to `guide/` does not express the intended reader entrance after removing `index.html` (`docs/reference-index.md:7`). Update it explicitly. Do not lose the current skills links while absorbing the homepage (`README.md:50`). Keeping the command table in README avoids an unnecessary test relocation: the test reads that file and finds `## Command` literally (`tests/command-reference.test.ts:8,24-32`).

### Q2 · Is this a format conversion only, or may it correct and consolidate verified operational drift?

A faithful copy would retain claims that conflict with working code. For example, `files.html:63` and `limits.html:64` say sync stages everything, while README and `src/sync.ts` describe selective issue staging.

Research: operator · the intake names `astra-6-akrogon-audit.md:131`; its recommendation at lines 133-135 is one maintained command reference and preservation of the narrative. Verified against `src/sync.ts:17-33,109-114` and `README.md:48`, read 2026-09-19. The supplied lesson `learnings/history/2026-09-11-stale-rule-in-docs.md:3-5` shows this class of drift previously survived a narrowly owned change.

- **A (recommended, requires explicit scope choice):** Preserve the topic coverage and operator explanations. Correct the verified sync claim in every migrated occurrence, including the cheat-sheet description (`docs/guide/cheat.html:66-67`), and point to the README reference for detailed command contracts. Record further suspected drift for a separate review unless the operator explicitly includes it. No broad prose redesign or policy change.
- **B:** Convert content without behavioral corrections. Keep the known sync discrepancy explicit in the handoff limitations and assign its later correction an owner. This is smaller but republishes known inaccurate guidance.

Pitfalls: copying README is not a substitute for checking code. Its init row presents `--from` as required (`README.md:38`, `tests/command-reference.test.ts:12`), while the guide demonstrates init with only `--toolkit` (`docs/guide/setup.html:57-59`, `cheat.html:60`) and `initialize` accepts an absent proposal (`src/init.ts:13,18-23`). That is a reference discrepancy to settle if init consolidation is selected, not proof that the guide example fails. A full command/recovery audit would be a larger destination than this migration.

### Q3 · Should the five illustrations retain their artwork, or become simple editable diagrams?

The illustrations mix semantic relationships with site presentation. The homepage uses animated motion and CSS variables, and the files diagram relies on the shared shell styling (`docs/guide/index.html:60-126`, `files.html:66-91`, `style.css:23-25`). Extracting SVG markup alone does not preserve that styling.

Research: operator · the intake identifies five illustrations and the supplied audit recommends retaining diagrams (`astra-6-akrogon-audit.md:133`); better-than-training · [GitHub diagram documentation](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams), read 2026-09-19, documents fenced Mermaid rendering and version compatibility. These sources support preserving the explanation without retaining the website runtime.

- **A (recommended):** Replace conceptual illustrations with simple Mermaid diagrams where relationships benefit from them, and use fenced text for a directory tree. Preserve their meaning and explanatory captions. Drop decorative repeated logos, fonts, animation and reveal effects. Keep surrounding prose sufficient to understand each diagram.
- **B:** Extract five static, self-contained SVG assets with explicit styles and colors, linked as images with meaningful alternative text. This preserves the visual identity, at the cost of maintaining drawing assets and checking their light/dark rendering.

Pitfalls: do not silently discard information that appears only inside the illustration. In the homepage, the moving element follows `#hero-rail` and the reduced-motion script removes animation nodes (`docs/guide/index.html:62-68,171-182`). Treat this as a static explanation, not a requirement to reproduce motion. Prefer basic supported Mermaid constructs and inspect the rendered diagrams, not only their source.

### Q4 · Should the HTML guide be retired in the migration, or retained temporarily alongside Markdown?

Maintaining two editable guides works against “everything in one place.” The intake says the HTML is not published and is consumed through file URLs. The existing tests therefore verify a delivery format being removed.

Research: operator · intake's delivery description; better-than-training · `tests/browser/docs-shell.pw.ts:49-69,92-94`, `docs-operate.pw.ts:66-87`, `docs-practice.pw.ts:127-140`, read 2026-09-19. The earlier conversion lesson explicitly requires the source-deleting leaf to retire dependent tests in the same diff (`learnings/history/2026-09-11-guide-source-spec.md:3-9`).

- **A (recommended):** Remove the HTML/CSS and all four guide-only browser specs/configurations in the same migration. Remove `@playwright/test` and update `bun.lock` after confirming no remaining consumers. Update `tests/AREA.md`. Preserve command-reference checks. Verify topic coverage, repository-relative links and fragment targets, code examples, tables and selected rendered pages. No replacement site or browser framework.
- **B:** Keep HTML for an explicitly limited compatibility window, marked superseded and linked to Markdown. This needs a removal owner and date, and retains the old dependencies and two sets of links until then.

Pitfalls: deleting only `.pw.ts` leaves configurations importing Playwright (`tests/browser/playwright.config.ts:1-14`, `docs-concepts.config.ts:1-7`, `docs-operate.config.ts:1-8`, `docs-practice.config.ts:1-8`). Package scripts do not run browser checks (`package.json:5-8`), and the documented Playwright command selects only the shell spec (`tests/AREA.md:7`, `tests/browser/playwright.config.ts:5`). A green command test suite alone does not demonstrate successful document rendering. Do not translate font, sticky-header, shell-byte-equality or screenshot assertions into brittle exact-prose tests.

## Practitioner questions for the operator round

1. **P1:** What should a first-time reader do directly from README: understand the system, install it, or run existing work? The current home prioritizes explanation, while README prioritizes installation (`docs/guide/index.html:55-57,130-147`, `README.md:5-25`). This determines link order, not a new content hierarchy project.
2. **P2:** Does “convert” permit the bounded sync correction in Q2, or is a larger accuracy pass wanted? The audit explicitly recommends consolidation, but the intake locks out unchosen content rewriting (`astra-6-akrogon-audit.md:129-135`).
3. **P3:** Are there important saved local HTML bookmarks, and is the existing illustrated appearance valuable? The tests exercise file URLs and deep fragments (`tests/browser/docs-practice.pw.ts:127-140`). An unpublished site does not prove nobody bookmarks it.

## Conversion pitfalls and acceptance boundaries

1. **R1 — Lost sections:** `in-practice.html` contains both the working day and the use cases (`:53-103`). Account for both. Maintain a review-time source-to-destination checklist for all 17 sources, not a committed second content manifest or byte-equality oracle.
2. **R2 — Broken fragments:** HTML ids such as `#day` and `#cases` are not necessarily the generated Markdown heading anchors (`tests/browser/docs-practice.pw.ts:52-58,127-130`). Rewrite incoming links and check their destinations. Use relative repository links so branch previews and clones stay useful, as documented by [GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes).
3. **R3 — Altered commands:** Decode HTML entities into fenced code, preserve whitespace and literal angle brackets, and escape pipes within Markdown tables. Existing tests distinguish optional/required alternatives and explicitly normalize escaped pipes (`tests/command-reference.test.ts:30-45,85-115`). Do not run lifecycle examples as migration tests against the live repository.
4. **R4 — Tests asserting obsolete structure:** Concept tests compare almost the entire document against `idea.html`, and practice navigation still omits chart while the shell includes it (`tests/browser/docs-concepts.pw.ts:53-66`, `docs-practice.pw.ts:5-22`, `docs-shell.pw.ts:5-23`). These are not authoritative content inventories.
5. **R5 — Unowned retirement work:** Test documentation refers to browser files, fonts and file URLs (`tests/AREA.md:7,14,20-22`), and the reference index points at the guide directory (`docs/reference-index.md:7`). Own these updates alongside deletion. Do not edit historical audit/lesson evidence merely because it names old files.
6. **R6 — Scope creep:** The guide contains policy explanations, not just markup. Conversion must not change runtime behavior or quietly settle every historical claim. The operator owns any `issues/` updates outside the leaf, per the intake lock.

## Proposed leaf split and ownership

**L1 — `github-markdown-guide` (recommended single leaf, akrogon).** One independently checkable outcome: README leads to a complete Markdown guide, with no live HTML guide or orphaned test machinery if Q4-A is selected. Own `README.md`, `docs/guide/**`, `docs/reference-index.md`, the four guide browser specs/configs, `tests/AREA.md`, `package.json`, `bun.lock`, and `tests/command-reference.test.ts` only if an explicitly chosen reference relocation/correction needs it. Also own any chosen small link check under `tests/`, without adding a documentation framework. Carry Q1-Q4 decisions literally, including the approved content correction boundary. No `src/`, skill policy, or `issues/` edits.

Validation: account for all source topics and five illustrations; check links and fragments from README and between pages; inspect representative GitHub-rendered code, table and diagram pages; retain the semantic command-reference negative cases; run existing applicable tests and typecheck after dependency removal. Do not require exact prose or pixel equivalence. Rendering review does not authorize a deployment or a new hosting service.

**L2 — optional `guide-operational-accuracy`, only if the operator chooses a broader accuracy destination.** Own named current-guidance sections and evidence-backed corrections, not runtime behavior. If its contract targets the new Markdown paths, it depends on L1 because those artifacts must exist. Otherwise independently scoped corrections can proceed without inventing an ordering dependency. Do not create a leaf merely to delete tests after another leaf deletes their inputs.

Challenge check: the largest unresolved choice is content scope. Format fidelity preserves known misinformation, while a broad cleanup exceeds the request. Settle the bounded correction choice explicitly. Keep the migration as one leaf unless a separately selected accuracy outcome justifies another.
