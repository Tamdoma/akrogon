# Brief 2 (unit U2): docs and lesson retirement for caller-display

## 1. Goal

Implement plan decisions D7 and D8: the reference docs state the display-variable forwarding rule, and the lesson "run-check drops DISPLAY" retires in the leaf's diff. Leaf: akrogon/caller-display (Tamdoma/akrogon#155). The product change itself lands in parallel from another worker; your texts describe the end state.

## 2. Numbered acceptance criteria

1. `docs/reference/checks.md`: the check-environment paragraph — the one beginning "The command runs with a clean environment" — names the four variables `DISPLAY`, `XAUTHORITY`, `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR` as copied from the caller when the caller holds them (empty values included, absent names absent), and states that a verify payload always carries `XDG_RUNTIME_DIR` (the verify pass service sets it even when the caller lacks it). Extend the existing paragraph minimally; do not restructure the page.
2. `docs/reference/config.md`: the `pass_env` row of the repo `issues/config.yaml` table, or the environment-variables paragraph after the table, states that the four display variables reach check commands without being listed and that listing them in `pass_env` stays valid. One minimal edit.
3. `tests/AREA.md`: the `tests/isolation.ts` entry (Key files section) additionally notes the preload unsets the caller's `DISPLAY`/`XAUTHORITY`/`WAYLAND_DISPLAY` so the suite sees one display state whoever launched it. Keep the file's existing section structure exactly (Commands, Key files, Non-obvious patterns, See also) and the file at most 40 lines — it is currently 30 lines, so extend inside the existing line rather than adding sections. Match how the file already writes lines (each bullet can be long).
4. `learnings/LESSONS.md`: the line beginning `- run-check drops DISPLAY` is removed. Nothing else in the file changes.
5. `learnings/history/2026-11-24-run-check-drops-display.md`: append one line at the end: `Applied 2026-11-25 by src/run-check.ts displayEnv/copied: the four display names are copied from the caller into every check command, so a headed browser inherits the caller's session` — cite the mechanism by that exact file-and-symbol form (the stopping mechanism is `displayEnv` spread into `copied` in `src/run-check.ts`, landing in parallel; do not invent a commit hash). Do not rewrite the historical case text.

## 3. Read-first list

- `docs/reference/checks.md` — find "The command runs with a clean environment"
- `docs/reference/config.md` — the `pass_env` row and the paragraph beginning "Environment variable names in `env` and `pass_env`"
- `tests/AREA.md` — the isolation.ts bullet
- `learnings/LESSONS.md` — find the exact line starting `- run-check drops DISPLAY`
- `learnings/history/2026-11-24-run-check-drops-display.md` — read it whole; append after the last line
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- You own exactly: `docs/reference/checks.md`, `docs/reference/config.md`, `tests/AREA.md`, `learnings/LESSONS.md`, `learnings/history/2026-11-24-run-check-drops-display.md`. Edit no other file — no source, no tests.
- The `displayEnv`/`copied` mechanism you cite is being implemented in parallel in `src/run-check.ts` by another worker; write your texts against the end state described in section 2.
- Chunks that must land first: none. Shared test resource: none. The worker worktree is at `/home/ivan/.akrogon/worktrees/akrogon/caller-display-u2`, created detached at commit `5f699994d32e98d021cd8fc23d252332fdfac2f4`.

## 5. Do-not, reasons and exceptions

- Do not edit `src/AREA.md`: inspected at planning, its lines stay accurate — nothing in it enumerates the copied env names.
- Do not edit `docs/reference/commands.md`, `docs/reference/files.md`, `README.md` or any skills file: inspected at planning, none enumerates the copied env names or claims their absence.
- Do not touch the `run-check drops DISPLAY` history file beyond the one appended line: the rule forbids rewriting the historical case.
- Do not add `XDG_SESSION_TYPE` or `WAYLAND_SOCKET` anywhere in the docs: they are deliberately never forwarded (locked design).
- Never run any `git stash` subcommand: every worktree of the repo shares one stash and a pop can lift a sibling's edit. To set work aside, commit it as a WIP commit and, before returning, `git reset --soft 5f699994d32e98d021cd8fc23d252332fdfac2f4` and make the unit's one returned commit.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change. Restated: the exclusions above exist because planning already inspected those surfaces, and the only exception is a revised brief.

## 6. Ordered steps

Advisory size: 5 files, under 20 turns.

1. Read each file's relevant area, then make the five edits of section 2 (criteria 1-5).
2. Verify the criterion-4 statements mechanically: `grep -c DISPLAY docs/reference/checks.md docs/reference/config.md` shows the names present in both, and re-read the two edited paragraphs checking each required statement is present verbatim-testable: the four variable names, the caller-only rule, the verify-payload-always-XDG_RUNTIME_DIR statement, the without-being-listed and stays-valid statements.
3. Verify `tests/AREA.md` is at most 40 lines (`wc -l tests/AREA.md`).
4. Verify the lesson line is gone and the Applied line appended exactly once.
5. Commit your chunk as one commit with the trailer `Test-Change: tests/AREA.md isolation preload display-state note; doc content only, no expectation changed` — `tests/AREA.md` matches the path rule in `src/test-files.ts` (any `tests` segment), so the trailer is required (corrected after worker report; the original parenthetical claiming otherwise was wrong).

## 7. Commands

No targeted test command is named for this unit — the docs assertions live in `tests/docs-links.test.ts`, which is A's criterion proof, not yours. Run no test suite. The grep and wc checks of section 6 step 2/3 are your verification; keep them through `akrogon run-check --name u2-docs -- sh -c 'grep -c DISPLAY docs/reference/checks.md docs/reference/config.md && wc -l tests/AREA.md'`.

## 8. Done-when, evidence and report

All five edits present with the checks green and the `check u2-docs: <exit> <path>` line cited, one commit holding exactly your five files. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
