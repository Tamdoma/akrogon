# Opening map: slot B

Sources: INTAKE.md and forks/signposts.md (whole), README.md, docs/README.md, three Haiku reader passes over docs/, skills/, src/, tests/, `hc ls` and 52 CHART.md files (I spot-checked the lines my picks rest on), tamdoma.ai raw HTML and `/_astro/Layout.*.css` (fetched 2026-11-27), GitHub Docs "Quickstart for writing on GitHub" (fetched 2026-11-27).

## Forks

**K1. Page architecture.**
- a (rec): six folders under docs/ plus two front pages. About 22 pages against 33 today.
  - `setup/` (3): what it is and who it fits; install and one Akrogon serving many repos with the made-up upstream example; the three tabs and first project setup.
  - `charting/` (5): a charting session start to end; Charting mode; signposts; Build route; what a chart hands off.
  - `lifecycle/` (2): slot A and slot B; watching work move with `akrogon status` and `akrogon next`.
  - `merging/` (1). `away/` (2): the watcher; when work stops (failed, park, pause, stop).
  - `reference/` (about 9): the lookup shelf. Minor jobs (save records, lessons, report an observation, write issues by hand, rollback) get a short section each, per signposts 3a.
- b: keep `start/`, `use/`, `reference/` and refill them. No path edits, but it keeps the structure the operator rejected.
- c: one long page per chapter. Fewest files, but the charting page passes 300 lines and the reader check gets coarse.
- Reason for a: folder names match the operator's five chapters, so the path tells the reader where they are.
- Cost: every guide path changes. Keep `docs/reference/commands.md`, `checks.md`, `files.md` and `skills.md` where they are, because tests read them by path.

**K2. What the charting chapter treats as normal.** Two weeks of charts (52 CHART.md files): 27 Lifecycle and 19 Direct; 31 Full autopilot, 7 Semi-autopilot, 11 No autopilot. Seven hc spaces hold all three tabs (t-, c-, w-).
- a (rec): Full autopilot and Direct are written as everyday choices with example jobs, not as side paths.
- b: No autopilot as the main path, the others as options (today's docs shape).
- Conflict to settle in the same fork: `skills/chart-issues/assets/autopilot.md:15` says Direct is not offered under autopilot, yet 12 of the 19 Direct charts ran under autopilot, and `issues/chart/lean-akrogon/CHART.md:37` records one as a "breach". SKILL.md:115 already says explicit Direct words from the operator are the answer.
- Rec: the rename leaf fixes autopilot.md:15 to match SKILL.md:115 (Lifecycle unless the operator asked for Direct in words), and the docs say the same. Cost: one rule sentence changes in a rename leaf. Without it the docs describe a rule the operator overrides weekly.

**K3. Picture set and style.**
- Set (rec, 6 stills): the three tabs; one Akrogon and many repos; Charting mode against Build route; one charting session; slot A and slot B passing work; merge and the overnight watch.
- Style facts from tamdoma.ai: light theme only (no `prefers-color-scheme`). Page `#f4f1e6`, ink `#0f0f0f`, beige `#e0dccf` and `#c4c0b3`, sage `#e7ede2`, `#b7c8ae`, `#90a985`, `#7a9b76`. Line drawings at stroke 1.5 with round caps, flat fills, corners rx 4 to 6, dashed guides, mono numbered labels ("01"). Fonts are three Google web fonts.
- Needs row 4 can be supplied from the site: the hexagon mark is `https://tamdoma.ai/favicon.svg` (362 bytes) and the wordmark is inline SVG in the header.
- K3a dark GitHub. a (rec): one SVG that draws its own parchment card, which is today's rule (docs/reference/where-things-go.md:11). Cost: a light card on a dark page. b: light and dark pairs with `<picture>` (GitHub Docs). Doubles the files and reviews, and the site has no dark palette to copy.
- K3b fonts. A picture embedded with `![]()` is an image, and browsers load no outside fonts for it (standard browser rule, not stated in the GitHub pages I fetched). a (rec): a system sans and mono stack, text kept as text. b: headings turned into paths. Exact look, but labels stop being searchable for later renames.
- K3c motion. The site animates. Signposts 5 named the look only. Rec: still pictures, since one screenshot proves each one. Cost: less like the site.
- K3d the 19 old pictures. All are embedded (23 embeds), about 11 on pages bound for the shelf. a (rec): delete all 19 and keep shelf pages text and tables. b: redraw the shelf pictures too (about 10 more drawings). c: leave old ones on the shelf, which gives two looks in one doc set.
- Mark: small mark and "created by Tamdoma" in a bottom corner, drawn as inline paths. No outside `href`.

**K4. Codebase rename scope.**
- Facts: mode words live only in skill text and docs. `src/*.ts` has 0 hits for "autopilot". No code parses the `Route:` line or mode records (src/status.ts reads only `Handed off|Closed|Held` and the Fog section). No test pins a mode word. So the rename is text only.
- Files: skills/chart-issues/SKILL.md (manual 3, attended 4, autopilot 17 lines), assets/autopilot.md (9), assets/shapes.md (8, record shapes at `## Mode record` and `## Autopilot`), assets/questions.md (5), assets/handover.md (1), assets/standing-design.md (1), skills/AREA.md:11. Docs: 15 pages and 3 pictures, all replaced by the rewrite.
- Printed command text: nothing to change. `akrogon direct` and its messages already use the approved value "direct", and no command prints a category name.
- K4a depth. a (rec): new names in prose, definitions and the values written into records from now on. Keys stay: the `Route:` line, `## Mode record`, `## Autopilot`, `signposts: <operator | A>`, the `akrogon direct` verb, file names. The skill adds one sentence that old record words (`on autopilot`, `continue attended`, "manual") read as Semi-autopilot and No autopilot. b: also rename keys, files and the verb. No gain for the reader, and it breaks 7 links to assets/autopilot.md and 5 tests that pin "direct leaf" strings. c: docs only, which the second and third corrections rule out.
- K4b guard. The repo already bans retired words by test (tests/hold-retired.test.ts:148, tests/run-permit.test.ts:796). a (rec): add the exact retired phrases ("manual mode", "autopilot signposts", "quick fix") for skills, docs and README. b: no guard. docs/reference/words.md already drifted once (no entry for manual, lifecycle or mode).
- Cost of a: about 8 skill files, one small test, and the old-words sentence stays until old charts close.

**K5. Cold-reader check.**
- a (rec): each text leaf's contract carries 6 to 10 fixed questions with expected answers, written at charting time from the operator's emphasis (tell Charting mode from Build route, pick a mode for three sample jobs, what each tab is for, what slot B does, what to do when a leaf stops). B runs a fresh agent that sees only that chapter's pages. Every answer must be right and quote its line, or it is a Fix. The reader runs on a different model from the writer.
- b: a tests/ check on word lists or reading level. Repeatable, but it checks form and cannot tell whether a reader understood.
- c: the operator reads every chapter. Strongest, but signposts 7a limits the operator's read to charting.
- Pictures: check by rendered screenshot on a light and a dark page (the beginner-docs method, issues/chart/beginner-docs/forks/svg-set.md) plus one "what does this show" question answered from the image.
- Cost of a: one extra agent run per review round.

**K6. Leaf split and order.**
- Limits: writing (agy/neon) and pictures (claude/opus) are different seats, so they are different leaves. tests/docs-links.test.ts must pass at every landing, so a page can link only to files that exist then, and a leaf that deletes a page repairs its inbound links.
- a (rec, 6 leaves in one chain):
  - L1 rename: skills, the same words in today's docs pages (where-things-go.md:28 requires it), the retired-phrase guard, the autopilot.md:15 fix.
  - L2 charting text: new `docs/charting/`, deletes plan-work, quick-fix and autopilot pages.
  - L3 charting pictures, which also set the style template (palette, card, mark, font stack).
  - Operator read (Needs row 2).
  - L4 setup, README and docs home text.
  - L5 lifecycle, merging, away and shelf text. Deletes the remaining old pages and moves the pinned test paths.
  - L6 remaining pictures. Deletes the 19 old SVGs.
- b: one text leaf per chapter in parallel after the read. Faster, but each leaf edits docs/README.md and links to pages not yet on main, so link tests go red and merges conflict.
- c: rename last. The operator would read a charting chapter whose names the door does not use yet.
- Cost of a: six serial landings.

## Practitioner questions

- Q1. Can a reader get from install to one landed change in one sitting, and which page carries that? The 2026-10-23 rule ("Don't make this a tutorial", beginner-docs/forks/doc-architecture.md) meets the new "pure guide with examples on how to do something". Rec: how-to pages with one made-up running example and no exercises.
- Q2. Where does the reader learn it needs Linux and herdr (README.md:9-13)? Rec: the first screen of setup, as a plain fit check.
- Q3. Which job fits which Charting mode? The operator asked for this. Rec: a table of example jobs.
- Q4. What does each tab show at each step, and do the page's words match the screen?
- Q5. Where does spend come from? The audience profile names leaking API spend, and the docs have no cost topic. Rec: name what starts agents (consultants, each slot, the watcher every 20 minutes), no prices.
- Q6. Which git words need a one-line gloss for a reader new to git (signposts 2a)? Branch, worktree, merge, default branch.
- Q7. Where does the "little bit of soft selling" go? Rec: README and chapter openers, one sentence each, never inside steps.
- Q8. Who keeps pages true after this chart? Today's rule is where-things-go.md:28. That page needs a rewrite for the new folders in L5.

## Pitfalls

- R1. Tests that pin doc paths or words:
  - tests/rollback.test.ts:140 reads docs/use/roll-back-a-release.md and needs three strings.
  - tests/watch-timer.test.ts:1367-1410 reads docs/use/watch-while-away.md, docs/reference/skills.md and docs/pictures/watch-loop.svg. It bans "cron" and "expir" and needs claude, codex, pi and agy named.
  - tests/command-reference.test.ts:8 matches the commands.md table to src/akrogon.ts.
  - tests/docs-links.test.ts:278-305 needs "(script)" in checks.md and files.md, and a verify-runs.jsonl row in files.md.
- R2. Rename misses. Old words sit in file names (docs/use/autopilot.md, quick-fix.md, two story pages), picture labels ("Attended chart", docs/pictures/ways-to-run.svg:27), alt text and the story pages. A blind replace is unsafe: "attended" and "manual" have about 60 unrelated hits ("unattended", `CLAUDE_CODE_SESSION_ATTENDED`, the e2e "attended tier", "manual next" in tests).
- R3. Old records. Over 50 CHART.md files carry `on autopilot` or `continue attended`, and a handover matches the latest Mode entry (SKILL.md:139). Without the K4a sentence an open chart could fail that match.
- R4. Release reach. Skills are symlinks through `~/.akrogon/current` into a release folder, so a skill edit reaches doors only after a deploy (docs/reference/releases-and-updates.md:3-17). A door that is already open may keep the old text in its context, so one chart can show both word sets for a while. This chart's own door is one of them.
- R5. SVG on GitHub: web fonts do not load, an outside `href` for the mark does not load, and text turned into paths cannot be found by a later rename. Today's 19 pictures already drifted into two templates (560 and 640 wide, two font stacks), so L3 fixes one template.
- R6. Screen pictures go stale when command output changes. Draw the layout and who does what. Quote no live output.
- R7. Privacy. issues/chart is pushed to public main (beginner-docs/forks/examples.md, privacy line). `hc ls` and the machine config hold client repo names, so nothing from them goes into pages or chart files. My earlier return, slots/signposts-angles-b.md, names the base repo's GitHub origin. The door may want to scrub that line.
- R8. Stale names. Model and harness names in the setup chapter age fast. Today's install page uses `<model>` placeholders.
- R9. The palette is itself the Tamdoma look. Keep the name and mark to the corner line only, as signposts 5 says.
