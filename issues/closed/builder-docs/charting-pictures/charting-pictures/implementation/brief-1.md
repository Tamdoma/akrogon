# Brief 1: docs/pictures/mode-and-route.svg

## 1. Goal

Draw `docs/pictures/mode-and-route.svg`: Charting mode and Build route as two separate choices, showing the three modes, the two routes, and that Direct is available only with No autopilot. Plan decisions D3, D4, D5, D6, D8.

## 2. Numbered acceptance criteria

1. The file exists, parses, and renders with `rsvg-convert`.
2. It shows two columns. Left: heading "Charting mode", mono line "who answers the questions", three stacked boxes "No autopilot" (small soft "default"), "Semi-autopilot", "Full autopilot". Right: heading "Build route", mono line "who builds the work", two boxes "Direct" and "Lifecycle".
3. Connectors: No autopilot to Direct, and each of the three modes to Lifecycle. The No autopilot to Direct connector is the only `.line` (solid ink); the others are `.link` (dashed sage). A soft note under Direct reads "only with No autopilot". Optional soft notes: under Direct "the charting agent builds, consultant B reviews"; under Lifecycle "slot A (the builder) and slot B (the reviewer)". An optional top title such as "Two separate choices".
4. It follows the shared frame and rules in `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/skeleton.txt` exactly (card, palette, strokes, fonts, attribution, forbidden tokens, words).
5. Rendered on a white page and on a #0d1117 page, a reader can tell what it shows: nothing overlaps, no text runs outside its box or the card, the attribution is legible.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/skeleton.txt` (shared frame, binding).
- `docs/guide/06-charting-mode.md` and `docs/guide/07-build-route.md` (what the picture explains; words).
- Line-art style to copy: `/home/ivan/Work/infra/tamdoma/website/website/src/components/Station.astro` and `SystemIcon.astro` (1.5 px round caps, dashed sage connectors, mono numbered labels).
- `/home/ivan/.akrogon/releases/4aff0f6881e486a15fd98db8d595644469cd4901/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- New file `docs/pictures/mode-and-route.svg`, about 960x420 to 960x460.
- Owned path: only that file. Shared test resource: none. Must land first: nothing. Consumed output: none.
- Worktree: `/home/ivan/.akrogon/worktrees/akrogon/charting-pictures-u1`, created at commit 4aff0f6881e486a15fd98db8d595644469cd4901.
- Unit U4 later writes this alt text for the embed, so the picture must show what it says: "Charting mode (No autopilot, Semi-autopilot, Full autopilot) and Build route (Direct, Lifecycle) are two separate choices. Direct is available only with No autopilot. Every mode can use Lifecycle."

## 5. Do-not, reasons and exceptions

- Edit only the path this unit owns. Other units edit the other files in parallel, and a stray edit conflicts at cherry-pick. Exception: none; a needed change elsewhere is a mismatch returned to A.
- Do not change the style tokens, the attribution recipe or the words list. They are plan decisions shared by both pictures. Exception: a revised brief from A.
- Write and edit no test. Tests belong to A. A wrong or red planned check is a mismatch with evidence.
- Do not read or wait for the other worker worktrees (`charting-pictures-u*`). Each unit is independent.
- Return a mismatch with evidence to A instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- Never run any `git stash` subcommand: every worktree of this repo shares one stash, and a pop can lift a sibling worker's edit. To set work aside, commit it as a WIP commit; before returning, `git reset --soft 4aff0f6881e486a15fd98db8d595644469cd4901` and make the unit's one returned commit, so A cherry-picks one commit carrying all the work.
- Run commands unattended: no command that waits on a human (prompt, confirmation, editor, pager); no poll or sleep loop; a slow command runs once in the foreground with the tool timeout above its expected time. Re-express a harness denial inside the same grant (a simpler single command, your own read or edit tool), never around a secret, `.env` or grant rule; when no permitted form answers, return a mismatch with the denial text verbatim. Name no env file path on a command line; an undeclared value you need is a mismatch. Reason: no human answers a seat's command, and this brief is the only place the rule reaches you. No exception.
- Stop no process by command-line pattern (`pkill -f`, `killall`); stop a run with `akrogon stop-run <run-id>`.
- No `.env` file is opened, printed or written with any tool.

Reasons and exceptions restated: own path only (parallel units), shared decisions fixed (pictures must match), no tests (A owns them), no stash (shared stack; WIP commit instead), unattended commands (nobody answers). The only exception to any of these is a revised brief from A.

## 6. Ordered steps

1. Read section 3. Extract the logotype paths with the awk command in the skeleton.
2. Write the SVG (criteria 2 to 4).
3. Run the targeted check (section 7); fix until `ok`.
4. Render light and dark PNGs into `$TMPDIR` and look at them with your image-reading tool (criterion 5). Fix overlaps or overflow, rerun the check.
5. Commit once: `docs: add mode-and-route picture`. No co-author line.

Advisory size: 1 file, under 12 turns.

## 7. Commands

Targeted check (run from the worktree root):

```sh
akrogon run-check --name u1-svg -- sh -c 'f=docs/pictures/mode-and-route.svg; test -f "$f" || exit 2; if grep -nE "href=|<script|@import|@font-face|animation" "$f"; then exit 1; fi; for s in "created by" "<title>Tamdoma</title>" "#f4f1e6" "#c4c0b3" "#0f0f0f" "ui-sans-serif" "ui-monospace" "1.5" "round" "<text" "Charting mode" "Build route" "No autopilot" "Semi-autopilot" "Full autopilot" "Direct" "Lifecycle"; do grep -qiF "$s" "$f" || { echo "missing $s"; exit 1; }; done; if grep -niE "manual|quick fix|attended|autopilot signposts" "$f"; then exit 1; fi; rsvg-convert "$f" > /dev/null && echo ok'
```

Renders: `rsvg-convert -b '#ffffff' -o "$TMPDIR/u1-light.png" docs/pictures/mode-and-route.svg` and the same with `-b '#0d1117'` to `u1-dark.png`. (`-o /dev/null` is refused by rsvg-convert.)

## 8. Done-when, evidence and report

Done when the criteria in section 2 hold and the targeted check prints `ok` with exit 0. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` line it prints; `akrogon log <path>` reads a cited log. Paste at most a short excerpt. Return the one commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
