# How do the docs carry the charting picture for beginners?

## Question
Q9 Where in docs/guide does the charting picture (territory, map, fog, fork, question, round, chart, off route, and the flow) live?
Q10 How far does "simpler" reach: the pages that touch charting, or a full pass over all sixteen pages?

### Carries
- Operator, round 3, verbatim: "we need to rewrite the docs and make them even simpler and synced to the new naming system. Everything has to flow smoothly and has to be easy to digest for beginners in akrogon."
- Taken: docs pages reword decision, unspecified to fork, taken, fog (disk-names.md Q3).
- Lesson 2026-09-11 stale-rule-in-docs: grep docs/ for a changed rule and own or report the hit.

## Findings
- (A) docs/guide is 16 pages, 2067 lines, read in order, each page ending with a link to the next. Only six lines mention the old chart words (create.html 2, files.html 3, in-practice.html 1).
- (A) No page explains charting itself. create.html gives the door one table row, parts.html one tree line, files.html one row, cheat.html one command. parts.html already has "The words, one at a time" for repo, epic, issue, leaf, and is the natural home for the eight chart words.
- (A) "Simpler" across all sixteen pages has no check yet. That is fog until a criterion exists.

## Taken
Operator, round 4: "9a | 10a".
Q9: the eight words join "The words, one at a time" in docs/guide/parts.html, and a new page chart.html between Create and Next tells the flow with the intake's session example. create.html, files.html, in-practice.html and cheat.html sync their chart lines. Reason: one page per step, charting has no step page today. Closed: expanding Create with the picture.
Q10: only the pages Q9 touches are rewritten for a beginner: short sentences, one idea per paragraph, terms used only after Parts defines them. Reason: checkable in review. Closed: a full pass over all sixteen pages, which would need its own chart and criterion.
