# Brief 2: page 12 pictures (unit U2)

## 1. Goal

Give `docs/guide/12-when-work-stops.md` seven new pictures in the house style: one under each of the six `##` sections and one under the `### Recover a failed leaf in four steps` subsection. Plan decisions D2, D3, D4, D6.

## 2. Numbered acceptance criteria

1. Page 12 embeds, each with non-blank plain alt text, directly under its heading:
   - `## Failed work`: `failed-work.svg`. `scheduled-email` in `implement` runs its one approved test send, Postmark rejects the From address (not a confirmed sender), the seat writes the blocker and runs `akrogon phase scheduled-email failed`, Akrogon records `failure` in `state.yaml`, sends an attention notice and renames the tab `scheduled-email failed`. Kept: plan, reviews, report, branch commits, worktree. Side box: a missing declared key waits with a `Missing:` line in `akrogon status`; it does not fail the leaf.
   - `### Recover a failed leaf in four steps`: `recover-failed.svg`. 1 `akrogon status scheduled-email` (read the reason), 2 fix the cause (confirm the sender in Postmark), 3 `akrogon phase scheduled-email implement` with no `--slot`, 4 `akrogon next scheduled-email`.
   - `## Park an issue`, `## Pause a repository`, `## Stop a leaf or a check run`: `hold-park.svg`, `hold-pause.svg`, `hold-stop.svg`, one series from one base drawing (like `docs/pictures/mode-no-autopilot.svg`, `mode-semi-autopilot.svg`, `mode-full-autopilot.svg`): the same row of four controls (`park`, `pause`, `stop`, `stop-run`) with one line each on what it touches; the section's control drawn with `.key` and its detail panel below. Park: `issues/open/` to `issues/parked/`, refused when a leaf started or another open leaf needs it, `akrogon unpark` brings it back. Pause: `~/.akrogon/paused.yaml`, automatic passes and watch checks skip the repo, a typed command still runs, `akrogon unpause` runs one pass. Stop: `~/.akrogon/stopped.yaml`, seat terminals, slice and runs ended, worktree kept, `akrogon start` resumes; `akrogon stop-run <run-id>` stops one run; `akrogon leftovers` lists what cleanup kept.
   - `## Common command refusals`: `refusals.svg`. A typed command refuses and says why, the leaf stays in its phase (not `failed`), you fix the condition and rerun. Four examples from the page: phase move refused, dependency not merged, sync refused, push held (`held <slug>`, keeps its queue place).
   - `## Where to go next`: `journey.svg`. The path `csv-export` and `scheduled-email` took: charting and hand-off (pages 04 to 08), lifecycle (09), merging (10), the night (11), one stop (12), ending at the shelf (Other tools, Reference).
2. Each of the seven SVGs follows the picture style below and holds the mark group identical to `mode-and-route.svg`'s apart from its translate.
3. Planned tests (A's, run by you, never edited):
   - `tests/docs-pictures.test.ts` "every section of guide pages 11 and 12 has a picture with alt text": none of the six page 12 sections may appear in its failure list (page 11 sections belong to another unit and stay listed).
   - `tests/docs-pictures.test.ts` "every SVG in docs/pictures holds ...": none of your seven files may appear in its failure list (old pictures stay listed until another unit deletes them).
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

- `docs/guide/12-when-work-stops.md` (the page; draw from its content)
- `docs/pictures/charting-session.svg` (pattern), `docs/pictures/mode-and-route.svg` (mark group source), `docs/pictures/mode-no-autopilot.svg` (series pattern)
- `tests/docs-pictures.test.ts`
- `docs/reference/words.md`
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- Owned paths: `docs/guide/12-when-work-stops.md` (seven embed lines only), new `docs/pictures/failed-work.svg`, `recover-failed.svg`, `hold-park.svg`, `hold-pause.svg`, `hold-stop.svg`, `refusals.svg`, `journey.svg`.
- Prerequisites: none. Shared test resource: none.
- Worktree: `/home/ivan/.akrogon/worktrees/akrogon/away-pictures-u2`, created at commit e7af8fe5c6db7340790b3abe75b1b8e426176ad0.

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
2. Draw `failed-work.svg` and `recover-failed.svg`, render, read, fix.
3. Draw the hold base once, then the three variants from it, rendering and reading each.
4. Draw `refusals.svg` and `journey.svg`, render, read, fix.
5. Add the seven embed lines to page 12.
6. Run section 7 commands. Commit once.

Advisory size: 8 files, under 35 turns.

## 7. Commands

- `akrogon run-check --name u2-pictures -- bun test tests/docs-pictures.test.ts` (expected red only for page 11 sections and old pictures not yours)
- `akrogon run-check --name u2-dash -- bun test tests/docs-em-dash.test.ts -t "no em dashes"` (green)
- Run `bun install --frozen-lockfile --backend=copyfile` once first if `node_modules` is missing.

## 8. Done-when, evidence and report

Done when every acceptance criterion above holds, each section 7 command shows the result stated, and every render was read. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line. Return one commit (message style `docs(pictures): ...`, no co-author line) with its commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
