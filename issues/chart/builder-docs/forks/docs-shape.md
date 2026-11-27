# Docs shape, pictures, rename and split

## Question

Q1 Page architecture: folder per chapter, one guide folder with few pages, or one guide folder with numbered pages and one page per charting topic?
Q2 Direct under autopilot: change the rule in this chart or document the rule as written?
Q3 Pictures: set, dark handling, fonts, mark, old pictures?
Q4 Codebase rename: depth, printed strings, guard test?
Q5 Cold-reader check: how is "a product manager can follow it" judged?
Q6 Leaf split, seats and order, and how the operator read (signposts 7a) gates the rest?

### Carries

forks/signposts.md (Taken and three corrections: approved names locked, docs and codebase). INTAKE.md operator sources.

## Findings

Merged notes: slots/map-merged.md (A, B, C maps). Rebuttals: slots/map-rebuttal-b.md, slots/map-rebuttal-c.md. Evidence: Haiku inventory of 35 pages, 19 SVGs and the pinned tests (tests/rollback.test.ts:140, tests/watch-timer.test.ts:1367-1410, tests/command-reference.test.ts:8, tests/docs-links.test.ts:117-305, tests/run-permit.test.ts:776-810, tests/hold-retired.test.ts:148-170); Haiku scan: no src/ or test code parses mode or route words, src/direct.ts:62 prints "is not a direct leaf" pinned by three tests (B); Tamdoma tokens at /home/ivan/Work/infra/tamdoma/website/website/src/layouts/Layout.astro `:root`; tamdoma.ai has no dark palette (B,C, CSS read 2026-11-27); 2026-11-14..26 charts: 27 Lifecycle, 19 Direct, 31 Full autopilot, 7 Semi, 11 No autopilot (B).

## Taken

A's picks under autopilot, 2026-11-27.

Q1: one `docs/guide/` folder with numbered file names in reading order (`01-...md`), charting keeps one page per topic so Charting mode and Build route each get their own page (about 12 guide pages). README is a short front door; docs/README.md is the chapter index; docs/reference/ stays at today's paths as the lookup shelf with words updated; docs/start, docs/use, docs/examples are retired. Chapters: 1 Set up (install, one Akrogon serving many registered repos with a made-up upstream repo, herdr space required and t-/c-/w- tabs as the daily layout), 2 Charting (session start to end, signposts, Charting mode, Build route, decisions and hand-off), 3 Lifecycle (slot A the builder, slot B the reviewer), 4 Merging, 5 While you are away and when work stops (watcher, failed work, park/pause/stop, minor tools named with what they do and how). Reason: signposts correction "differentiate two things and make it very clear" needs separate pages (B rebuttal D6); GitHub lists folders alphabetically, so numbered files keep reading order. Rejected: folder per chapter (wrong order on GitHub, more link churn, C); 8 to 9 pages (merges mode and route, B). Dissent: C preferred 8 to 9 pages.

Q2: the rule stays as written (Direct is not offered under semi or full autopilot) and the docs state it. Reason: the signposts corrections authorize names, not behavior; autopilot.md says changes to autopilot's limits wait for the operator (B withdrew, C). The rule-versus-practice gap (13 recorded breaches) is recorded only, for the operator.

Q3: six still SVGs, all with an opaque parchment card (#f4f1e6, border #c4c0b3) in one file that reads on GitHub light and dark; Tamdoma palette and 1.5 px rounded line art with dashed sage connectors; system sans and mono font stacks with text kept as text; small Tamdoma mark drawn as inline paths from /home/ivan/Work/infra/tamdoma/website/website/public/logos/ plus "created by Tamdoma" in a bottom corner, no outside href. Set: (1) the three tabs (README hero and setup), (2) one Akrogon serving many repos, (3) Charting mode against Build route, (4) one charting session, (5) slot A and slot B passing work, (6) merge and the overnight watch, drawn at docs/pictures/watch-loop.svg so tests/watch-timer.test.ts keeps its path. All other old pictures are deleted with their embeds. Reason: no dark palette exists to copy (B,C); one file per picture halves review. Rejected: in-SVG prefers-color-scheme (A's map; tracks OS not GitHub theme, C); `<picture>` pairs (double files). The three-tabs picture was missing from the merged set (B D1).

Q4: new names in skill prose, definitions and record values written from now on; keys stay (`Route:`, `## Mode record`, `## Autopilot`, `akrogon direct`, file names); printed strings and record values stay lower-case (`direct`, `lifecycle`), so src/direct.ts and its three tests are untouched (B D7); one sentence in the skill reads old record words (`manual`, `attended`, `on autopilot`, `continue attended`, `continue autopilot`, `autopilot signposts`) as their new values. A guard test bans the retired phrases ("manual mode", "manual route", "quick fix", "autopilot signposts" as a mode name) in README.md and docs/ and in skills text outside the one compatibility sentence (C); no hype-word test, tone stays with the cold reader and slot B (B,C). Blind replace is forbidden: "manual" and "attended" have about 60 unrelated hits. Reason: function over form; the reader sees one word set.

Q5: each text leaf's brief carries fixed questions with one right answer each, written here at charting. Slot B gives a fresh subagent inside its own review session only that leaf's guide pages and records each answer with the line it came from in its review; a wrong or unsupported answer is a Fix. Tone (no marketing jargon, little soft selling) is slot B's reading under standing-design's model-choice line. Pictures: slot B reads a rendered screenshot of each picture on a light and a dark page and answers "what does this show". No score.

Q6: one epic `builder-docs` with five issues, each holding one leaf, so ISSUE.md `slots:` separates seats. Open now: `taxonomy-rename` (default seats), `charting-guide` (agy/neon/high), `charting-pictures` (claude/claude-opus-5-5/high, blocked-by charting-guide). Written into issues/parked/: `guide-chapters` (agy/neon/high, blocked-by charting-guide and taxonomy-rename) and `guide-pictures` (claude/claude-opus-5-5/high, blocked-by guide-chapters and charting-pictures). The operator reads the charting chapter with its pictures, then runs `akrogon unpark guide-chapters guide-pictures`. Reason: blocked-by alone would dispatch the rest the moment charting merges (C); charting pictures before the read because pictures are half the complaint (B D5). Rejected: one chain with a readiness needs row (prints Missing: noise and exits 1 on next, C); all pictures last (C).

Correction (A, 2026-11-27, at leaf writing): `akrogon park` takes a top-level folder under issues/open (docs/use/park-pause-stop.md), so an issue inside an epic cannot be parked alone. The split becomes two epics: `builder-docs` (taxonomy-rename, charting-guide, charting-pictures; open) and `builder-docs-rest` (guide-chapters, guide-pictures; written to issues/open and parked at once with `akrogon park builder-docs-rest`, safe because both leaves are blocked-by unlanded leaves). The operator unparks with `akrogon unpark builder-docs-rest` after reading the charting chapter.

Correction (A, 2026-11-27, leaf review): the attribution is the text "created by" followed by the Tamdoma logotype from website/src/components/logotype.svg (pure paths), titled `<title>Tamdoma</title>`; website/public/logos/*.svg wrap raster data URIs and are never copied (B F1, C 2). Slot B for the four docs issues is claude/claude-opus-5-5/high so the cold-reader subagent and screenshot reading are available (B F11).
