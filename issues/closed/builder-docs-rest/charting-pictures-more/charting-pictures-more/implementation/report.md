# Implementation report: charting-pictures-more

Base: 9a7402bf (origin/main, unchanged at both refreshes). Committed head: d44a5866. Mode: delegated, waves U1 | U2 U3 U4 | U5 U6 per plan.md. Sub-briefs: `implementation/brief-1.md` to `brief-6.md`.

## Commits

| Commit | Unit | What |
|---|---|---|
| 9fbf4bf2 | planning | `tests/docs-pictures.test.ts` (criterion test, red on base) |
| 96941cd9 | U1 | one mark group in charting-session.svg and mode-and-route.svg, where-things-go.md Mark line, tests/AREA.md clause. Trailer `Test-Change: tests/AREA.md ...` |
| 245ad80f | U2 | page 04: P1 to P3 and embeds |
| 225ba174 | U4 | page 06: P9 to P15 and embeds |
| 7187f348 | U3 | page 05: P4 to P8 and embeds |
| 94643dd7 | U6 | page 08: P19 to P22 and embeds |
| 33d3631b | A | page 08: P21 embed moved directly under its `##` heading (it shows both routes; it had landed inside `### On the Lifecycle route`) |
| d44a5866 | U5 | page 07: P16 to P18 and embeds |

## Changed files and reasons

- `docs/pictures/charting-session.svg`, `docs/pictures/mode-and-route.svg`: mark is now one group `<g transform="translate(838 Y)"><title>Tamdoma</title>` holding the "created by" text (inline `style`) and the logo `<g transform="translate(8 -14) scale(0.05)">`. Y = 438 and 418. Nothing else changed.
- 22 new SVGs in `docs/pictures/` (list below), one per section.
- `docs/guide/04` to `08`: embed lines only (`git diff 9a7402bf -- docs/guide` holds no removed line apart from the moved P21 embed in 33d3631b, which moves an added line).
- `docs/reference/where-things-go.md`: Mark bullet only.
- `tests/AREA.md`: one sentence appended to the docs-links bullet. Still 49 lines, which was already over the 40-line limit before this task. No line added.

## Section to picture (criterion 2)

Shares: none. Every section has its own picture.

| Page | Section | Picture |
|---|---|---|
| 04 | Where you chart: the `c-` tab | none, by the brief (links to page 03) |
| 04 | Opening a session | opening-a-session.svg |
| 04 | What consultants do during charting | consultants.svg |
| 04 | One session, step by step | charting-session.svg (existing, mark fixed) |
| 04 | Where chart records live | chart-records.svg |
| 05 | What signposts are and when they are asked | signposts-session.svg |
| 05 | How the signposts round works | signposts-round.svg |
| 05 | Who answers signposts in each Charting mode | signposts-by-mode.svg |
| 05 | The needs sheet | needs-sheet.svg |
| 05 | Worked example: `client-portal` | signposts-example.svg |
| 06 | opener | mode-and-route.svg (existing, mark fixed) |
| 06 | The three Charting modes at a glance | modes-at-a-glance.svg (series base) |
| 06 | No autopilot | mode-no-autopilot.svg (series) |
| 06 | Semi-autopilot | mode-semi-autopilot.svg (series) |
| 06 | Full autopilot | mode-full-autopilot.svg (series) |
| 06 | Direct is offered only under No autopilot | autopilot-hands-off.svg |
| 06 | What still waits for you under Semi-autopilot and Full autopilot | autopilot-waits.svg |
| 06 | Boundaries, records, and turning autopilot off | autopilot-records.svg |
| 07 | opener | mode-and-route.svg |
| 07 | Direct vs Lifecycle at a glance | routes-at-a-glance.svg |
| 07 | Direct | direct-route.svg |
| 07 | Lifecycle | lifecycle-route.svg |
| 08 | Before hand-off: locking decisions and checking assumptions | before-hand-off.svg |
| 08 | What the hand-off review shows | hand-off-review.svg |
| 08 | What the charting agent hands off and what happens next | after-hand-off.svg |
| 08 | Moving to the next chart | next-chart.svg |

Every alt text equals its picture's `<desc>`.

## Pictures for slot B to render (criterion 4)

All 24 under `docs/pictures/`: charting-session, mode-and-route, opening-a-session, consultants, chart-records, signposts-session, signposts-round, signposts-by-mode, needs-sheet, signposts-example, modes-at-a-glance, mode-no-autopilot, mode-semi-autopilot, mode-full-autopilot, autopilot-hands-off, autopilot-waits, autopilot-records, routes-at-a-glance, direct-route, lifecycle-route, before-hand-off, hand-off-review, after-hand-off, next-chart (each `.svg`).

A's own renders (white, rsvg-convert): `/var/tmp/akr-1000/5d20/dc9a0813/claude-1000/-home-ivan--akrogon-worktrees-akrogon-charting-pictures-more/ceca1f6f-2e48-4f86-a38f-70986811c7ea/scratchpad/final/` (one PNG per picture, `dark-hand-off-review.png` on #0d1117, contact sheets `sheet-a.jpg`, `sheet-b.jpg`). A read both sheets: every picture reads, nothing overlaps or clips, the mark sits in the same corner on each. `xmllint --noout` passed for all 24. These renders are A's check, not B's reading.

Logo geometry (criterion 1, for B's screenshot read), measured at 4x with rsvg-convert on d44a5866's pictures: mode-and-route text rows 409.25 to 419.75 (mid 414.5), logo 405.0 to 423.25 (mid 414.1). charting-session text mid 434.5, logo mid 434.1 (it was 438.5 and 434.1 before, 4.4 px high).

## Proofs

| Criterion | Command | Commit | Result |
|---|---|---|---|
| 1, 2, 3 | `akrogon run-check --name pictures -- bun test tests/docs-pictures.test.ts` | d44a5866 | 3 pass. `check pictures: 0 implementation/check-pictures-1795788335777-1080540.log` |
| 3 (em dash) | `akrogon run-check --name dash -- bun test tests/docs-em-dash.test.ts` | d44a5866 | 2 pass. `check dash: 0 implementation/check-dash-1795788335859-1080638.log` |
| 5 | `akrogon verify` | d44a5866 | `verify leaf d44a5866...: green` (format 0, typecheck 0, test 0). Wall time 111 s |
| 1 (position), 2 (plain alt, approved words), 4 | slot B's reading | | not run by A |

Criterion 3's search is the test's case 2 (one mark group per picture holding `<title>Tamdoma</title>` and `created by`, and no `href`, `<script`, `@import`, `@font-face`, `animation` or `<animate`, case-insensitive) plus the dash guard. Both are green over all 24 pictures, because the test finds its picture set from the embeds on pages 04 to 08.

Lane runs after each cherry-pick (`bun test tests/docs-pictures.test.ts tests/docs-links.test.ts tests/docs-em-dash.test.ts`). Only the per-section case was red each time, and its list shrank as each page landed: `check-lane-after-u1-1795787870633-1057610.log`, `check-lane-after-u2-1795788064441-1066970.log`, `check-lane-after-u4-1795788101462-1068678.log`, `check-lane-after-u3-1795788115520-1069206.log`.

Worker check logs: `check-u1-pictures-1795787815611-1055444.log`, `check-u2-pictures-1795788025805-1061958.log`, `check-u3-pictures-1795788086539-1068076.log`, `check-u4-pictures-1795788062785-1066767.log`, `check-u5-pictures-1795788310594-1078861.log`, `check-u6-pictures-1795788297553-1078302.log`. Each was exit 1 from the per-section case only, listing other units' pages.

## Worker returns, folded

- U1: the logo has eight paths, not seven as brief 1 said. All are copied unchanged (plan Implementation notes).
- U2, U4, U6, U5: where a section opens with a table or list, the embed goes after that block (plan Implementation notes refine D6). U6 put P21 after the first paragraph of `### On the Lifecycle route`, and A moved it under the `##` heading (33d3631b).
- U3: the P6 embed is after the intro paragraph and before the table.
- U6: the "Effective seats" row reads "Slot A and slot B: which models run them" because "seat" is not a guide word.
- U5: P18 shows `akrogon next`, which page 08 states. Page 07's Lifecycle section links there.
- No worker changed a test file. No mismatch was returned.

## Known limitations

- GitHub renders the SVGs with the viewer's system fonts. Boxes leave about 10 px of spare room, and only rsvg-convert renders were checked.
- guide-chapters (parallel) says where-things-go.md keeps its picture-style lines unchanged. This task changes the Mark line by its own brief. guide-chapters also edits page 04. Whichever lands second rebases.

## Unverified criteria

- Criteria 1 (logo position on a screenshot), 2 (plain alt text and approved label words) and 4 (render and read each picture) are slot B's reading by the brief.
