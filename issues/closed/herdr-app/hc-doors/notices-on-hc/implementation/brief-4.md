# Brief 4: U4 watcher needs-you line uses the notice verb

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/notices-on-hc-u4` (detached at the leaf head). Repo: akrogon.

## 1. Goal

The watch skill's needs-you notice goes through `akrogon notice` instead of `herdr notification show` (plan D12), and the user doc says so.

## 2. Acceptance criteria

1. In `skills/watch-issues/SKILL.md` line 42 (the "Failed on a human prerequisite" bullet), both forms `herdr --session <name> notification show "<repo>/<slug> needs you" --body "<...>" --sound request` become `akrogon notice --title "<repo>/<slug> needs you" --body "<...>" --attention`, run from the repo root. Keep each form's own body placeholder (`<body>` for the defect notice, `<reason>` for the generic one).
2. In the same bullet, the generic notice's condition "when `failure.delivery` is not `shown`" becomes "when `failure.delivery` is neither `shown` nor `pending`" (a pending failed notice waits for the window and will still show).
3. Nothing else in that bullet or file changes.
4. `docs/use/watch-while-away.md` line 24 ("It sends you a Herdr notification when a leaf needs you, ...") says it sends a notice that herdr-app shows as a toast when a leaf needs you; the rest of the sentence stays.
5. `grep -n "notification" skills/watch-issues/SKILL.md` shows no `herdr ... notification show` call.

## 3. Read first

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.
- `skills/watch-issues/SKILL.md` line 42. `docs/use/watch-while-away.md` lines 18-28.

## 4. Change list

- `skills/watch-issues/SKILL.md` (criteria 1-3, 5), `docs/use/watch-while-away.md` (criterion 4). Owned paths: those two. Lands after U1 (landed). No shared test resource.

## 5. Do-not, reasons and exceptions

- Do not change any other line of the watch skill: watcher-on-hc owns the rest (session lines, paused rule, observe script).
- Do not touch `src/`, `tests/` or other docs.
- A conflict with the text found: return a mismatch with evidence. Exception: a revised brief from A.

Reasons restated: another leaf owns the rest of the skill; other units own code and tests. The only exception is a revised brief from A.

## 6. Ordered steps

1. Edit line 42 (criteria 1-3).
2. Edit the doc line (criterion 4).
3. Run section 7. One commit: `docs: watcher needs-you notice through akrogon notice`.

Advisory size: 2 files, under 8 turns.

## 7. Commands

- `akrogon run-check --name u4-grep -- sh -c "! grep -nE 'herdr[^|]*notification show' skills/watch-issues/SKILL.md"`

## 8. Done-when, evidence and report

Done when criteria 1-5 hold and the commit exists. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite its `check <label>: <exit> <path>` line. Return the commit id and `git show --stat HEAD`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
