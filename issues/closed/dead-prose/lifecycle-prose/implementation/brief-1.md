# Brief 1: lifecycle-prose skill edits and ponytail symlink

## 1. Goal

Apply the plan's skill-side edits: delete the peer-question paragraphs, delete the scrambled-context sentences, delete the failed-diagnosis clauses, rewrite two lesson sentences, and turn `skills/check-issue/ponytail.md` into a relative symlink. Plan decisions D1, D2, D3, D4, D5.

## 2. Numbered acceptance criteria

1. `grep -rn "questions/" skills/` is empty.
2. `grep -rn -i scrambled skills/` is empty; `grep -c "^Last operation:" skills/*/SKILL.md` and `grep -c "^Next:" skills/*/SKILL.md` each show 1 for all eight skills.
3. `grep -rn "diagnosis paragraph\|A's diagnosis" skills/` and `grep -rn "moved failed" skills/` are empty (seed-issue:26 keeps its intake-exclusion "diagnosis").
4. `readlink skills/check-issue/ponytail.md` prints `../implement-issue/ponytail.md`; `cmp skills/check-issue/ponytail.md skills/implement-issue/ponytail.md` exits 0; `git ls-files -s` shows mode 120000 once staged.
5. `grep -rn "leaf branch" skills/check-issue/SKILL.md` is empty; `grep -n "registered checkout" skills/check-issue/SKILL.md skills/merge-issue/SKILL.md` returns exactly the two lesson lines.
6. `git diff origin/main -- skills/implement-issue/SKILL.md` touches only lines 25-26 and 68; `git diff origin/main -- skills/plan-issue/SKILL.md` touches only lines 27-28 and 68-69; implement-issue:29 and plan-issue:31 are byte-identical to origin/main.

## 3. Read-first list

- `skills/broadcast-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/plan-issue/SKILL.md`
- `skills/check-issue/ponytail.md`, `skills/implement-issue/ponytail.md`
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` (lazy senior dev mode)

## 4. Change list and needed interfaces

Line numbers are origin/main at 735cd63, verified live. Deleting a paragraph takes one adjacent blank line, leaving no double blank line. A deleted last line takes its preceding blank line so the file ends cleanly.

Deletions (whole lines):

- `skills/broadcast-issue/SKILL.md` line 25 (peer-question paragraph) and line 54 (scrambled-context line, last line of file).
- `skills/check-issue/SKILL.md` line 45 (peer-question paragraph) and line 60 (scrambled-context line, last line of file).
- `skills/implement-issue/SKILL.md` line 25 (peer-question paragraph).
- `skills/merge-issue/SKILL.md` line 21 (peer-question paragraph), line 39 (`If that repair request prints \`moved failed\`...` paragraph) and line 60 (scrambled-context line, last line of file).
- `skills/plan-issue/SKILL.md` line 27 (peer-question paragraph) and line 68 (scrambled-context line, last line of file).

Verbatim replacements:

- `skills/check-issue/SKILL.md` line 47 becomes:
  `Finish with \`akrogon phase <slug> <next> --slot <A|B> --verdict <ready|nits|fix>\`, requesting \`check.fix\` for fix or \`merge\` for ready/nits, then print the footer and stop.`
- `skills/check-issue/SKILL.md` line 41 becomes:
  `Rerun checks only for a code change, missing evidence or a specific concern, leaving doc/index authorship with B and recording any reusable lesson found here as one active mechanism/date/history line plus a history file with case, evidence and learning, written under the registered checkout's \`learnings/\` and left for the operator to commit.`
- `skills/merge-issue/SKILL.md` line 27 becomes:
  `Turn a Nit A still holds and finds reusable into one line naming mechanism/date/history in the registered checkout's \`learnings/LESSONS.md\` and a history file with case, evidence and learning, left for the operator to commit, without reading the active list as pass input or adding another turn.`
- `skills/implement-issue/SKILL.md` line 68 becomes:
  `The lines are printed only, with actual command results rather than assumed progress.`

Symlink:

- `ln -sfn ../implement-issue/ponytail.md skills/check-issue/ponytail.md` (committed as symlink, git mode 120000).

## 5. Do-not, reasons and exceptions

- Do not touch `skills/chart-issues/`, `skills/init-issues/`, `skills/seed-issue/`; chart-prose owns chart-issues and the others are out of scope.
- Do not touch `skills/implement-issue/SKILL.md` line 29 or `skills/plan-issue/SKILL.md` line 31; the design locks them byte-identical.
- Do not touch `skills/check-issue/SKILL.md` line 14; it reads its own path, which now resolves through the symlink.
- Do not touch any `Last operation:` or `Next:` line or the intro sentences before them; operator answer 19 keeps both lines in all eight skills.
- Do not touch `docs/`, `src/`, `tests/`, `issues/`; other briefs own the guide and nothing owns code.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from B authorizing that change.

Restated: the exclusions exist because the design locks exact line scope and sibling ownership; the only exception is a revised brief from B.

## 6. Ordered steps

1. Delete broadcast-issue:25 and :54 (criteria 1, 2).
2. Delete check-issue:45 and :60, rewrite :41 and :47 (criteria 1, 2, 3, 5).
3. Delete implement-issue:25, rewrite :68 (criteria 1, 2, 6).
4. Delete merge-issue:21, :39, :60, rewrite :27 (criteria 1, 2, 3, 5).
5. Delete plan-issue:27 and :68 (criteria 1, 2, 6).
6. Create the symlink (criterion 4).
7. Run every criterion's grep/diff/readlink command and paste results (all criteria).

Advisory size: about 6 files and under 24 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=735cd630afe03fe21b773aafeabdddddc88ca612`.

## 8. Done-when, evidence and report

All seven criteria verified with pasted command output. No tests are added; the changed-tests run is the evidence that nothing executable moved.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
