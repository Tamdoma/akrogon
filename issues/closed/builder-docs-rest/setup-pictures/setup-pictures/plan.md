# Plan: setup-pictures

Worktree: /home/ivan/.akrogon/worktrees/akrogon/setup-pictures (base f6fb1864; guide-chapters and charting-pictures-more already on main). Test commit: f629638f.

## Read first

- `brief.md`, `design.md` (this folder).
- `docs/reference/where-things-go.md` `## Pictures`: card, palette, strokes, fonts, mark, still, layout rules.
- `docs/pictures/charting-session.svg` and `docs/pictures/mode-and-route.svg`: reference drawings (root attributes, `<style>` block, arrow marker, card, box classes) and the mark group to copy whole.
- `docs/pictures/opening-a-session.svg`, `chart-records.svg`: examples of tab frames and folder cards from charting-pictures-more.
- `README.md`, `docs/guide/01-install.md`, `docs/guide/02-set-up-a-repo.md`, `docs/guide/03-your-three-tabs.md`: the sections to draw. Every label comes from these pages.
- `tests/docs-pictures.test.ts`, `tests/docs-em-dash.test.ts`, `tests/docs-links.test.ts`.
- `/home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/charting-pictures-more/charting-pictures-more/plan.md` `## Implementation notes`: alt text cannot hold `)`, the logo group has eight paths, embed placement after a block.
- Grounding: `docs/reference-index.md` links `docs/README.md`, `tests/AREA.md`. `learnings/LESSONS.md` line 43 (a screenshot can succeed while showing the wrong thing; inspect the saved frame) applies to every render. No other lesson touches pictures.

## Decisions

- **D1 Mark group.** Each new picture copies the mark group whole from `docs/pictures/mode-and-route.svg` (outer `<g transform="translate(838 Y)"><title>Tamdoma</title>`, the `created by` text with its inline style, the inner logo group with its eight paths). Only the outer translate changes: `X` 838 on a 960 px card, `Y` = card height minus 22.
- **D2 Drawing style.** Copy root attributes (`role="img" aria-labelledby="t d"`), `<style>` block, `<defs>` arrow marker and card `<rect>` from charting-session.svg. Width 960, height as the content needs. Heading at (40, 48) class `h`, one `soft` subtitle at (40, 72). Commands, paths and config keys in class `mono`. No em dash, no `href`, `<script`, `@import`, `@font-face`, `animation`.
- **D3 Words.** Labels and alt text use the pages' own words and the approved names only: slot A (the builder), slot B (the reviewer), consultant, task, repository, space, tab, Charting mode, Build route, Direct, Lifecycle, watcher. Never: manual, quick fix, seat, door, leaf, attended, autopilot signposts. A command or path is copied exactly from the page.
- **D4 One picture per section, no shares.** 12 sections, 12 new SVGs (list below). The report's share list is empty, so slot B has no share reason to judge. `three-tabs.svg` is embedded twice (README hero and page 03), which is the brief's own placement, not a section share.
- **D5 Page 03 series.** `space-and-tabs.svg`, `three-tabs.svg` and `task-tabs.svg` are one base drawing: the Herdr window with the `client-portal` space and its three tabs. `three-tabs.svg` is the base. The other two copy its frame and change the highlighted part.
- **D6 Embeds.** One line `![<alt>](../pictures/<file>.svg)` per section with a blank line each side, placed after the section's first paragraph, or after the first block (table, list, code block) that paragraph introduces. A section whose first child is a `###` step gets the embed directly under its `##` intro line. README: one line `![<alt>](docs/pictures/three-tabs.svg)` after the second intro paragraph, above `## Guide`. Alt text and the SVG `<desc>` hold the same plain sentence. No `)` inside alt text. No other text changes.
- **D7 File names.** New names avoid every existing file in `docs/pictures/` (old `grounding.svg`, `releases.svg`, `config-layers.svg` belong to away-pictures' deletion and stay untouched).
- **D8 Proof test.** Three cases in `tests/docs-pictures.test.ts` (committed f629638f): README holds a `docs/pictures/three-tabs.svg` embed with non-blank alt; every `##` section of pages 01 to 03 holds an embed with non-blank alt; `pictureProblems` over pages 04 to 08 plus 01 to 03 reports nothing, and page 02 embeds `one-akrogon-many-repos.svg`, page 03 embeds `three-tabs.svg`. Running the mark comparison over both page sets makes "identical to charting-pictures-more's group" mechanical: one setup picture that differs from the charting pictures is reported.

### Note for review: parallel picture leaves

build-pictures and away-pictures also extend `tests/docs-pictures.test.ts` and `tests/AREA.md`. Whichever lands second rebases over the other. This leaf's cases are a separate block before the fixture test, so the hunks are additive.

## Pictures

Page 01 (`docs/guide/01-install.md`):
- **P1** `machine-check.svg`, `## Check your machine`: a checklist card, one row per prerequisite with its check command and what a ready machine prints: Linux with a systemd user manager (`systemctl --user is-system-running`, running or degraded), Bun, Git, `flock`, `herdr-core` (`hc`), `herdr-app`, one agent CLI (`claude`, `codex`, `agy` or `pi`); GitHub CLI marked optional.
- **P2** `install-steps.svg`, `## Install step by step`: five numbered steps left to right: clone into `~/code/akrogon`, write `~/.akrogon/config.yaml`, `bun install` and `bun src/akrogon.ts install`, `~/.local/bin` on `PATH`, `akrogon config` ends `repo: none`. Under step 3, what install creates: `~/.akrogon/current`, `~/.local/bin/akrogon`, skill folders for every agent CLI, systemd units with `akrogon-listener.service`.
- **P3** `agent-clis.svg`, `## Optional: add more agent CLIs`: `~/.akrogon/config.yaml` with `harnesses:` claude, codex, agy, pi; `slots:` a (slot A, the builder), b (slot B, the reviewer), consultant, each pointing at one harness, for example a to claude, b to codex, consultant to pi; note: every harness a slot names needs a line under `harnesses:`.
- **P4** `updates-and-rollback.svg`, `## Updates and rollback`: your checkout registered as repository `akrogon`; a merged update builds `~/.akrogon/releases/<commit>`; `~/.akrogon/current` switches to it; `akrogon rollback` points `current` back at the previous release.

Page 02 (`docs/guide/02-set-up-a-repo.md`):
- **P5** `one-akrogon-many-repos.svg`, `## One Akrogon install, many repositories`: one install (`~/.akrogon/config.yaml`) serving three repositories: `acme-core` (ac, the shared upstream library) with `client-portal` (cp) and `partner-hub` (ph) built on it; each prefix names that repository's terminals, for example `cp-csv-export-a` for slot A, `cp-watch` for the watcher timer.
- **P6** `repo-setup-steps.svg`, `## Set up client-portal step by step`: four steps: `/init-akrogon` in your agent CLI at the repo root, accept the proposal (`akrogon init` writes `issues/config.yaml`, `issues/open/`, `learnings/LESSONS.md`, `.gitignore`, `.gitattributes`, the `repos:` entry), add `client-portal: cp` under `prefixes:`, `akrogon status` shows `client-portal`; then commit the setup files.
- **P7** `repo-settings.svg`, `## Settings you are most likely to touch`: the `issues/config.yaml` card with `remote`, `default_branch`, `setup`, `checks`, `grounding.index`, optional `slots`; side notes: `merge_checks` run only at merge time, `advisory` never blocks; `slots` here override a and b for this repository, `consultant` always comes from `~/.akrogon/config.yaml`.
- **P8** `grounding-map.svg`, `## Grounding`: top index `docs/reference-index.md` with one line per area, some lines pointing at an `AREA.md` (at most 40 lines; Commands, Key files, Non-obvious patterns, See also) that points at real paths; three readers: planning copies paths into the read-first list, building works from that list, reviewing checks changed `AREA.md` paths exist.

Page 03 (`docs/guide/03-your-three-tabs.md`) and README (P9, P11, P12 are one series, D5):
- **P9** `space-and-tabs.svg`, `## Required space name vs your tab naming convention`: the Herdr space named `client-portal` marked required (must match the `repos:` key; none or two and Akrogon refuses to launch), the three tab names `t-`, `c-`, `w-` marked your convention, never checked.
- **P10** `create-space-steps.svg`, `## Create the space and three tabs step by step`: five steps with their commands: open `herdr-app`; `herdr-app do space.new --name client-portal ... --tab t-client-portal`; `tab.new` for `c-client-portal`; `tab.new` for `w-client-portal`; `herdr-app ls` and `akrogon status` in `t-client-portal`.
- **P11** `three-tabs.svg`, `## What runs in each tab` and README hero: one Herdr space `client-portal` with three tabs: `t-client-portal` (`akrogon status`, `akrogon next`), `c-client-portal` (your agent CLI running `/chart-issues`), `w-client-portal` (your agent CLI running `watch-issues`, a 20-minute timer).
- **P12** `task-tabs.svg`, `## Task tabs Akrogon manages for you`: the same space with the three permanent tabs plus one temporary task tab `csv-export` holding slot A and slot B; `akrogon next` opens it, merging closes it, a stopped task shows as `csv-export failed`; closing the window leaves `herdr-core` running the terminals.

## Waves

- **Wave 1** (three disjoint units, no shared test resource, no prerequisite)
  - **U1 Page 01.** Owns P1 to P4 and their embed lines in `docs/guide/01-install.md`.
  - **U2 Page 02.** Owns P5 to P8 and their embed lines in `docs/guide/02-set-up-a-repo.md`.
  - **U3 Page 03 and README.** Owns P9 to P12, their embed lines in `docs/guide/03-your-three-tabs.md`, and the hero line in `README.md`.

Each unit renders every SVG it writes with `rsvg-convert -b white -o <scratch>/<file>.png docs/pictures/<file>.svg`, opens the PNG and checks it reads and the mark sits on the text line, then runs `bun test tests/docs-pictures.test.ts tests/docs-links.test.ts tests/docs-em-dash.test.ts`. Until all three land, the section case lists the other units' sections.

Docs affected: `README.md` (hero line only, U3); guide pages 01 to 03 (embed lines only, U1 to U3); `tests/AREA.md` (docs-pictures line, done in the test commit). `docs/reference/where-things-go.md` already states the mark rule and stays. No skill or agent doc is affected.

## Criteria and proof

The report (`implementation/report.md`) lists each section with its picture, the empty share list (D4), the 12 SVG paths, the render paths and the run-check logs below.

1. **README hero, a picture per section, plain alt, approved words.**
   - Observation: `akrogon run-check --name pictures -- bun test tests/docs-pictures.test.ts`, cases "README embeds the three-tabs hero picture with alt text" and "every section of guide pages 01 to 03 has a picture with alt text". Boundary: README.md and pages 01 to 03 on disk. Before (log below): README alt empty, 12 sections listed. After: pass, `[]`. Catches: a missing hero, a section left bare, blank alt. Size: seconds. Rerun: any change to README.md or pages 01 to 03.
   - Plain alt text, approved label words (D3) and share reasons (none, D4) are slot B's reading.
2. **Mark group identical to charting-pictures-more's; search finds no forbidden markup; "created by" and `<title>Tamdoma</title>` in each.**
   - Observation: same command, case "every picture on guide pages 01 to 03 holds the charting pictures mark group and no outside or moving markup" (one mark group per picture holding the title and `created by`, identical across pages 01 to 08 apart from the translate; no `href`, `<script`, `@import`, `@font-face`, `animation`, `<animate`), plus `akrogon run-check --name dash -- bun test tests/docs-em-dash.test.ts` for the em dash. The report cites both logs as its search. Before: page 02 embeds nothing. After: pass. Catches: a hand-edited or rescaled mark, an outside link, a script, a web font, motion, an em dash. Size: seconds. Rerun: any SVG change.
3. **Slot B renders and reads each picture.** B runs `rsvg-convert -b white -o <scratch>/<file>.png docs/pictures/<file>.svg` for each of the 12 and `rsvg-convert -b '#0d1117' ...` for one, reads each PNG and answers "what does this picture show?" against its section. B's reading, no test.
4. **Checks pass.** `akrogon verify` on the committed head (format, test, typecheck; test runs the three docs tests). Size: minutes.

### Conditions checked against decisions

| Condition (criterion) | Decision | Case or traced reason | Red at planning |
|---|---|---|---|
| K1 a setup picture's mark matches the charting group, not only the other setup pictures (2) | D1, D8 | the mark case compares pages 01 to 08 together; temporary `three-tabs.svg` with `scale(0.06)` embedded on page 03 is reported | `red-k1-mark-differs`: "three-tabs.svg: mark group differs from the others apart from its translate" |
| K2 README hero alt is not blank (1) | D6, D8 | temporary `![ ](docs/pictures/three-tabs.svg)` in README fails the hero case | `red-k2-hero-blank-alt`: `Expected: not ""` |
| K3 no forbidden markup in a setup picture (2) | D2, D8 | temporary `three-tabs.svg` holding `<a href>` embedded on page 03 is reported | `red-k3-href`: "three-tabs.svg: holds href" |
| K4 the other tokens, blank section alt, missing "created by" (1, 2) | D8 | traced: the setup cases call the same `pictureProblems` and `sectionsWithoutPicture` whose fixture case already fails on each token, blank alt and "made by" (charting-pictures-more K3 to K6) | none (traced) |

Each red was a temporary edit of README.md, page 03 or a scratch `three-tabs.svg`, reverted with `git checkout` and `rm`; `git status` showed only the test file afterwards.

### Planning runs

- Criterion tests red for missing behavior: `check pictures-red: 1 implementation/check-pictures-red-1795790751439-2276980.log`. Hero case `Expected: not ""`; section case listed all 12 sections; mark case `Expected to contain: "docs/pictures/one-akrogon-many-repos.svg"`. The two 04 to 08 cases and the fixture case passed.
- K1: `check red-k1-mark-differs: 1 implementation/check-red-k1-mark-differs-1795790762190-2277586.log`
- K3: `check red-k3-href: 1 implementation/check-red-k3-href-1795790762299-2277659.log`
- K2: `check red-k2-hero-blank-alt: 1 implementation/check-red-k2-hero-blank-alt-1795790762450-2277755.log`
- `check plan-format: 0 implementation/check-plan-format-1795790768191-2278430.log`, `check plan-typecheck: 0 implementation/check-plan-typecheck-1795790771099-2278701.log`

## Open limitations

- GitHub shows each SVG through `<img>` with the viewer's system fonts, so text width varies a little. Boxes leave about 10 px slack around their longest label.
- Whether a picture shows its section's content is slot B's reading; no test checks it.

## Credentials

The design names no credential. `akrogon status setup-pictures` prints no `Missing:` line.

## Implementation notes

2026-11-27:
- Plan gap, not a locked-decision change: `tests/docs-links.test.ts` case "README carries no picture" (guide-chapters, from design R10 "README carries no picture until the hero exists") contradicts criterion 1 once the hero lands. A corrected that one expectation to "README images equal `docs/pictures/three-tabs.svg`" in its own commit 15453437 with a `Test-Change:` trailer citing criterion 1 and R10. The README hero proof stays in `tests/docs-pictures.test.ts`.
