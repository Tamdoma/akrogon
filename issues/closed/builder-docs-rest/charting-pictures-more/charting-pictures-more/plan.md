# Plan: charting-pictures-more

Worktree: /home/ivan/.akrogon/worktrees/akrogon/charting-pictures-more (base 9a7402bf, charting-fixes merged).

## Read first

- `brief.md`, `design.md` (this folder).
- `docs/reference/where-things-go.md` `## Pictures`: the picture rules.
- `docs/pictures/charting-session.svg`, `docs/pictures/mode-and-route.svg`: the reference drawings (style block, defs, card, box classes, arrow marker).
- `docs/guide/04-a-charting-session.md` to `docs/guide/08-hand-off.md`: the sections to illustrate.
- `tests/docs-pictures.test.ts` (new, planning commit), `tests/docs-links.test.ts`, `tests/docs-em-dash.test.ts`.
- `/home/ivan/Work/infra/tamdoma/website/website/src/layouts/Layout.astro` (tokens) if a colour is in doubt. Logotype paths are already inline in both reference drawings; copy them, never from `website/public/logos/`.
- Grounding: `docs/reference-index.md` links `docs/README.md` and `tests/AREA.md`. `learnings/LESSONS.md` line 43 (a screenshot can succeed while showing the wrong thing; inspect the saved frame) applies to the render step. No other lesson touches pictures.

## Decisions

- **D1 Mark group markup.** Every picture carries exactly this group, bottom right, with only the outer translate differing:

  ```text
  <g transform="translate(838 Y)"><title>Tamdoma</title>
    <text x="0" y="0" text-anchor="end" style="font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; letter-spacing: .04em; fill: #5e7355;">created by</text>
    <g transform="translate(8 -14) scale(0.05)" fill="#0f0f0f">
    (the seven <path> elements copied verbatim from today's group in mode-and-route.svg)
    </g>
  </g>
  ```

  The title moves from the inner logo group to the outer group, so the group holds both the text and the logo (brief: "one group holding the text and the Tamdoma logotype, placed by one translate"). The inner offset `translate(8 -14)` is today's mode-and-route geometry, measured at 4x with rsvg-convert: text rows 409.25 to 419.75 (mid 414.5), logo rows 405.0 to 423.25 (mid 414.1), so the logo is centred on the text line within 0.4 px. charting-session today measures text mid 438.5 and logo mid 434.1, 4.4 px high, which matches B and C.
- **D2 Inline style on the text.** The text carries its font, size, spacing and fill in a `style` attribute instead of `class="mono"`. A `style` attribute beats each file's `text { ... }` type rule, so the group renders the same whatever style block the host file has. Rejected: `class="mono"`, which makes the group's look depend on each file's own style block.
- **D3 One translate.** `Y` is the card height minus 22 (mode-and-route 440 gives 418, as today; charting-session 460 gives 438). `X` is 838 on every 960 px card.
- **D4 One picture per section, no shares.** 22 new SVGs, one under each `##` section of pages 04 to 08 except 04's c- tab section (list below). No section shares a picture, so the report's share list is empty. Rejected: re-embedding mode-and-route.svg under 06's `## Direct is offered only under No autopilot` (the same picture twice on one page), and pointing 05's `## Who answers signposts` at 06's table picture (it lacks the unanswered-signpost row).
- **D5 Series.** 06's four mode pictures (P9 to P12) are one base drawing: P9 shows the three Charting modes side by side, and P10, P11, P12 are copies with one column highlighted (sage `key` fill) and the other two faded to `soft` text, plus one or two lines specific to that mode. P6 on page 05 uses the same three-column layout but is drawn by its own unit, since it lives on another page.
- **D6 Embeds.** Each embed is one line `![<alt>](../pictures/<file>.svg)` with a blank line on each side, placed after the section's first paragraph (or after its first code block when the paragraph introduces one), as 04's existing embed sits after its intro line. Keeping embeds off the heading line keeps hunks away from guide-chapters' edits to section ends on page 04. No guide text other than embed lines changes. Alt text and the SVG `<desc>` hold the same plain sentence saying what the picture shows.
- **D7 Drawing style.** Copy the `<svg>` root attributes (`role="img" aria-labelledby="t d"`), `<style>` block, `<defs>` arrow marker and card `<rect>` from charting-session.svg. Width 960, height as the content needs (about 300 to 480). Heading at (40, 48) in class `h`, one `soft` subtitle at (40, 72). Labels use the guide's words and the approved names only: Charting mode, No autopilot, Semi-autopilot, Full autopilot, Build route, Direct, Lifecycle, slot A (the builder), slot B (the reviewer), charting agent, consultants, signposts, needs sheet, fork, Fog, hand-off, task. Never: manual, quick fix, seat, door, leaf, attended. Text stays text. No em dash (the dash guard reads SVGs).
- **D8 Docs line.** `docs/reference/where-things-go.md` Mark line becomes: Mark: one group, titled `<title>Tamdoma</title>`, holding the "created by" text and the Tamdoma logotype as inline paths, placed at the bottom right by its one translate. Every picture copies the group whole from `docs/pictures/mode-and-route.svg` and changes only that translate.
- **D9 Proof test.** `tests/docs-pictures.test.ts` (committed at planning) reads pages 04 to 08 from disk: every `##` section except the one starting "Where you chart" holds an embed with non-blank alt; every picture embedded on those pages holds exactly one mark group (the D1 shape), all identical once the outer translate is removed, containing "created by", and no `href`, `<script`, `@import`, `@font-face`, `animation` or `<animate` (case-insensitive). The picture set comes from the embeds, so the 22 new files and the two reference drawings are exactly the pictures this leaf touches or adds.
- **D10 No opener pictures.** Openers (text above the first `##`) are not `##` sections, so none is required. 06 and 07 keep mode-and-route.svg above their first `##`.

### Note for review: guide-chapters

guide-chapters' brief (criterion 5) says where-things-go.md "keeps the picture-style lines unchanged". This leaf's brief changes the Mark line. The two leaves run in parallel, so whichever lands second rebases over the other. guide-chapters also edits page 04 (tab section, previous/next line). D6 keeps this leaf's 04 hunks inside other sections.

## Pictures

Each row: file, section it sits under, what it shows. Labels in mono where they are commands, paths or record words.

Page 04:
- **P1** `opening-a-session.svg`, `## Opening a session`: the c-client-portal tab with the request `/chart-issues Add a weekly client report export to client-portal.` and the full consultant line `Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.`; the start checks `akrogon pull` (into `issues/seeds/`), `akrogon flaky`, `akrogon status`; the first reply confirming three things: consultants, Charting mode (No autopilot by default), who answers signposts.
- **P2** `consultants.svg`, `## What consultants do during charting`: four steps left to right: blind notes (charting agent, B, C each inspect alone), merge with agreement tags `(A,B)` `(A,B,C)`, one short rebuttal from each consultant, the question to you with disagreements shown. A side note: consultants B, C, D are not slot A and slot B of a Lifecycle task.
- **P3** `chart-records.svg`, `## Where chart records live`: the folder `issues/chart/weekly-client-report/` with `CHART.md`, `INTAKE.md`, `forks/signposts.md`, `forks/<fork-slug>.md`, `slots/`, `seats.yaml`, `USAGE.md`, each with a short label; beside it the t-client-portal tab running `akrogon status --charts`.

Page 05:
- **P4** `signposts-session.svg`, `## What signposts are and when they are asked`: one session as a line in the c- tab: first message, signposts once, territory map, then charts 1, 2, 3; waits, compaction and handovers marked as inside the session; what signposts hold: ranked priorities, hard limits, chart order (and drops).
- **P5** `signposts-round.svg`, `## How the signposts round works`: quick consultant exchange, the round card (4 to 7 questions, 2 or 3 options, one recommended, no research block, "same" reuses earlier answers), the short account, then `forks/signposts.md` in the original chart with verbatim copies in the session's other charts.
- **P6** `signposts-by-mode.svg`, `## Who answers signposts in each Charting mode`: three columns No autopilot, Semi-autopilot, Full autopilot; rows: signposts (you, you once, charting agent), forks after (you, charting agent, charting agent), unanswered signpost (asked again, standing values fill it, charting agent answers).
- **P7** `needs-sheet.svg`, `## The needs sheet`: four row kinds (keys and files, accounts and permissions, approvals, human-only actions) with statuses `pending`, `supplied`, `late`; two rules: only you answer rows, and pending rows let charting continue and wait only at proofs and hand-off.
- **P8** `signposts-example.svg`, `## Worked example: client-portal`: three charts (weekly client report export, CRM sync retry fix, agency logo header tweak), your reply `1a 2a 3a 4a`, the chart order, needs rows (row 1 key `pending`, row 2 approval `supplied`, row 3 human-only `pending`), then the territory map starting.

Page 06 (P9 to P12 are one series, D5):
- **P9** `modes-at-a-glance.svg`, `## The three Charting modes at a glance`: three columns with who answers signposts, who answers each fork, and whether Direct is offered.
- **P10** `mode-no-autopilot.svg`, `## No autopilot`: No autopilot highlighted: you answer signposts and every fork, you approve the hand-off, Direct can be offered.
- **P11** `mode-semi-autopilot.svg`, `## Semi-autopilot`: Semi-autopilot highlighted: you answer signposts once, the charting agent answers each fork and records it as its own pick with a reason, Lifecycle only.
- **P12** `mode-full-autopilot.svg`, `## Full autopilot`: Full autopilot highlighted: the charting agent answers signposts and forks, may order charts but never drops one, Lifecycle only.
- **P13** `autopilot-hands-off.svg`, `## Direct is offered only under No autopilot`: an autopilot chart becomes contracts in `issues/open/` for a fresh slot A (the builder) and slot B (the reviewer); Direct is closed under autopilot; autopilot charts and hands off, it never starts building.
- **P14** `autopilot-waits.svg`, `## What still waits for you under Semi-autopilot and Full autopilot`: a handed list of charts; one chart hits a boundary (needs-sheet row, grant or human-only step, late need, new-chart proposal, seed decision finding, conflicting answers), parks, the charting agent moves to the next chart and sends an attention alert, your next message resumes it.
- **P15** `autopilot-records.svg`, `## Boundaries, records, and turning autopilot off`: `CHART.md` with `## Mode record` and `## Autopilot`; fixed list only; a consultant dropped after two misses; autopilot ends when every chart is `Handed off` or `Closed`, or when you turn it off.

Page 07:
- **P16** `routes-at-a-glance.svg`, `## Direct vs Lifecycle at a glance`: two lanes. Direct: charting agent as slot A in a worktree, consultant B as slot B, merge queue, default branch. Lifecycle: contracts in `issues/open/`, fresh slot A, fresh slot B, merge queue.
- **P17** `direct-route.svg`, `## Direct`: seven checks (No autopilot, consultant B named, inside herdr, one outcome, no readiness extras, no live run, no pending human-only step), `akrogon direct`, build as slot A, B reviews with a repair loop, merge queue lands, `Closed`; side branch: bigger than expected, `failed`, then `akrogon direct-drop` (`Held`) or move to Lifecycle.
- **P18** `lifecycle-route.svg`, `## Lifecycle`: the charting agent writes `brief.md`, `design.md`, `readiness.yaml`, `state.yaml` and stops; you run `akrogon next`; slot A plans and builds, slot B reviews, in their own tab; the work lands.

Page 08:
- **P19** `before-hand-off.svg`, `## Before hand-off: locking decisions and checking assumptions`: four safeguards feeding "ready for hand-off": settled forks (`## Taken`), seed decisions locked, real-world checks (proofs), readiness check (`Missing:`); gate: no open fork and no Fog.
- **P20** `hand-off-review.svg`, `## What the hand-off review shows`: the review card: task tree (`csv-export`, `scheduled-email` blocked-by `csv-export`), destination repo, settled decisions, grants, seats for slot A and slot B, Build route choice, usage, live-run estimates; then consultants review drafts, final contracts written, `state.yaml` last.
- **P21** `after-hand-off.svg`, `## What the charting agent hands off and what happens next`: Lifecycle: contracts in `issues/open/`, `Handed off` in `CHART.md`, nothing starts until `akrogon next` in t-client-portal or the watcher in w-client-portal. Direct: `akrogon direct`, the merge queue lands it, `Closed`.
- **P22** `next-chart.svg`, `## Moving to the next chart`: chart 1 hands off, closes, holds or waits; handover logs the remaining list, consultants and signposts path; fresh conversation; chart 2 starts with the same signposts.

## Waves

- **Wave 1**
  - **U1 Mark group.** Owns `docs/pictures/charting-session.svg`, `docs/pictures/mode-and-route.svg` (mark group only, D1 to D3), `docs/reference/where-things-go.md` (Mark line, D8), `tests/AREA.md` (one line for `tests/docs-pictures.test.ts`). Prerequisite: none.
- **Wave 2** (each needs U1, copies the group from mode-and-route.svg)
  - **U2 Page 04.** Owns P1 to P3 and their embed lines in `docs/guide/04-a-charting-session.md`.
  - **U3 Page 05.** Owns P4 to P8 and their embed lines in `docs/guide/05-signposts.md`.
  - **U4 Page 06.** Owns P9 to P15 and their embed lines in `docs/guide/06-charting-mode.md`.
- **Wave 3** (needs U1; in a later wave only because a wave holds at most 3)
  - **U5 Page 07.** Owns P16 to P18 and their embed lines in `docs/guide/07-build-route.md`.
  - **U6 Page 08.** Owns P19 to P22 and their embed lines in `docs/guide/08-hand-off.md`.

No unit uses a shared test resource: renders and tests are local reads. Each unit renders every SVG it writes with `rsvg-convert -b white -o <scratch>/<file>.png docs/pictures/<file>.svg`, opens the PNG and checks it reads, and runs `bun test tests/docs-pictures.test.ts tests/docs-links.test.ts tests/docs-em-dash.test.ts` (after U1, case 2 is green and case 1 stays red until wave 3 lands; each later unit's own sections leave case 1's list).

Docs affected: `docs/reference/where-things-go.md` (Mark line, U1); `tests/AREA.md` (one line naming `tests/docs-pictures.test.ts`, U1); guide pages 04 to 08 (embed lines only, U2 to U6). No skill or agent doc is affected.

## Criteria and proof

The report (`implementation/report.md`) lists each section with its picture, an empty share list (D4), the render paths, and the run-check logs below.

1. **Mark group identical, logo on the line.**
   - Observation: `akrogon run-check --name pictures -- bun test tests/docs-pictures.test.ts`, case "every picture on guide pages 04 to 08 holds one identical mark group". Boundary: SVG files on disk, found from the embeds in pages 04 to 08. Before (planning, log below): `charting-session.svg: 0 mark groups`, `mode-and-route.svg: 0 mark groups`. After: `[]`. Catches: a picture whose mark was hand-edited, rescaled, or left in the old split form. Size: seconds. Rerun: any change to `docs/pictures/*.svg` or to an embed on pages 04 to 08.
   - Logo position: slot B reads `rsvg-convert -z 2 -b white` renders of charting-session.svg and mode-and-route.svg. D1 records the measured geometry.
2. **Every section has a picture, alt text plain, labels in approved words.**
   - Observation: same command, case "every section of guide pages 04 to 08 has a picture with alt text". Before: 22 sections listed (log below). After: `[]`. Catches: a section left without a picture or with blank alt. Size: seconds. Rerun: any change to pages 04 to 08.
   - Plain alt text and approved label words (D7) are slot B's reading of the pages and renders. No shares, so B has no share reasons to judge.
3. **Search finds no forbidden markup and finds "created by" and the title in each.**
   - Observation: the same test case as 1 (tokens `href`, `<script`, `@import`, `@font-face`, `animation`, `<animate`; one mark group holding `<title>Tamdoma</title>` and `created by`), plus `akrogon run-check --name dash -- bun test tests/docs-em-dash.test.ts` for the em dash. The report cites both logs as its search. Size: seconds. Rerun: any SVG change.
4. **Slot B renders and reads each picture.** The report lists the 24 SVG paths. B runs `rsvg-convert -b white -o <scratch>/<file>.png docs/pictures/<file>.svg` for each and `rsvg-convert -b '#0d1117' ...` for one, reads each PNG and answers "what does this picture show?". This is B's reading. Nothing in it is a test.
5. **Checks pass.** `akrogon verify` on the committed head (format, test, typecheck; test covers `tests/docs-links.test.ts`, `tests/docs-em-dash.test.ts` and `tests/docs-pictures.test.ts`). Size: minutes.

### Conditions checked against decisions

| Condition (criterion) | Decision | Case or traced reason | Red at planning |
|---|---|---|---|
| K1 groups differ only in their translate (1) | D1, D3 | fixture b.svg with `scale(0.06)` must be reported | `red-c1-mark-diff`: comparison disabled, fixture lost "mark group differs" |
| K2 rendering cannot vary with the host style (1) | D2 | traced: an inline `style` attribute outranks the `text {}` type rule, so the markup comparison in K1 also fixes the rendered text. B's screenshot confirms | none (traced) |
| K3 only 04's c- tab section is exempt (2) | D9 | fixture page with the c- tab heading and no picture is not reported, other bare sections are | `red-c4-ctab`: exemption removed, fixture reported the c- tab section |
| K4 alt text is not blank (2) | D6, D9 | fixture section with `![ ]` is reported | `red-c3-blank-alt`: alt check removed, fixture lost "## Three" |
| K5 no `href` (and each other token) (3) | D9 | one fixture write per token, each reported | `red-c2-href`: `href` dropped from the list, fixture lost "holds href" |
| K6 "created by" sits inside the group (3) | D1, D9 | fixture group with "made by" is reported | `red-c5-created-by`: check disabled, fixture lost the "created by" problem |

Each red was a temporary edit of `tests/docs-pictures.test.ts`, run with `-t 'picture checks catch'`, then restored byte for byte (`cmp`).

### Planning runs

- Criterion test red for missing behavior: `check pictures-red: 1 implementation/check-pictures-red-1795787560920-1047925.log`. Case 1 listed the 22 sections, case 2 listed `charting-session.svg: 0 mark groups, 1 Tamdoma titles` and `mode-and-route.svg: 0 mark groups, 1 Tamdoma titles`, the fixture case passed.
- K1: `check red-c1-mark-diff: 1 implementation/check-red-c1-mark-diff-1795787572585-1048185.log`
- K5: `check red-c2-href: 1 implementation/check-red-c2-href-1795787572711-1048266.log`
- K4: `check red-c3-blank-alt: 1 implementation/check-red-c3-blank-alt-1795787572798-1048340.log`
- K3: `check red-c4-ctab: 1 implementation/check-red-c4-ctab-1795787572889-1048422.log`
- K6: `check red-c5-created-by: 1 implementation/check-red-c5-created-by-1795787572968-1048498.log`
- `check plan-format: 0 implementation/check-plan-format-1795787577569-1048740.log`, `check plan-typecheck: 0 implementation/check-plan-typecheck-1795787580352-1048836.log`

## Open limitations

- GitHub shows each SVG through `<img>` with the viewer's system fonts, so text width varies a little by platform. Boxes leave about 10 px slack around their longest label. rsvg-convert and chromium renders stand in for GitHub.
- The test pins the five page names. A later picture leaf for other pages extends the list or adds its own case.

## Credentials

The design names no credential. `akrogon status charting-pictures-more` prints no `Missing:` line.

## Implementation notes

2026-11-27:
- D6 refined for section shapes the rule did not foresee. When a section opens with a table or a list, or its first paragraph introduces a list or table, the embed goes after that block (page 04 Where chart records live, page 06 at a glance, What still waits and Boundaries, page 07 at a glance). Page 05 Who answers signposts keeps the embed after the intro paragraph, before the table. When a section has no paragraph before its first `###` (page 08 What the charting agent hands off), the embed sits directly under the `##` heading, since its picture covers both route subsections. The page 04 hunks stay away from the c- tab section and the previous/next line, so the purpose of D6 holds.
- D1: the logo group has eight `<path>` elements, not seven. All eight are copied unchanged.
- Alt text may not contain `)`, so labels like "slot A (the builder)" appear in alt text as "slot A, the builder". The pictures keep the parentheses.
- `tests/AREA.md` is under `tests/`, so `src/test-files.ts` matches it. The U1 commit carries a `Test-Change: tests/AREA.md` trailer (prose line for the new test, no expectation changed).
