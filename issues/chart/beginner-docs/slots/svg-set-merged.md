# Merged notes — svg-set

Q1
- (a) three animated views, each with a distinct job: overview (request → contract → explicit start → checked landing; same file in README and its concept page), life of one change (plan → build → review ⇄ fix → land, the loop shown as possible not mandatory, the command lands green work, not B), chart door (consultants work blind, questions, answers, contract) (A,B). Static: folder map (A,B).
- Correction (B, A agrees): the static "ways to run work" view shows three separate dials, not four equal options — how decisions are made (attended or autopilot), how work is delivered (direct or lifecycle), and optional watching while it runs (watch-issues). Autopilot stops at hand-off. The picture shows allowed combinations: autopilot only leads to lifecycle delivery; watching attaches to lifecycle execution, not to direct work (B rebuttal; skills/chart-issues/SKILL.md Autopilot).
- Base state is the complete picture; motion only emphasizes; prose and alt text beside each (B).
- (b) rejected: noise and upkeep (A,B). (c) rejected: review loop and chart door too crowded into one picture (A,B).
Q2
- (a) one SVG per picture with its own solid background card, contrast checked on both GitHub themes (A,B).
- (b) rejected: A said in-<img> prefers-color-scheme follows the OS; B corrected — MDN says it follows the embedding element's color-scheme, which GitHub's CSS controls, not us; either way uncontrolled (B, MDN prefers-color-scheme, 2026-10-23). (c) rejected: two files per picture drift (A,B).
Q3
- (a) hand-written SVG, CSS @keyframes, viewBox, system fonts, no script/external resources, prefers-reduced-motion shows the full static picture (A,B). Finite emphasis rather than endless loops by default (B; A agrees).
- Practitioners: DenverCoder1 readme-typing-svg (SMIL, hosted endpoint), Platane snk (CSS animation, theme variants) — show both techniques ship in READMEs (B, 2026-10-23; A cited readme-typing-svg and github-readme-stats from model knowledge).
- (b) SMIL rejected: works, but CSS gives the simple reduced-motion path (A,B). (c) generator rejected: ~5 files don't justify a tool (A,B).
Q4
- (a) charting probe, only with operator approval (A,B). Plan: one tiny self-contained SVG + one .md using the final embedding form, pushed to a throwaway branch of public Tamdoma/akrogon (ivanjuras has push, A checked 2026-10-23); view the rendered .md on github.com with the site theme set to light then dark, normal and reduced motion, narrow viewport (blepsis/chromium exist locally); save screenshots in the chart; delete branch; confirm absence with git ls-remote (A,B).
- (b) acceptable only as an explicit lower-confidence choice (B). (c) rejected: finds problems after everything is built (A,B).
Pitfalls: picture teaches a wrong flow → node/edge list checked against src and skills before styling (B); labels overflow with viewer fonts → short labels, generous boxes, checked at embedded width (A); a single screenshot proves one instant → check several points and motion-off (B); Playwright present in node_modules but not declared in package.json → leaf uses existing tooling (blepsis) for inspection, no new screenshot suite (B).
Differences: none left.
