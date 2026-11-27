# Brief 3: picture rules in docs/reference/where-things-go.md

## 1. Goal

Rewrite the picture rules in `docs/reference/where-things-go.md` to the new style, so later pictures follow it. Plan decision D9.

## 2. Numbered acceptance criteria

1. Line 11 (the `docs/pictures/` bullet) becomes: "`docs/pictures/`: SVG pictures, drawn in the [picture style](#pictures)."
2. A new `## Pictures` section sits directly before `## When code changes`. It states, one short line each, in plain words:
   - card: opaque `#f4f1e6` with a 1.5 px `#c4c0b3` border and rounded corners, so one file reads on GitHub light and dark pages;
   - palette: ink `#0f0f0f`, ink-soft `#6e6a5c`, beige `#f0ede0` `#e0dccf`, sage scale `#e7ede2` `#b7c8ae` `#90a985` `#7a9b76` `#5e7355`;
   - strokes: 1.5 px, round caps and joins, flat fills, dashed sage connectors;
   - fonts: system sans stack (`ui-sans-serif, system-ui, ...`) and `ui-monospace` stack, labels kept as text so renames can find them;
   - mark: "created by" plus the Tamdoma logotype as inline paths in a group titled `<title>Tamdoma</title>`, bottom-right; copy the group from `docs/pictures/mode-and-route.svg` (a code span, NOT a link, because that file lands in a parallel unit);
   - still: no animation, no script, no `href`, no web font, no `@import`;
   - layout: about 960 px wide, read left to right, short labels in the guide's words, no screenshots of command output.
3. Nothing else in the page changes. The other folder bullets (`docs/start/`, `docs/use/`, `docs/examples/`) stay as they are; another leaf owns them.
4. The page keeps the repo's doc voice: short plain sentences, no marketing words.

## 3. Read-first list

- `docs/reference/where-things-go.md` (whole page; match its style).
- `docs/guide/06-charting-mode.md` (only for the word "Charting mode" style of naming).
- `/home/ivan/.akrogon/releases/4aff0f6881e486a15fd98db8d595644469cd4901/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Edit `docs/reference/where-things-go.md`: line 11 and the new section.
- Owned path: only those lines of that file. Shared test resource: none. Must land first: nothing. Consumed output: none.
- Worktree: `/home/ivan/.akrogon/worktrees/akrogon/charting-pictures-u3`, created at commit 4aff0f6881e486a15fd98db8d595644469cd4901.
- `tests/docs-links.test.ts` checks that `#pictures` resolves to a heading slug in the same page; `## Pictures` gives slug `pictures`.

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

1. Read section 3.
2. Edit line 11 and add the section (criteria 1 to 4).
3. Run the two targeted checks (section 7) until both pass.
4. Commit once: `docs: state the picture style in where-things-go`. No co-author line.

Advisory size: 1 file, under 8 turns.

## 7. Commands

From the worktree root, after `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`:

```sh
akrogon run-check --name u3-style-rules -- sh -c 'f=docs/reference/where-things-go.md; for s in "#f4f1e6" "#c4c0b3" "#0f0f0f" "sage" "1.5" "ui-sans-serif" "ui-monospace" "created by" "<title>Tamdoma</title>" "animation"; do grep -qiF "$s" "$f" || { echo "missing $s"; exit 1; }; done; echo ok'
akrogon run-check --name u3-docs-links -- bun test tests/docs-links.test.ts
```

## 8. Done-when, evidence and report

Done when the criteria in section 2 hold and the targeted check prints `ok` with exit 0. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` line it prints; `akrogon log <path>` reads a cited log. Paste at most a short excerpt. Return the one commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
