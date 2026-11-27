# Brief 4: embed the two pictures in guide pages 04, 06 and 07

## 1. Goal

Embed `docs/pictures/charting-session.svg` in `docs/guide/04-a-charting-session.md` and `docs/pictures/mode-and-route.svg` in `docs/guide/06-charting-mode.md` and `docs/guide/07-build-route.md`, with plain alt text. Plan decisions D1, D2.

## 2. Numbered acceptance criteria

1. `04-a-charting-session.md`: directly after the line "Using `client-portal`'s weekly client report export, a complete charting session moves through six steps:", one blank line, then:
   `![One charting session in the c- tab: intake, signposts, a territory map drawn with consultants, one decision per round, Charting mode and Build route, then the hand-off.](../pictures/charting-session.svg)`
   then one blank line before the next heading.
2. `06-charting-mode.md`: after the paragraph ending "every chart uses the Lifecycle build route." and before `## The three Charting modes at a glance`, a blank-line-separated line:
   `![Charting mode (No autopilot, Semi-autopilot, Full autopilot) and Build route (Direct, Lifecycle) are two separate choices. Direct is available only with No autopilot. Every mode can use Lifecycle.](../pictures/mode-and-route.svg)`
3. `07-build-route.md`: the same line as criterion 2, after the bold definition paragraph (the one starting "**Build route decides who builds the work") and before "Once a chart has no open questions left".
4. No other line in any file changes. Each page keeps exactly one blank line around the embed.
5. `tests/docs-links.test.ts` passes.

## 3. Read-first list

- The three guide pages named above.
- Look at the two pictures before editing, so you know the alt text is true: `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/charting-session-light.png` and `/home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-pictures/charting-pictures/implementation/mode-and-route-light.png`.
- `/home/ivan/.akrogon/releases/4aff0f6881e486a15fd98db8d595644469cd4901/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Three new lines (plus their blank lines) in the three pages.
- Owned paths: those three new lines only. Shared test resource: none. Must land first: U1 and U2 (both SVGs, landed at the creation commit). Consumed output: the two SVG files.
- Worktree: `/home/ivan/.akrogon/worktrees/akrogon/charting-pictures-u4`, created at commit d73b6db2.
- Embed form `tests/docs-links.test.ts` resolves: `![alt](../pictures/<file>.svg)` from `docs/guide/`.

## 5. Do-not, reasons and exceptions

- Edit only the three new embed lines and their blank lines. The pictures are done, and other leaves own the guide text; a stray edit conflicts at merge. Exception: none; a needed change elsewhere is a mismatch returned to A.
- Keep the alt text as given unless the picture shows something it does not say; then return a mismatch naming the difference instead of rewording.
- Write and edit no test. Tests belong to A. A wrong or red planned check is a mismatch with evidence.
- Return a mismatch with evidence to A instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.
- Never run any `git stash` subcommand: every worktree of this repo shares one stash, and a pop can lift a sibling worker's edit. To set work aside, commit it as a WIP commit; before returning, `git reset --soft d73b6db2` and make the unit's one returned commit, so A cherry-picks one commit carrying all the work.
- Run commands unattended: no command that waits on a human (prompt, confirmation, editor, pager); no poll or sleep loop; a slow command runs once in the foreground with the tool timeout above its expected time. Re-express a harness denial inside the same grant (a simpler single command, your own read or edit tool), never around a secret, `.env` or grant rule; when no permitted form answers, return a mismatch with the denial text verbatim. Name no env file path on a command line; an undeclared value you need is a mismatch. Reason: no human answers a seat's command, and this brief is the only place the rule reaches you. No exception.
- Stop no process by command-line pattern (`pkill -f`, `killall`); stop a run with `akrogon stop-run <run-id>`.
- No `.env` file is opened, printed or written with any tool.

Reasons and exceptions restated: own lines only (other owners), alt text fixed (plan decision), no tests (A owns them), no stash (shared stack; WIP commit instead), unattended commands (nobody answers). The only exception to any of these is a revised brief from A.

## 6. Ordered steps

1. Read section 3 and look at the two PNGs.
2. Add the three embeds (criteria 1 to 4).
3. Run the commands in section 7 until both pass.
4. Commit once: `docs: embed the charting pictures in guide pages 04, 06 and 07`. No co-author line.

Advisory size: 3 files, under 12 turns.

## 7. Commands

From the worktree root, first `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`, then:

```sh
akrogon run-check --name u4-embeds -- sh -c 'for f in docs/guide/06-charting-mode.md docs/guide/07-build-route.md; do grep -nF "](../pictures/mode-and-route.svg)" "$f" || { echo "no mode-and-route embed in $f"; exit 1; }; done; grep -nF "](../pictures/charting-session.svg)" docs/guide/04-a-charting-session.md || { echo "no charting-session embed in 04"; exit 1; }; echo ok'
akrogon run-check --name u4-docs-links -- bun test tests/docs-links.test.ts
```

## 8. Done-when, evidence and report

Done when criteria 1 to 5 hold and both commands exit 0. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` line it prints; `akrogon log <path>` reads a cited log. Paste at most a short excerpt. Return the one commit ID and `git show --stat` of it.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
