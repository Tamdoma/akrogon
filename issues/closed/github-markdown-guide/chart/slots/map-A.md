# Map A: guide to GitHub markdown

## Surface
- 17 HTML pages, ~7,200 words of prose total, 18 pre blocks, 6 tables, 16 cards, 5 unique illustrations (index, idea, parts, files, next) built on CSS vars and SMIL animateMotion. Not published anywhere: repo private, no Pages. Only reachable as file URLs.
- README.md is a reference (install, init, command table, skills table). tests/command-reference.test.ts:23-33 parses the `## Command` table rows of README against src/akrogon.ts dispatch verbs. Moving or renaming that table breaks the test.
- tests/browser: 4 playwright specs (529 lines) + 3 per-spec configs + @playwright/test dev dep, all asserting HTML shell, fonts, sections by file URL. Pointless once HTML is gone.
- docs/reference-index.md:7 links `guide/` as Documentation.
- Known content drift: audit astra-6 line 131 (files.html sync description wrong), lesson 2026-09-11 stale-rule-in-docs. Conversion 1:1 carries the drift.
- Lessons that die with the HTML: ink-band links (09-14), duplicated browser helpers (09-11), guide-source-spec (09-11 history only).

## Forks
Q1 README shape. A: README becomes the index page (hero paragraph + reading-order list linking docs pages), and the current install/init/command/skills reference moves to docs pages; test retargets. B: README keeps its reference and gets the reading-order list appended on top. Recommend A: operator said "entrance just like the homepage"; a reference table above the map is not a homepage. Cost: test retarget + skills links move.
Q2 Fidelity. A: convert text as it stands, drift stays, refresh is new intake. B: convert and correct against current code. Recommend A: one leaf, checkable by diffing extracted text; correctness review is a different kind of work and the audit already lists the drift for a later leaf.
Q3 Illustrations. A: drop them, keep the caption sentence as prose. B: export 5 SVGs to docs/guide/ with hardcoded colors and embed as images. Recommend A: they depend on page CSS vars, GitHub strips inline SVG, and the operator asked for docs not a site.
Q4 Browser tests. A: delete tests/browser, the three configs, the playwright dev dep, and the tests/AREA.md lines; add one bun test that every relative link in README and docs/*.md resolves to a file (and anchors to headings). B: delete only. Recommend A: link rot is the one failure a markdown guide has and the check is ~30 lines.
Q5 Layout. docs/guide/<name>.md keeping the 17 names (reference-index link survives, git history readable) vs flat docs/<name>.md. Recommend keep docs/guide/. Minor.

## Split
One issue `guide-markdown`, one leaf: pages, README, tests, index. Parallel leaves would collide on README and nav/pager links and gain little for 7k words. If the operator wants speed: leaf 1 README + shell convention + tests, leaf 2 the 16 pages blocked-by leaf 1.

## Pitfalls
- command-reference.test.ts breaks silently on README rewrite unless retargeted (path + section heading).
- Cheat page duplicates the README command table in shell form; keep one canonical command reference or accept two.
- Pager prev/next lines need a fixed markdown convention or they drift per page.
- `<span class="c">` comments in pre blocks become plain `#` comments; fine.
- Cards (limits: 10) become h3 + paragraph; do not invent tables.
- Delete style.css too, or it lingers.
