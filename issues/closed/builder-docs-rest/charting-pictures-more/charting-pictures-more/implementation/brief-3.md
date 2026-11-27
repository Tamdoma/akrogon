# Brief 3: U3 Page 05 pictures

## 1. Goal

Draw 5 new still SVG pictures (P4 to P8) in the charting-pictures style and embed each under its `##` section of `docs/guide/05-signposts.md`, so every section of that page has a picture that shows its content. Plan decisions D4 (one picture per section, no shares), D5 (series), D6 (embeds), D7 (style), with the mark group from D1 copied whole.

## 2. Numbered acceptance criteria

1. Each picture below exists, follows the drawing rules in section 4, and shows the content listed for it, matching the facts in its section of `docs/guide/05-signposts.md`.
2. Each picture is embedded once, under its own section, by the embed rules in section 4, with plain alt text equal to its `<desc>`.
3. Each picture holds the mark group copied byte for byte from `docs/pictures/mode-and-route.svg`, differing only in its outer translate (`translate(838 Y)`, Y = height minus 22).
4. Each picture renders on a white page and reads: a stranger seeing the PNG can say what the section explains. No text overlaps another text, a box edge, or the mark; nothing is clipped at the card edge.
5. Planned test `tests/docs-pictures.test.ts`: the case "every picture on guide pages 04 to 08 holds one identical mark group and no outside or moving markup" passes; in the case "every section ... has a picture" no line for `docs/guide/05-signposts.md` appears any more (other pages' lines may still appear: other units own them). `tests/docs-links.test.ts` and `tests/docs-em-dash.test.ts` pass.

Pictures:

- **P4** `docs/pictures/signposts-session.svg`, under `## What signposts are and when they are asked`: one session as a line in the c- tab: first message, signposts once, territory map, then charts 1, 2, 3; waits, compaction and handovers marked as inside the session; what signposts hold: ranked priorities, hard limits, chart order (and drops).
- **P5** `docs/pictures/signposts-round.svg`, under `## How the signposts round works`: quick consultant exchange, the round card (4 to 7 questions, 2 or 3 options, one recommended, no research block, "same" reuses earlier answers), the short account, then `forks/signposts.md` in the original chart with verbatim copies in the session's other charts.
- **P6** `docs/pictures/signposts-by-mode.svg`, under `## Who answers signposts in each Charting mode`: three columns No autopilot, Semi-autopilot, Full autopilot; rows: signposts (you, you once, charting agent), forks after (you, charting agent, charting agent), unanswered signpost (asked again, standing values fill it, charting agent answers).
- **P7** `docs/pictures/needs-sheet.svg`, under `## The needs sheet`: four row kinds (keys and files, accounts and permissions, approvals, human-only actions) with statuses `pending`, `supplied`, `late`; two rules: only you answer rows, and pending rows let charting continue and wait only at proofs and hand-off.
- **P8** `docs/pictures/signposts-example.svg`, under `## Worked example: `client-portal``: three charts (weekly client report export, CRM sync retry fix, agency logo header tweak), your reply `1a 2a 3a 4a`, the chart order, needs rows (row 1 key `pending`, row 2 approval `supplied`, row 3 human-only `pending`), then the territory map starting.

Page 05 has five `##` sections; every one gets its picture here.

## 3. Read-first list

- `docs/guide/05-signposts.md` (the whole page: the facts to draw).
- `docs/pictures/charting-session.svg` and `docs/pictures/mode-and-route.svg`: the reference drawings to copy the style from (mode-and-route for the mark group).
- `docs/reference/where-things-go.md` `## Pictures`.
- `tests/docs-pictures.test.ts` (read only).
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- New: `docs/pictures/signposts-session.svg`, `docs/pictures/signposts-round.svg`, `docs/pictures/signposts-by-mode.svg`, `docs/pictures/needs-sheet.svg`, `docs/pictures/signposts-example.svg`.
- `docs/guide/05-signposts.md`: add one embed line per picture, nothing else.

### Drawing rules (binding, from docs/reference/where-things-go.md `## Pictures` and plan D1 to D7)

- Start each new SVG from `docs/pictures/charting-session.svg`: copy its `<svg>` root (`xmlns`, `viewBox="0 0 960 H"`, `width="960" height="H"`, `role="img" aria-labelledby="t d"`), `<title id="t">`, `<desc id="d">`, the whole `<style>` block, the `<defs>` arrow marker and the card `<rect x="0.75" y="0.75" width="958.5" height="H-1.5" rx="14" fill="#f4f1e6" stroke="#c4c0b3" stroke-width="1.5"/>`. Height H as the content needs (about 300 to 480).
- Heading `<text class="h" x="40" y="48">`, one `soft` subtitle at (40, 72). Boxes use classes `box` (beige) and `key` (sage, for the thing that matters), connectors class `link` (dashed sage) with `arrow` for arrows, `mono` for commands, paths and record words, `soft` for small grey notes. Palette only: ink `#0f0f0f`, ink-soft `#6e6a5c`, beige `#f0ede0` `#e0dccf`, sage `#e7ede2` `#b7c8ae` `#90a985` `#7a9b76` `#5e7355`, card `#f4f1e6` border `#c4c0b3`. 1.5 px strokes, round caps and joins, flat fills.
- Read left to right, short labels. Leave about 10 px slack inside every box around its longest label (system fonts vary). Text stays `<text>`; never convert labels to paths.
- Mark group: after the drawing, copy the whole mark group from `docs/pictures/mode-and-route.svg` (the `<g transform="translate(838 418)"><title>Tamdoma</title>` group through its two closing `</g>` lines) byte for byte, and change only the translate to `translate(838 Y)` with `Y` = H minus 22. Nothing else in the group changes. Keep the drawing clear of the bottom-right corner (x > 700, y > H-40) so the mark never overlaps content.
- Words: use the guide's own words and the approved names only: Charting mode, No autopilot, Semi-autopilot, Full autopilot, Build route, Direct, Lifecycle, slot A (the builder), slot B (the reviewer), charting agent, consultants, signposts, needs sheet, fork, Fog, hand-off, task. Never: manual, quick fix, seat, door, leaf, attended. Every fact on a picture must match the guide page text (read the section before drawing it).
- Forbidden anywhere in the file, including comments, case-insensitive: `href` (so no `<a>`, `<use>`, `<image>`, `xlink`), `<script`, `@import`, `@font-face`, the word `animation`, `<animate`, and any em dash (U+2014, `&mdash;`, `&#8212;`). Use a plain hyphen or a comma instead of a dash. Escape `&` as `&amp;` and `<`/`>` inside text as `&lt;`/`&gt;` (for example `forks/&lt;fork-slug&gt;.md`).
- `<desc id="d">` holds the same plain sentence as the embed's alt text: what the picture shows, in plain words, no markdown.

### Embed rules (plan D6)

- Each embed is one line `![<alt>](../pictures/<file>.svg)` with a blank line before and after, placed under its section after the section's first paragraph (or after its first code block when that paragraph introduces the code block). Never directly on the line after the `##` heading, never inside a code fence or table.
- Alt text: one or two plain sentences saying what the picture shows, no `]` or `)` characters, no em dash.
- Change no other guide text: no wording, no headings, no links. Only the embed lines are added.

Owned paths: the files above. Must land first: U1 (mark group), already in your worktree's base commit. Shared test resource: none. Worktree created at commit: 96941cd9.

## 5. Do-not, reasons and exceptions

- Do not change guide text other than adding the embed lines, and do not touch other guide pages or existing pictures: other units and another leaf own them. Exception: none.
- Do not edit any test file (`tests/*.test.ts`): tests are locked after planning. A planned test that is wrong, or red for your files once they are right, is a mismatch you return to A with the output.
- Do not use any forbidden markup or em dash listed in section 4: the test and the dash guard fail on them.
- Return a mismatch with evidence to A instead of changing scope or an interface; the exception is a revised brief from A.
- Never run any `git stash` subcommand: every worktree of the repo shares one stash and a pop can lift a sibling's edit. To set work aside, make a WIP commit; before returning, `git reset --soft 96941cd9` and make the unit's one returned commit, so A's cherry-pick of that one commit carries all the work. To check base behaviour, use a second worktree of the base.
- Run commands unattended: no command that waits on a human (prompt, editor, pager); no poll or sleep loop, and a slow command runs once in the foreground with the tool timeout above its expected time; a harness denial is re-expressed inside the same grant (a simpler single command, your own read or edit tool), never around a secret, `.env` or grant rule, and if nothing works, return a mismatch with the denial text verbatim; name no env file path on a command line, and a needed undeclared value is a mismatch.

Reasons restated: other units and a parallel leaf own the other text; tests belong to A; the checks read every SVG; the stash is shared; nobody answers a prompt. The only exception is a revised brief from A.

## 6. Ordered steps

1. Install deps in the worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
2. Read `docs/guide/05-signposts.md` and the two reference SVGs.
3. For each picture in order: draw it (criteria 1, 3), render it with `rsvg-convert -b white -o $TMPDIR/<name>.png docs/pictures/<name>.svg`, open the PNG with your Read tool and fix overlaps, clipping, crowding or a fact that does not match the page (criterion 4). Inspect the saved image itself: a render that succeeds can still show a wrong or broken picture.
4. Add the embed lines (criterion 2).
5. Run the command in section 7 (criterion 5).
6. Commit once (see section 5).

Advisory size: about 6 files and under 30 turns.

## 7. Commands

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/charting-pictures-more-u3`.

- `akrogon run-check --name u3-pictures -- bun test tests/docs-pictures.test.ts tests/docs-links.test.ts tests/docs-em-dash.test.ts`

## 8. Done-when, evidence and report

Done when criteria 1 to 5 hold. Report: each section with its picture file and alt text, each render PNG path, the cited `check u3-pictures: <exit> <path>` line and which section lines it still lists. Keep command output only through `akrogon run-check`; read a log back with `akrogon log <path>`. No test file changes, so no `Test-Change:` trailer.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
