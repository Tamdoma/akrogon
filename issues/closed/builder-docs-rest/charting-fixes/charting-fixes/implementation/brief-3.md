# Sub-brief u3: Start and use docs em-dash removal

## 1. Goal

Remove every em dash (`—`, U+2014) from the 6 affected docs under `docs/start/` and `docs/use/` by rewriting each affected sentence naturally (no dash substitutes), while keeping every consumer-tested string intact.

Plan decision IDs: D2, D3, D5.

## 2. Numbered acceptance criteria

1. Zero em dashes (`—`, U+2014, or `&mdash;`/`&#8212;`/`&#x2014;`) remain in the 6 owned files, and every changed sentence is rewritten naturally using periods, commas, colons, semicolons, parentheses, or restructured clauses — never by swapping in `" - "`, `"--"`, or an en dash (`–`).
2. Consumer contracts remain intact:
   - `docs/use/watch-while-away.md`: keeps `claude`, `codex`, `pi`, and `agy` on line 7; introduces no `cron` or `expir*`; keeps `akrogon status` out of `## What each check does`.
3. No other wording changes occur beyond Criterion 1, and all targeted consumer tests in Section 7 pass.

Planned tests live in the leaf diff; you write and edit no test file.

## 3. Read-first list

- `/home/ivan/.gemini/config/skills/implement-issue/ponytail.md`
- `docs/start/what-it-is.md`
- `docs/start/why-it-works.md`
- `docs/use/a-working-day.md`
- `docs/use/autopilot.md`
- `docs/use/plan-work.md`
- `docs/use/watch-while-away.md`

Pattern to copy: clean prose sentences without em dashes in `docs/start/why-it-works.md` lines 1–24.

## 4. Change list and needed interfaces

- Worktree path: `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u3`
- Creation commit: `86eae17b77ffb6239d8827cb6ad9d502514f0bbd`
- Chunks that must land first: none
- Shared test resources or consumed outputs: none
- Owned paths (exact edit targets):
  1. `docs/start/what-it-is.md`: line 12 (2 em dashes).
  2. `docs/start/why-it-works.md`: line 25 (1 em dash).
  3. `docs/use/a-working-day.md`: line 10 (2 em dashes).
  4. `docs/use/autopilot.md`: lines 21, 25 (4 em dashes).
  5. `docs/use/plan-work.md`: lines 24, 32, 34, 56 (8 em dashes).
  6. `docs/use/watch-while-away.md`: lines 7, 43 (4 em dashes).

## 5. Do-not, reasons and exceptions

- Do not edit any file outside the 6 owned paths in Section 4, and do not write or edit any test file.
- Do not change any line in those 6 files that does not hold an em dash, and do not alter technical facts, links, or consumer-asserted harness names (`claude`, `codex`, `pi`, `agy`).
- Do not substitute `" - "`, `"--"`, or an en dash (`–`) where an em dash was removed; rewrite each sentence naturally.
- Do not run `akrogon verify` or whole-repo `tests/docs-em-dash.test.ts` (other units own the remaining 14 files; A runs whole-repo proofs after Wave 1 merges).
- Do not introduce retired terms (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`, `hold-fix`, `unhold`, `--red-on-base`, `held.yaml`, `run permit`, `cron`, `expir*`).
- Return a mismatch with evidence to A instead of changing scope or an interface.
- **Standing exclusion (`git stash`)**: Never run any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to inspect base behavior use a second worktree of base instead. To set work aside, commit a WIP commit and before returning run `git reset --soft 86eae17b77ffb6239d8827cb6ad9d502514f0bbd` and make the unit's single returned commit once.
- **Standing exclusion (unattended commands)**: Never write a command that waits on a human; never write a poll or sleep loop, and run a slow command once in the foreground waiting on its exit inside your turn; re-express a harness command denial inside the same grant and identity (simpler command, configured runner, or file tools) without routing around secret/`.env`/grant rules, and if no permitted formulation answers return a mismatch with the denial text verbatim; name no env file path on a command line, and treat an undeclared required value as a mismatch.
- **Standing exclusion (process stop)**: Never stop a process by command-line pattern (`pkill -f`, `killall`, `pgrep ... | xargs kill`); use `akrogon stop-run <run-id>` if needed.

Reasons and exceptions: Strict file ownership prevents Wave 1 merge conflicts and satisfies Criterion 4; `tests/watch-timer.test.ts` asserts harness names and forbids `cron`/`expir*`/`akrogon status`; test files are frozen after planning; no stash and no pattern kill protect parallel workers; unattended command rules apply because no human attends worker turns. Exceptions: only a revised brief from A authorizes changing scope, owned files, or an interface; the unattended-command, no-stash, and no-pattern-kill exclusions have no exception.

## 6. Ordered steps

Advisory size: 6 files, under 24 turns.

1. Read `ponytail.md` and the 6 owned docs in `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u3`.
2. Rewrite em-dash lines in `docs/start/what-it-is.md` and `docs/start/why-it-works.md` for Criterion 1.
3. Rewrite em-dash lines in `docs/use/a-working-day.md`, `docs/use/autopilot.md`, `docs/use/plan-work.md`, and `docs/use/watch-while-away.md` for Criteria 1–2.
4. Inspect `git diff` line by line to confirm natural rewrites, zero dash substitutes (`" - "`, `"--"`, `–`), intact technical meaning, and zero extraneous edits (Criterion 3).
5. Run the targeted checks in Section 7 from `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u3`, then commit all 6 files in one commit on the detached HEAD and confirm `git status --porcelain` is empty.

## 7. Commands

Run inside `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u3`:

```sh
akrogon run-check --name u3-em-dash -- sh -c '! rg -n "—|&mdash;|&#8212;|&#x2014;" docs/start/what-it-is.md docs/start/why-it-works.md docs/use/a-working-day.md docs/use/autopilot.md docs/use/plan-work.md docs/use/watch-while-away.md'
akrogon run-check --name u3-consumer-tests -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile --backend=copyfile'\'' && bun test tests/docs-links.test.ts && bun test -t "docs describe the timer watch|omits the akrogon status" tests/watch-timer.test.ts'
```

## 8. Done-when, evidence and report

Done when all 6 files pass both commands in Section 7 with exit `0`, every changed line is naturally rewritten without dash substitutes, all consumer contracts hold, and one clean commit sits on `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u3` with an empty `git status --porcelain`.

Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` lines (at most a short excerpt pasted). You edit no test files so no `Test-Change:` trailer is needed.

Return your commit SHA and complete these four lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
