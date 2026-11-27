# Brief 2: docs for direct's seat resolution

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/direct-lookup-u2`, created detached at `b862819a5a7ace4579ba61ae9907e21b8f5ad808`.

## 1. Goal

Three docs must say that `akrogon direct` resolves both seats in the caller's own `HC_SESSION`. This unit covers plan decision D7 and brief criterion 4.

The behaviour these docs describe, which unit 1 implements:

- `akrogon direct` reads `HC_SESSION`. It refuses when `HC_SESSION` is unset or blank.
- It checks that `HC_TERMINAL_ID` (seat A) and `--reviewer` (seat B) are each live terminals in that session, using `terminalIfPresent` from `src/hc.ts`. It refuses otherwise, even when another session holds the address live.
- It scans no other session. A reviewer that lives only in another session can no longer be named.
- Seat refs keep `{session, address}`, and both sessions equal the caller's `HC_SESSION`.

## 2. Numbered acceptance criteria

1. `src/AREA.md`, line 21 (`src/direct.ts`): "each probed live in exactly one live session — zero or more refuse" is replaced. The new text says both are checked live in the caller's `HC_SESSION`, with a refusal when `HC_SESSION` is blank or either address is not live there.
2. `src/AREA.md`, line 18 (`src/hc.ts`): the sentence about `probeTerminal` still describes the seat-ref probe that dispatch uses. Add, or adjust it to say, that `akrogon direct` checks its seats with `terminalIfPresent` in the caller's own session.
3. `docs/reference/commands.md`, the `akrogon direct` row: "or either address does not resolve as a live terminal in exactly one live session" becomes "`HC_SESSION` is blank or either address is not a live terminal in the caller's `HC_SESSION`". The rest of the row's wording can be adjusted to match.
4. `docs/reference-index.md`, line 3: the Command entry no longer says that every hc call pins `HC_SESSION` to the resolved repo session without an exception. It names direct's seat lookup, which uses the caller's own `HC_SESSION`, as the exception.
5. No "exactly one live session" claim remains anywhere in the three files. Check with `grep -n "exactly one live session" src/AREA.md docs/reference/commands.md docs/reference-index.md`, which must print nothing.
6. `src/AREA.md` stays at most 40 lines, with the same second-level sections (Commands, Key files, Non-obvious patterns, See also).

## 3. Read-first list

- `src/AREA.md` lines 18 and 21
- `docs/reference/commands.md` line 22
- `docs/reference-index.md` line 3
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Edit only the three files and only the lines named above. Owned paths: `src/AREA.md`, `docs/reference/commands.md`, `docs/reference-index.md`. Nothing must land first, and there is no shared test resource.

## 5. Do-not, reasons and exceptions

- Do not edit code or tests, because unit 1 owns them.
- Do not rewrite unrelated sentences, because diffs stay minimal.
- Do not add history wording such as "no longer" or "was". Docs describe the current state.
- Never run any `git stash` subcommand, because every worktree shares one stash. To set work aside, commit a WIP commit. Before returning, run `git reset --soft b862819a5a7ace4579ba61ae9907e21b8f5ad808` and make one commit for the unit.

To restate the reasons: code belongs to unit 1, minimal diffs, current-state docs, and a shared stash. The only exception is a revised brief from A, which you get by returning a mismatch with evidence.

## 6. Ordered steps

1. Edit `src/AREA.md` (criteria 1, 2, 6).
2. Edit `docs/reference/commands.md` (criterion 3).
3. Edit `docs/reference-index.md` (criterion 4).
4. Run the grep from criterion 5 and `wc -l src/AREA.md`.
5. Make one commit with message `Describe direct seat resolution in the caller's HC_SESSION`. Add no co-author line.

Advisory size: 3 files and under 10 turns.

## 7. Commands

- `grep -n "exactly one live session" src/AREA.md docs/reference/commands.md docs/reference-index.md` must print nothing.
- `wc -l src/AREA.md` must report at most 40.

No test runner applies.

## 8. Done-when, evidence and report

Done when criteria 1–6 hold. Paste the grep output, the `wc` output and the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
