# Plan: away-pictures

Base: `f6fb1864` (charting-pictures-more, charting-fixes and guide-chapters merged). No credentials, grants, paid runs or live services: `akrogon status away-pictures` prints no `Missing:` line, the design names no variable.

## Read first

1. `docs/pictures/charting-session.svg` and `docs/pictures/mode-and-route.svg`: the reference drawings. Copy the card, `<style>` block, arrow marker and the mark group from them.
2. `docs/reference/where-things-go.md` `## Pictures`: card, palette, strokes, fonts, mark, still, layout rules. Unchanged by this leaf.
3. `docs/guide/11-while-you-are-away.md` and `docs/guide/12-when-work-stops.md`: the sections to draw. Labels use the words the section uses.
4. `docs/reference/words.md`: approved words. Never "manual mode", "manual route", "quick fix", "autopilot signposts".
5. `docs/guide/06-charting-mode.md` (`mode-*.svg`): the existing series-from-one-base pattern for D6.
6. `tests/watch-timer.test.ts:1366-1420`: reads page 11 whole (no `cron`, no `expir`) and `## What each check does` (no `akrogon status`), and reads `watch-loop.svg` whole for all three.
7. `tests/docs-pictures.test.ts`, `tests/docs-links.test.ts:96-148` (missing files are looked up in the committed tree, so a deletion only shows after it is committed), `tests/docs-em-dash.test.ts` (covers every `docs/pictures/*.svg`).
8. `learnings/LESSONS.md`: "A native screenshot can succeed while showing a stale or error description" (read each render, not its exit code); "sweep prose for the old term" (grep deleted picture names after deletion).

Gaps: none. `grounding.index` is `docs/reference-index.md`, read.

## Decisions

- D1 Page 11 pictures, one per section plus the opener. All say "watcher" or "watch", none says `cron`, `expir` or `akrogon status`, alt text included.
  - Opener (above the first `##`): `docs/pictures/watch-loop.svg`, redrawn in place as the overnight watcher. One night on a time line: you start the watch in `w-client-portal`, `cp-watch` sends a tick every 20 minutes, each tick runs one check over `csv-export` and `scheduled-email`, `scheduled-email` starts once `csv-export` merges, a stop-list item waits with a notice, and you read the notices in the morning. The path stays so the watch-timer test keeps reading it.
  - `## Starting the watch in w-client-portal`: `watch-start.svg`. You send `watch-issues ~/code/client-portal`, it launches one `cp-watch` timer (one per repo), runs one check now, then a tick every 20 minutes. Side note: a busy watcher keeps only the latest tick.
  - `## What each check does`: `watch-check.svg`. The six steps in order: observe once (`observe.ts`), start unblocked leaves, retry failures (up to two unproductive cycles), check busy seats for loops (one steer per seat), open a consult case (`cp-watch-consult`), notice and a five-line summary. A paused read stops after step 1.
  - `## What keeps moving vs what waits for you`: `watch-moves-or-waits.svg`. Three columns: keeps moving, waits for you (the stop list), never does.
  - `## Stop the watch`: `watch-stop.svg`. `watch-issues stop` ends `cp-watch` and `cp-watch-consult`. Automatic stops (agent exits, terminal reused, `/clear` on claude and agy), `/new` on codex and pi, compaction keeps the watch alive.
- D2 Page 12 pictures, one per section and one for the recovery subsection.
  - `## Failed work`: `failed-work.svg`. `scheduled-email` in `implement`, Postmark rejects the sender, the seat writes the blocker and runs `akrogon phase ... failed`, Akrogon records `failure`, sends a notice and renames the tab `scheduled-email failed`; what stays kept (plan, reviews, report, commits, worktree). Side box: a missing declared key waits with a `Missing:` line, it does not fail.
  - `### Recover a failed leaf in four steps` (inside Failed work): `recover-failed.svg`. 1 `akrogon status scheduled-email`, 2 fix the cause, 3 `akrogon phase scheduled-email implement` with no `--slot`, 4 `akrogon next scheduled-email`.
  - `## Park an issue`, `## Pause a repository`, `## Stop a leaf or a check run`: `hold-park.svg`, `hold-pause.svg`, `hold-stop.svg` (D6).
  - `## Common command refusals`: `refusals.svg`. A typed command refuses with its reason, the leaf stays in its phase (not `failed`), you fix the condition and rerun. Four examples: phase move, dependency not merged, sync, push held.
  - `## Where to go next`: `journey.svg`. The path `csv-export` and `scheduled-email` took through pages 04 to 12 (charting, hand-off, lifecycle, merging, the night, one stop), ending at the shelf (Other tools, Reference).
- D3 No shares are planned. A unit that decides to share instead records the section, the shared picture and the reason in `implementation/report.md` for slot B, and the section still embeds the picture (the D1/D2 test needs an embed with alt text in each section).
- D4 Every new SVG: about 960 px wide, `role="img"` with `<title>` and `<desc>`, the opaque `#f4f1e6` card, the `<style>` block of `charting-session.svg`, and the mark group copied byte for byte from `mode-and-route.svg` changing only its `translate`, placed bottom right on the card's last text baseline. Alt text in the page equals the plain sentence in `<desc>`.
- D5 Old-style pictures are the 19 SVGs without the mark group. Delete 18: `change-flow`, `chart-door`, `config-layers`, `control-states`, `dispatch-order`, `factory-overview`, `failure-recovery`, `grounding`, `lessons-flow`, `machine-parts`, `phases`, `project-folders`, `records-vs-code`, `releases`, `two-seats`, `verification`, `ways-to-run`, `working-day`. `watch-loop.svg` is redrawn (D1). Only five are embedded, all on the shelf; each embed becomes text (D7). Nothing in src, skills or tests names a deleted file (`git grep` checked).
- D6 Park, pause and stop are one series from one base drawing: a row of the four controls (`park`, `pause`, `stop`, `stop-run`) with what each touches, the section's control highlighted and its detail below. Park: `issues/open/` to `issues/parked/`, refused when started or needed. Pause: `paused.yaml`, automatic passes skip, typed commands still run, `unpause` runs one pass. Stop: `stopped.yaml`, slice and runs ended, worktree kept, `akrogon start` resumes, `stop-run <run-id>` stops one run, `akrogon leftovers` lists what cleanup kept.
- D7 Shelf replacements: each removed embed becomes one or two plain sentences in its place, built from the old alt text and checked against the page body and its cited source. No new table.
  - `docs/reference/checks.md`: verify on a fresh checkout, green writes a receipt, red passes only when the same tests fail on the base, a changed test file without a `Test-Change` trailer is refused.
  - `docs/reference/config.md`: seat lookup order ISSUE.md, EPIC.md, `issues/config.yaml`, machine `config.yaml`, first file that sets the seat wins (check against `src/config.ts`).
  - `docs/reference/state-and-phases.md`: start at `plan.synthesis`, through `implement`, `check.review`, `merge` to `merged`; a fix verdict loops `check.repair`, `check.fix`, `check.review`; any active phase can stop in `failed` (check against the table below it).
  - `docs/reference/files.md`: `issues/` holds the record folders and logs listed below, leaf worktrees live in a separate store at `~/.akrogon/worktrees/<repo>`.
  - `docs/reference/releases-and-updates.md`: releases are built from the merged default branch, `current` points at the active release, `akrogon rollback` makes the previous release active and holds the rolled-back commit.
- D8 Tests (committed before product code): `tests/docs-pictures.test.ts` gains `AWAY_PAGES`, a sections test for pages 11 and 12, and a whole-folder test over every `docs/pictures/*.svg` using `markProblems`, extracted from `pictureProblems` with no behavior change. The whole-folder test proves criteria 2 and 4 together: an old-style file has no mark group, so it fails. `tests/AREA.md` describes the wider scope.

## Units and waves

Wave 1 (three units, disjoint paths, no shared test resource, no prerequisite):

- U1 page 11. Owns `docs/guide/11-while-you-are-away.md` (embed lines only), `docs/pictures/watch-loop.svg`, `docs/pictures/watch-start.svg`, `docs/pictures/watch-check.svg`, `docs/pictures/watch-moves-or-waits.svg`, `docs/pictures/watch-stop.svg`.
- U2 page 12. Owns `docs/guide/12-when-work-stops.md` (embed lines only), `docs/pictures/failed-work.svg`, `recover-failed.svg`, `hold-park.svg`, `hold-pause.svg`, `hold-stop.svg`, `refusals.svg`, `journey.svg`.
- U3 deletions. Owns the 18 files in D5 (delete) and the five shelf pages in D7 (embed line only).

Each unit commits its own work. The whole-folder test turns green only when U1 and U3 have both landed. U2 needs no other unit for its own tests.

## Docs affected

- `tests/AREA.md`: one line on the wider picture test (in the test commit).
- `docs/guide/11-while-you-are-away.md`, `docs/guide/12-when-work-stops.md`: embed lines only.
- Five shelf pages under `docs/reference/`: embed line replaced by text (D7).
- `docs/reference/where-things-go.md`, README.md, docs/README.md, skills: not affected. The picture rules already say "every SVG", which becomes true.

## Criteria and proof

Kept logs below are under this leaf folder's `implementation/`.

### C1 every `##` section of 11 and 12 has a picture or a share, plain alt text, approved words

- Boundary: pages 11 and 12 on disk. Before: 10 sections without a picture. After: none.
- Test: `tests/docs-pictures.test.ts` "every section of guide pages 11 and 12 has a picture with alt text". Command: `akrogon run-check --name pictures -- bun test tests/docs-pictures.test.ts`. Seconds. Rerun on any change to pages 11, 12 or `docs/pictures/`.
- Red at planning (`check pictures-red: 1 implementation/check-pictures-red-1795790749887-2276765.log`): 4 sections of page 11 and 6 of page 12 listed as missing.
- Catches: a section left without a picture or with blank alt text.
- Not mechanical: whether alt text is plain and labels use approved words, and whether a share's reason holds. Slot B reads alt text, labels (search `docs/reference/words.md` retired phrases in the new SVGs) and the report's share list.

### C2 identical mark group, no forbidden markup, no em dash, "created by" and `<title>Tamdoma</title>` in each

- Boundary: every file in `docs/pictures/`. The mark is compared to the first file alphabetically, which is a charting-pictures-more picture, so identity with charting-pictures-more's group is proven.
- Test: "every SVG in docs/pictures holds one identical mark group and no outside or moving markup" (same command as C1), plus `tests/docs-em-dash.test.ts` "README, docs markdown and docs pictures hold no em dashes" (`akrogon run-check --name dash -- bun test tests/docs-em-dash.test.ts`). Seconds.
- Report search (criterion's own wording): in implement, `akrogon run-check --name svg-search -- sh -c 'for f in <new svgs>; do grep -c -i -e href -e "<script" -e "@import" -e "@font-face" -e animation -e "—" "$f"; grep -c "created by" "$f"; grep -c "<title>Tamdoma</title>" "$f"; done'`, recorded in the report.
- Condition: the copied group must not drift (a changed scale, colour or path). Case: temp edit of `mode-and-route.svg` scale 0.05 to 0.06 and an em dash in its title; red `check cond-mark-dash-red: 1 implementation/check-cond-mark-dash-red-1795790766997-2278126.log` with "mode-and-route.svg: mark group differs" and the em-dash line. Discarded.

### C3 slot B renders and reads each picture

- Judgment, read by slot B. Renders: `rsvg-convert -b white -w 960 -o <out>.png <svg>` for each new picture and `rsvg-convert -b '#0d1117' -w 960 -o <out>.png docs/pictures/watch-loop.svg` once. Implement makes the same renders in its own scratch folder and reads them before handing off (lesson: inspect the frame, not the exit code). No test holds an expected value for what a picture shows.

### C4 only new-style pictures, no link to a deleted picture, every link resolves

- Boundary: `docs/pictures/` and every page in README.md and docs/. Before: 19 old-style files, five shelf embeds of them. After: none.
- Tests: the whole-folder test of C2 (red at planning: the 19 old files listed, same log as C1) and `tests/docs-links.test.ts` "README, docs and skill links resolve to files and anchors" (`akrogon run-check --name links -- bun test tests/docs-links.test.ts`). Seconds. Rerun after the deletion commit.
- Condition: a deleted picture must not stay embedded. The link test resolves missing files from the committed tree, so the condition only shows after the deletion is committed. Case: temp commit deleting `verification.svg` with `checks.md` unchanged; red `check cond-links-red: 1 implementation/check-cond-links-red-1795790779447-2279311.log` ("checks.md: missing file ../pictures/verification.svg"). The commit was undone. The same deletion left uncommitted stayed green (`check-cond-links-red-1795790766863-2277995.log`), so U3 runs the link test after committing.
- Also: `git grep -n -e <each deleted name>.svg` returns nothing after U3 (lesson on stale prose).

### C5 watch-timer test passes on the redrawn watch-loop.svg and page 11; checks pass

- Tests: `tests/watch-timer.test.ts` "docs describe the timer watch for all harnesses with no cron wording" and "the watch check omits the akrogon status command in ..." (`akrogon run-check --name watch-docs -- bun test tests/watch-timer.test.ts -t "cron wording|akrogon status command"`). Seconds. Green on base (`check watch-docs-base: 0 implementation/check-watch-docs-base-1795790784134-2279681.log`).
- Condition: D1 adds alt text inside `## What each check does` and redraws `watch-loop.svg`; neither may hold `cron`, `expir` or `akrogon status`. Case: temp alt text "The watcher runs akrogon status on a cron timer" in that section plus `<text>akrogon status</text>` in the SVG; red `check cond-watch-red: 1 implementation/check-cond-watch-red-1795790760754-2277403.log` (three tests fail). Discarded.
- Checks: `akrogon verify` runs `format`, `test`, `typecheck`. Minutes.

## Verification order in implement

1. Each unit: its own test from C1, C2 or C4 green for its paths, and its renders read.
2. After all units: `pictures`, `dash`, `links`, `watch-docs`, the svg search and the `git grep` sweep.
3. `akrogon verify`.

## Open limitations

- Sibling leaves setup-pictures and build-pictures also edit `tests/docs-pictures.test.ts` and may conflict textually at landing. Their new pictures are new-style, so the whole-folder test stays valid after they land.
- Whether each picture reads and shows its section stays slot B's judgment (C3).

## Implementation notes
