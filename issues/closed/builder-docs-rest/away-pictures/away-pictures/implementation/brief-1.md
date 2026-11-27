# Brief 1: page 11 pictures (unit U1)

## 1. Goal

Give `docs/guide/11-while-you-are-away.md` five pictures in the house style: `watch-loop.svg` redrawn in place as the overnight watcher (page opener) and one new picture under each of the four `##` sections. Plan decisions D1, D3, D4.

## 2. Numbered acceptance criteria

1. Page 11 embeds, with non-blank plain alt text:
   - above the first `##` (after the two opening paragraphs): `docs/pictures/watch-loop.svg`, redrawn as the overnight watcher. One night on a time line: you start the watch in `w-client-portal`, `cp-watch` sends a tick every 20 minutes, each tick runs one check over `csv-export` and `scheduled-email`, `scheduled-email` starts once `csv-export` merges, a stop-list item waits with a notice, and you read the notices in the morning.
   - `## Starting the watch in w-client-portal`: `watch-start.svg`. You send `watch-issues ~/code/client-portal` in `w-client-portal`; it launches one `cp-watch` timer (one per repo, a live one is reported, never doubled), runs one check now, then a tick every 20 minutes. Side note: a busy watcher keeps only the latest tick.
   - `## What each check does`: `watch-check.svg`. The six steps in order: 1 observe once (`observe.ts`), 2 start unblocked leaves (`akrogon next`), 3 retry failures (up to two unproductive cycles), 4 check busy seats for loops (one steer per seat; codex is notify-only), 5 open a consult case (`cp-watch-consult`), 6 notice and a short summary. A paused read stops after step 1.
   - `## What keeps moving vs what waits for you`: `watch-moves-or-waits.svg`. Three columns: keeps moving, waits for you (the stop list), never does. Use the page's own items, shortened.
   - `## Stop the watch`: `watch-stop.svg`. `watch-issues stop` ends `cp-watch` and `cp-watch-consult`. Automatic stops (agent exits, terminal reused, `/clear` on claude and agy), `/new` on codex and pi may leave it running until the first tick stops it, compaction keeps the watch alive.
2. No picture file and no alt text on page 11 contains `cron`, `expir` (any case) or `akrogon status`. `tests/watch-timer.test.ts` reads page 11 whole and `watch-loop.svg` whole for these words.
3. Each of the five SVGs follows the picture style below and holds the mark group identical to `mode-and-route.svg`'s apart from its translate.
4. Planned tests (A's, run by you, never edited):
   - `tests/docs-pictures.test.ts` "every section of guide pages 11 and 12 has a picture with alt text": your four page 11 sections must no longer appear in its failure list (page 12 sections belong to another unit and stay listed).
   - `tests/docs-pictures.test.ts` "every SVG in docs/pictures holds ...": none of your five files may appear in its failure list (other old pictures stay listed until another unit deletes them).
   - `tests/watch-timer.test.ts` "docs describe the timer watch ..." and "the watch check omits the akrogon status command in ..." stay green.
   - `tests/docs-em-dash.test.ts` "README, docs markdown and docs pictures hold no em dashes" stays green.

### Picture style (binding, from docs/reference/where-things-go.md `## Pictures` and plan D4)

- Start each new SVG from a copy of `docs/pictures/charting-session.svg`: keep its root `<svg ... viewBox="0 0 960 H" width="960" height="H" role="img" aria-labelledby="t d">`, its `<title id="t">` and `<desc id="d">` (write your own), its whole `<style>` block (`.h`, `.soft`, `.mono`, `.box`, `.key`, `.link`, `.line`, `.frame`, `.arrow`), its `<defs>` arrow marker, and its opaque card `<rect x="0.75" y="0.75" width="958.5" height="H-1.5" rx="14" fill="#f4f1e6" stroke="#c4c0b3" stroke-width="1.5"/>`. Height H is yours (about 380 to 520).
- Heading `class="h"` at x=40 y=48, one-line subtitle `class="soft"` at y=72, like the reference.
- Palette only: ink `#0f0f0f`, ink-soft `#6e6a5c`, beige `#f0ede0` and `#e0dccf`, sage `#e7ede2`, `#b7c8ae`, `#90a985`, `#7a9b76`, `#5e7355`. 1.5 px strokes, round caps and joins, flat fills, dashed sage connectors (`.link`) with the arrow marker. Use `.key` (sage) to highlight the one thing the section is about.
- Labels are real `<text>`, short, in the words the guide section itself uses. Commands and names in `.mono`. No screenshots of command output.
- Mark group: copy the whole `<g transform="translate(838 418)"><title>Tamdoma</title> ... </g>` group (from that line through its closing `</g>` after the inner `</g>`) byte for byte from `docs/pictures/mode-and-route.svg` (lines 45 to the end before `</svg>`). Change only the two numbers in its first `translate(...)`. Put it bottom right: x=838, y = H - 22 (charting-session uses 838 438 for H=460). Nothing may overlap it.
- Forbidden anywhere in the file: `href` (also `xlink:href`), `<script`, `@import`, `@font-face`, `animation`, `<animate`, and the em dash character (U+2014, also `&#8212;` and `&mdash;`). Use a plain hyphen, comma or "to" instead of a dash.
- Never use the retired phrases "manual mode", "manual route", "quick fix", "autopilot signposts".
- Alt text in the page embed is the same plain sentence as the SVG's `<desc>`: what the picture shows, in plain words. Embed form: a blank line, `![<desc sentence>](../pictures/<name>.svg)`, a blank line, placed directly under the heading line (or under the page's first paragraph block for an opener).
- Read every render: after each picture, run `rsvg-convert -b white -w 960 -o "$TMPDIR/<name>.png" docs/pictures/<name>.svg` and open the PNG with your Read tool. Check text does not overflow boxes, nothing overlaps, the mark sits bottom right on its own, arrows point the right way, and the picture shows the section's content at a glance. Fix and re-render until it reads. A successful render exit code proves nothing; look at the image.

## 3. Read-first list

- `docs/guide/11-while-you-are-away.md` (the page; draw from its content)
- `docs/pictures/charting-session.svg` (pattern to copy), `docs/pictures/mode-and-route.svg` (mark group source)
- `docs/pictures/watch-loop.svg` (old drawing, replaced whole)
- `tests/watch-timer.test.ts` lines 1366-1420, `tests/docs-pictures.test.ts`
- `docs/reference/words.md`
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- Owned paths: `docs/guide/11-while-you-are-away.md` (five embed lines only), `docs/pictures/watch-loop.svg` (rewrite), new `docs/pictures/watch-start.svg`, `watch-check.svg`, `watch-moves-or-waits.svg`, `watch-stop.svg`.
- Prerequisites: none. Shared test resource: none.
- Worktree: `/home/ivan/.akrogon/worktrees/akrogon/away-pictures-u1`, created at commit e7af8fe5c6db7340790b3abe75b1b8e426176ad0.

## 5. Do-not, reasons and exceptions

- Do not edit any guide text other than the embed lines you add, and no page or picture outside your owned paths. Reason: other leaves (setup-pictures, build-pictures) own the other pages and pictures, and the design excludes guide text changes. Exception: none; a needed change elsewhere is a mismatch returned to A.
- Do not write or edit any test file (`tests/**`). Reason: tests are locked after planning. A planned test that stays red once your work is right is a mismatch returned to A with its output.
- Do not run `akrogon verify` or the whole test suite. Reason: A runs the final proof. Run only the commands in section 7.
- Return a mismatch with evidence to A instead of changing scope or an interface. Exception: a revised brief from A.
- Never run any `git stash` subcommand: every worktree of this repo shares one stash, and a pop can lift a sibling worker's edit. To set work aside, make a WIP commit; before returning, `git reset --soft <creation commit>` and make the unit's one returned commit, so A's cherry-pick of that one commit carries all the work.
- Run commands unattended: no command that waits on a human, no poll or sleep loop, a slow command runs once in the foreground with the tool timeout above its run time. A harness denial is re-expressed inside the same grant (a simpler single command, the configured runner, your own read or edit tool), never around a secret, `.env` or grant rule; when no permitted formulation works, return a mismatch with the denial text verbatim. Name no env file path on a command line. Reason: no human answers a seat's command, and you read only this brief. No exception.
- Stop no process by command-line pattern (`pkill -f`, `killall`, `pgrep | xargs kill`). Reason: it hits other leaves' runs. Use `akrogon stop-run <run-id>`.

Restated: stay inside your owned paths and embed lines (mismatch otherwise), no test edits (mismatch), no full suite, no stash (WIP commit plus soft reset), unattended commands only, no pattern kills.

## 6. Ordered steps

1. Read the page and the reference drawings.
2. Draw `watch-loop.svg`, render, read, fix (criteria 1 to 3).
3. Draw the four section pictures one by one, rendering and reading each (criteria 1, 3).
4. Add the five embed lines to page 11 (criteria 1, 2).
5. Run section 7 commands (criterion 4). Commit once.

Advisory size: 6 files, under 30 turns.

## 7. Commands

- `akrogon run-check --name u1-pictures -- bun test tests/docs-pictures.test.ts` (expected red only for page 12 sections and old pictures not yours)
- `akrogon run-check --name u1-watch -- bun test tests/watch-timer.test.ts -t "cron wording|akrogon status command"` (green)
- `akrogon run-check --name u1-dash -- bun test tests/docs-em-dash.test.ts -t "no em dashes"` (green)
- Run `bun install --frozen-lockfile --backend=copyfile` once first if `node_modules` is missing.

## 8. Done-when, evidence and report

Done when every acceptance criterion above holds, each section 7 command shows the result stated, and every render was read. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line. Return one commit (message style `docs(pictures): ...`, no co-author line) with its commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
