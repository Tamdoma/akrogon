# Brief 1: pictures for guide page 09

## 1. Goal

Draw 8 new still SVG pictures, one for each `##` section of `docs/guide/09-lifecycle.md`, and embed each directly under its section heading with plain alt text. Plan decisions D1 to D6 and D8 (plan: `/home/ivan/Work/infra/akrogon/issues/open/builder-docs-rest/build-pictures/build-pictures/plan.md`).

## 2. Numbered acceptance criteria

1. Each of the 8 `##` sections of page 09 has exactly one embed line right under its heading (before any `###`), form `![<alt>](../pictures/<file>.svg)`, each pointing at a different new file from the table in section 4. No two sections share a file. No picture above the first `##`.
2. Alt text says in plain words what the picture shows and matches the SVG `<desc>`. Example of the style: page 07's line `![Charting mode (No autopilot, Semi-autopilot, Full autopilot) and Build route (Direct, Lifecycle) are two separate choices. ...](../pictures/mode-and-route.svg)`.
3. Each picture holds the Tamdoma mark group copied byte for byte from `docs/pictures/mode-and-route.svg` (from the line `<g transform="translate(838 418)"><title>Tamdoma</title>` through its two closing `</g>` lines), changing only the `translate(...)` numbers to place it at the bottom right of that picture's card (for a 960 x H card, `translate(838 H-22)`).
4. No picture contains `href`, `<script`, `@import`, `@font-face`, `animation`, `<animate`, an em dash (U+2014 or `&mdash;`), or the phrases "manual mode", "manual route", "quick fix", "autopilot signposts". Each contains "created by" and `<title>Tamdoma</title>` exactly once (inside the mark group).
5. Each picture shows its section's content (section 4 table) so a reader who sees only the rendered image can say what the section is about. Labels use the guide's own words from that section.
6. Planned tests (written by A, already committed): in `tests/docs-pictures.test.ts`, `every section of guide pages 09 and 10 has its own picture with alt text` and `pictures on guide pages 09 and 10 hold the same mark group as pages 04 to 08 and no outside or moving markup`. These two stay red until unit 2 (page 10) lands too. Your page-09 part is green when neither failure output names a page-09 section or a page-09 picture (see section 7). You never edit tests.

## 3. Read-first list

- `docs/reference/where-things-go.md` § Pictures (lines 24 to 36): card, palette, strokes, fonts, mark, still, layout rules. Binding.
- `docs/pictures/mode-and-route.svg`: pattern to copy (style block, card rect, box and connector classes, mark group).
- `docs/pictures/lifecycle-route.svg`, `docs/pictures/charting-session.svg`, `docs/pictures/modes-at-a-glance.svg` and `mode-no-autopilot.svg`: flows, rows and a series drawn from one base drawing.
- `docs/guide/09-lifecycle.md`: the content for each picture.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/build-pictures-u1`, created at commit `b25fdcf950acedba9046c13c6d8467744f91c4cd`. Prerequisites: none. Shared test resource: none. Owned paths: the 8 SVGs below and `docs/guide/09-lifecycle.md` (embed lines only).

| Section | File | Shows |
| --- | --- | --- |
| Starting handed-off work from `t-client-portal` | `docs/pictures/next-pass.svg` | the `t-client-portal` tab, the four `akrogon next` forms (every ready leaf, one slug, one issue or epic, `--all`), then one pass: check picked leaves, start or prompt seats, merge pass, clean up, exit (it does not stay running) |
| Why a ready task may wait | `docs/pictures/why-a-task-waits.svg` | a picked leaf and the six reasons it waits: `blocked-by` (`waiting: scheduled-email on csv-export`), missing input (`POSTMARK_API_KEY`), twin owner folder, `max_active`, paused repo, stopped or failed leaf |
| Start order and capacity refill | `docs/pictures/start-order.svg` | rule 1 merged leaves first, rule 2 most unmerged dependents (csv-export ahead of a leaf with none), then refill of capacity waiters longest-waiting first |
| What starts agent sessions and keeps them moving | `docs/pictures/leaf-start.svg` | the four start steps (worktree, `.env` keys, `setup`, leaf tab with slot A and later slot B), then `akrogon-listener.service` waking the next pass, with progress kept in files (`state.yaml`, `plan.md`, report, reviews) |
| Lifecycle phases at a glance | `docs/pictures/lifecycle-phases.svg` | `plan.synthesis` to `implement` to `check.review` to `merge` to `merged`, the `check.repair` and `check.fix` loop, `failed` reachable from any active phase |
| Slot A (the builder) | `docs/pictures/slot-a-and-b.svg` | slot A plans (`plan.md`, red-first tests), builds, runs `akrogon verify`, writes `implementation/report.md` and passes the work to slot B, which reviews and repairs |
| Slot B (the reviewer) | `docs/pictures/slot-b-review.svg` | drawn from the same base as `slot-a-and-b.svg`, slot B's side: blind review by both seats, verdicts `ready`/`nits`/`fix`, B repairs most Fixes, `Handed to A` goes to `check.fix`, re-checks by slot B only |
| Watching progress from `t-client-portal` | `docs/pictures/watching-progress.svg` | what `akrogon status`, `akrogon status csv-export` and `akrogon log <path>` each show, as labelled boxes, not a screenshot of terminal output |

Approved words: "slot A (the builder)", "slot B (the reviewer)", Charting mode values (No autopilot, Semi-autopilot, Full autopilot), Build route values (Direct, Lifecycle), "charting", and the section's own command, file and phase names. Never "manual", "seat A", "seat B", "quick fix", or shelf words the page does not use.

## 5. Do-not, reasons and exceptions

- Do not change any guide text other than adding the 8 embed lines. The leaf owns only pictures and embeds. Exception: none.
- Do not touch page 10, other pictures, `watch-loop.svg`, `phases.svg` or `two-seats.svg`, or any test. Other units and leaves own them. Exception: none.
- Do not redraw or reformat the mark group. The test compares it byte for byte. Exception: none.
- No `href` of any kind (no links, no `xlink:href`, no `<use>` referencing ids), no images, no web fonts. Exception: none.
- A conflict with the plan (a section that cannot be drawn as described, a planned test you believe is wrong) is returned to A as a mismatch with evidence and the smallest brief correction, not solved by changing scope. Exception: a revised brief from A.
- Never run any `git stash` subcommand: every worktree shares one stash. Set work aside with a WIP commit; before returning, `git reset --soft b25fdcf950acedba9046c13c6d8467744f91c4cd` and make one commit for the unit so A cherry-picks one commit.
- Run every command unattended: no command that waits on a human, no poll or sleep loop, a slow command runs once in the foreground with a timeout above its run time. A harness denial is re-expressed inside the same grant (a simpler single command, your own read or edit tool), never around a secret, `.env` or grant rule; when nothing works, return a mismatch with the denial text verbatim. Name no env file path on a command line. No human answers a worker's command. No exception.

Reasons restated: scope stays with this leaf's pictures, the mark test is exact, outside references are forbidden by the docs rules, the stash is shared, and no one answers prompts. The only exception is a revised brief from A.

## 6. Ordered steps

1. Run `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'` in the worktree.
2. Draw the 8 SVGs (criteria 3, 4, 5), about 960 px wide, opaque `#f4f1e6` card, `<title>` and `<desc>` with `role="img"`, copying the style block of `mode-and-route.svg`. Draw `slot-a-and-b.svg` first, then `slot-b-review.svg` from it.
3. Render each on white and read the PNG: `rsvg-convert -b white -o "$TMPDIR/<name>.png" docs/pictures/<name>.svg`. Render `slot-a-and-b.svg` also with `-b '#0d1117'`. Fix overlap, clipping, unreadable text or a picture that does not show its section. Do not commit PNGs.
4. Add the 8 embed lines to page 09 (criteria 1, 2).
5. Run the commands in section 7 and confirm criterion 6.
6. Commit once (see section 5).

Advisory size: about 9 files and under 40 turns.

## 7. Commands

- `akrogon run-check --name u1-pictures -- bun test tests/docs-pictures.test.ts tests/docs-em-dash.test.ts`: expect the pages 04 to 08 tests and both em-dash tests green; the two pages 09 and 10 tests stay red only for page-10 sections and the missing `docs/pictures/merge-landing.svg`. Because the second test stops at its first failing expect, also run the mark check directly over your pictures:
- `akrogon run-check --name u1-search -- sh -c 'for f in docs/pictures/next-pass.svg docs/pictures/why-a-task-waits.svg docs/pictures/start-order.svg docs/pictures/leaf-start.svg docs/pictures/lifecycle-phases.svg docs/pictures/slot-a-and-b.svg docs/pictures/slot-b-review.svg docs/pictures/watching-progress.svg; do printf "%s " "$f"; for t in href "<script" "@import" "@font-face" animation "—" "created by" "<title>Tamdoma</title>"; do printf "%s=%s " "$t" "$(grep -c -- "$t" "$f")"; done; echo; done; for f in docs/pictures/mode-and-route.svg docs/pictures/next-pass.svg docs/pictures/why-a-task-waits.svg docs/pictures/start-order.svg docs/pictures/leaf-start.svg docs/pictures/lifecycle-phases.svg docs/pictures/slot-a-and-b.svg docs/pictures/slot-b-review.svg docs/pictures/watching-progress.svg; do sed -n "/<title>Tamdoma<\/title>/,/^  <\/g>$/p" "$f" | sed "1s/translate([^)]*)//" | md5sum; done | sort | uniq -c'`: expect zeros for the first six tokens, 1 for the last two, and one md5 line with count 9.

## 8. Done-when, evidence and report

Done when criteria 1 to 5 hold, the commands above show the expected result, and one commit holds the 8 SVGs and the page-09 embed lines. Keep output only through `akrogon run-check` and cite each `check <label>: <exit> <path>` line. Return the commit ID and:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
