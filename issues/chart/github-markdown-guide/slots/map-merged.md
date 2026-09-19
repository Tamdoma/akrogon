# Merged map: guide to GitHub markdown

Surface (both): 17 pages, ~7,200 words, 18 pre blocks, 6 tables, 16 cards, 5 illustrations; unpublished, file URLs only; 4 playwright specs + 3 configs + dev dep assert the HTML shell; README `## Command` table is parsed by tests/command-reference.test.ts:24-32; reference-index.md:7 links guide/; verified drift: files.html:63 and limits.html:64 say sync stages everything, cheat.html:66-67 same, src/sync.ts stages only issue records (B found the second and third occurrences).

Settled without asking (both): pages land at docs/guide/<same stem>.md; index.html is absorbed into README, not a second homepage; HTML, style.css, the four specs, three configs and @playwright/test leave in the same leaf (lesson 2026-09-11 guide-source-spec); tests/AREA.md and reference-index.md updated in that leaf; one leaf `github-markdown-guide` (B's slug), no parallel split.

Q1 README shape. (A) move reference tables to docs pages, README = homepage only; retarget the test. (B, recommended) README = overview + reading-order links on top, existing install/init/command/skills reference kept below; test untouched. (both) skills links survive.
Q2 Fidelity. (A) convert as is, drift to new intake. (B, recommended) convert plus the one verified sync correction in its three occurrences, other suspected drift recorded as limitations. (B) init `--from` discrepancy noted, not settled here.
Q3 Illustrations. (A, recommended) drop, keep caption as prose. (B) Mermaid for the relational ones. (both) static SVG extraction as third option, cost: assets with hardcoded colors.
Q4 Link check. (A, recommended) one bun test: relative links and heading anchors in README and docs/guide/*.md resolve. (B) accepts as optional; warns against exact-prose tests. (both) no site, no framework.

Pitfalls (both): HTML ids like #day/#cases differ from markdown heading anchors; entities in pre blocks; pipes in tables; in-practice.html holds two sections (day and cases); cheat page duplicates the command table; do not edit historical audit/lesson files that name old paths.
