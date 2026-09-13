# Brief: guide-chart-picture

## What
The operator guide under `docs/guide/` explains charting in the eight words shipped by `rename-vocabulary`, in a way a beginner in akrogon can read in order.

- `parts.html`: the section "The words, one at a time" gains territory, map, fog, fork, question, round, chart, off route, each in one or two short sentences, after repo, epic, issue, leaf.
- New page `chart.html` between Create and Next: how a chart flows. Look at the territory, draw the map. Sharp parts become forks, the rest is fog. Forks are put to you in rounds, every question with exhaustive options and one recommended. Every answer redraws the map, fog clears into forks, new forks can appear at any round. When no fork is open and no fog is left the route is clear and the chart hands off. Include the worked example from the chart intake (a seat that quits mid-phase: three forks, one patch of fog, four rounds, one thing off route). The page joins the header nav of every page, the index page list, and the previous/next links of Create and Next.
- `create.html`, `files.html`, `in-practice.html`, `cheat.html`: the chart lines say the same thing in the same words and link to the Chart page where a reader needs more.
- Every touched page is written for a beginner: short sentences, one idea per paragraph, a term is used only after Parts defines it.

The other guide pages are not rewritten.

## Why
The guide is read in order and has one page per step, but charting has no step page. It gets one table row, one tree line, one file row and one command. A beginner cannot hold the charting picture from that, and after the rename the few lines that exist would carry words the rest of the guide never defines.

## Operator inputs
None.

## Done-criteria
1. `docs/guide/chart.html` exists, appears in the header nav of every guide page between Create and Next, in the index page list, and as the next link of `create.html` and the previous link of `next.html`.
2. `parts.html` defines the eight words in "The words, one at a time".
3. `grep -rniE "decision|batch|not yet specified|out of scope|unspecified" docs/guide/` matches only the design.md row about locked decisions and the plan.md row about plan decisions in `files.html`.
4. `bunx --no-install playwright test --config tests/browser/playwright.config.ts` passes, including the complete navigation test with the new page, and its trace artifact path is recorded in the implementation report.
5. `bun test` passes.
6. A review reading `chart.html`, `parts.html` and the touched lines finds every term defined before use and no paragraph with more than one idea.
