# Report: setup-pictures (implement)

Base f6fb18643f6dfc31f8e7e801660f80d1887947c8 (origin/main). Committed head 154534374fe4f8ac0e905af0f95bdf4cff483513. Refreshes at implement start and before verify: branch already on origin/main, no move.

Mode: subagents, one wave of three workers (U1 page 01, U2 page 02, U3 page 03 and README), worktrees `setup-pictures-u1..u3` at f629638f, all removed after cherry-pick. No paid session, no shared test resource.

## Commits

- f629638f test: picture checks for README hero and guide pages 01 to 03 (planning)
- 687acdf7 docs: pictures for guide page 01 sections (U1, from 9bf9fec5)
- 868adf87 docs: pictures for guide page 02 sections (U2, from edaf1341)
- e0cb9022 docs: pictures for guide page 03 sections (U3, from 7033ec64)
- 15453437 test: README may carry the three-tabs hero picture (A, expectation correction)

## Changed files and reasons

- `docs/pictures/*.svg`, 12 new pictures (below): one per `##` section of pages 01 to 03, style copied from charting-session.svg, mark group copied byte for byte from mode-and-route.svg with only the outer translate changed (838, height minus 22).
- `docs/guide/01-install.md`, `02-set-up-a-repo.md`, `03-your-three-tabs.md`: one embed line per section, no other text change. Alt text equals each SVG `<desc>`.
- `README.md`: one hero line `![...](docs/pictures/three-tabs.svg)` above `## Guide`.
- `tests/docs-pictures.test.ts`, `tests/AREA.md`: planning commit.
- `tests/docs-links.test.ts`: expectation correction. U3 returned a mismatch: the existing case "README carries no picture" (guide-chapters, design R10 "README carries no picture until the hero exists") contradicts criterion 1. A changed `not.toMatch(/!\[...\]\(/)` to `README images toEqual(['docs/pictures/three-tabs.svg'])` and renamed the case, in its own commit with a `Test-Change:` trailer citing criterion 1 and R10. Red before (`check lane-docs: 1 implementation/check-lane-docs-1795791162231-2304112.log`, only that case failed), green after (`check lane-docs-2: 0 implementation/check-lane-docs-2-1795791168741-2304687.log`). Slot B judges this correction.

## Sections and pictures (share list: empty, plan D4)

| Page | Section | Picture |
|---|---|---|
| README | hero, above `## Guide` | `docs/pictures/three-tabs.svg` |
| 01 | Check your machine | `docs/pictures/machine-check.svg` |
| 01 | Install step by step | `docs/pictures/install-steps.svg` |
| 01 | Optional: add more agent CLIs | `docs/pictures/agent-clis.svg` |
| 01 | Updates and rollback | `docs/pictures/updates-and-rollback.svg` |
| 02 | One Akrogon install, many repositories | `docs/pictures/one-akrogon-many-repos.svg` |
| 02 | Set up `client-portal` step by step | `docs/pictures/repo-setup-steps.svg` |
| 02 | Settings you are most likely to touch | `docs/pictures/repo-settings.svg` |
| 02 | Grounding | `docs/pictures/grounding-map.svg` |
| 03 | Required space name vs your tab naming convention | `docs/pictures/space-and-tabs.svg` |
| 03 | Create the space and three tabs step by step | `docs/pictures/create-space-steps.svg` |
| 03 | What runs in each tab | `docs/pictures/three-tabs.svg` |
| 03 | Task tabs Akrogon manages for you | `docs/pictures/task-tabs.svg` |

`three-tabs.svg` on README and page 03 is the brief's own placement, not a section share. Page 03's `space-and-tabs.svg` and `task-tabs.svg` are drawn from the `three-tabs.svg` base (D5).

## Criteria and proof (all on head 15453437)

1. README hero, a picture per section, alt text: `check pictures: 0 implementation/check-pictures-1795791320020-2635482.log` (6 pass, including "README embeds the three-tabs hero picture with alt text" and "every section of guide pages 01 to 03 has a picture with alt text"). Plain alt and approved words: slot B's reading.
2. Mark group identical to charting-pictures-more's, forbidden markup, "created by" and title: same `pictures` log, case "every picture on guide pages 01 to 03 holds the charting pictures mark group and no outside or moving markup" (compares pages 01 to 08 together); em dash `check dash: 0 implementation/check-dash-1795791320149-2635555.log`. Report's search of every new SVG (`grep -i` for `href|<script|@import|@font-face|animation|—|&mdash;|&#8212;|&#x2014;`, counts of `created by` and `<title>Tamdoma</title>`): `check svg-search: 0 implementation/check-svg-search-1795791320285-2635648.log`, every file `forbidden=0 created_by=1 title=1`.
3. Slot B renders and reads: A's own renders (white, plus `three-tabs-dark.png` on #0d1117) are in `/var/tmp/akr-1000/5d20/e99d7cea/claude-1000/-home-ivan--akrogon-worktrees-akrogon-setup-pictures/1d2f05f6-a0b5-40a8-9f7f-3f2528c4f8b2/scratchpad/a-renders/`. A looked at eight of them and each read as its section. B makes its own renders.
4. Checks: `akrogon verify` on 154534374fe4: setup 0, format 0, typecheck 0, test 0, `verify leaf 154534374fe4f8ac0e905af0f95bdf4cff483513: green`. Wall time 114 s.

## Worker returns folded in

- U1: 4 pictures, targeted tests in the expected state (`check u1-docs: 1 implementation/check-u1-docs-1795791074408-2300007.log`, only other units' items red).
- U2: 4 pictures (`check u2-docs: 1 implementation/check-u2-docs-1795791109993-2301734.log`, only other units' items red). Noted "area line" stands for the index rows, since the page names no real areas.
- U3: 4 pictures and the README hero (`check u3-docs: 1 implementation/check-u3-docs-1795791108767-2301535.log`), returned the docs-links mismatch above.

## Docs

README.md and pages 01 to 03 (embed lines), tests/AREA.md (planning commit). where-things-go.md unchanged; no skill or agent doc affected.

## Known limitations

- GitHub renders SVG text in the viewer's system fonts. The longest mono rows in `create-space-steps.svg` leave about 50 px at the right edge.
- build-pictures and away-pictures also extend `tests/docs-pictures.test.ts` and `tests/AREA.md`. Whichever lands second rebases.

## Unverified criteria

- Criterion 1's plain alt text and approved words, and criterion 3, are slot B's reading.
