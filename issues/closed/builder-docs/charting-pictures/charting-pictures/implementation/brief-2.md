# Brief 2: docs/pictures/charting-session.svg

## 1. Goal

Draw `docs/pictures/charting-session.svg`: one charting session in the c- tab, showing the signposts, the map with consultants, the decisions, and the hand-off. Plan decisions D3, D4, D5, D7, D8.

## 2. Numbered acceptance criteria

1. The file exists, parses, and renders with `rsvg-convert`.
2. An inner frame (`.box` style, lighter is fine) stands for the c- tab, with a mono tab label `c-client-portal` at its top-left.
3. Inside, six stations left to right, numbered in mono 1 to 6 to match the guide's "One session, step by step" headings: 1 Intake, 2 Signposts (soft "and the needs sheet"), 3 Territory map, 4 Decisions (soft "one fork per round"), 5 Charting mode and Build route, 6 Hand-off review. Stations 2, 3, 4 and 6 use `.key`; 1 and 5 use `.box`. Stations join by `.link` connectors with arrowheads.
4. Station 3 has two small nodes "B" and "C" captioned "consultants", joined to the map by `.link` connectors, with mono caption "blind notes, merge, rebuttal". Station 4 shows two or three small stacked fork cards. Station 6 splits into two short outcomes: "Lifecycle: contracts in issues/open/" and "Direct: one small change".
5. It follows the shared frame and rules in `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/skeleton.txt` exactly (card, palette, strokes, fonts, attribution, forbidden tokens, words).
6. Rendered on a white page and on a #0d1117 page, a reader can tell what it shows: nothing overlaps, no text runs outside its box or the card, the attribution is legible. Six stations in 960 px is tight: use two lines per label or a taller station where needed rather than tiny type (no text under 11 px).

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/skeleton.txt` (shared frame, binding).
- `docs/guide/04-a-charting-session.md` (the six steps and words), skim `05-signposts.md` and `08-hand-off.md`.
- Line-art style to copy: `/home/ivan/Work/infra/tamdoma/website/website/src/components/Station.astro` and `SystemIcon.astro` (1.5 px round caps, dashed sage connectors, mono numbered labels).
- `/home/ivan/.akrogon/releases/4aff0f6881e486a15fd98db8d595644469cd4901/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- New file `docs/pictures/charting-session.svg`, about 960x440 to 960x500.
- Owned path: only that file. Shared test resource: none. Must land first: nothing. Consumed output: none.
- Worktree: `/home/ivan/.akrogon/worktrees/akrogon/charting-pictures-u2`, created at commit 4aff0f6881e486a15fd98db8d595644469cd4901.
- Unit U4 later writes this alt text for the embed, so the picture must show what it says: "One charting session in the c- tab: intake, signposts, a territory map drawn with consultants, one decision per round, Charting mode and Build route, then the hand-off."

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
2. Write the SVG (criteria 2 to 5).
3. Run the targeted check (section 7); fix until `ok`.
4. Render light and dark PNGs into `$TMPDIR` and look at them with your image-reading tool (criterion 6). Fix overlaps or overflow, rerun the check.
5. Commit once: `docs: add charting-session picture`. No co-author line.

Advisory size: 1 file, under 12 turns.

## 7. Commands

Targeted check (run from the worktree root):

```sh
akrogon run-check --name u2-svg -- sh -c 'f=docs/pictures/charting-session.svg; test -f "$f" || exit 2; if grep -nE "href=|<script|@import|@font-face|animation" "$f"; then exit 1; fi; for s in "created by" "<title>Tamdoma</title>" "#f4f1e6" "#c4c0b3" "#0f0f0f" "ui-sans-serif" "ui-monospace" "1.5" "round" "<text" "c-" "signposts" "map" "consultant" "decision" "hand-off"; do grep -qiF "$s" "$f" || { echo "missing $s"; exit 1; }; done; if grep -niE "manual|quick fix|attended|autopilot signposts" "$f"; then exit 1; fi; rsvg-convert "$f" > /dev/null && echo ok'
```

Renders: `rsvg-convert -b '#ffffff' -o "$TMPDIR/u2-light.png" docs/pictures/charting-session.svg` and the same with `-b '#0d1117'` to `u2-dark.png`. (`-o /dev/null` is refused by rsvg-convert.)

## 8. Done-when, evidence and report

Done when the criteria in section 2 hold and the targeted check prints `ok` with exit 0. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` line it prints; `akrogon log <path>` reads a cited log. Paste at most a short excerpt. Return the one commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
