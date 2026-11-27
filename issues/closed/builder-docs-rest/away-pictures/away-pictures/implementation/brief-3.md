# Brief 3: delete old-style pictures and replace their shelf embeds (unit U3)

## 1. Goal

Remove every old-style picture from `docs/pictures/` except `watch-loop.svg` (another unit redraws it), and replace each shelf-page embed of a deleted picture with one or two plain sentences. Plan decisions D5, D7.

## 2. Numbered acceptance criteria

1. These 18 files are deleted with `git rm`: `change-flow.svg`, `chart-door.svg`, `config-layers.svg`, `control-states.svg`, `dispatch-order.svg`, `factory-overview.svg`, `failure-recovery.svg`, `grounding.svg`, `lessons-flow.svg`, `machine-parts.svg`, `phases.svg`, `project-folders.svg`, `records-vs-code.svg`, `releases.svg`, `two-seats.svg`, `verification.svg`, `ways-to-run.svg`, `working-day.svg` (all under `docs/pictures/`). `watch-loop.svg` stays.
2. Each of the five embeds below is replaced in place (same spot, the line between the intro paragraph and the first `##`) by one or two plain sentences built from its old alt text. Every fact in the sentence must match the page body below it or the source it cites; read them and drop or fix any part they do not support. No table, no new heading, no em dash, no "manual mode", "manual route", "quick fix", "autopilot signposts".
   - `docs/reference/checks.md` (was `verification.svg`): every change goes through `akrogon verify` on a fresh checkout; green writes a receipt; red can pass only when the same tests also fail on the base; a changed test file without a `Test-Change` trailer is refused.
   - `docs/reference/config.md` (was `config-layers.svg`): seats `a` and `b` are each looked up in ISSUE.md, then EPIC.md, then the repo `issues/config.yaml`, then the machine `config.yaml`; the first file that sets the seat wins. Check the order against `src/config.ts` and the page body.
   - `docs/reference/state-and-phases.md` (was `phases.svg`): a leaf starts at `plan.synthesis`, moves through `implement`, `check.review` and `merge` to `merged`; a fix verdict loops through `check.repair` and `check.fix` back to `check.review`; any active phase can stop in `failed`. Check against the phase table right below it.
   - `docs/reference/files.md` (was `project-folders.svg`): the registered checkout's `issues/` holds the record folders and logs laid out below, and leaf worktrees live in a separate store at `~/.akrogon/worktrees/<repo>`. Check the store path against the page body.
   - `docs/reference/releases-and-updates.md` (was `releases.svg`): releases are built from the merged default branch, `current` points at the active release, and `akrogon rollback` makes the previous release active and holds the rolled-back commit. Check against the page body.
3. `git grep -n -e '<name>.svg'` for each deleted name returns nothing.
4. Planned tests (A's, run by you, never edited), run after your commit (the link test reads missing files from the committed tree, so an uncommitted deletion looks fine):
   - `tests/docs-links.test.ts` "README, docs and skill links resolve to files and anchors": green.
   - `tests/docs-pictures.test.ts` "every SVG in docs/pictures holds ...": its failure list holds only `docs/pictures/watch-loop.svg` (redrawn by another unit).
   - `tests/docs-em-dash.test.ts`: green.

## 3. Read-first list

- The five shelf pages above, the top 15 lines of each and the section the sentence summarises
- `src/config.ts` (seat lookup order)
- `docs/reference/where-things-go.md` `## One home per fact`
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- Owned paths: the 18 files in criterion 1 (delete), and the embed line of the five shelf pages in criterion 2.
- Prerequisites: none. Shared test resource: none.
- Worktree: `/home/ivan/.akrogon/worktrees/akrogon/away-pictures-u3`, created at commit e7af8fe5c6db7340790b3abe75b1b8e426176ad0.

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

1. Read each shelf page and its source; write the replacement sentence (criterion 2).
2. `git rm` the 18 files (criterion 1).
3. Run the grep (criterion 3). Commit once.
4. Run section 7 commands on the commit (criterion 4).

Advisory size: 23 files (18 deletions), under 20 turns.

## 7. Commands

- `akrogon run-check --name u3-links -- bun test tests/docs-links.test.ts -t "resolve to files and anchors"` (green, after commit)
- `akrogon run-check --name u3-pictures -- bun test tests/docs-pictures.test.ts -t "every SVG in docs/pictures"` (red only for watch-loop.svg)
- `akrogon run-check --name u3-dash -- bun test tests/docs-em-dash.test.ts` (green)
- Run `bun install --frozen-lockfile --backend=copyfile` once first if `node_modules` is missing.

## 8. Done-when, evidence and report

Done when every acceptance criterion above holds, each section 7 command shows the result stated, and every render was read. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` line. Return one commit (message style `docs(pictures): ...`, no co-author line) with its commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
