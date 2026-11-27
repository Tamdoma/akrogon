# Sub-brief u2: Reference docs em-dash removal

## 1. Goal

Remove every em dash (`—`, U+2014) from the 8 affected reference docs under `docs/reference/` by rewriting each affected sentence naturally (no dash substitutes), while keeping every consumer-tested string and Markdown table contract intact.

Plan decision IDs: D2, D3, D5.

## 2. Numbered acceptance criteria

1. Zero em dashes (`—`, U+2014, or `&mdash;`/`&#8212;`/`&#x2014;`) remain in the 8 owned reference docs, and every changed sentence is rewritten naturally using periods, commas, colons, semicolons, parentheses, or restructured clauses — never by swapping in `" - "`, `"--"`, or an en dash (`–`).
2. Consumer contracts remain intact:
   - `docs/reference/checks.md`: keeps `(script)` and leaves mathematical minus (`−`, U+2212) and multiplication (`×`, U+00D7) on line 85 intact.
   - `docs/reference/commands.md`: lines 44, 47, 54 stay valid single-line Markdown table rows with untouched `Invocation` column and non-empty `Effect` column.
   - `docs/reference/files.md`: keeps `(script)` and keeps line 73 as a single-line `| \`verify-runs.jsonl\`` Markdown table row containing `` `timeouts` ``, `` `durations` ``, and `` `attempt` ``.
   - `docs/reference/skills.md`: introduces no `cron` or `expir*`.
   - `docs/reference/config.md` (line 68) and `docs/reference/state-and-phases.md` (line 18) keep valid single-line Markdown table rows.
3. No other wording changes occur beyond Criterion 1, and all targeted consumer tests in Section 7 pass.

Planned tests live in the leaf diff; you write and edit no test file.

## 3. Read-first list

- `/home/ivan/.gemini/config/skills/implement-issue/ponytail.md`
- `docs/reference/checks.md`
- `docs/reference/commands.md`
- `docs/reference/config.md`
- `docs/reference/files.md`
- `docs/reference/limits.md`
- `docs/reference/skills.md`
- `docs/reference/state-and-phases.md`
- `docs/reference/words.md`

Pattern to copy: clean prose sentences without em dashes in `docs/reference/checks.md` lines 18–50.

## 4. Change list and needed interfaces

- Worktree path: `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u2`
- Creation commit: `86eae17b77ffb6239d8827cb6ad9d502514f0bbd`
- Chunks that must land first: none
- Shared test resources or consumed outputs: none
- Owned paths (exact edit targets):
  1. `docs/reference/checks.md`: lines 52, 63, 69, 85, 95, 147 (11 em dashes).
  2. `docs/reference/commands.md`: lines 44, 47, 54 (8 em dashes; table rows).
  3. `docs/reference/config.md`: line 68 (2 em dashes; table row).
  4. `docs/reference/files.md`: lines 28, 71, 73, 95, 99 (15 em dashes; lines 28, 71, 73 are table rows).
  5. `docs/reference/limits.md`: line 17 (1 em dash).
  6. `docs/reference/skills.md`: lines 16, 46 (3 em dashes).
  7. `docs/reference/state-and-phases.md`: lines 18, 36 (2 em dashes; line 18 is a table row).
  8. `docs/reference/words.md`: line 29 (2 em dashes).

## 5. Do-not, reasons and exceptions

- Do not edit any file outside the 8 owned paths in Section 4, and do not write or edit any test file.
- Do not change any line in those 8 files that does not hold an em dash, and do not alter technical facts, command signatures, backticked field names, or math symbols (`−`, `×`).
- Do not substitute `" - "`, `"--"`, or an en dash (`–`) where an em dash was removed; rewrite each sentence naturally.
- Do not run `akrogon verify` or whole-repo `tests/docs-em-dash.test.ts` (other units own the remaining 12 files; A runs whole-repo proofs after Wave 1 merges).
- Do not introduce retired terms (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`, `hold-fix`, `unhold`, `--red-on-base`, `held.yaml`, `run permit`, `cron`, `expir*`).
- Return a mismatch with evidence to A instead of changing scope or an interface.
- **Standing exclusion (`git stash`)**: Never run any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to inspect base behavior use a second worktree of base instead. To set work aside, commit a WIP commit and before returning run `git reset --soft 86eae17b77ffb6239d8827cb6ad9d502514f0bbd` and make the unit's single returned commit once.
- **Standing exclusion (unattended commands)**: Never write a command that waits on a human; never write a poll or sleep loop, and run a slow command once in the foreground waiting on its exit inside your turn; re-express a harness command denial inside the same grant and identity (simpler command, configured runner, or file tools) without routing around secret/`.env`/grant rules, and if no permitted formulation answers return a mismatch with the denial text verbatim; name no env file path on a command line, and treat an undeclared required value as a mismatch.
- **Standing exclusion (process stop)**: Never stop a process by command-line pattern (`pkill -f`, `killall`, `pgrep ... | xargs kill`); use `akrogon stop-run <run-id>` if needed.

Reasons and exceptions: Strict file ownership prevents Wave 1 merge conflicts and satisfies Criterion 4; consumer tests depend on exact table rows and literals; test files are frozen after planning; no stash and no pattern kill protect parallel workers; unattended command rules apply because no human attends worker turns. Exceptions: only a revised brief from A authorizes changing scope, owned files, or an interface; the unattended-command, no-stash, and no-pattern-kill exclusions have no exception.

## 6. Ordered steps

Advisory size: 8 files, under 32 turns.

1. Read `ponytail.md` and the 8 owned reference docs in `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u2`.
2. Rewrite em-dash lines in `docs/reference/checks.md` and `docs/reference/commands.md` for Criteria 1–2.
3. Rewrite em-dash lines in `docs/reference/config.md` and `docs/reference/files.md` for Criteria 1–2.
4. Rewrite em-dash lines in `docs/reference/limits.md`, `docs/reference/skills.md`, `docs/reference/state-and-phases.md`, and `docs/reference/words.md` for Criteria 1–2.
5. Inspect `git diff` line by line to confirm natural rewrites, zero dash substitutes (`" - "`, `"--"`, `–`), intact technical meaning, and zero extraneous edits (Criterion 3).
6. Run the targeted checks in Section 7 from `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u2`, then commit all 8 files in one commit on the detached HEAD and confirm `git status --porcelain` is empty.

## 7. Commands

Run inside `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u2`:

```sh
akrogon run-check --name u2-em-dash -- sh -c '! rg -n "—|&mdash;|&#8212;|&#x2014;" docs/reference/checks.md docs/reference/commands.md docs/reference/config.md docs/reference/files.md docs/reference/limits.md docs/reference/skills.md docs/reference/state-and-phases.md docs/reference/words.md'
akrogon run-check --name u2-consumer-tests -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile --backend=copyfile'\'' && bun test tests/docs-links.test.ts tests/command-reference.test.ts && bun test -t "docs describe the timer watch" tests/watch-timer.test.ts'
```

## 8. Done-when, evidence and report

Done when all 8 files pass both commands in Section 7 with exit `0`, every changed line is naturally rewritten without dash substitutes, all consumer contracts hold, and one clean commit sits on `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u2` with an empty `git status --porcelain`.

Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` lines (at most a short excerpt pasted). You edit no test files so no `Test-Change:` trailer is needed.

Return your commit SHA and complete these four lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
