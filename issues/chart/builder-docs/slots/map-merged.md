# Merged map (A, B, C)

Sources: slots/map-a.md, map-b.md, map-c.md. Tags name the slots whose map holds the line.

## K1 Page architecture
- README short front door, docs/README chapter index, docs/reference/ kept as lookup shelf at today's paths (A,B,C).
- Chapters: setup (install, one Akrogon serving many repos, made-up upstream repo, herdr space required and t-/c-/w- tabs as convention), charting (deepest: session, Charting mode, Build route, signposts, hand-off), lifecycle (slot A, slot B), merging, away and when work stops (watcher, failed, park/pause/stop, minor tools named with what and how) (A,B,C).
- Folder shape differs: one folder per chapter, about 22 pages (B); one docs/guide/ folder, about 8 to 9 pages (C); unspecified (A).
- Retire docs/start, docs/use, docs/examples (A,B,C). docs/README.md and docs/reference/where-things-go.md must survive (linked from docs/reference-index.md) (C).

## K2 What charting treats as normal
- Two weeks: 27 Lifecycle and 19 Direct charts; 31 Full autopilot, 7 Semi, 11 No autopilot; seven spaces with all three tabs (B). Same pattern (C).
- Write Full autopilot and Direct as everyday choices with example jobs (B).
- Conflict: autopilot.md and SKILL.md `## Direct route` refuse Direct under autopilot, yet 12 of 19 Direct charts ran under autopilot, recorded as breaches (B,C). B proposes the rename leaf changes the rule.

## K3 Pictures
- 6 still SVGs, one per chapter idea (README hero, setup and repos, mode vs route, charting session, slot A and B, merge and overnight watch) (A,B,C).
- Tamdoma palette (#f4f1e6, #0f0f0f, sage, beige), 1.5 px rounded line art, dashed connectors (B,C). Opaque parchment card in one file for GitHub light and dark (B,C); A proposed in-SVG prefers-color-scheme instead (A). Site has no dark palette (B,C).
- System font stacks, text kept as text (A,B,C). Corner mark: hexagon from favicon/logo files as inline paths plus "created by Tamdoma", no outside href (B,C); logo files also exist locally in the website repo (A).
- Old 19 pictures: delete all (B); delete 13 and reuse names such as watch-loop.svg (C); delete unembedded (A).

## K4 Codebase rename
- No src/ or test code prints or parses mode or route words; scope is skills/chart-issues prose and templates, skills/AREA.md, docs (A,B,C).
- New words in prose, definitions and records written from now on; keys stay (`Route:`, `## Mode record`, `## Autopilot`, `akrogon direct`, file names); one sentence reads old record words as the new values (A,B,C).
- Guard test banning retired phrases ("manual mode", "autopilot signposts", "quick fix", "manual route") in skills, docs, README, like tests/hold-retired.test.ts (B,C). C adds banning hype words.
- Blind replace unsafe: "manual"/"attended" have about 60 unrelated hits (B,C).
- Skill change reaches doors only after release (A,B,C).

## K5 Cold-reader check
- Fixed 6 to 10 questions per chapter with expected answers in the leaf contract; a fresh agent on a different model reads only that chapter; every answer right with its quoted line, else a Fix; slot B judges (A,B,C).
- Pictures: rendered screenshot on light and dark page plus one "what does this show" question (B).

## K6 Leaf split and order
- Writing (agy/neon/high) and pictures (claude/opus/high) need separate issues for ISSUE.md slots (A,B,C).
- Rename first (B,C).
- Charting text, then charting pictures, then operator read, then the rest (B); C puts all pictures last.
- Gate for the read: blocked-by alone auto-dispatches dependents when the charting leaf merges, so dependents are parked until the operator reads (C). B uses a chain with the read as a needs row.
- Link test must pass at every landing: a page links only to files on main; a leaf deleting a page fixes inbound links (B,C).
- Pinned tests: rollback.test.ts, watch-timer.test.ts, command-reference.test.ts, docs-links.test.ts, run-permit.test.ts, hold-retired.test.ts; a moved page moves its assertion in the same leaf (A,B,C).

## Practitioner questions
- Where spend comes from (what starts agents), no prices (B). Git words glossed once (B). Soft selling one sentence in README and chapter openers (B). One running made-up example (B,C).

## Where slots differ
- K1 folder per chapter (B) vs one guide folder (C).
- K3 dark handling: card (B,C) vs media query (A); delete all old pictures (B) vs reuse names (C).
- K4 hype-word ban (C) vs reviewer judgment.
- K2 change the Direct-under-autopilot rule in this chart (B) vs not.
- K6 pictures early for the read (B) vs last (C); park (C) vs chain (B).
