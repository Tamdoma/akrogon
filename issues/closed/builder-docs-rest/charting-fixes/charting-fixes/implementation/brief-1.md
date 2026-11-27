# Sub-brief u1: Charting guide and docs home

## 1. Goal

Remove every em dash (`—`, U+2014) from `docs/README.md` and `docs/guide/04`–`08` by rewriting each affected sentence naturally (no dash substitutes), expand every consultant-starting example on those pages to name each slot with harness, model, and effort, and add the one slots sentence to page 04.

Plan decision IDs: D2, D3, D4, D5.

## 2. Numbered acceptance criteria

1. Zero em dashes (`—`, U+2014, or `&mdash;`/`&#8212;`/`&#x2014;`) remain in the 6 owned files, and every changed sentence is rewritten naturally using periods, commas, colons, semicolons, parentheses, or restructured clauses — never by swapping in `" - "`, `"--"`, or an en dash (`–`).
2. All 4 consultant-starting examples on `docs/guide/04`–`08` and `docs/README.md` name each slot with harness, model, and effort:
   - `docs/guide/04-a-charting-session.md:22`: `/chart-issues Add a weekly client report export to client-portal. Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.`
   - `docs/guide/06-charting-mode.md:35`: `/chart-issues Add a weekly client report export to client-portal. Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.`
   - `docs/guide/06-charting-mode.md:54`: `/chart-issues Chart these three client-portal report issues on autopilot, I'll answer the signposts. Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.`
   - `docs/guide/06-charting-mode.md:75`: `/chart-issues Run full autopilot on these three client-portal cleanup reports, answering the signposts and all forks yourself. Consultants: slot B claude, claude-fable-5-2, high effort.`
3. `docs/guide/04-a-charting-session.md` holds this one added sentence right below the opening example block (after line 23, before line 25):
   `While charting, consultants sit in slots B, C, D, and a Lifecycle task later gets its own fresh slot B (the reviewer).`
4. No other wording changes occur beyond criteria 1–3, and `tests/docs-links.test.ts` stays green.

Planned tests live in the leaf diff (`tests/docs-em-dash.test.ts` and `tests/docs-links.test.ts`); you write and edit no test file.

## 3. Read-first list

- `/home/ivan/.gemini/config/skills/implement-issue/ponytail.md`
- `docs/README.md` (existing clean prose style in lines 9–13, 29–42)
- `docs/guide/04-a-charting-session.md`
- `docs/guide/05-signposts.md`
- `docs/guide/06-charting-mode.md`
- `docs/guide/07-build-route.md`
- `docs/guide/08-hand-off.md`

## 4. Change list and needed interfaces

- Worktree path: `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u1`
- Creation commit: `86eae17b77ffb6239d8827cb6ad9d502514f0bbd`
- Chunks that must land first: none
- Shared test resources or consumed outputs: none
- Owned paths (exact edit targets):
  1. `docs/README.md`: lines 21, 22 (2 em dashes).
  2. `docs/guide/04-a-charting-session.md`: line 22 (full consultant example); add the slots sentence right after the code block (after line 23, before line 25), leaving line 35 untouched; lines 25, 43, 44, 64, 78, 83, 88 (9 em dashes).
  3. `docs/guide/05-signposts.md`: lines 9, 17, 35, 54, 91, 107 (7 em dashes).
  4. `docs/guide/06-charting-mode.md`: lines 35, 54, 75 (3 consultant examples including singular `Use consultant B.` on line 75); lines 7, 16, 17, 19, 28, 42, 63, 75, 82, 84, 97 (13 em dashes).
  5. `docs/guide/07-build-route.md`: lines 15, 24, 33, 49, 59, 75 (7 em dashes).
  6. `docs/guide/08-hand-off.md`: lines 10, 41, 47 (4 em dashes; line 47 is a `##` heading — rewrite cleanly, e.g. `## What the charting agent hands off and what happens next`).

## 5. Do-not, reasons and exceptions

- Do not edit any file outside the 6 owned paths in Section 4, and do not write or edit any test file.
- Do not change any line in `docs/guide/04`–`08` or `docs/README.md` that is not an em-dash line, one of the 4 consultant examples, or the added slots sentence on page 04 (in particular, do not touch the tab section, previous/next footer lines, or picture embeds; `guide-chapters` and `charting-pictures-more` own those).
- Do not substitute `" - "`, `"--"`, or an en dash (`–`) where an em dash was removed; rewrite each sentence naturally.
- Do not run `akrogon verify` or whole-repo `tests/docs-em-dash.test.ts` (other units own the remaining 14 files; A runs whole-repo proofs after Wave 1 merges).
- Do not introduce retired terms (`manual mode`, `manual route`, `quick fix`, `autopilot signposts`, `hold-fix`, `unhold`, `--red-on-base`, `held.yaml`, `run permit`).
- Return a mismatch with evidence to A instead of changing scope or an interface.
- **Standing exclusion (`git stash`)**: Never run any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to inspect base behavior use a second worktree of base instead. To set work aside, commit a WIP commit and before returning run `git reset --soft 86eae17b77ffb6239d8827cb6ad9d502514f0bbd` and make the unit's single returned commit once.
- **Standing exclusion (unattended commands)**: Never write a command that waits on a human; never write a poll or sleep loop, and run a slow command once in the foreground waiting on its exit inside your turn; re-express a harness command denial inside the same grant and identity (simpler command, configured runner, or file tools) without routing around secret/`.env`/grant rules, and if no permitted formulation answers return a mismatch with the denial text verbatim; name no env file path on a command line, and treat an undeclared required value as a mismatch.
- **Standing exclusion (process stop)**: Never stop a process by command-line pattern (`pkill -f`, `killall`, `pgrep ... | xargs kill`); use `akrogon stop-run <run-id>` if needed.

Reasons and exceptions: Strict file ownership prevents Wave 1 merge conflicts and satisfies Criterion 4 and downstream leaf exclusions; test files are frozen after planning; no stash and no pattern kill protect parallel workers; unattended command rules apply because no human attends worker turns. Exceptions: only a revised brief from A authorizes changing scope, owned files, or an interface; the unattended-command, no-stash, and no-pattern-kill exclusions have no exception.

## 6. Ordered steps

Advisory size: 6 files, under 24 turns.

1. Read `ponytail.md` and the 6 owned files in `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u1`.
2. Edit `docs/README.md` (lines 21–22) for Criterion 1.
3. Edit `docs/guide/04-a-charting-session.md` (consultant example, slots sentence, 9 em dashes) for Criteria 1–3.
4. Edit `docs/guide/05-signposts.md` (7 em dashes) for Criterion 1.
5. Edit `docs/guide/06-charting-mode.md` (3 consultant examples + 13 em dashes) for Criteria 1–2.
6. Edit `docs/guide/07-build-route.md` (7 em dashes) and `docs/guide/08-hand-off.md` (4 em dashes including heading) for Criterion 1.
7. Review `git diff` line by line to confirm natural rewrites, zero dash substitutes (`" - "`, `"--"`, `–`), and zero extraneous edits (Criterion 4).
8. Run the targeted checks in Section 7 from `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u1`, then commit all 6 files in one commit on the detached HEAD and confirm `git status --porcelain` is empty.

## 7. Commands

Run inside `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u1`:

```sh
akrogon run-check --name u1-em-dash -- sh -c '! rg -n "—|&mdash;|&#8212;|&#x2014;" docs/README.md docs/guide/04-a-charting-session.md docs/guide/05-signposts.md docs/guide/06-charting-mode.md docs/guide/07-build-route.md docs/guide/08-hand-off.md'
akrogon run-check --name u1-docs-links -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile --backend=copyfile'\'' && bun test tests/docs-links.test.ts'
```

## 8. Done-when, evidence and report

Done when all 6 files pass both commands in Section 7 with exit `0`, every changed line is naturally rewritten without dash substitutes, all 4 consultant examples and the page-04 slots sentence match Section 2, and one clean commit sits on `/home/ivan/.akrogon/worktrees/akrogon/charting-fixes-u1` with an empty `git status --porcelain`.

Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite the printed `check <label>: <exit> <path>` lines (at most a short excerpt pasted). You edit no test files so no `Test-Change:` trailer is needed.

Return your commit SHA and complete these four lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
