# Round 1: shape of the markdown guide

## Question
Q1 What does README look like: homepage on top with the existing reference kept below (A), or homepage only with the reference tables moved out (B)?
Q2 Convert as is (B), or also correct the one verified sync claim in its three places (A)?
Q3 Illustrations: drop and keep captions as prose (A), redraw as Mermaid (B), export static SVG (C)?
Q4 Add one bun test that relative links and anchors in README and docs/guide/*.md resolve (A), or no test (B)?
Q5 Remove HTML, CSS, four specs, four configs and the Playwright dependency in the same leaf (A), or keep HTML for a window (B)?

### Carries
- Leaf branches carry code only, never issues/ (phase.ts refuses issues/ diffs).
- No widening into a content rewrite beyond what Q2 selects.
- lesson 2026-09-11 guide-source-spec: the leaf deleting a source retires its dependent tests in the same diff.

## Findings
Full maps in slots/map-A.md and slots/map-B.md, merge in slots/map-merged.md, rebuttal in slots/map-rebuttal-B.md.
- Q1 (B recommended A) tests/command-reference.test.ts:24-32 reads README's `## Command` literally, keeping the table avoids a retarget. (A) cheat page repeats the command table; under A it points at README.
- Q2 (B) three occurrences of the wrong sync claim: files.html:63, limits.html:64, cheat.html:67; src/sync.ts:6-34 is the truth. (B) init `--from` discrepancy README.md:38 vs src/init.ts:13-23, recorded as a limitation.
- Q3 (A) illustrations depend on style.css variables and SMIL, GitHub strips inline SVG. (B) GitHub renders fenced Mermaid natively (docs.github.com "Creating diagrams", read 2026-09-19).
- Q4 (A) nothing today checks links; the specs check fonts and shell bytes. (B) no exact-prose or screenshot tests.
- Q5 (both) recommend removal. (B rebuttal, taken) four configs not three: playwright.config.ts plus docs-concepts, docs-operate, docs-practice configs, all importing @playwright/test. (B rebuttal, taken) removal is a fork for the operator, not a settlement.
- Layout settled by both maps without a question: docs/guide/<same stem>.md, index.html absorbed into README, one leaf.

## Taken
Operator 2026-09-19, verbatim: "1a | 2a - also add the gacp script so they can put it into their .bashrc. It has to contain its own page guide with noob explainer on what it does and when to use it | 3a | 4a | 5a"

- Q1 A: README = intro paragraph and reading order on top, existing install, init, command and skills reference below. Foreclosed: moving the reference tables.
- Q2 A plus gacp: correct the sync claim in three places, nothing else. Add a guide page for gacp holding the script as a bash function to paste into .bashrc, with a beginner explanation of what it does and when to use it. Foreclosed: byte-faithful copy, broader accuracy pass.
- Q3 A: drop the five illustrations, keep caption sentences as prose. Foreclosed: Mermaid, static SVG.
- Q4 A: one bun link test. Foreclosed: no test.
- Q5 A: HTML, style.css, four specs, four configs, @playwright/test and its lockfile entries leave in this leaf. Foreclosed: compatibility window.

Chart decision (A, routine): the gacp page ships the function text only, no repo script file, because the operator asked for something pasted into .bashrc. The page is docs/guide/gacp.md and joins the reading order after Files.
