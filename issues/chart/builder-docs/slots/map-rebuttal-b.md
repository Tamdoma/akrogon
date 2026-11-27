# Rebuttal on the merged map: slot B
**D1. K3, the six-picture list drops the three tabs.**
- Evidence: INTAKE.md, operator point 1 ("I always start with three tabs open"). forks/signposts.md `## Question` 5a lists "the three tabs" first.
- Consequence: the operator's own starting point has no picture. Make the README hero the three-tabs picture, so the count stays six.

**D2. K3 dark handling: I oppose the in-SVG media query (A).**
- Evidence: tamdoma.ai's stylesheet has no `prefers-color-scheme` rule and no dark palette (raw CSS read 2026-11-27). GitHub Docs "Quickstart for writing on GitHub" (fetched 2026-11-27) documents only the `<picture>` method.
- Consequence: the picture leaf would have to invent a dark palette that signposts 5 does not cover, and every picture needs two renders checked.

**D3. K4 hype-word ban (C): I oppose it.**
- Evidence: Correction 2026-11-27 allows "a little bit of soft selling". The existing ban tests cover exact retired product terms only (tests/hold-retired.test.ts:148, tests/run-permit.test.ts:796).
- Consequence: a style word list turns unrelated leaves red when an ordinary word matches, and passes hype that is not on the list. Put "no marketing jargon" in the cold-reader and slot B review bar.

**D4. K2: I withdraw my own pick to change the Direct-under-autopilot rule in the rename leaf.**
- Evidence: the refusal is stated twice on purpose. skills/chart-issues/SKILL.md `## Direct route` lists "the door is running under autopilot" among its refusals, and assets/autopilot.md:15 repeats it. My map called this one sentence to align, which was wrong. 13 CHART.md files record a breach.
- Consequence: a behaviour change would ride inside a leaf reviewed as a words-only rename. Rename leaf keeps the rule. The docs state the rule as written. The gap between rule and practice goes out as a separate seed.

**D5. K6 pictures last (C): I oppose it.**
- Evidence: INTAKE.md, "the charts and SVGs are not intuitive to follow". The Tamdoma look has never been drawn in this repo (today's 19 pictures use a white card and `#0969da`).
- Consequence: the operator's read cannot judge the pictures. A rejected look found at the end means redrawing all six, not the two charting ones.

**D6. K1: neither folder shape is right as written.**
- Against mine (B): GitHub lists folders alphabetically, so chapter folders show as away, charting, lifecycle, merging, reference, setup. That is not the reading order.
- Against C's 8 to 9 pages: charting has five topics in the merged K1 line (session, Charting mode, Build route, signposts, hand-off). In 8 to 9 pages total, Charting mode and Build route share a page, and Correction 2026-11-27 asks to "differentiate two things and make it very clear".
- Consequence and fix: one `docs/guide/` folder with numbered file names, and charting keeps one page per topic (about 12 guide pages).

**D7. K4 first line is too broad: src does print a route word.**
- Evidence: src/direct.ts:62 prints "is not a direct leaf". tests/direct-drop.test.ts:324, tests/direct-create.test.ts:317 and tests/direct-seats.test.ts:239 pin it.
- Consequence: a leaf that applies the approved capitalised "Direct" to printed text breaks three tests. The contract should say printed strings and record values stay lower-case.
