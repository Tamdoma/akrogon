# Brief 1: U1 mark group

## 1. Goal

Make the "created by" mark one group holding the text and the Tamdoma logotype, placed by one translate, in `docs/pictures/charting-session.svg` and `docs/pictures/mode-and-route.svg`, and say so in `docs/reference/where-things-go.md`. Add one line for the new test to `tests/AREA.md`. Plan decisions D1, D2, D3, D8.

## 2. Numbered acceptance criteria

1. Each of the two SVGs holds exactly this group (and no other "created by" text or Tamdoma title), with only the outer translate differing:

   ```text
     <g transform="translate(838 Y)"><title>Tamdoma</title>
     <text x="0" y="0" text-anchor="end" style="font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; letter-spacing: .04em; fill: #5e7355;">created by</text>
     <g transform="translate(8 -14) scale(0.05)" fill="#0f0f0f">
     (the seven <path .../> lines, unchanged, copied from today's logo group)
     </g>
     </g>
   ```

   `Y` = card height minus 22: mode-and-route.svg (height 440) uses `translate(838 418)`, charting-session.svg (height 460) uses `translate(838 438)`. The seven path lines are byte-identical in both files today; keep them byte-identical. Indent every line of the group by two spaces, as the file does today, so both groups are character-for-character identical apart from `Y`.
2. The rendered logo sits centred on the "created by" text line in both files (mode-and-route already is; charting-session moves from 4 px high to centred).
3. `docs/reference/where-things-go.md`, `## Pictures`, the `- Mark:` bullet is replaced by: `- Mark: one group, titled \`<title>Tamdoma</title>\`, holding the "created by" text and the Tamdoma logotype as inline paths, placed at the bottom right by its one translate. Every picture copies the group whole from \`docs/pictures/mode-and-route.svg\` and changes only that translate.` No other line of that file changes.
4. `tests/AREA.md` gains, in `## Key files`, after the line that names `tests/docs-links.test.ts` (inside that same bullet is fine, or as the next bullet): `tests/docs-pictures.test.ts` checks that every \`##\` section of guide pages 04 to 08 except the c- tab section embeds a picture with alt text, and that every picture embedded there holds one identical Tamdoma mark group (apart from its translate) and no \`href\`, script, \`@import\`, \`@font-face\` or animation. The file is already 49 lines, so add no line: append this as a sentence at the end of the existing bullet that names `tests/docs-links.test.ts` (that bullet also names `tests/command-reference.test.ts`). The line count must stay 49.
5. Planned test `tests/docs-pictures.test.ts`, case "every picture on guide pages 04 to 08 holds one identical mark group and no outside or moving markup", passes. Case "every section of guide pages 04 to 08 has a picture..." stays red (other units add those pictures); that is expected. `tests/docs-links.test.ts` and `tests/docs-em-dash.test.ts` pass.

Why the inline `style`: a `style` attribute outranks each file's `text { ... }` CSS type rule, so the group renders the same in every file whatever its style block holds.

## 3. Read-first list

- `docs/pictures/mode-and-route.svg` lines 45 to 55 (today's mark: a separate `<text class="mono" ...>created by</text>` line and a `<g transform="translate(846 404) scale(0.05)" fill="#0f0f0f"><title>Tamdoma</title>` logo group).
- `docs/pictures/charting-session.svg` (same mark at y 442 / translate(846 424)).
- `docs/reference/where-things-go.md` `## Pictures`.
- `tests/AREA.md`.
- `tests/docs-pictures.test.ts` (read only; the `MARK` regex shows the exact group shape it accepts).
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- `docs/pictures/mode-and-route.svg`: replace the old text line and logo group with the group above, `Y` = 418.
- `docs/pictures/charting-session.svg`: same, `Y` = 438.
- `docs/reference/where-things-go.md`: the Mark bullet only.
- `tests/AREA.md`: one line or clause.

Owned paths: those four files. Must land first: nothing. Shared test resource: none. Worktree created at commit: 9fbf4bf2 (fill: see section 7 path).

## 5. Do-not, reasons and exceptions

- Do not change anything else in the two SVGs (layout, labels, style block): only the mark is in scope. Exception: none.
- Do not edit any test file (`tests/*.test.ts`): tests are locked after planning. A planned test that is wrong or stays red for your two files once the group is right is a mismatch you return to A with the output.
- Do not change other lines of `where-things-go.md`: a parallel leaf (guide-chapters) edits that file. Exception: none.
- Do not add an em dash anywhere: `tests/docs-em-dash.test.ts` fails on it.
- Return a mismatch with evidence to A instead of changing scope or an interface; the exception is a revised brief from A.
- Never run any `git stash` subcommand: every worktree of the repo shares one stash and a pop can lift a sibling's edit. To set work aside, make a WIP commit; before returning, `git reset --soft 9fbf4bf2` and make the unit's one returned commit, so A's cherry-pick of that one commit carries all the work. To check base behaviour, use a second worktree of the base.
- Run commands unattended: no command that waits on a human (prompt, editor, pager); no poll or sleep loop, and a slow command runs once in the foreground with the tool timeout above its expected time; a harness denial is re-expressed inside the same grant (a simpler single command, your own read or edit tool), never around a secret, `.env` or grant rule, and if nothing works, return a mismatch with the denial text verbatim; name no env file path on a command line, and a needed undeclared value is a mismatch.

Reasons restated: scope stays at the mark; tests belong to A; a sibling leaf shares where-things-go.md; the dash guard reads SVGs; the stash is shared; nobody answers a prompt. The only exception is a revised brief from A.

## 6. Ordered steps

1. Install deps in the worktree: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
2. Edit mode-and-route.svg (criterion 1), then charting-session.svg (criterion 1). Confirm byte identity apart from `Y`: extract both groups and `diff` them (only the translate line may differ).
3. Render both: `rsvg-convert -z 2 -b white -o $TMPDIR/<name>.png docs/pictures/<name>.svg`, open each PNG with your Read tool and check the logo sits centred on the "created by" line, at the bottom right, inside the card (criterion 2).
4. Edit where-things-go.md (criterion 3) and tests/AREA.md (criterion 4).
5. Run the commands in section 7 (criterion 5).
6. Commit once (see section 5).

Advisory size: 4 files, under 16 turns.

## 7. Commands

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/charting-pictures-more-u1`.

- `akrogon run-check --name u1-pictures -- bun test tests/docs-pictures.test.ts tests/docs-links.test.ts tests/docs-em-dash.test.ts`

Expected: the mark-group case, docs-links and em-dash pass; only the per-section case fails, listing sections (none of them about your files).

## 8. Done-when, evidence and report

Done when criteria 1 to 5 hold, with the `check u1-pictures: <exit> <path>` line cited and the render PNG paths given. Keep command output only through `akrogon run-check`; read a log back with `akrogon log <path>`. No test file changes, so no `Test-Change:` trailer.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
