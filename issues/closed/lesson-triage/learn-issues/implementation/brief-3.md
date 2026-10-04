# Worker brief: docs and index updates for learn-issues

## 1. Goal

Update six doc surfaces so `learn-issues` is named where skills are listed, and the LESSONS.md header names `/learn-issues` as the prune path. Plan decisions D5, D6. The skill file `skills/learn-issues/SKILL.md` is being written by a sibling worker; link to its path, do not create or edit it.

## 2. Numbered acceptance criteria

1. `learnings/LESSONS.md` header line 5 (`A line leaves when applied or pruned at chart open.`) is reworded to name `/learn-issues` as the place lines are pruned, keeping the applied half. No lesson line changes; `git diff` shows the header line only.
2. `docs/reference-index.md` Skills bullet says `ten agent workflows` (the folder count becomes 10).
3. `README.md` skill table gains a row `| [learn-issues](skills/learn-issues/SKILL.md) | <purpose> |` matching the table's linked-row form; the link must resolve.
4. `docs/guide/cheat.md` skill table gains a `learn-issues` row in the Need/Skill/What-you-get form (plain skill name, not a link), and the sentence after the table listing operator-invoked skills includes lesson triage.
5. `docs/guide/learn.md` replaces `Charting can propose removing stale entries.` with a sentence saying `/learn-issues` removes a lesson once a running guard covers it and offers a seed when a check could.
6. `skills/AREA.md` Key files gains a bullet naming `skills/learn-issues/SKILL.md` and what it does. The file stays under 40 lines and keeps exactly its Commands / Key files / Non-obvious patterns / See also sections.
7. No test asserts doc wording. Proof is grep plus `tests/docs-links.test.ts` (README link), which A runs with `checks`.

## 3. Read-first list

- `README.md` near :180 — skill table form.
- `docs/guide/cheat.md` near :115-129 — table form and the operator-invoked sentence.
- `docs/guide/learn.md` near :18 — the sentence being replaced.
- `docs/reference-index.md` :5 — the count phrase.
- `skills/AREA.md` — Key files bullet form.
- `learnings/LESSONS.md` :1-6 — the header.
- `skills/implement-issue/ponytail.md` — read before editing.

## 4. Change list and needed interfaces

Owned paths, one commit:

- `learnings/LESSONS.md`: header line 5 only. Suggested form: `A line leaves when applied or when /learn-issues prunes it.` (equivalent wording naming `/learn-issues` as the prune path is fine). Lesson lines untouched.
- `docs/reference-index.md`: `the nine agent workflows` → `the ten agent workflows`.
- `README.md`: new row in the skills table. Place it with the issue skills; short purpose in the table's voice, e.g. `Sort lessons into guarded, checkable or staying.` Verify `skills/learn-issues/SKILL.md` is the link target.
- `docs/guide/cheat.md`: new table row in Need/Skill/What-you-get form, e.g. `| Triage stale lessons | learn-issues | Guarded lines removed, checkable ones seeded. |`; extend the operator-invoked sentence (`Invoke setup, intake, charting and watching when you need them.`) to include lesson triage.
- `docs/guide/learn.md`: replace the sentence `Charting can propose removing stale entries.` with one stating `/learn-issues` removes a lesson once a running guard covers it and offers a seed when a check could.
- `skills/AREA.md`: add `- \`skills/learn-issues/SKILL.md\` sorts active lessons into guarded, checkable or staying.` under Key files.

## 5. Do-not, reasons and exceptions

- Do not create or edit `skills/learn-issues/SKILL.md` or `skills/chart-issues/SKILL.md`: sibling units own them.
- Do not edit any lesson line or history file under `learnings/`: only the header line changes, per locked decision.
- Do not edit anything under `issues/` or `src/`.
- Do not add rows beyond the one each table needs, and match each table's existing row form.
- A requirement conflict returns as a mismatch with evidence instead of changed scope; the exception is a revised brief from A.

Restated: six owned files, one edit each as listed, no lesson lines, no sibling-owned files; conflicts return, they are not resolved by widening scope.

## 6. Ordered steps

1. Read the read-first surfaces (criteria 1-6).
2. Make the six edits.
3. Verify: `grep -n 'learn-issues' README.md docs/guide/cheat.md docs/guide/learn.md skills/AREA.md learnings/LESSONS.md` shows each required hit; `grep -n 'ten agent workflows' docs/reference-index.md` matches; `git diff learnings/LESSONS.md` shows the header line only.
4. Commit all six files in one commit on the detached HEAD in your worktree.

Advisory size: 6 files, under 25 turns.

## 7. Commands

Changed-test command: `bun test --changed=76ec78494a77dca27a7b25a2128cf1d3bcda1045 --timeout=30000`. Docs-only edits may produce no changed tests; a pass or "no changed tests" result is acceptable. Run `bun install` first only if tests fail for missing dependencies.

## 8. Done-when, evidence and report

All six edits are in one commit with the greps passing. Return the commit ID and the filled lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
