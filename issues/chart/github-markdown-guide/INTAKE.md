# Intake: github-markdown-guide

## Scope
Replace the HTML operator guide under docs/guide/ with markdown pages in the same folder, make README.md the entrance, retire the browser test machinery, and add a gacp page whose bash function readers paste into .bashrc. One issue, one leaf, destination akrogon.

## Provenance
- Operator: 2026-09-19 chart-issues note and round 1 answers

## Source: operator 2026-09-19
We need to turn the actual guide into a docs, with readme.md being the entrance just like the homepage. Intent: move from HTML to Github documentation, so everything's in one place.

## Source: operator 2026-09-19 round 1
1a | 2a - also add the gacp script so they can put it into their .bashrc. It has to contain its own page guide with noob explainer on what it does and when to use it | 3a | 4a | 5a

## Agent findings
- docs/guide/: 17 HTML pages plus style.css, about 7,200 words, 18 pre blocks, 6 tables, 16 cards, 5 illustrations (index, idea, parts, files, next). Unpublished: repo private, no GitHub Pages. Opened only as file URLs.
- README.md: install, init, `## Command` table, skills table. tests/command-reference.test.ts:24-32 parses that table by the literal `## Command` heading.
- tests/browser/: docs-shell, docs-concepts, docs-operate, docs-practice specs, playwright.config.ts and three per-spec configs, all importing @playwright/test (devDependency). package.json scripts never run them.
- docs/reference-index.md:7 links guide/ as Documentation. tests/AREA.md:7,20-22 describe the browser specs.
- Verified drift: files.html:63, limits.html:64 and cheat.html:67 say sync commits everything in the checkout. src/sync.ts:6-34 stages only issue records. Named in astra-6-akrogon-audit.md:127-135.
- Noted, not settled: README.md:38 shows `init --from` as required while src/init.ts:13-23 accepts no proposal.
- gacp: /home/ivan/.local/bin/gacp, 20-line bash script: refuse off main, git add ., commit with message or "add issues", pull --rebase --autostash, abort and print conflicting files on conflict, push. process-review-claude.md:53 records that the operator runs gacp, never sync.
- Lessons that describe only the HTML guide: 2026-09-14 ink-band links, 2026-09-11 duplicated browser helpers. Pruned at handoff.
