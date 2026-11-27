# Plan: build-pictures

Base: `f6fb18643f6dfc31f8e7e801660f80d1887947c8`. Both blockers (guide-chapters, charting-pictures-more) are on the base: pages 09 and 10 exist and 24 pictures on pages 04 to 08 hold one identical mark group.

## Read first

- `docs/reference/where-things-go.md` § Pictures: card, palette, strokes, fonts, mark group, still rules, layout.
- `docs/pictures/mode-and-route.svg`: the mark group source (lines from `<g transform="translate(838 418)"><title>Tamdoma</title>` to its closing `</g></g>`). Copy it whole, change only the translate.
- `docs/pictures/charting-session.svg`, `docs/pictures/lifecycle-route.svg`, `docs/pictures/modes-at-a-glance.svg`: reference drawings for style and for a series drawn from one base.
- `docs/guide/09-lifecycle.md`, `docs/guide/10-merging.md`: the section content each picture must show.
- `docs/guide/06-charting-mode.md`: example of alt text and embed placement (embed line right under the `##` heading).
- `tests/docs-pictures.test.ts`: the picture checks this leaf extends.
- `learnings/LESSONS.md`: no picture lesson applies.

Gap: none. The grounding index `docs/reference-index.md` links `docs/README.md`, which points to where-things-go.md.

## Decisions

- D1. One new picture per `##` section, 14 in all (8 on page 09, 6 on page 10). No section shares a picture, so criterion 1's share clause is unused and the report says "no shares". No picture above the first `##` (R8 makes an opener optional).
- D2. File names and content. Each label uses the guide's own words from that section.

  | Page | Section | File | Shows |
  | --- | --- | --- | --- |
  | 09 | Starting handed-off work | `next-pass.svg` | the `t-client-portal` tab, the four `akrogon next` forms, then one pass: check picked leaves, start or prompt seats, merge pass, clean up, exit |
  | 09 | Why a ready task may wait | `why-a-task-waits.svg` | a picked leaf and the six reasons it waits: `blocked-by` (scheduled-email on csv-export), missing input (`POSTMARK_API_KEY`), twin owner folder, `max_active`, paused repo, stopped or failed leaf |
  | 09 | Start order and capacity refill | `start-order.svg` | rule 1 merged leaves first, rule 2 most unmerged dependents (csv-export ahead), refill of capacity waiters longest-waiting first |
  | 09 | What starts agent sessions | `leaf-start.svg` | worktree, `.env` keys, `setup`, leaf tab with slot A and slot B, then `akrogon-listener.service` waking the next pass, progress kept in files |
  | 09 | Lifecycle phases at a glance | `lifecycle-phases.svg` | `plan.synthesis` to `implement` to `check.review` to `merge` to `merged`, the `check.repair` and `check.fix` loop, `failed` from any active phase |
  | 09 | Slot A (the builder) | `slot-a-and-b.svg` | slot A plans (plan.md, red-first tests), builds, runs `akrogon verify`, writes the report and passes the work to slot B, which reviews and repairs |
  | 09 | Slot B (the reviewer) | `slot-b-review.svg` | same base drawing as `slot-a-and-b.svg` with slot B's side: blind review by both seats, verdicts `ready`/`nits`/`fix`, B repairs most Fixes, `Handed to A` goes to `check.fix`, re-check by B only |
  | 09 | Watching progress | `watching-progress.svg` | what `akrogon status`, `akrogon status csv-export` and `akrogon log <path>` each show, drawn as labelled boxes, not a screenshot |
  | 10 | One merge turn per repository | `merge-turn.svg` | one queue per repo, holder and places 2, 3, the three order rules, the `TURN` column |
  | 10 | Command-owned landing with no seat | `merge-landing.svg` | no seat; reconcile, fetch and rebase, apply and start `akrogon-land-<id>`; conflict or dirty goes to `check.repair` |
  | 10 | Checks, land gates, and pushing | `land-run.svg` | verify, gates, fast-forward push and its four outcomes: merged, one restack retry, held with queue place kept, failed |
  | 10 | When checks go red or a gate refuses | `merge-exit.svg` | the four `merge-exit=` causes into `check.repair`, the two covers, slot B's four outcomes |
  | 10 | Issue and epic completion | `issue-complete.svg` | csv-export lands and wakes scheduled-email; scheduled-email lands and the issue completes: sources closed, logs deleted, folder moved to `issues/closed/`, `issue complete weekly-client-report` |
  | 10 | Announcements | `announcement.svg` | `broadcast pending`, slot B with broadcast-issue, one Discord update (headline, before, now); a failed send never undoes the merge |

  `slot-a-and-b.svg` is the brief's page-09 picture. `merge-landing.svg` is page 10's merge picture of its own; `watch-loop.svg` is not used here.
- D3. Every picture follows where-things-go.md § Pictures: opaque `#f4f1e6` card with `#c4c0b3` border, about 960 px wide, the listed palette, 1.5 px round strokes, dashed sage connectors, system sans and `ui-monospace` stacks, text kept as text, `<title>` and `<desc>` with `role="img"`, the mark group copied whole from `mode-and-route.svg` placed at bottom right by its translate only. No `href`, script, `@import`, `@font-face`, animation or em dash.
- D4. Each embed line sits directly under its `##` heading (before any `###`), in the form `![<alt>](../pictures/<file>.svg)`. Alt text says in plain words what the picture shows, matching the `<desc>`. No other guide text changes.
- D5. Labels use only approved words: Charting mode values, Build route values Direct and Lifecycle, "slot A (the builder)" and "slot B (the reviewer)", "charting", and the section's own command, file and phase names. Never "manual", "quick fix", "seat A", "leaf" where the page says task, or other shelf words the page does not use.
- D6. Old pictures (`phases.svg`, `two-seats.svg`, `watch-loop.svg` and the rest) are left untouched; deletion belongs to away-pictures.
- D7. Proof machinery: extend `tests/docs-pictures.test.ts` (existing runner `bun test`) with two real-tree tests for pages 09 and 10, a retired-phrase check inside `pictureProblems`, and one synthetic case for it. The mark sameness is checked across pages 04 to 10 together, so a new picture must equal charting-pictures-more's group, not only its siblings.
- D8. Self-check renders before handing to review: `rsvg-convert -b white -o <scratch>/<name>.png docs/pictures/<name>.svg` for each picture and `rsvg-convert -b '#0d1117'` for `slot-a-and-b.svg`; the implementer reads each PNG. Renders go to scratch, never committed.

## Waves

The run is not serial-solo.

- Wave 1
  - U1 page 09 pictures. Owns: the 8 page-09 SVGs in D2, `docs/guide/09-lifecycle.md` (embed lines only). Shared test resource: none. Prerequisite: none.
  - U2 page 10 pictures. Owns: the 6 page-10 SVGs in D2, `docs/guide/10-merging.md` (embed lines only). Shared test resource: none. Prerequisite: none.

Both units read `mode-and-route.svg` for the mark group and edit nothing outside their owned paths.

## Done-criteria and proof

### 1. Picture under every section, alt text, approved words

- Boundary: guide pages 09 and 10 on disk and the SVGs they embed. Before: 14 sections, no embeds. After: 14 embeds with alt text, 14 distinct pictures.
- Catches: a section with no picture, a blank alt, a silent share, a retired phrase in a label.
- Test: `every section of guide pages 09 and 10 has its own picture with alt text`; retired phrase via `pictureProblems` in the next test.
- Command: `akrogon run-check --name build-pictures-crit -- bun test tests/docs-pictures.test.ts`. Size: seconds. Rerun trigger: any change to pages 09 or 10 or their SVGs.
- Red at planning: `check build-pictures-red: 1 .../implementation/check-build-pictures-red-1795790753748-2277112.log`, failing with all 14 sections listed as missing a picture.
- Not mechanical: plain-words alt text and approved-word labels beyond the retired phrases are slot B's reading of the page and screenshots. Shares: none (D1), so slot B has no share to accept.
- Conditions checked:
  - C1 "has a picture under it" includes sections with `###` subsections (Slot A, Slot B). Decision D4 places the embed above the first `###`. The section split counts `##` only and the body includes its subsections, so the real-tree test covers them; placement above `###` is read by slot B. Traced, no extra case.
  - C2 "or shares one, each share named" can be broken by D1 if a worker reuses one SVG silently. Case: distinct picture count equals section count. Red by a temporary edit embedding `mode-and-route.svg` under all 14 sections: `check build-pictures-c2-share-red: 1 .../implementation/check-build-pictures-c2-share-red-1795790768039-2278375.log` (`Expected: 14 Received: 1`). Discarded.

### 2. Mark group identical, no forbidden markup, "created by" and Tamdoma title

- Boundary: every SVG embedded on pages 09 and 10, compared with every SVG on pages 04 to 08.
- Catches: a redrawn or nudged logo, a missing "created by", a second title, an outside link, a script, a web font, animation, an em dash.
- Test: `pictures on guide pages 09 and 10 hold the same mark group as pages 04 to 08 and no outside or moving markup` (also asserts `slot-a-and-b.svg` on 09 and `merge-landing.svg` on 10); em dash by the existing `README, docs markdown and docs pictures hold no em dashes` in `tests/docs-em-dash.test.ts`, which reads every SVG under `docs/pictures/`.
- Command: `akrogon run-check --name build-pictures-crit -- bun test tests/docs-pictures.test.ts tests/docs-em-dash.test.ts`. Size: seconds. Rerun trigger: any SVG change.
- Red at planning: same log as criterion 1, failing on the missing `slot-a-and-b.svg`.
- Report search: the report also pastes `grep -c` results per new SVG for `href`, `<script`, `@import`, `@font-face`, `animation`, `—`, `created by` and `<title>Tamdoma</title>`, as the criterion asks.
- Conditions checked:
  - C3 "identical to charting-pictures-more's", not only to each other. D7 compares pages 04 to 10 in one call. Red by a temporary `slot-a-and-b.svg` with `scale(0.06)` and an exact copy as `merge-landing.svg`, both embedded: `check build-pictures-c1-mark-red: 1 .../implementation/check-build-pictures-c1-mark-red-1795790767911-2278282.log` (`slot-a-and-b.svg: mark group differs from the others apart from its translate`). Discarded.
  - C4 retired phrase in a label (D5). Synthetic case `<text>Manual mode</text>`. Red by temporarily deleting the retired-phrase line from `pictureProblems`: `check build-pictures-c3-retired-red: 1 .../implementation/check-build-pictures-c3-retired-red-1795790768175-2278553.log`. Discarded.

### 3. Slot B renders and reads each picture

- A judgment criterion with no test. Slot B renders each of the 14 SVGs on white and `slot-a-and-b.svg` on `#0d1117` with `/usr/bin/rsvg-convert` or `/usr/bin/chromium`, reads the PNGs and answers "what does this picture show?" against the section in D2.
- Inputs slot B reads: the 14 SVGs in D2, pages 09 and 10, this table. Unproven until slot B's review: whether each picture reads and matches its section.

### 4. Destination checks pass

- Command: `akrogon verify` in the leaf worktree on HEAD (format, test, typecheck). Size: minutes. Rerun trigger: any commit.

## Docs affected

- `docs/guide/09-lifecycle.md`: 8 embed lines.
- `docs/guide/10-merging.md`: 6 embed lines.
- No agent doc, skill or reference page changes. where-things-go.md already states the picture rules.

## Kept output

- `check build-pictures-red: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/build-pictures/build-pictures/implementation/check-build-pictures-red-1795790753748-2277112.log`
- `check build-pictures-c1-mark-red: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/build-pictures/build-pictures/implementation/check-build-pictures-c1-mark-red-1795790767911-2278282.log`
- `check build-pictures-c2-share-red: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/build-pictures/build-pictures/implementation/check-build-pictures-c2-share-red-1795790768039-2278375.log`
- `check build-pictures-c3-retired-red: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/build-pictures/build-pictures/implementation/check-build-pictures-c3-retired-red-1795790768175-2278553.log`

No paid launches, grants or credentials. `akrogon status build-pictures` shows no `Missing:` line and the design names no credential.

## Implementation notes
